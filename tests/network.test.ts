import { describe, expect, test } from "vitest";
import { defaultNetwork, destination, type NetworkSettings } from "@/lib/network";
import { scenarios, simulate } from "@/lib/scenarios";

const conditions: NetworkSettings[] = (["local", "http", "https"] as const).flatMap(target => [false, true].flatMap(dnsCached => [false, true].flatMap(reuseConnection => (["direct", "proxy", "balanced"] as const).map(ingress => ({ target, dnsCached, reuseConnection, ingress })))));

describe("Fronteras de red e infraestructura", () => {
  test.each(conditions)("preparación e ingreso $target, caché $dnsCached, reutilización $reuseConnection, $ingress", settings => {
    const capture = simulate("201", 1, settings);
    const stages = capture.events.map(entry => entry.stage);
    expect(stages.includes("dns")).toBe(settings.target !== "local" && !settings.dnsCached && !settings.reuseConnection);
    expect(stages.includes("tcp")).toBe(!settings.reuseConnection);
    expect(stages.includes("tls")).toBe(settings.target === "https" && !settings.reuseConnection);
    expect(stages.includes("proxy")).toBe(settings.ingress !== "direct");
    expect(stages.includes("balancer")).toBe(settings.ingress === "balanced");
    expect(stages.indexOf("wireRequest")).toBeLessThan(stages.indexOf("serverAccept"));
    expect(stages.indexOf("response")).toBeLessThan(stages.indexOf("wireResponse"));
    expect(stages.indexOf("wireResponse")).toBeLessThan(stages.indexOf("receive"));
    expect(capture.network).toEqual(settings);
    expect(capture.network).not.toBe(settings);
    expect(capture.measuredMs).toBeUndefined();
  });

  test.each(scenarios)("el escenario %s conserva fronteras causales para todos los destinos", scenario => {
    for (const target of ["local", "http", "https"] as const) {
      const capture = simulate(scenario, 2, { ...defaultNetwork, target });
      const url = new URL(capture.request!.url);
      expect(url.origin).toBe(destination({ ...defaultNetwork, target }).origin);
      expect(url.pathname).toBe(scenario === "200" ? "/api/orders/pedido-simulado" : scenario === "404" ? "/api/orders/inexistente" : "/api/orders");
      expect(capture.request?.method).toBe(scenario === "200" || scenario === "404" ? "GET" : "POST");
      if (scenario === "200" || scenario === "404") {
        expect(capture.request?.body).toBeUndefined();
        expect(capture.events.find(entry => entry.stage === "route")?.contract).toBe("Route Handler GET /api/orders/[id]");
      }
      const indices = new Map(capture.events.map((entry, i) => [entry.id, i]));
      capture.events.forEach((entry, i) => entry.dependencies.forEach(dep => expect(indices.get(dep)).toBeLessThan(i)));
    }
  });

  test("el fallo de entrega no ejecuta ingreso ni proveedor", () => {
    const capture = simulate("network", 1, { ...defaultNetwork, ingress: "balanced" });
    expect(capture.events.some(entry => ["proxy", "balancer", "server", "store"].includes(entry.actor))).toBe(false);
    expect(capture.response).toBeUndefined();
  });

  test("el timeout construye respuesta pero no la entrega, aunque sí escribe", () => {
    const capture = simulate("timeout");
    const stages = capture.events.map(entry => entry.stage);
    expect(stages.indexOf("persist")).toBeLessThan(stages.indexOf("response"));
    expect(capture.events.find(entry => entry.stage === "wireResponse")?.state).toBe("error");
    expect(stages).not.toContain("receive");
    expect(capture.response).toBeUndefined();
  });

  test("duplicar repite invocación y recepción, reutiliza conexión y guarda una vez", () => {
    const capture = simulate("duplicate");
    const count = (stage: string) => capture.events.filter(entry => entry.stage === stage).length;
    for (const stage of ["request", "wireRequest", "serverAccept", "receive"]) expect(count(stage)).toBe(2);
    for (const stage of ["dns", "tcp", "tls", "persist", "deduplicate"]) expect(count(stage)).toBe(1);
    const requests = capture.events.filter(entry => entry.stage === "request");
    expect(requests[0].input).toEqual(requests[1].input);
  });

  test.each(["401", "403", "400"] as const)("%s detiene la cadena antes del handler de negocio", scenario => {
    expect(simulate(scenario).events.some(entry => entry.stage === "endpoint" || entry.stage === "persist")).toBe(false);
  });
});
