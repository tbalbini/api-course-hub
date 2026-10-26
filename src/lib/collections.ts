import { contractCapture, contractStep } from "./contracts";
import type { TraceEvent } from "./trace";

export interface CollectionOrder { id: string; totalMinor: number; status: "created" | "confirmed" }
export interface CollectionSettings { mode: "offset" | "cursor"; filter: "all" | "created" | "confirmed"; sort: "id-asc" | "id-desc" | "total-asc" | "total-desc"; limit: number; offset: number; cursor: string }
export const defaultCollection: CollectionSettings = { mode: "offset", filter: "all", sort: "id-asc", limit: 2, offset: 0, cursor: "" };
export function initialCollection(): CollectionOrder[] { return [8900, 17800, 8900, 26700, 17800, 35600, 8900].map((totalMinor, index) => ({ id: `PED-100${index + 1}`, totalMinor, status: index % 2 ? "confirmed" : "created" })); }
function compare(left: Pick<CollectionOrder, "id" | "totalMinor">, right: Pick<CollectionOrder, "id" | "totalMinor">, sort: CollectionSettings["sort"]) {
  const byId = left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
  const value = sort.startsWith("total") ? left.totalMinor - right.totalMinor || byId : byId;
  return sort.endsWith("desc") ? -value : value;
}
interface Cursor { filter: CollectionSettings["filter"]; sort: CollectionSettings["sort"]; last: Pick<CollectionOrder, "id" | "totalMinor"> }
function encodeCursor(cursor: Cursor) { return btoa(JSON.stringify(cursor)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", ""); }
function decodeCursor(source: string, settings: CollectionSettings): Cursor {
  try {
    if (source.length > 512 || !/^[A-Za-z0-9_-]+$/.test(source)) throw new Error();
    const value: unknown = JSON.parse(atob(source.replaceAll("-", "+").replaceAll("_", "/")));
    if (!value || typeof value !== "object" || !("filter" in value) || value.filter !== settings.filter || !("sort" in value) || value.sort !== settings.sort || !("last" in value) || !value.last || typeof value.last !== "object" || !("id" in value.last) || typeof value.last.id !== "string" || !/^PED-\d{4}$/.test(value.last.id) || !("totalMinor" in value.last) || typeof value.last.totalMinor !== "number" || !Number.isSafeInteger(value.last.totalMinor) || value.last.totalMinor < 0) throw new Error();
    return value as Cursor;
  } catch { throw new Error("Cursor inválido o perteneciente a otro filtro/orden. Reinicia el recorrido."); }
}
export function collectionPage(records: CollectionOrder[], options: CollectionSettings, seen: string[] = []) {
  const settings = { ...options };
  if (!["offset", "cursor"].includes(settings.mode) || !["all", "created", "confirmed"].includes(settings.filter) || !["id-asc", "id-desc", "total-asc", "total-desc"].includes(settings.sort)) throw new Error("Mecanismo, filtro u orden fuera del contrato.");
  if (!Number.isInteger(settings.limit) || settings.limit < 1 || settings.limit > 3) throw new Error("limit necesita un entero entre 1 y 3.");
  if (!Number.isSafeInteger(settings.offset) || settings.offset < 0) throw new Error("offset necesita un entero no negativo.");
  const filtered = records.filter(record => settings.filter === "all" || record.status === settings.filter).sort((a, b) => compare(a, b, settings.sort));
  const cursor = settings.mode === "cursor" && settings.cursor ? decodeCursor(settings.cursor, settings) : null;
  const remaining = settings.mode === "offset" ? filtered.slice(settings.offset) : cursor ? filtered.filter(record => compare(record, cursor.last, settings.sort) > 0) : filtered;
  const items = remaining.slice(0, settings.limit).map(item => ({ ...item })), more = remaining.length > settings.limit;
  const last = items.at(-1);
  const next = more && last ? settings.mode === "offset" ? String(settings.offset + settings.limit) : encodeCursor({ filter: settings.filter, sort: settings.sort, last: { id: last.id, totalMinor: last.totalMinor } }) : null;
  const duplicates = items.filter(item => seen.includes(item.id)).map(item => item.id);
  const params = new URLSearchParams({ limit: String(settings.limit), sort: settings.sort, ...(settings.filter !== "all" ? { status: settings.filter } : {}), ...(settings.mode === "offset" ? { offset: String(settings.offset) } : settings.cursor ? { cursor: settings.cursor } : {}) });
  const query = `/v1/orders?${params}`, events: TraceEvent[] = [];
  contractStep(events, "request", "Consultar una página de la colección", { query, mode: settings.mode }, null, "La URL es del modelo. No consulta el Map de pedidos reales.", "transport");
  contractStep(events, "providerModel", "Filtrar antes de ordenar y paginar", { filter: settings.filter, sort: settings.sort, records }, filtered, "El id desempata de forma estable. Ordenar solo por un valor repetido puede hacer ambiguo el cursor.");
  contractStep(events, "providerModel", settings.mode === "offset" ? "Saltar un número de posiciones" : "Buscar claves posteriores al cursor", settings.mode === "offset" ? { offset: settings.offset } : cursor, { items, next }, settings.mode === "offset" ? "Una inserción anterior desplaza posiciones. El offset no identifica el último objeto visto." : "El cursor representa clave de orden e id, no una posición. No congela el dataset ni implica firma o secreto.");
  contractStep(events, "response", "Devolver items y continuación", null, { items, next }, "next solo existe si quedan elementos en el dataset actual bajo ese filtro.", "transport");
  contractStep(events, "parse", "El consumidor detecta ids ya observados", { seen }, { duplicates }, "Evitar un duplicado concreto no garantiza una lectura consistente de todos los cambios concurrentes.", "browser");
  return { settings, items, next, duplicates, query, capture: contractCapture("contract:collection", events, { request: { method: "GET", url: `https://design.example${query}`, headers: {} }, response: { status: 200, body: { items, next } } }) };
}
export function insertBeforeWindow(records: CollectionOrder[], settings: CollectionSettings): CollectionOrder[] {
  const entry: CollectionOrder = { id: settings.sort === "id-desc" ? "PED-9999" : "PED-1000", totalMinor: settings.sort === "total-desc" ? 99999 : 1, status: settings.filter === "confirmed" ? "confirmed" : "created" };
  return [...records.map(record => ({ ...record })), entry];
}
