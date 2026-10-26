export const httpMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
export type HTTPMethod = typeof httpMethods[number];
export interface RequestDraft { method: HTTPMethod; url: string; params: string; headers: string; body: string }
export interface PreparedRequest { method: HTTPMethod; url: string; headers: Record<string, string>; body?: string }
export const defaultDraft: RequestDraft = { method: "GET", url: "/api/lab/http", params: "message=Hola", headers: "Accept: application/json\nContent-Type: application/json", body: '{"message":"Hola desde el body"}' };
const allowedHeaders = ["accept", "content-type", "authorization", "idempotency-key", "if-none-match", "x-demo-note"];

export function prepareRequest(draft: RequestDraft, origin: string): PreparedRequest {
  if (!httpMethods.includes(draft.method)) throw new Error("Método fuera del contrato de este editor.");
  if (draft.url.length + draft.params.length > 2048) throw new Error("URL y params admiten como máximo 2048 caracteres.");
  let url: URL;
  try { url = new URL(draft.url, origin); } catch { throw new Error("La URL no es válida."); }
  if (url.origin !== new URL(origin).origin || url.username || url.password || !/^\/api\/(?:lab\/http|orders(?:\/[A-Za-z0-9-]{1,80})?)$/.test(url.pathname)) throw new Error("Solo se permiten /api/lab/http, /api/orders y /api/orders/{id} del mismo origen.");
  for (const [key, value] of new URLSearchParams(draft.params)) url.searchParams.append(key, value);
  url.hash = "";
  if (url.href.length > 2048) throw new Error("La URL efectiva supera 2048 caracteres al codificar los params.");
  if (draft.headers.length > 8192) throw new Error("Los headers superan 8192 caracteres.");
  const headers: Record<string, string> = {};
  for (const line of draft.headers.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const colon = line.indexOf(":");
    if (colon < 1) throw new Error("Cada header necesita Nombre: valor.");
    const name = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (!allowedHeaders.includes(name)) throw new Error(`Header no admitido: ${name}. Usa ${allowedHeaders.join(", ")}.`);
    if (Object.hasOwn(headers, name)) throw new Error(`Header duplicado: ${name}. Combina sus valores en una línea si su contrato lo admite.`);
    try { new Headers({ [name]: value }); } catch { throw new Error(`Valor de header inválido: ${name}.`); }
    headers[name] = value;
  }
  if (new TextEncoder().encode(draft.body).length > 4096) throw new Error("El body supera 4096 bytes UTF-8.");
  if (draft.method === "POST" && url.pathname === "/api/orders" && !headers["idempotency-key"]) throw new Error("Crear un pedido requiere Idempotency-Key. El preset de creación genera una clave una sola vez.");
  return { method: draft.method, url: url.href, headers, ...(draft.method !== "GET" && draft.body !== "" ? { body: draft.body } : {}) };
}

export function replaceHeader(headers: string, name: string, value: string): string {
  return [...headers.split(/\r?\n/).filter(line => line.trim() && line.slice(0, line.indexOf(":")).trim().toLowerCase() !== name.toLowerCase()), `${name}: ${value}`].join("\n");
}

export function creationUncertain(status: number | undefined, parsed: unknown, bodyRead: boolean, previouslyUncertain: boolean): boolean {
  if (status === undefined || !bodyRead || status >= 500) return true;
  if (status >= 200 && status < 300) return !(parsed && typeof parsed === "object" && "order" in parsed && parsed.order && typeof parsed.order === "object" && "id" in parsed.order && typeof parsed.order.id === "string");
  return previouslyUncertain;
}
