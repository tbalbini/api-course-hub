import { readJSON } from "@/lib/read-json";
import { authenticate, createOrder, OrderError, store, validateOrder } from "@/lib/orders";
import { orderTrace } from "@/lib/order-trace";

export async function POST(request: Request) {
  const trace = orderTrace("POST", "/api/orders");
  try {
    const authentication = trace.add("authenticate");
    const role = authenticate(request.headers.get("authorization"));
    authentication.output = { role };
    const authorization = trace.add("authorize", { role });
    if (role !== "buyer") throw new OrderError(403, "FORBIDDEN", "El lector está reconocido, pero no tiene permiso para crear pedidos.");
    authorization.output = { permission: "orders:create", allowed: true };
    const validation = trace.add("validate");
    const input = validateOrder(await readJSON(request));
    validation.input = input; validation.output = { valid: true };
    const business = trace.add("business", input);
    const result = createOrder(store, input, request.headers.get("idempotency-key"));
    business.output = { totalMinor: result.order.totalMinor, currency: result.order.currency };
    trace.add(result.repeated ? "deduplicate" : "persist", input, result.order);
    return trace.respond(result.repeated ? 200 : 201, { order: result.order, repeated: result.repeated });
  } catch (cause) { return trace.fail(cause, "El servidor no pudo completar la operación. Reintenta con la misma clave."); }
}
