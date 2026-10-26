import { etagMatches, negotiate } from "@/lib/http-representation";
import { OrderError } from "@/lib/orders";
import { readJSON } from "@/lib/read-json";

async function diagnose(request: Request) {
  const traceId = crypto.randomUUID();
  try {
    const query = [...new URL(request.url).searchParams];
    if (query.length > 20 || query.some(([key, value]) => key.length > 40 || value.length > 200)) throw new OrderError(400, "QUERY_LIMIT", "Máximo 20 params, claves de 40 y valores de 200 caracteres.");
    const type = negotiate(request.headers.get("accept"));
    if (!type) throw new OrderError(406, "NOT_ACCEPTABLE", "Este receptor ofrece application/json o text/plain. Negocia q y comodines comunes; omite otros parámetros de medios.");
    const body = request.method === "GET" ? null : await readJSON(request, true);
    const data = { diagnostic: true, method: request.method, message: query.find(([key]) => key === "message")?.[1] ?? "Hola", query, body };
    const text = type === "application/json" ? JSON.stringify(data) : `${data.method}: ${data.message}\n${JSON.stringify({ query, body }, null, 2)}\nEco de diagnóstico, sin persistencia.`;
    const headers: Record<string, string> = { "Content-Type": `${type}; charset=utf-8`, "Cache-Control": "no-store", "X-Trace-Id": traceId, Vary: "Accept" };
    if (request.method === "GET") {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      const etag = `"${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("")}"`;
      headers.ETag = etag; headers["Cache-Control"] = "private, no-cache";
      if (etagMatches(request.headers.get("if-none-match"), etag)) return new Response(null, { status: 304, headers });
    }
    return new Response(text, { headers });
  } catch (cause) {
    const error = cause instanceof OrderError ? cause : new OrderError(500, "INTERNAL_ERROR", "No se pudo procesar el diagnóstico.");
    return Response.json({ error: { code: error.code, message: error.message }, traceId }, { status: error.status, headers: { "Cache-Control": "no-store", "X-Trace-Id": traceId, Vary: "Accept" } });
  }
}

export const GET = diagnose;
export const POST = diagnose;
export const PUT = diagnose;
export const PATCH = diagnose;
export const DELETE = diagnose;
