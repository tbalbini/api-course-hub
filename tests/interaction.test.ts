import { describe, expect, test } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { XRayProvider } from "@/components/xray-mode";
import { TracePlayer } from "@/components/trace-player";
import { interfaces } from "@/content/comparison";
import { communicationProfiles, deliveryProfiles } from "@/content/events";
import { credentialProfiles } from "@/content/security";
import { anatomyCapture, mechanisms, type Mechanism } from "@/lib/anatomy";
import { compareRun, initialSettings } from "@/lib/comparison";
import { communicationRun, defaultCommunication } from "@/lib/communication";
import { defaultDelivery, deliveryRun } from "@/lib/delivery";
import { baselineDesign, provideOrder } from "@/lib/contracts";
import { collectionPage, defaultCollection, initialCollection } from "@/lib/collections";
import { defaultRetry, idempotencyRun } from "@/lib/idempotency";
import { domCapture, runFunction } from "@/lib/learning";
import { defaultNetworkLab, networkLabCapture } from "@/lib/network-lab";
import { accessRun, browserPolicyRun, credentialRun, defaultAccess, defaultBrowserPolicy } from "@/lib/security";
import { localCapture, scenarios, simulate } from "@/lib/scenarios";
import { defaultSystem, runSystem } from "@/lib/systems";
import { defaultTransaction, runTransaction } from "@/lib/transactions";
import { abiRun, defaultBinary, wasmRun } from "@/lib/binary-boundary";
import { defaultWire, wireRun } from "@/lib/database-wire";
import { defaultToolSettings, toolPresets, toolRun } from "@/lib/tool-boundary";
import { event, stages, type Capture, type Stage } from "@/lib/trace";

describe("AC-2/4/5: X Ray transversal", () => {
  test("AC-7: una captura vacía muestra un estado honesto", () => {
    const html = renderToStaticMarkup(createElement(XRayProvider, null, createElement(TracePlayer, { state: { capture: { id: "empty", mode: "local", events: [] }, cursor: 0, running: false, speed: 1 }, dispatch: () => {}, depth: "engineering", onDepth: () => {} })));
    expect(html).toContain("No hay eventos capturados");
    expect(html).not.toContain("Paso completado");
  });
  test("todos los productores disponibles declaran interacción sin alterar procedencia o causalidad", async () => {
    const captures: Capture[] = [
      ...Object.keys(stages).map(stage => ({ id: stage, mode: "local" as const, events: [event(stage as Stage)] })),
      ...scenarios.map(scenario => simulate(scenario)), localCapture(true), runFunction(2, 3).capture, domCapture("antes", "después"),
      ...Object.keys(mechanisms).map(mode => anatomyCapture(mode as Mechanism, "success", true)),
      ...interfaces.map(profile => compareRun(profile.id, initialSettings).capture),
      ...Object.keys(communicationProfiles).map(mechanism => communicationRun({ ...defaultCommunication, mechanism: mechanism as keyof typeof communicationProfiles }, "Hola").capture),
      ...Object.keys(deliveryProfiles).map(mechanism => deliveryRun({ ...defaultDelivery, mechanism: mechanism as keyof typeof deliveryProfiles, fault: "lost-ack" }).capture),
      ...(["h1", "h2", "h3", "udp"] as const).map(protocol => networkLabCapture({ ...defaultNetworkLab, protocol }).capture),
      accessRun(defaultAccess).capture, browserPolicyRun(defaultBrowserPolicy).capture,
      ...Object.entries(credentialProfiles).flatMap(([kind, profile]) => profile.faults.map(fault => credentialRun(kind as keyof typeof credentialProfiles, fault).capture)),
      provideOrder(baselineDesign, { sku: "kit-api", quantity: 2 }).capture,
      collectionPage(initialCollection(), defaultCollection).capture, idempotencyRun(defaultRetry).capture,
      runSystem(defaultSystem).capture, runTransaction(defaultTransaction).capture,
      abiRun(defaultBinary).capture, abiRun({ ...defaultBinary, swapped: true }).capture, abiRun({ ...defaultBinary, released: true }).capture,
      (await wasmRun(defaultBinary)).capture, (await wasmRun({ ...defaultBinary, right: 0 })).capture,
      ...(["none", "truncated", "length"] as const).map(fault => wireRun({ ...defaultWire, fault }).capture),
      ...(["none", "reader", "buyer"] as const).map(role => toolRun(JSON.stringify(toolPresets.confirm), { ...defaultToolSettings, role }).capture),
      ...[false, true].map(adapt => toolRun(JSON.stringify(toolPresets.confirm), { ...defaultToolSettings, version: "v2", adapt }).capture),
    ];
    for (const capture of captures) for (const entry of capture.events) {
      expect(entry.interaction, `${capture.id}:${entry.action}`).toBeDefined();
      for (const value of [entry.interaction.initiator, entry.interaction.receiver, entry.interaction.technology, ...entry.interaction.possibleFailures]) expect(value.trim().length).toBeGreaterThan(0);
      expect(Array.isArray(entry.interaction.possibleFailures)).toBe(true);
      if (capture.mode === "simulation") expect(entry.provenance).toBe("conceptual");
    }
  });

  test("los metadatos canónicos no se comparten entre capturas", () => {
    const first = event("request"), second = event("request");
    first.interaction.receiver = "Otro receptor";
    first.interaction.possibleFailures.push("Otro fallo");
    expect(second.interaction).toEqual(event("request").interaction);
    expect(second.interaction.possibleFailures).not.toContain("Otro fallo");
  });

  test("retornos, notificaciones y ACK invierten los participantes", () => {
    const comparison = compareRun("subscription", initialSettings).capture;
    const notification = comparison.events.find(entry => entry.stage === "crossBoundary" && entry.output !== null && entry.interaction.initiator === "Proveedor");
    expect(notification?.interaction.receiver).toBe("Consumidor");
    const chat = communicationRun({ ...defaultCommunication, mechanism: "sse" }, "Hola").capture;
    expect(chat.events.find(entry => entry.action === "La actualización atraviesa la red hacia el consumidor")?.interaction).toMatchObject({ initiator: "Proveedor del chat", receiver: "Cliente del chat", technology: "Server-Sent Events" });
    const delivery = deliveryRun({ ...defaultDelivery, mechanism: "pubsub", fault: "lost-ack" }).capture;
    const lost = delivery.events.find(entry => entry.error?.code === "ACK_LOST");
    expect(lost?.interaction).toMatchObject({ initiator: "Pedidos", receiver: "Broker" });
    expect(delivery.events.filter(entry => entry.lane === "B").every(entry => !entry.dependencies.some(id => delivery.events.find(parent => parent.id === id)?.lane === "A"))).toBe(true);
  });

  test("Anatomy distingue procesos y retorno sin convertir IPC en red", () => {
    const capture = anatomyCapture("ipc");
    expect(capture.events.find(entry => entry.stage === "crossBoundary")).toMatchObject({ boundary: "IPC local", interaction: { initiator: "Proceso solicitante", receiver: "Proceso trabajador", technology: "IPC local" } });
    expect(capture.events.at(-1)?.interaction).toMatchObject({ initiator: "Proceso trabajador", receiver: "Proceso solicitante" });
    const message = anatomyCapture("message");
    expect(message.events.find(entry => entry.stage === "deliveryModel")?.interaction.initiator).toBe("Broker");
  });

  test("módulo local, servicio remoto y Map mantienen fronteras distintas", () => {
    for (const architecture of ["monolith", "services"] as const) {
      const call = runSystem({ ...defaultSystem, architecture }).capture.events.find(entry => entry.component === "inventory" && entry.stage === "crossBoundary");
      expect(call?.boundary).toBe(architecture === "monolith" ? "Mismo proceso" : "Red remota");
      expect(call?.interaction.receiver).toBe(architecture === "monolith" ? "Módulo de inventario" : "Servicio de inventario");
    }
    expect(event("persist").interaction.technology).toContain("mismo proceso");
    expect(event("readStore").interaction.receiver).toBe("Map del proceso servidor");
  });

  test("UDP y QUIC conservan sus mecanismos sin heredar HTTP o TCP", () => {
    const udp = networkLabCapture({ ...defaultNetworkLab, protocol: "udp", literalIP: true }).capture;
    expect(udp.events.every(entry => !entry.interaction.technology.includes("HTTP"))).toBe(true);
    const quic = networkLabCapture({ ...defaultNetworkLab, protocol: "h3" }).capture;
    expect(quic.events.some(entry => entry.stage === "tcp")).toBe(false);
    expect(quic.events.find(entry => entry.action === "QUIC prepara transporte y seguridad")?.interaction.technology).toContain("QUIC");
  });
});
