import { describe, expect, test } from "vitest";
import { defaultNetworkLab, networkLabCapture, type NetworkLabSettings } from "@/lib/network-lab";
import { playback } from "@/lib/trace";

const profiles: NetworkLabSettings["protocol"][] = ["h1", "h2", "h3", "udp"];
describe("Modelos de transporte y separación de garantías", () => {
  test.each(profiles)("%s prepara su pila y conserva procedencia conceptual", protocol => {
    const run = networkLabCapture({ ...defaultNetworkLab, protocol });
    const stages = run.capture.events.map(entry => entry.stage);
    expect(stages.includes("tcp")).toBe(protocol === "h1" || protocol === "h2");
    expect(stages.includes("tls")).toBe(protocol === "h1" || protocol === "h2");
    expect(stages).toContain("dns");
    expect(run.capture.events.every(entry => entry.provenance === "conceptual")).toBe(true);
    expect(run.capture.measuredMs).toBeUndefined();
    expect(run.capture.request === undefined).toBe(protocol === "udp");
    expect(run.capture.response === undefined).toBe(protocol === "udp");
    expect(run.delivered).toEqual([1, 2, 3]);
  });
  test.each(profiles.flatMap(protocol => ["literalIP", "dnsCached", "reuse"].map(condition => ({ protocol, condition }))))("%s omite solo la preparación aplicable", ({ protocol, condition }) => {
    const run = networkLabCapture({ ...defaultNetworkLab, protocol, [condition]: true });
    const stages = run.capture.events.map(entry => entry.stage);
    expect(stages.includes("dns")).toBe(condition === "reuse" && protocol === "udp");
    if (condition === "reuse") expect(stages).not.toContain("tcp");
    else if (protocol === "h1" || protocol === "h2") expect(stages).toContain("tcp");
  });
  test.each(profiles)("%s distingue pérdida de unidad de reintento de aplicación", protocol => {
    const run = networkLabCapture({ ...defaultNetworkLab, protocol, drop: true });
    expect(run.attempts).toBe(1);
    expect(run.recovered).toBe(protocol !== "udp");
    expect(run.delivered).toEqual(protocol === "udp" ? [1, 3] : [1, 2, 3]);
    expect(run.known).toBe(protocol !== "udp");
    expect(run.capture.events.some(entry => entry.error?.code === "UNIT_LOST")).toBe(true);
    if (protocol === "h3") expect(run.capture.events.some(entry => entry.action === "QUIC recupera el contenido perdido")).toBe(true);
  });
  test.each(["h1", "h2", "h3"] as const)("%s pierde respuesta después del proveedor y reintenta una vez", protocol => {
    const failed = networkLabCapture({ ...defaultNetworkLab, protocol, lostResponse: true });
    expect(failed.known).toBe(false); expect(failed.capture.response).toBeUndefined();
    const events = failed.capture.events;
    expect(events.findIndex(entry => entry.actor === "provider")).toBeLessThan(events.findIndex(entry => entry.error?.code === "TIMEOUT"));
    const recovered = networkLabCapture({ ...defaultNetworkLab, protocol, lostResponse: true, retry: true });
    expect(recovered.attempts).toBe(2); expect(recovered.known).toBe(true);
    expect(recovered.capture.events.filter(entry => entry.stage === "dns")).toHaveLength(1);
    expect(recovered.capture.events.filter(entry => entry.action.includes("reintenta GET"))).toHaveLength(1);
    expect(recovered.capture.events.filter(entry => entry.actor === "provider")).toHaveLength(2);
  });
  test("UDP no hereda ajustes HTTP y el cálculo no se presenta como medición", () => {
    const options = { ...defaultNetworkLab, protocol: "udp" as const, lostResponse: true, retry: true, oneWayMs: 100, processingMs: 40 };
    const run = networkLabCapture(options);
    expect(run.attempts).toBe(1); expect(run.exchangeMs).toBe(240);
    expect(run.capture.events.some(entry => entry.error?.code === "TIMEOUT")).toBe(false);
    const before = JSON.stringify(run); options.oneWayMs = 200;
    expect(run.settings.oneWayMs).toBe(100);
    playback({ capture: run.capture, cursor: 0, speed: 1, running: false }, { type: "replay" });
    expect(JSON.stringify(run)).toBe(before);
    const seen = new Set<string>(); for (const entry of run.capture.events) { for (const dependency of entry.dependencies) expect(seen.has(dependency)).toBe(true); seen.add(entry.id); }
  });
});
