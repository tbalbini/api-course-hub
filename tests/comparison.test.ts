import { describe, expect, test } from "vitest";
import { interfaces } from "@/content/comparison";
import { compareRun, demoOrder, initialSettings, type StreamMode } from "@/lib/comparison";
import { confirmOrder, readOrder } from "@/lib/order-status";
import { playback } from "@/lib/trace";

describe("El mismo negocio a través de interfaces distintas", () => {
  test.each(interfaces)("$name consulta sin escribir y confirma una sola transición", item => {
    const read = compareRun(item.id, initialSettings);
    const confirm = compareRun(item.id, { ...initialSettings, operation: "confirm" });
    expect(read.provider).toEqual(demoOrder);
    expect(read.changes).toBe(0);
    expect(confirm.provider).toEqual({ ...demoOrder, status: "confirmed" });
    expect(confirm.changes).toBe(1);
    expect(confirm.uncertain).toBe(false);
    expect(demoOrder.status).toBe("created");
    expect(read.provider).not.toBe(confirm.provider);
    const events = confirm.capture.events;
    expect(new Set(events.map(entry => entry.id)).size).toBe(events.length);
    for (let i = 1; i < events.length; i++) expect(events[i].dependencies).toEqual([events[i - 1].id]);
    expect(confirm.capture.measuredMs).toBeUndefined();
    expect(events.every(entry => entry.provenance === (item.id === "local" ? "observed" : "conceptual"))).toBe(true);
  });

  test.each(interfaces)("$name devuelve not found sin escritura", item => {
    const run = compareRun(item.id, { ...initialSettings, operation: "confirm", condition: "missing" });
    expect(run.provider).toBeNull(); expect(run.changes).toBe(0);
    expect(run.capture.events.some(entry => entry.error?.code === "NOT_FOUND")).toBe(true);
    expect(run.capture.events.some(entry => entry.action === "El proveedor confirma el pedido")).toBe(false);
  });

  test.each(interfaces)("$name distingue pérdida de respuesta, efecto y observación posterior", item => {
    const run = compareRun(item.id, { ...initialSettings, operation: "confirm", condition: "lost" });
    expect(run.provider?.status).toBe("confirmed");
    expect(run.changes).toBe(1);
    const canKnow = ["local", "polling", "subscription"].includes(item.id);
    expect(run.uncertain).toBe(!canKnow);
    expect(run.result === null).toBe(!canKnow);
    if (!canKnow) expect(run.capture.response).toBeUndefined();
    if (item.id === "local") expect(run.capture.events.some(entry => entry.boundary === "Red remota")).toBe(false);
    else expect(run.capture.events.some(entry => entry.error?.code === "RESPONSE_LOST" || entry.error?.code === "DEADLINE_EXCEEDED")).toBe(true);
  });

  test("GraphQL proyecta campos en documento y datos, y permite errores con HTTP 200", () => {
    const run = compareRun("graphql", { ...initialSettings, operation: "confirm", fields: ["status"] });
    expect(run.result).toEqual({ data: { confirmOrder: { status: "confirmed" } } });
    expect(run.invocation).toContain("{ status }");
    expect(run.contract).toContain("type Subscription");
    expect(run.providerCode).toContain("subscribe:");
    const failed = compareRun("graphql", { ...initialSettings, condition: "missing" });
    expect(failed.capture.response?.status).toBe(200);
    expect(failed.result).toHaveProperty("errors");
  });

  test.each(["unary", "server", "client", "bidi"] as StreamMode[])("gRPC %s conserva el negocio y explicita la cardinalidad", stream => {
    const run = compareRun("grpc", { ...initialSettings, operation: "confirm", stream });
    const twice = stream === "client" || stream === "bidi";
    expect(run.capture.events.filter(entry => entry.action === "El proveedor confirma el pedido")).toHaveLength(twice ? 2 : 1);
    expect(run.changes).toBe(1);
    expect(run.contract).toContain(`ConfirmOrder(${twice ? "stream " : ""}OrderRequest)`);
    expect(run.contract).toContain(stream === "client" ? "returns (OrderBatch)" : stream === "unary" ? "returns (Order)" : "returns (stream Order)");
    expect(run.capture.response).toBeUndefined();
    expect(run.result).toHaveProperty("grpcStatus", "OK");
  });

  test("observar no causa un comando durante consultar", () => {
    for (const kind of ["polling", "subscription"] as const) {
      const read = compareRun(kind, initialSettings);
      const confirm = compareRun(kind, { ...initialSettings, operation: "confirm", condition: "lost" });
      expect(read.capture.events.some(entry => entry.action.includes("comando separado"))).toBe(false);
      const command = confirm.capture.events.findIndex(entry => entry.action.includes("comando separado"));
      const changed = confirm.capture.events.findIndex(entry => entry.action === "El proveedor confirma el pedido");
      const lost = confirm.capture.events.findIndex(entry => entry.action === "Se pierde la respuesta remota");
      expect(command).toBeGreaterThan(0); expect(changed).toBeGreaterThan(command); expect(lost).toBeGreaterThan(changed);
      expect(confirm.capture.events.slice(lost + 1).some(entry => entry.action.includes(kind === "polling" ? "snapshot 3" : "order.confirmed"))).toBe(true);
      expect(confirm.uncertain).toBe(false);
    }
    expect(compareRun("polling", initialSettings).capture.events.filter(entry => entry.action.startsWith("Consulta periódica"))).toHaveLength(3);
  });

  test("las capturas conservan sus ajustes y reproducir no reejecuta el dominio", () => {
    const options = { ...initialSettings, fields: ["status" as const] };
    const run = compareRun("graphql", options);
    const before = JSON.stringify(run);
    const state = { capture: run.capture, cursor: 0, speed: 1, running: false };
    playback(playback(state, { type: "replay" }), { type: "next" });
    expect(JSON.stringify(run)).toBe(before);
    options.fields.pop();
    expect(run.settings.fields).toEqual(["status"]);
  });

  test("la función compartida conserva campos e idempotencia sin mutar el original", () => {
    const original = { ...demoOrder, quantity: 2 };
    const confirmed = confirmOrder(original);
    expect(readOrder(original)).toEqual(original);
    expect(readOrder(original)).not.toBe(original);
    expect(confirmOrder(confirmed)).toEqual(confirmed);
    expect(confirmed.quantity).toBe(2); expect(original.status).toBe("created");
  });
});
