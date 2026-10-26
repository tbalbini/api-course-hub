import { modelStep } from "./communication";
import { interaction } from "./interaction";
import { indexEvents, type Capture, type TraceEvent } from "./trace";

export const wireQueries = { number: "SELECT 1;", utf8: "SELECT 'á';" } as const;
export interface WireSettings { query: keyof typeof wireQueries; chunkSize: number; fault: "none" | "truncated" | "length" }
export const defaultWire: WireSettings = { query: "number", chunkSize: 4, fault: "none" };
export interface WireSnapshot { received: number; query: string | null; state: "waiting" | "complete" | "error" }
export interface WireRun { settings: WireSettings; frame: number[]; delivered: number[]; query: string | null; error: string | null; snapshots: WireSnapshot[]; capture: Capture }

export function encodeQuery(query: string): Uint8Array<ArrayBuffer> {
  if (query.includes("\0")) throw new Error("El texto no puede incluir NUL.");
  const text = new TextEncoder().encode(query), length = 4 + text.length + 1;
  if (length > 256) throw new Error("El ejemplo admite un frame de hasta256 bytes después del tag.");
  const frame = new Uint8Array(1 + length); frame[0] = 81;
  new DataView(frame.buffer).setInt32(1, length, false); frame.set(text, 5);
  return frame;
}
export function decodeQuery(bytes: Uint8Array): string | null {
  if (!bytes.length) return null;
  if (bytes[0] !== 81) throw new Error("Tag distinto de Q: este parser solo admite Query.");
  if (bytes.length < 5) return null;
  const length = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(1, false);
  if (length < 5 || length > 256) throw new Error("Longitud fuera del límite del parser.");
  if (bytes.length < length + 1) return null;
  if (bytes.length > length + 1) throw new Error("Se recibió más de un frame o bytes sobrantes.");
  const payload = bytes.subarray(5);
  if (payload.at(-1) !== 0 || payload.subarray(0, -1).includes(0)) throw new Error("String requiere un único NUL al final.");
  return new TextDecoder("utf-8", { fatal: true }).decode(payload.subarray(0, -1));
}
export function wireRun(options: WireSettings): WireRun {
  if (!Object.hasOwn(wireQueries, options.query) || ![1,4,8,64].includes(options.chunkSize) || !["none", "truncated", "length"].includes(options.fault)) throw new Error("Configuración wire inválida.");
  const settings = { ...options }, frame = encodeQuery(wireQueries[settings.query]);
  if (settings.fault === "length") new DataView(frame.buffer).setInt32(1, 3, false);
  const delivered = settings.fault === "truncated" ? frame.slice(0, -1) : frame.slice();
  const entries: TraceEvent[] = [], snapshots: WireSnapshot[] = [];
  let received = 0, query: string | null = null, error: string | null = null;
  function snapshot(state: WireSnapshot["state"]) { snapshots.push({ received, query, state }); }
  entries.push(modelStep("handler", "El cliente codifica un mensaje Query", { query: wireQueries[settings.query] }, Array.from(frame), "Un driver transforma una operación en bytes que obedecen un protocolo de aplicación.", "browser", "Q + Int32 big endian + String terminada en0", "length = 4 + utf8.length + 1;\nframe = [81, ...int32be(length), ...utf8, 0];", "Es un frame Simple Query acotado. Su codificación se calcula en JS; no se abre conexión, autentica ni ejecuta SQL. El startup y el protocolo extendido se omiten.", interaction("Cliente DB modelado", "Codificador del ejemplo", "PostgreSQL Query · codificación local", "Longitud, terminador o codificación inválidos."))); snapshot("waiting");
  for (let offset = 0; offset < delivered.length; offset += settings.chunkSize) {
    const chunk = delivered.slice(offset, offset + settings.chunkSize); received += chunk.length;
    const entry = modelStep("crossBoundary", "Un fragmento amplía el buffer del receptor", Array.from(chunk), { received, total: frame.length }, "La unidad recibida puede contener solo parte de un mensaje. El receptor acumula antes de interpretar el frame completo.", "transport", "Flujo ordenado de bytes · fragmentación conceptual", "buffer = concat(buffer, chunk);\nconst query = decodeQuery(buffer);", "Estos cortes no son segmentos TCP capturados. TCP no conserva límites de mensajes de aplicación. El parser usa tag y longitud; este ejemplo no es un cliente PostgreSQL completo.", interaction("Emisor de bytes modelado", "Parser del receptor modelado", "TCP conceptual + framing PostgreSQL", "Fin prematuro o frame mal formado."));
    entries.push(entry);
    try { query = decodeQuery(delivered.subarray(0, received)); snapshot(query === null ? "waiting" : "complete"); }
    catch (cause) { error = "INVALID_FRAME"; entry.state = "error"; entry.error = { code: error, message: cause instanceof Error ? cause.message : "Frame inválido." }; snapshot("error"); break; }
  }
  if (!error) {
    const end = modelStep("checkContract", query === null ? "El flujo termina antes de completar el mensaje" : "El parser recupera la sentencia completa", { received, required: frame.length }, query, query === null ? "El fin de los bytes disponibles no permite inventar el terminador que falta." : "Completar framing permite leer la sentencia, pero no demuestra que una base de datos la haya ejecutado.", "browser", "Un frame completo antes de decodificar String", "if (query === null && eof) throw new Error('INCOMPLETE_FRAME');", "El servidor y su ejecución SQL están fuera de este experimento. En un stream hay que acordar framing, fin, buffers, límites y recuperación; un chunk no equivale a un evento de negocio.", interaction("Parser del receptor modelado", "Consumidor de mensajes", "Validación de frame · modelo", "EOF antes de completar el mensaje."));
    entries.push(end);
    if (query === null) { error = "INCOMPLETE_FRAME"; end.state = "error"; end.error = { code: error, message: "EOF incompleto: no se entrega una sentencia a ejecución." }; }
    snapshot(error ? "error" : "complete");
  }
  return { settings, frame: Array.from(frame), delivered: Array.from(delivered), query, error, snapshots, capture: { id: "advanced:wire", mode: "simulation", events: indexEvents("advanced:wire", entries) } };
}
