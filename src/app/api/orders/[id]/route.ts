import { authenticate, confirmStoredOrder, OrderError, store } from "@/lib/orders";
import { readOrder } from "@/lib/order-status";
import { readJSON } from "@/lib/read-json";
import { orderTrace } from "@/lib/order-trace";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const trace = orderTrace("GET", "/api/orders/{id}");
  try {
    const authentication = trace.add("authenticate");
    const role = authenticate(request.headers.get("authorization")); authentication.output = { role };
    trace.add("authorize", { role }, { permission: "orders:read", allowed: true });
    const { id } = await context.params;
    const lookup = trace.add("readStore", { id });
    const stored = store.orders.get(id);
    if (!stored) throw new OrderError(404, "NOT_FOUND", "Ese pedido no existe en este proceso.");
    const order = readOrder(stored); lookup.output = order;
    return trace.respond(200, { order });
  } catch (cause) { return trace.fail(cause, "No se pudo consultar el pedido."); }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const trace = orderTrace("PATCH", "/api/orders/{id}");
  try {
    const authentication = trace.add("authenticate");
    const role = authenticate(request.headers.get("authorization")); authentication.output = { role };
    const authorization = trace.add("authorize", { role });
    if (role !== "buyer") throw new OrderError(403, "FORBIDDEN", "El lector puede consultar, pero no confirmar pedidos.");
    authorization.output = { permission: "orders:confirm", allowed: true };
    const validation = trace.add("validate");
    const input = await readJSON(request);
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 1 || !("status" in input) || input.status !== "confirmed") throw new OrderError(400, "INVALID_INPUT", 'Envía exactamente {"status":"confirmed"}.');
    validation.input = input; validation.output = { valid: true };
    const { id } = await context.params;
    const confirmation = trace.add("confirmStored", { id, status: "confirmed" });
    const order = confirmStoredOrder(store, id); confirmation.output = order;
    return trace.respond(200, { order });
  } catch (cause) { return trace.fail(cause, "No se pudo confirmar el pedido. Consulta su estado antes de inferir el resultado."); }
}
