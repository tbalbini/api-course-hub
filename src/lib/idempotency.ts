import { contractCapture, contractStep } from "./contracts";
import { PRODUCT } from "./product";
import type { TraceEvent } from "./trace";

export interface RetrySettings { strategy: "same" | "new-key" | "changed-body"; protection: boolean; loseFirst: boolean; forgetKeys: boolean }
export const defaultRetry: RetrySettings = { strategy: "same", protection: true, loseFirst: true, forgetKeys: false };
export function idempotencyRun(options: RetrySettings) {
  const settings = { ...options }, events: TraceEvent[] = [];
  const orders: { id: string; quantity: number; totalMinor: number }[] = [];
  const keys = new Map<string, { fingerprint: string; order: typeof orders[number] }>();
  const attempts: { key: string; quantity: number; status: number; delivered: boolean; orderId: string | null; repeated: boolean }[] = [];
  for (let index = 0; index < 2; index++) {
    if (index && settings.forgetKeys) {
      keys.clear();
      contractStep(events, "providerModel", "Expira el registro de idempotencia", null, { ordersRetained: orders.length, keys: 0 }, "Este escenario olvida claves pero conserva pedidos. La ventana de dedupe delimita su garantía.");
    }
    const key = index && settings.strategy === "new-key" ? "key-B" : "key-A", quantity = index && settings.strategy === "changed-body" ? 2 : 1;
    const input = { sku: PRODUCT.sku, quantity }, fingerprint = JSON.stringify(input);
    contractStep(events, "request", `Intento ${index + 1} envía ${key}`, { key, input }, null, "Un intento nuevo no implica una operación de negocio nueva. Los headers aquí son conceptuales.", "transport");
    const previous = settings.protection ? keys.get(key) : undefined;
    let status = 201, order: typeof orders[number] | undefined, repeated = false;
    if (previous && previous.fingerprint !== fingerprint) {
      status = 409;
      const conflict = contractStep(events, "deduplicate", "La misma clave identifica otro payload", { key, fingerprint }, { originalFingerprint: previous.fingerprint }, "Cambiar los datos bajo la misma identidad se rechaza sin crear otro pedido.");
      conflict.state = "error"; conflict.error = { code: "IDEMPOTENCY_CONFLICT", message: "Reutilización conflictiva de key-A." };
    } else if (previous) {
      order = previous.order; status = 200; repeated = true;
      contractStep(events, "deduplicate", "Recuperar el pedido de la primera operación", { key }, order, "El proveedor reconoce identidad y datos, y devuelve el resultado almacenado.");
    } else {
      order = { id: `model-${orders.length + 1}`, quantity, totalMinor: quantity * PRODUCT.priceMinor }; orders.push(order);
      if (settings.protection) keys.set(key, { fingerprint, order });
      contractStep(events, "persist", "Guardar un efecto en el almacén del modelo", { key, input }, { order, recordedKey: settings.protection }, "Pedido y clave son atómicos solo en este modelo de una ejecución, sin DB ni concurrencia real.", "store");
    }
    const delivered = !(index === 0 && settings.loseFirst);
    const response = contractStep(events, "response", delivered ? `El intento ${index + 1} devuelve HTTP ${status}` : "Se pierde la primera respuesta después del efecto", { status, order }, { delivered }, delivered ? "La respuesta se conoce por el emisor. HTTP200 del reintento es una decisión del contrato de ejemplo." : "La falta de respuesta no revierte el pedido guardado. El emisor no sabe por ese retorno si terminó.", "transport");
    if (!delivered) { response.state = "error"; response.error = { code: "RESPONSE_LOST", message: "El efecto existe aunque el consumidor no recibió respuesta." }; }
    attempts.push({ key, quantity, status, delivered, orderId: order?.id ?? null, repeated });
  }
  const last = attempts[1];
  return { settings, orders: structuredClone(orders), attempts, capture: contractCapture("contract:idempotency", events, { request: { method: "POST", url: "https://design.example/v1/orders", headers: { "Idempotency-Key": last.key }, body: { sku: PRODUCT.sku, quantity: last.quantity } }, response: { status: last.status, body: { orderId: last.orderId, repeated: last.repeated } } }) };
}
