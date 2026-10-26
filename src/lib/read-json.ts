import { OrderError } from "./orders";

export async function readJSON(request: Request, allowEmpty = false): Promise<unknown> {
  const jsonType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json";
  if (!jsonType && !allowEmpty) throw new OrderError(415, "CONTENT_TYPE", "Envía application/json.");
  const reader = request.body?.getReader();
  if (!reader) {
    if (allowEmpty) return null;
    throw new OrderError(400, "EMPTY_BODY", "Falta el cuerpo JSON.");
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 4096) { await reader.cancel(); throw new OrderError(413, "BODY_TOO_LARGE", "El máximo es 4096 bytes."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (size === 0 && allowEmpty) return null;
  if (!jsonType) throw new OrderError(415, "CONTENT_TYPE", "Envía application/json para un body no vacío.");
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new OrderError(400, "INVALID_JSON", "El cuerpo no es JSON válido en UTF-8."); }
}

