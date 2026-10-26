import { describe, expect, test } from "vitest";
import { defaultSystem, runSystem, systemMetrics, type SystemSettings } from "@/lib/systems";
import { defaultTransaction, recoverTransaction, runTransaction, type TransactionSettings } from "@/lib/transactions";
import { playback, type Capture } from "@/lib/trace";
import { awardCourse, courseComplete, decodeCourseProgress, initialCourseProgress } from "@/lib/course-progress";
function causal(capture: Capture) {
  const ids = new Set<string>();
  for (const e of capture.events) { expect(ids.has(e.id)).toBe(false); expect(e.provenance).toBe("conceptual"); for (const dependency of e.dependencies) expect(ids.has(dependency)).toBe(true); ids.add(e.id); }
  expect(capture.measuredMs).toBeUndefined();
}
const config = (s: Partial<SystemSettings>) => ({ ...defaultSystem, ...s });
describe("AC-2/3/4/9: scheduler y fronteras", () => {
  test("concurrencia cambia duración y respeta límite sin encadenar peticiones", () => {
    const serial = runSystem(config({ count: 4, concurrency: 1 })), concurrent = runSystem(config({ count: 4, concurrency: 2 }));
    expect(serial.results.map(r => r.endedAt)).toEqual([115, 230, 345, 460]);
    expect(concurrent.results.map(r => r.endedAt)).toEqual([115, 115, 230, 230]);
    expect(concurrent.results[2].startedAt).toBe(115);
    expect(concurrent.capture.events.filter(e => e.requestId === "R2").at(0)?.dependencies).toEqual([]);
    causal(concurrent.capture);
  });
  test.each(["monolith", "services"] as const)("frontera %s y entrada/BFF producen diferencias", architecture => {
    const run = runSystem(config({ architecture, count: 1, entry: "gateway", bff: true, balanced: true, runtime: "functions" }));
    expect(run.capture.events.find(e => e.action === "Invocar inventario")?.boundary).toBe(architecture === "monolith" ? "Mismo proceso" : "Red remota");
    expect(run.results[0].endedAt).toBe(architecture === "monolith" ? 144 : 164);
    expect(run.results[0].body).toMatchObject({ id: "PED-1042", status: "created", availability: 3, partial: false }); causal(run.capture);
  });
  test("arranque compartido no deja adelantar otra solicitud coincidente", () => {
    const run = runSystem(config({ runtime: "functions", concurrency: 3, count: 3 }));
    expect(run.capture.events.filter(e => e.action === "Termina el arranque compartido")).toHaveLength(1);
    expect(run.results.map(r => r.endedAt)).toEqual([155, 155, 155]);
    const init = run.capture.events.find(e => e.action === "Termina el arranque compartido")!;
    for (const entry of run.capture.events.filter(e => e.action === "La aplicación recibe la consulta")) expect(entry.dependencies).toContain(init.id);
  });
  test.each([false, true])("inventario exigido=%s cambia resultado, no efecto", required => {
    const run = runSystem(config({ required, failure: "all", retries: 0 }));
    expect(run.results.every(r => r.status === (required ? 503 : 200) && r.partial === !required)).toBe(true);
    expect(run.metrics.good).toBe(0); expect(run.metrics.calls).toBe(4); causal(run.capture);
  });
  test("sin inventario omite retry/breaker y no declara parcial", () => {
    const run = runSystem(config({ inventory: false, required: true, failure: "all", breaker: true, cache: true }));
    expect(run.metrics.calls).toBe(0); expect(run.results.every(r => !r.partial && r.status === 200)).toBe(true); expect(run.results[0].body).toMatchObject({ inventory: null });
  });
  test("deadline no cancela proveedor, drena tardíos y no cuenta fallo dos veces", () => {
    const run = runSystem(config({ count: 1, latency: 200, timeout: 50, retries: 1, backoff: 40, breaker: true }));
    expect(run.results[0].endedAt).toBe(155); expect(run.results[0].attempts).toBe(2);
    expect(run.capture.events.filter(e => e.kind === "late").map(e => e.atMs)).toEqual([235, 325]);
    expect(run.breakerStates).toEqual([{ state: "open", generation: 1 }]); causal(run.capture);
  });
  test("finalización empatada con deadline gana y no genera timeout", () => {
    const run = runSystem(config({ count: 1, latency: 80, timeout: 100 }));
    expect(run.results[0].partial).toBe(false); expect(run.results[0].attempts).toBe(1); expect(run.capture.events.some(e => e.error?.code === "TIMEOUT")).toBe(false);
  });
  test("backoff exponencial es observable", () => {
    const run = runSystem(config({ count: 1, failure: "all", retries: 2, backoff: 30 }));
    expect(run.results[0].attempts).toBe(3); expect(run.results[0].endedAt).toBe(405);
    expect(run.capture.events.filter(e => e.action === "Esperar backoff exponencial").map(e => e.output)).toEqual([{ waitMs: 30 }, { waitMs: 60 }]);
  });
});

describe("AC-5/6/9: breakers, caché y métricas", () => {
  test("circuito abre, rechaza sin llamadas y recupera con sonda", () => {
    const run = runSystem(config({ count: 6, concurrency: 3, gap: 100, failure: "first-two", retries: 0, breaker: true }));
    expect(run.results.map(r => r.attempts)).toEqual([1, 1, 0, 0, 0, 1]);
    expect(run.results[5].partial).toBe(false); expect(run.breakerStates[0].state).toBe("closed");
    expect(run.capture.events.some(e => e.action === "Circuito half open: admitir una sonda")).toBe(true); causal(run.capture);
  });
  test("inflight de generación anterior no cambia breaker tras apertura", () => {
    const run = runSystem(config({ count: 3, concurrency: 3, failure: "first-two", retries: 0, breaker: true }));
    expect(run.results.map(r => r.partial)).toEqual([true, true, false]); expect(run.breakerStates[0]).toEqual({ state: "open", generation: 1 });
    expect(run.capture.events.filter(e => e.action === "Circuito: closed")).toHaveLength(1);
  });
  test("cada réplica conserva contador propio", () => {
    const run = runSystem(config({ balanced: true, count: 4, concurrency: 2, failure: "first-two", retries: 0, breaker: true }));
    expect(run.results.map(r => r.replica)).toEqual([1, 2, 1, 2]); expect(run.breakerStates.map(b => b.state)).toEqual(["closed", "closed"]);
  });
  test("caché evita lectura e inventario, conserva versión antigua y expira estrictamente", () => {
    const run = runSystem(config({ cache: true, changeSource: true, count: 6, concurrency: 1, gap: 100, latency: 20 }));
    expect(run.metrics.hits).toBe(5); expect(run.results[2]).toMatchObject({ revision: 1, cacheHit: true, endedAt: 205 });
    expect(run.capture.events.filter(e => e.action === "Leer el pedido de la fuente")).toHaveLength(1);
    const fill = run.capture.events.find(e => e.action === "Guardar snapshot completo en caché")!;
    expect(run.capture.events.find(e => e.action === "Caché: snapshot recuperado")?.dependencies).toContain(fill.id);
    const expiry = runSystem(config({ cache: true, count: 6, gap: 300, latency: 20, concurrency: 1 }));
    expect(expiry.results.map(r => r.cacheHit)).toEqual([false, true, false, true, false, true]); causal(run.capture);
  });
  test("misses simultáneos no hacen single flight; parciales no se guardan", () => {
    const same = runSystem(config({ cache: true, count: 3, concurrency: 3 })); expect(same.metrics.calls).toBe(3);
    const failed = runSystem(config({ cache: true, failure: "all", retries: 0, concurrency: 1 })); expect(failed.metrics.hits).toBe(0);
  });
  test("SLI exige resultado completo dentro de umbral y p95 incluye cola", () => {
    const run = runSystem(config({ concurrency: 1, threshold: 250, target: 75 }));
    expect(run.metrics).toMatchObject({ good: 2, bad: 2, sli: 50, budget: 1, excess: 1, p95: 460 });
    expect(systemMetrics([], { threshold: 100, target: 95 }).p95).toBe(0);
  });
  test.each([{ count: 0 }, { count: 7 }, { concurrency: 4 }, { latency: 1.5 }, { timeout: 0 }, { retries: 3 }, { backoff: -1 }, { threshold: 1001 }, { target: 101 }, { gap: 5 }])("rechaza ajustes %j", change => { expect(() => runSystem(config(change))).toThrow(); });
  test("resultados y replay no alteran capturas o ajustes", () => {
    const settings = config({ cache: true }), run = runSystem(settings), before = JSON.stringify(run.capture);
    settings.count = 1; run.results[0].body = null; run.settings.count = 2;
    let state = { capture: run.capture as Capture, cursor: 0, running: false, speed: 1 };
    for (const action of [{ type: "replay" }, { type: "next" }, { type: "previous" }] as const) state = playback(state, action);
    expect(JSON.stringify(run.capture)).toBe(before); expect(runSystem(defaultSystem)).toEqual(runSystem(defaultSystem));
  });
});

describe("AC-7/9: commits y recuperación", () => {
  test.each(["local", "independent", "saga", "two-phase"] as const)("éxito en %s", mode => {
    const run = runTransaction({ mode, failure: "none" }); expect(run.state).toMatchObject({ stock: 2, reserved: 0, chargedMinor: 8900, order: "confirmed", prepared: false }); causal(run.capture);
    expect(recoverTransaction(run)).toEqual(run);
  });
  test.each(["local", "independent", "saga", "two-phase"] as const)("rechazo en %s", mode => {
    const run = runTransaction({ mode, failure: "payment" });
    expect(run.state.stock).toBe(mode === "independent" ? 2 : 3); expect(run.state.chargedMinor).toBe(0); expect(run.state.order).toBe(mode === "saga" ? "cancelled" : "created"); causal(run.capture);
  });
  test("compensación fallida se recupera sin cobrar ni mutar anterior; repetir no añade eventos", () => {
    const run = runTransaction({ mode: "saga", failure: "compensation" }), snapshot = JSON.stringify(run), next = recoverTransaction(run);
    expect(run.state).toMatchObject({ stock: 2, reserved: 1, order: "attention" }); expect(next.state).toMatchObject({ stock: 3, reserved: 0, order: "cancelled", chargedMinor: 0 });
    expect(next.pending).toBeNull(); expect(next.recovered).toBe(true); expect(JSON.stringify(run)).toBe(snapshot); expect(recoverTransaction(next)).toEqual(next); causal(next.capture);
  });
  test("2PC recupera la decisión registrada, conservándola", () => {
    const run = runTransaction({ mode: "two-phase", failure: "coordinator" });
    expect(run.state).toMatchObject({ prepared: true, decision: "commit", stock: 3 }); const next = recoverTransaction(run);
    expect(next.state).toMatchObject({ prepared: false, decision: "commit", stock: 2, chargedMinor: 8900, order: "confirmed" }); causal(next.capture);
  });
  test("estado público local no incluye cambios privados antes de commit", () => {
    const run = runTransaction({ mode: "local", failure: "none" }); expect(run.capture.events[1].publicState.stock).toBe(3); expect(run.capture.events[2].publicState.stock).toBe(2);
    const original = JSON.stringify(run.capture); run.state.stock = 0; expect(JSON.stringify(run.capture)).toBe(original);
  });
  test.each([{ mode: "local", failure: "compensation" }, { mode: "saga", failure: "coordinator" }] as TransactionSettings[])("rechaza combinación %j", setting => { expect(() => runTransaction(setting)).toThrow(); });
  test("settings y estado inicial no comparten referencias", () => { const run = runTransaction(defaultTransaction); run.settings.failure = "none"; expect(defaultTransaction.failure).toBe("payment"); expect(runTransaction(defaultTransaction).state.chargedMinor).toBe(0); });
});

test("AC-8: progreso del capítulo10 necesita cuatro logros y quiz, valida persistencia", () => {
  const partial = awardCourse(initialCourseProgress, 10, ["partial"], true); expect(courseComplete(partial, 10)).toBe(false);
  const complete = awardCourse(partial, 10, ["late", "stale", "compensated"]); expect(courseComplete(decodeCourseProgress(JSON.stringify(complete)), 10)).toBe(true);
  expect(initialCourseProgress.chapters[10]).toBeUndefined();
});
