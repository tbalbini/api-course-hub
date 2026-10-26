import { confirmOrder, type OrderStatus } from "./order-status";
import { PRODUCT } from "./product";
export interface OrderInput { sku: string; quantity: number }
export interface Order extends OrderInput { id: string; totalMinor: number; currency: string; status: OrderStatus; createdAt: string }
interface Store { orders: Map<string, Order>; keys: Map<string, { fingerprint: string; order: Order }> }

export class OrderError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export function newStore(): Store { return { orders: new Map(), keys: new Map() }; }

export function authenticate(header: string | null): "buyer" | "reader" {
  if (header === "Bearer demo-buyer") return "buyer";
  if (header === "Bearer demo-reader") return "reader";
  throw new OrderError(401, "UNAUTHENTICATED", "Usa una credencial pública de demostración válida.");
}

export function validateOrder(value: unknown): OrderInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new OrderError(400, "INVALID_INPUT", "Se esperaba un objeto JSON.");
  const input = value as Record<string, unknown>;
  if (Object.keys(input).some(key => key !== "sku" && key !== "quantity") || input.sku !== PRODUCT.sku || typeof input.quantity !== "number" || !Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 5) {
    throw new OrderError(400, "INVALID_INPUT", "sku debe ser kit-api y quantity un entero de 1 a 5, sin campos adicionales.");
  }
  return { sku: input.sku, quantity: input.quantity };
}

export function createOrder(state: Store, input: OrderInput, key: string | null): { order: Order; repeated: boolean } {
  if (!key || key.length > 100) throw new OrderError(400, "INVALID_KEY", "Idempotency-Key debe tener entre 1 y 100 caracteres.");
  const fingerprint = JSON.stringify(input);
  const previous = state.keys.get(key);
  if (previous) {
    if (previous.fingerprint !== fingerprint) throw new OrderError(409, "IDEMPOTENCY_CONFLICT", "Esta clave ya se utilizó con datos distintos.");
    return { order: previous.order, repeated: true };
  }
  if (state.orders.size >= 200) throw new OrderError(429, "CAPACITY_LIMIT", "Hay 200 pedidos en memoria. Reinicia el servidor para vaciar esta demostración.");
  const order: Order = { ...input, id: crypto.randomUUID(), totalMinor: PRODUCT.priceMinor * input.quantity, currency: PRODUCT.currency, status: "created", createdAt: new Date().toISOString() };
  // shortcut: almacén de un proceso sin durabilidad, usar transacción persistente antes de operar con varias instancias.
  state.orders.set(order.id, order);
  state.keys.set(key, { fingerprint, order });
  return { order, repeated: false };
}

export function confirmStoredOrder(state: Store, id: string): Order {
  const order = state.orders.get(id);
  if (!order) throw new OrderError(404, "NOT_FOUND", "Ese pedido no existe en este proceso.");
  const confirmed = confirmOrder(order);
  state.orders.set(id, confirmed);
  return confirmed;
}

// shortcut: mantener el almacén entre recargas del módulo en desarrollo, sustituir por persistencia al salir del laboratorio local.
const globalStore = globalThis as typeof globalThis & { apiUniverseStore?: Store };
export const store = globalStore.apiUniverseStore ??= newStore();
