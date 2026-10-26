import { describe, expect, test } from "vitest";
import { communicationRun, defaultCommunication, type CommunicationMechanism } from "@/lib/communication";
import { applySnapshot, defaultDelivery, deliveryRun, type DeliverySettings, type Projection } from "@/lib/delivery";
import { paymentEvents } from "@/content/events";
import { playback, type Capture } from "@/lib/trace";

function checkTrace(capture: Capture) {
  const seen = new Set<string>();
  const events = new Map(capture.events.map(entry => [entry.id, entry]));
  for (const entry of capture.events) {
    expect(seen.has(entry.id)).toBe(false);
    for (const dependency of entry.dependencies) {
      expect(seen.has(dependency)).toBe(true);
      const parent = events.get(dependency)!;
      expect(parent.logicalTime).toBeLessThan(entry.logicalTime);
      if (entry.lane && parent.lane) expect(parent.lane).toBe(entry.lane);
    }
    seen.add(entry.id);
    expect(entry.provenance).toBe("conceptual");
  }
  expect(capture.measuredMs).toBeUndefined();
}

describe("Comunicación continua", () => {
  const settings = (["polling", "longpoll", "websocket", "sse"] as CommunicationMechanism[]).flatMap(mechanism => [false, true].flatMap(disconnect => [false, true].map(resume => ({ mechanism, disconnect, resume }))));
  test.each(settings)("$mechanism, pérdida $disconnect, recuperación $resume", setting => {
    const run = communicationRun(setting, "Mensaje editable");
    const streaming = setting.mechanism === "websocket" || setting.mechanism === "sse";
    expect(run.provider.messages[0].text).toBe("Mensaje editable");
    expect(run.provider.revision).toBe(1);
    expect(run.client.revision).toBe(streaming && setting.disconnect && !setting.resume ? 0 : 1);
    expect(run.channels).toBe(streaming ? setting.disconnect ? 2 : 1 : 0);
    expect(run.capture.events.some(entry => entry.action === "POST separado envía el mensaje")).toBe(setting.mechanism !== "websocket");
    if (setting.disconnect) {
      const events = run.capture.events;
      expect(events.findIndex(entry => entry.actor === "provider")).toBeLessThan(events.findIndex(entry => entry.error?.code === "UPDATE_LOST"));
    }
    checkTrace(run.capture);
  });
  test("muestra solicitudes sin equipararlas a conexiones y valida mensajes", () => {
    expect(communicationRun(defaultCommunication, "hola").requests).toBe(4);
    expect(communicationRun({ ...defaultCommunication, mechanism: "longpoll" }, "hola").requests).toBe(3);
    expect(communicationRun({ ...defaultCommunication, mechanism: "sse" }, "hola").requests).toBe(2);
    expect(communicationRun({ ...defaultCommunication, mechanism: "websocket" }, "hola").requests).toBe(1);
    expect(() => communicationRun(defaultCommunication, " ")).toThrow("1 a 120");
    expect(() => communicationRun(defaultCommunication, "a".repeat(121))).toThrow("1 a 120");
  });
});

describe("Entrega de eventos y proyecciones", () => {
  const mechanisms: DeliverySettings["mechanism"][] = ["webhook", "queue", "pubsub", "stream"];
  const faults: DeliverySettings["fault"][] = ["none", "reject", "lost-ack", "exhaust"];
  test.each(mechanisms.flatMap(mechanism => faults.map(fault => ({ mechanism, fault }))))("$mechanism con $fault respeta intentos, ids y fronteras", settings => {
    const run = deliveryRun({ ...defaultDelivery, ...settings });
    checkTrace(run.capture);
    expect(run.attempts.every(attempt => attempt.attempt >= 1 && attempt.attempt <= 3)).toBe(true);
    expect(run.log.map(record => record.event.id)).toEqual(["pay-1", "pay-2"]);
    if (settings.fault === "exhaust") {
      expect(run.failed.length).toBeGreaterThan(0);
      if (settings.mechanism === "stream") {
        expect(run.projections[0].offsetCommitted).toBe(0);
        expect(run.projections[0].applications).toBe(0);
        expect(run.attempts.some(attempt => attempt.offset === 1)).toBe(false);
      }
    } else {
      for (const projection of run.projections) { expect(projection.status).toBe("refunded"); expect(projection.applications).toBe(2); }
      expect(run.failed).toHaveLength(0);
    }
    if (settings.fault === "lost-ack") {
      const first = run.attempts.filter(attempt => attempt.consumer === "Pedidos" && attempt.eventId === "pay-1");
      expect(first.map(attempt => attempt.result)).toEqual(["ack-lost", "ack"]);
      expect(first.filter(attempt => attempt.applied)).toHaveLength(1);
    }
    expect(run.capture.request === undefined).toBe(settings.mechanism !== "webhook");
  });
  test.each(mechanisms)("%s puede repetir el efecto sin filtros de protección", mechanism => {
    const unsafe = deliveryRun({ ...defaultDelivery, mechanism, fault: "lost-ack", duplicate: true, deduplicate: false, versionGuard: false });
    expect(unsafe.projections[0].applications).toBe(4);
    const safe = deliveryRun({ ...unsafe.settings, deduplicate: true });
    expect(safe.projections[0].applications).toBe(2);
    expect(safe.attempts.filter(attempt => attempt.eventId === "pay-1").length).toBeGreaterThan(1);
  });
  test("el orden invertido retrocede un snapshot sin guardia de revisión", () => {
    const unsafe = deliveryRun({ ...defaultDelivery, reversed: true, versionGuard: false });
    expect(unsafe.projections[0].status).toBe("confirmed"); expect(unsafe.projections[0].revision).toBe(1);
    const safe = deliveryRun({ ...unsafe.settings, versionGuard: true });
    expect(safe.projections[0].status).toBe("refunded"); expect(safe.projections[0].revision).toBe(2);
    expect(safe.projections[0].seenIds).toEqual(["pay-2", "pay-1"]);
  });
  test("pub/sub tiene ramas independientes y un consumidor puede quedar atrás", () => {
    const run = deliveryRun({ ...defaultDelivery, mechanism: "pubsub", fault: "exhaust", reversed: true });
    expect(run.projections.map(projection => projection.revision)).toEqual([1, 2]);
    expect(run.attempts.filter(attempt => attempt.consumer === "Analítica").every(attempt => attempt.result === "ack")).toBe(true);
    expect(run.capture.events.some(entry => entry.lane === "A")).toBe(true);
    expect(run.capture.events.some(entry => entry.lane === "B")).toBe(true);
    checkTrace(run.capture);
  });
  test("queue compite por un grupo, sin fanout a dos proyecciones", () => {
    const run = deliveryRun({ ...defaultDelivery, mechanism: "queue", fault: "reject" });
    expect(run.projections).toHaveLength(1);
    expect(new Set(run.attempts.map(attempt => attempt.worker))).toEqual(new Set(["Worker A", "Worker B"]));
    expect(run.projections[0].applications).toBe(2);
  });
  test("publicar copia crea otro offset; releer no publica y conserva dedupe", () => {
    const run = deliveryRun({ ...defaultDelivery, mechanism: "stream", duplicate: true, reversed: true, replayLog: true });
    expect(run.log.map(record => [record.offset, record.event.id])).toEqual([[0, "pay-2"], [1, "pay-1"], [2, "pay-1"]]);
    expect(run.attempts.map(attempt => attempt.offset)).toEqual([0, 1, 2, 0, 1, 2]);
    expect(run.projections[0].offsetCommitted).toBe(3);
    expect(run.projections[0].applications).toBe(1);
    expect(run.capture.events.filter(entry => entry.action.startsWith("Se publica"))).toHaveLength(3);
    expect(run.capture.events.filter(entry => entry.action.includes("confirma siguiente offset")).slice(3).every(entry => entry.action.endsWith("3"))).toBe(true);
    const blocked = deliveryRun({ ...run.settings, fault: "exhaust" });
    expect(blocked.projections[0].offsetCommitted).toBe(0);
    expect(blocked.attempts.every(attempt => attempt.offset === 0)).toBe(true);
  });
  test("dedupe y revisión son comprobaciones distintas, sin mutar entrada", () => {
    const projection: Projection = { name: "Test", status: "confirmed", revision: 1, applications: 1, seenIds: ["pay-1"], offsetCommitted: 0 };
    const before = JSON.stringify(projection);
    expect(applySnapshot(projection, paymentEvents[0], true, false).reason).toBe("duplicate");
    expect(applySnapshot(projection, paymentEvents[0], false, true).reason).toBe("stale");
    expect(applySnapshot(projection, paymentEvents[0], false, false).projection.applications).toBe(2);
    expect(JSON.stringify(projection)).toBe(before);
  });
  test("la captura y ajustes se conservan durante replay", () => {
    const settings = { ...defaultDelivery, mechanism: "pubsub" as const, fault: "lost-ack" as const };
    const run = deliveryRun(settings); const before = JSON.stringify(run);
    settings.deduplicate = false;
    playback({ capture: run.capture, cursor: 0, running: false, speed: 1 }, { type: "replay" });
    expect(JSON.stringify(run)).toBe(before);
    expect(run.capture.events.find(entry => entry.action === "Pedidos aplica revisión 1")?.output).toMatchObject({ revision: 1, applications: 1 });
  });
});
