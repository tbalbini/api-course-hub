import type { Order } from "./orders";
import { PRODUCT } from "./product";
import { stages, type Capture, type Stage, type TraceEvent } from "./trace";

export interface OrderReceipt { order?: Order; error?: { code: string; message: string }; traceId: string; repeated?: boolean; events?: TraceEvent[] }
export interface OrderOutcome { method: "POST" | "GET" | "PATCH"; status: number; role?: string; quantity?: number; repeated?: boolean; errorCode?: string }
export type ProjectGoal = "created" | "read" | "confirmed" | "invalid" | "forbidden" | "repeated";
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
export function isOrder(value: unknown): value is Order {
  return record(value) && typeof value.id === "string" && value.id.length > 0 && value.id.length <= 80 && value.sku === PRODUCT.sku && typeof value.quantity === "number" && Number.isInteger(value.quantity) && value.quantity >= 1 && value.quantity <= 5 && value.totalMinor === value.quantity * PRODUCT.priceMinor && value.currency === PRODUCT.currency && (value.status === "created" || value.status === "confirmed") && typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt));
}
function serverEvent(value: unknown, previous: Set<string>): value is TraceEvent {
  if (!record(value) || typeof value.stage !== "string" || !Object.hasOwn(stages, value.stage)) return false;
  const text = (item: unknown) => typeof item === "string" && item.trim().length > 0;
  if (!record(value.interaction) || !text(value.interaction.initiator) || !text(value.interaction.receiver) || !text(value.interaction.technology) || !Array.isArray(value.interaction.possibleFailures) || !value.interaction.possibleFailures.every(text)) return false;
  const definition = stages[value.stage as Stage];
  return value.actor === definition.actor && value.boundary === definition.boundary && value.provenance === "observed" && (value.state === "ok" || value.state === "error") && typeof value.id === "string" && !previous.has(value.id) && typeof value.action === "string" && typeof value.contract === "string" && typeof value.code === "string" && record(value.explanation) && ["intuition", "engineering", "internals"].every(key => typeof value.explanation === "object" && value.explanation !== null && typeof (value.explanation as Record<string, unknown>)[key] === "string") && Array.isArray(value.dependencies) && value.dependencies.every((id: unknown) => typeof id === "string" && previous.has(id)) && (value.error === undefined || record(value.error) && typeof value.error.code === "string" && typeof value.error.message === "string");
}
export function projectReceipt(value: unknown, status: number, header: string | null, request: NonNullable<Capture["request"]>): OrderReceipt {
  if (!record(value) || typeof value.traceId !== "string" || !value.traceId || value.traceId !== header || !Array.isArray(value.events) || value.events.length < 2 || value.events.length > 32) throw new Error("Respuesta sin traza correlacionada válida.");
  const seen = new Set<string>(), events: TraceEvent[] = [], candidates: unknown[] = value.events;
  for (const [index, candidate] of candidates.entries()) {
    if (!serverEvent(candidate, seen) || candidate.id !== `${value.traceId}:${index}` || candidate.logicalTime !== index) throw new Error("Eventos del servidor inválidos; no se presentan como instrumentación confiable.");
    seen.add(candidate.id); events.push(candidate);
  }
  const last = events.at(-1)!;
  const contract = `${request.method} ${request.method === "POST" ? "/api/orders" : "/api/orders/{id}"}`;
  if (events[0].stage !== "route" || events[0].contract !== contract || last.stage !== "response" || !record(last.output) || last.output.status !== status) throw new Error("La traza no corresponde a la operación o estado HTTP recibidos.");
  const success = status >= 200 && status < 300;
  if (success) {
    if (!isOrder(value.order)) throw new Error("El pedido recibido incumple el contrato.");
    if (request.method === "POST") {
      if (!record(request.body) || value.order.sku !== request.body.sku || value.order.quantity !== request.body.quantity || value.order.status !== "created" || !(status === 201 && value.repeated === false || status === 200 && value.repeated === true)) throw new Error("La respuesta no corresponde a esta creación.");
    } else {
      const id = decodeURIComponent(new URL(request.url, "https://local.example").pathname.split("/").at(-1)!);
      if (status !== 200 || value.order.id !== id || request.method === "PATCH" && value.order.status !== "confirmed") throw new Error("La respuesta no corresponde al pedido u operación solicitados.");
    }
  } else if (!record(value.error) || typeof value.error.code !== "string" || typeof value.error.message !== "string") throw new Error("Falta un error contractual en el rechazo HTTP.");
  return structuredClone({ traceId: value.traceId, events, ...(success ? { order: value.order as Order } : { error: value.error as { code: string; message: string } }), ...(typeof value.repeated === "boolean" ? { repeated: value.repeated } : {}) });
}
export function projectAchievements(outcome: OrderOutcome): ProjectGoal[] {
  const { method, status, role, quantity, errorCode, repeated } = outcome;
  return [
    ...(method === "POST" && status === 201 ? ["created" as const] : []),
    ...(method === "GET" && status === 200 ? ["read" as const] : []),
    ...(method === "PATCH" && status === 200 ? ["confirmed" as const] : []),
    ...(method === "POST" && status === 400 && errorCode === "INVALID_INPUT" && typeof quantity === "number" && (quantity < 1 || quantity > 5) ? ["invalid" as const] : []),
    ...(method !== "GET" && status === 403 && role === "reader" && errorCode === "FORBIDDEN" ? ["forbidden" as const] : []),
    ...(method === "POST" && status === 200 && repeated === true ? ["repeated" as const] : []),
  ];
}
