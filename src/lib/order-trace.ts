import { OrderError } from "./orders";
import { event, indexEvents, type Stage, type TraceEvent } from "./trace";

export function orderTrace(method: "POST" | "GET" | "PATCH", path: string) {
  const traceId = crypto.randomUUID(), events: TraceEvent[] = [];
  function add(stage: Stage, input: unknown = null, output: unknown = null) {
    const entry = event(stage, structuredClone(input), structuredClone(output));
    if (stage === "route") { entry.contract = `${method} ${path}`; entry.code = `export async function ${method}(request, context) { /* handler real */ }`; }
    if (stage === "authorize" && method !== "POST") {
      entry.contract = method === "GET" ? "orders:read · buyer o reader" : method === "PATCH" ? "orders:confirm · buyer" : "orders:create · buyer";
      entry.explanation = { intuition: "El servidor comprueba el permiso de esta operación.", engineering: `La operación exige ${entry.contract}. Identidad y permiso son decisiones distintas.`, internals: "Se instrumenta la comprobación del handler real. Las credenciales son públicas y no implementan privacidad entre usuarios." };
      entry.code = method === "GET" ? '// Los roles reconocidos buyer y reader pueden consultar.' : 'if (role !== "buyer") throw new OrderError(403, "FORBIDDEN", message);';
    }
    if (stage === "validate" && method === "PATCH") {
      entry.contract = 'PATCH · exactamente {"status":"confirmed"}'; entry.code = 'const input = await readJSON(request);\n// Se comprueba objeto, campo único y valor confirmed.';
      entry.explanation = { intuition: "El servidor comprueba los datos de confirmación.", engineering: "Se exige application/json, máximo4096 bytes UTF-8 y exactamente status:confirmed.", internals: "La comprobación está en el Route Handler. Un objeto JSON válido puede incumplir este contrato." };
    }
    events.push(entry); return entry;
  }
  function respond(status: number, body: Record<string, unknown>) {
    add("response", null, { status });
    return Response.json({ ...body, traceId, events: indexEvents(traceId, events) }, { status, headers: { "Cache-Control": "no-store", "X-Trace-Id": traceId, ...(status === 401 ? { "WWW-Authenticate": 'Bearer realm="api-universe-demo"' } : {}) } });
  }
  function fail(cause: unknown, message: string) {
    const error = cause instanceof OrderError ? cause : new OrderError(500, "INTERNAL_ERROR", message);
    const last = events.at(-1)!;
    if (!(cause instanceof OrderError)) console.error(JSON.stringify({ traceId, stage: last.stage, code: "INTERNAL_ERROR" }));
    last.state = "error"; last.error = { code: error.code, message: error.message };
    return respond(error.status, { error: { code: error.code, message: error.message } });
  }
  add("route");
  return { add, respond, fail };
}
