import { interaction } from "./interaction";
import { modelStep } from "./communication";
import type { Actor, Boundary, Capture, Stage, TraceEvent } from "./trace";

export interface SystemSettings {
  architecture: "monolith" | "services"; runtime: "process" | "functions"; entry: "direct" | "proxy" | "gateway";
  balanced: boolean; bff: boolean; inventory: boolean; required: boolean; cache: boolean; changeSource: boolean; breaker: boolean;
  count: number; concurrency: number; gap: number; latency: number; timeout: number; retries: number; backoff: number; threshold: number; target: number;
  failure: "none" | "first-two" | "all";
}
export const defaultSystem: SystemSettings = { architecture: "services", runtime: "process", entry: "proxy", balanced: false, bff: false, inventory: true, required: false, cache: false, changeSource: false, breaker: false, count: 4, concurrency: 2, gap: 0, latency: 80, timeout: 150, retries: 1, backoff: 40, threshold: 300, target: 95, failure: "none" };
export interface SystemEvent extends TraceEvent { atMs: number; requestId: string; traceId: string; spanId: string; parentSpanId: string | null; component: string; kind: "normal" | "late" | "cache" | "breaker" }
export interface SystemResult { requestId: string; traceId: string; status: number; partial: boolean; revision: number; replica: number; attempts: number; cacheHit: boolean; arrivedAt: number; startedAt: number; endedAt: number; body: unknown }
export interface SystemRun { settings: SystemSettings; capture: Omit<Capture, "events"> & { events: SystemEvent[] }; results: SystemResult[]; metrics: ReturnType<typeof systemMetrics>; breakerStates: { state: string; generation: number }[] }
export function systemMetrics(results: SystemResult[], settings: Pick<SystemSettings, "threshold" | "target">) {
  const durations = results.map(r => r.endedAt - r.arrivedAt).sort((a, b) => a - b);
  const good = results.filter(r => r.status === 200 && !r.partial && r.endedAt - r.arrivedAt <= settings.threshold).length;
  const bad = results.length - good, budget = Math.floor(results.length * (100 - settings.target) / 100);
  return { good, bad, sli: results.length ? 100 * good / results.length : 0, budget, excess: Math.max(0, bad - budget), p95: durations[Math.max(0, Math.ceil(durations.length * .95) - 1)] ?? 0, calls: results.reduce((n, r) => n + r.attempts, 0), hits: results.filter(r => r.cacheHit).length };
}
export function validateSystem(s: SystemSettings) {
  const ranges: [keyof SystemSettings, number, number][] = [["count", 1, 6], ["concurrency", 1, 3], ["latency", 20, 400], ["timeout", 50, 500], ["retries", 0, 2], ["backoff", 20, 200], ["threshold", 50, 1000], ["target", 50, 100]];
  for (const [key, min, max] of ranges) { const value = s[key]; if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new Error(`${key}: necesita un entero entre ${min} y ${max}.`); }
  if (![0, 100, 300].includes(s.gap) || !["monolith", "services"].includes(s.architecture) || !["process", "functions"].includes(s.runtime) || !["direct", "proxy", "gateway"].includes(s.entry) || !["none", "first-two", "all"].includes(s.failure)) throw new Error("Perfil de sistema fuera del contrato.");
  for (const key of ["balanced", "bff", "inventory", "required", "cache", "changeSource", "breaker"] as const) if (typeof s[key] !== "boolean") throw new Error(`${key}: necesita un booleano.`);
}
interface Branch { requestId: string; traceId: string; spanId: string; parentSpanId: string | null; last?: string }
interface Job { at: number; priority: number; sequence: number; run: () => void }
interface Circuit { state: "closed" | "open" | "half-open"; failures: number; until: number; generation: number; last?: string }

export function runSystem(options: SystemSettings): SystemRun {
  validateSystem(options); const settings = { ...options }, events: SystemEvent[] = [], results: SystemResult[] = [], jobs: Job[] = [];
  const circuits: Circuit[] = Array.from({ length: settings.balanced ? 2 : 1 }, () => ({ state: "closed", failures: 0, until: 0, generation: 0 }));
  const initialized = circuits.map(() => ({ at: -1, event: "" }));
  const waiting: { branch: Branch; arrivedAt: number }[] = [];
  let now = 0, sequence = 0, active = 0, admitted = 0, calls = 0;
  let cache: { revision: number; body: unknown; expires: number; event: string } | null = null;
  const schedule = (at: number, run: () => void, priority = 1) => jobs.push({ at, run, priority, sequence: sequence++ });
  function add(branch: Branch, component: string, stage: Stage, action: string, input: unknown, output: unknown, cause: string, extra: { deps?: string[]; actor?: Actor; boundary?: Boundary; kind?: SystemEvent["kind"]; error?: string } = {}) {
    const id = `system:${events.length}`;
    const participants: Record<string, string> = { client: "Cliente", entry: settings.entry === "gateway" ? "API gateway" : "Reverse proxy", balancer: "Balanceador", bff: "BFF", app: "Aplicación de pedidos", store: "Fuente de pedidos", cache: "Caché compartida", inventory: settings.architecture === "services" ? "Servicio de inventario" : "Módulo de inventario" };
    const destination = participants[component];
    const details = interaction(stage === "receive" ? "Aplicación" : stage === "request" ? "Cliente" : stage === "crossBoundary" || component === "store" || component === "cache" ? "Aplicación" : destination, stage === "receive" ? "Cliente" : stage === "request" ? "Aplicación" : destination, extra.boundary === "Red HTTP" ? "HTTP conceptual" : extra.boundary === "Red remota" ? "Llamada entre servicios conceptual" : component === "inventory" ? settings.architecture === "services" ? "Servicio remoto conceptual" : "Llamada local · mismo proceso" : component === "cache" ? "Caché compartida conceptual" : "Modelo de componente local", "Timeout no cancela completaciones tardías.", "Proveedor fallido, circuito abierto o snapshot obsoleto según el paso.");
    const entry: SystemEvent = { ...modelStep(stage, action, { atMs: now, traceId: branch.traceId, spanId: branch.spanId, parentSpanId: branch.parentSpanId, data: input }, output, cause, extra.actor ?? "provider", "GET resumen PED-1042 · modelo", stage === "crossBoundary" ? "const attempt = invokeInventory(readOnlyRequest);\nconst deadline = startedAt + timeout;" : stage === "failure" ? "// Vencer la espera no cancela al proveedor.\nif (attempts <= retries) schedule(backoff * 2 ** (attempts - 1));" : component === "cache" ? "const hit = cache && now < cache.expiresAt;\n// El valor conserva la revisión leída." : extra.kind === "breaker" ? "if (attempt.generation !== circuit.generation) return;\n// Solo resultados vigentes modifican el circuito." : "// Modelo de eventos discretos, sin llamadas HTTP\nschedule(simulatedTime, nextOperation);", `${cause} Milisegundos simulados, no observados. El orden lógico es independiente. No se modela capacidad ni cola interna del proveedor.`, details), id, logicalTime: events.length, atMs: now, requestId: branch.requestId, traceId: branch.traceId, spanId: branch.spanId, parentSpanId: branch.parentSpanId, component, kind: extra.kind ?? "normal", dependencies: [...new Set([...(branch.last ? [branch.last] : []), ...(extra.deps ?? [])])], boundary: extra.boundary ?? "Mismo proceso" };
    if (extra.error) { entry.state = "error"; entry.error = { code: extra.error, message: cause }; }
    events.push(entry); branch.last = id; return id;
  }
  function startNext() {
    while (active < settings.concurrency && waiting.length) {
      const request = waiting.shift()!; active++; const b = request.branch;
      const replica = settings.balanced ? admitted++ % 2 : 0;
      const result: SystemResult = { requestId: b.requestId, traceId: b.traceId, status: 200, partial: false, revision: 0, replica: replica + 1, attempts: 0, cacheHit: false, arrivedAt: request.arrivedAt, startedAt: now, endedAt: now, body: null };
      add(b, "client", "request", "El cliente admite la consulta", { replica: replica + 1, waitedMs: now - request.arrivedAt }, null, "La concurrencia limita consultas activas del cliente, no workers del servidor.", { actor: "browser", boundary: "Red HTTP" });
      let delay = 0;
      if (settings.entry !== "direct") { delay += settings.entry === "proxy" ? 5 : 9; add(b, "entry", "proxy", settings.entry === "proxy" ? "El reverse proxy reenvía" : "El gateway selecciona la ruta de API", null, { route: "/summary" }, "Proxy reenvía; gateway añade políticas de API. Son roles opcionales del modelo.", { actor: "proxy", boundary: "Entrada → aplicación" }); }
      if (settings.balanced) { delay += 2; add(b, "balancer", "balancer", "El balanceador elige réplica", null, { replica: result.replica }, "Round robin al admitir la petición; no se mide carga ni se supone más capacidad.", { actor: "balancer" }); }
      if (settings.bff) { delay += 3; add(b, "bff", "providerModel", "El BFF prepara una vista para el cliente", null, { fields: ["id", "status", "availability", "partial"] }, "El Backend for Frontend adapta el contrato al cliente; añade otro componente.", { boundary: "Red remota" }); }
      schedule(now + delay, () => {
        const ready = initialized[replica];
        if (settings.runtime === "functions" && ready.at < 0) {
          ready.at = now + 40; const initBranch = { ...b, spanId: `init-${replica + 1}`, parentSpanId: b.spanId };
          schedule(ready.at, () => { ready.event = add(initBranch, "app", "providerModel", "Termina el arranque compartido", { replica: replica + 1 }, null, "40ms configurados para esta réplica, no una medición ni garantía de serverless."); });
        }
        const readyAt = Math.max(now, ready.at);
        schedule(readyAt, () => {
          add(b, "app", "route", "La aplicación recibe la consulta", { replica: replica + 1 }, null, "Las solicitudes coincidentes esperan el mismo arranque, sin adelantarlo.", { deps: ready.event ? [ready.event] : [] });
          if (settings.cache) {
            const hit = cache && now < cache.expires ? cache : null;
            add(b, "cache", "providerModel", hit ? "Caché: snapshot recuperado" : "Caché: no hay valor vigente", { key: "summary:PED-1042" }, hit ? { revision: hit.revision, expiresAt: hit.expires } : null, "Caché compartida, TTL500ms. Un hit evita la lectura local y el inventario; no consulta frescura.", { actor: "store", kind: "cache", deps: hit ? [hit.event] : [] });
            if (hit) { result.cacheHit = true; result.revision = hit.revision; result.body = structuredClone(hit.body); finish(); return; }
          }
          schedule(now + 10, () => {
            result.revision = settings.changeSource && now >= 150 ? 2 : 1;
            add(b, "store", "persist", "Leer el pedido de la fuente", null, { id: "PED-1042", status: result.revision === 1 ? "created" : "confirmed", revision: result.revision }, "10ms configurados de lectura. La fuente cambia desde t=150ms; esta revisión se conserva durante retries.", { actor: "store" });
            if (settings.inventory) attempt(); else complete(true);
          });
        });
      });
      function finish() {
        result.endedAt = now;
        add(b, "client", "receive", `La consulta termina con HTTP ${result.status}`, null, result, "El resultado representa lo que recibe el cliente. El proveedor puede seguir trabajando después de un timeout.", { actor: "browser", boundary: "Red HTTP" });
        results.push(structuredClone(result)); active--; startNext();
      }
      function complete(ok: boolean) {
        result.partial = !ok && !settings.required; result.status = ok || !settings.required ? 200 : 503;
        const status = result.revision === 1 ? "created" : "confirmed";
        result.body = result.status !== 200 ? { code: "DEPENDENCY_UNAVAILABLE", id: "PED-1042" } : settings.bff ? { id: "PED-1042", status, availability: ok && settings.inventory ? 3 : null, partial: result.partial } : { order: { id: "PED-1042", status, revision: result.revision }, inventory: ok && settings.inventory ? { sku: "kit-api", available: 3 } : null, partial: result.partial };
        if (settings.cache && result.status === 200 && !result.partial) {
          const key = add(b, "cache", "persist", "Guardar snapshot completo en caché", null, { revision: result.revision, expiresAt: now + 500 }, "Puede sobrescribir un valor más reciente si una consulta antigua acaba después. No hay single flight ni orden monotónico.", { actor: "store", kind: "cache" });
          cache = { revision: result.revision, body: structuredClone(result.body), expires: now + 500, event: key };
        }
        finish();
      }
      function attempt() {
        const circuit = circuits[replica];
        if (settings.breaker && circuit.state === "open" && now >= circuit.until) {
          circuit.state = "half-open";
          circuit.last = add(b, "app", "providerModel", "Circuito half open: admitir una sonda", null, { replica: replica + 1 }, "El cooldown permite una prueba, no declara sano al proveedor.", { kind: "breaker", deps: circuit.last ? [circuit.last] : [] });
        } else if (settings.breaker && circuit.state !== "closed") {
          add(b, "app", "failure", "El circuito rechaza la llamada", { state: circuit.state }, null, "No se llama al proveedor ni se reintenta un rechazo del circuito.", { kind: "breaker", error: "CIRCUIT_OPEN", deps: circuit.last ? [circuit.last] : [] }); complete(false); return;
        }
        const probe = settings.breaker && circuit.state === "half-open", generation = circuit.generation;
        result.attempts++; const ordinal = ++calls, failed = settings.failure === "all" || settings.failure === "first-two" && ordinal <= 2;
        const branch: Branch = { ...b, spanId: `${b.requestId}-inventory-${result.attempts}`, parentSpanId: b.spanId };
        const sentAt = now;
        const endAt = now + settings.latency + (settings.architecture === "services" ? 20 : 0);
        add(branch, "inventory", "crossBoundary", "Invocar inventario", { attempt: result.attempts, ordinal, deadlineAt: now + settings.timeout, replica: replica + 1 }, null, settings.architecture === "services" ? "Llamada entre servicios: proceso distinto y20ms de transporte conceptual." : "Llamada a un módulo dentro del mismo proceso. No existe salto de red.", { boundary: settings.architecture === "services" ? "Red remota" : "Mismo proceso" });
        let settled = false;
        const record = (ok: boolean) => {
          if (!settings.breaker || generation !== circuit.generation) return;
          if (probe && circuit.state === "half-open" || !probe && circuit.state === "closed") {
            if (ok) { circuit.state = "closed"; circuit.failures = 0; }
            else if (probe || ++circuit.failures >= 2) { circuit.state = "open"; circuit.until = now + 300; circuit.generation++; }
            circuit.last = add(b, "app", "providerModel", `Circuito: ${circuit.state}`, { generation }, { failures: circuit.failures, until: circuit.until, generation: circuit.generation }, "Solo resultados vigentes modifican el breaker de esta réplica; llamadas de generaciones anteriores se ignoran.", { kind: "breaker" });
          }
        };
        const settle = (ok: boolean, timedOut: boolean) => {
          settled = true;
          add(b, "app", ok ? "providerModel" : "failure", ok ? "El intento obtiene inventario" : timedOut ? "Vence el timeout del intento" : "Inventario devuelve un fallo", { attempt: result.attempts, sentAt }, { ok }, timedOut ? "El deadline vence sin cancelar el trabajo. El proveedor todavía puede terminar." : "Un resultado del intento puede provocar retry; no se repite la lectura del pedido.", { deps: [branch.last!], error: ok ? undefined : timedOut ? "TIMEOUT" : "DEPENDENCY_FAILURE" });
          record(ok);
          if (ok) complete(true);
          else if (result.attempts <= settings.retries) {
            const wait = settings.backoff * 2 ** (result.attempts - 1);
            add(b, "app", "providerModel", "Esperar backoff exponencial", null, { waitMs: wait }, "El cliente conserva su slot durante la espera. Sin jitter, clientes pueden sincronizar retries.");
            schedule(now + wait, attempt);
          } else complete(false);
        };
        schedule(endAt, () => {
          add(branch, "inventory", "providerModel", settled ? "El proveedor termina después del timeout" : "El proveedor termina el trabajo", { ordinal }, { ok: !failed, available: failed ? null : 3 }, "Completar trabajo y entregar resultado dentro del deadline son hechos distintos.", { kind: settled ? "late" : "normal", error: failed ? "DEPENDENCY_FAILURE" : undefined });
          if (!settled) settle(!failed, false);
        }, 0);
        schedule(now + settings.timeout, () => { if (!settled) settle(false, true); }, 2);
      }
    }
  }
  for (let i = 0; i < settings.count; i++) schedule(i * settings.gap, () => {
    const b: Branch = { requestId: `R${i + 1}`, traceId: `trace-R${i + 1}`, spanId: `R${i + 1}-root`, parentSpanId: null };
    add(b, "client", "click", "Llega una consulta al cliente", null, { arrivedAt: now }, "IDs reproducibles del lote, sin correlación con un servidor real.", { actor: "browser" });
    waiting.push({ branch: b, arrivedAt: now }); startNext();
  });
  while (jobs.length) { jobs.sort((a, b) => a.at - b.at || a.priority - b.priority || a.sequence - b.sequence); const job = jobs.shift()!; now = job.at; job.run(); }
  results.sort((a, b) => a.arrivedAt - b.arrivedAt || a.requestId.localeCompare(b.requestId));
  return { settings, results, metrics: systemMetrics(results, settings), breakerStates: circuits.map(c => ({ state: c.state, generation: c.generation })), capture: { id: "systems:batch", mode: "simulation", events } };
}
