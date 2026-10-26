import { beforeEach, describe, expect, test } from "vitest";
import { authenticate, createOrder, newStore, OrderError, store, validateOrder } from "@/lib/orders";
import { POST } from "@/app/api/orders/route";
import { GET, PATCH } from "@/app/api/orders/[id]/route";

const input = { sku: "kit-api", quantity: 2 };
function request(body: unknown = input, options: { auth?: string; key?: string; type?: string } = {}) {
  return new Request("http://localhost/api/orders", { method: "POST", headers: { authorization: options.auth ?? "Bearer demo-buyer", "idempotency-key": options.key ?? crypto.randomUUID(), "content-type": options.type ?? "application/json" }, body: JSON.stringify(body) });
}

describe("Contrato y efectos de pedidos", () => {
  beforeEach(() => { store.orders.clear(); store.keys.clear(); });

  test.each([null, [], { ...input, priceMinor: 1 }, { ...input, quantity: "2" }, { ...input, quantity: 0 }, { ...input, quantity: 1.2 }, { ...input, quantity: 6 }, { ...input, sku: "otro" }])("rechaza datos fuera del contrato: %j", value => {
    expect(() => validateOrder(value)).toThrow(OrderError);
  });

  test("calcula el precio en servidor y deduplica por clave y datos", () => {
    const state = newStore();
    const first = createOrder(state, validateOrder(input), "same-key");
    const repeated = createOrder(state, validateOrder(input), "same-key");
    expect(first.order.totalMinor).toBe(17800);
    expect(first.repeated).toBe(false);
    expect(repeated.order.id).toBe(first.order.id);
    expect(repeated.repeated).toBe(true);
    expect(state.orders.size).toBe(1);
    expect(() => createOrder(state, { ...input, quantity: 3 }, "same-key")).toThrow("datos distintos");
    expect(state.orders.size).toBe(1);
  });

  test("no confunde identidad con permiso", async () => {
    expect(authenticate("Bearer demo-reader")).toBe("reader");
    expect(() => authenticate(null)).toThrow(OrderError);
    const absent = await POST(request(input, { auth: "" }));
    const denied = await POST(request(input, { auth: "Bearer demo-reader" }));
    expect(absent.status).toBe(401);
    expect(denied.status).toBe(403);
    expect(store.orders.size).toBe(0);
    for (const response of [absent, denied]) {
      const body = await response.json();
      expect(body.events.some((entry: { actor: string }) => entry.actor === "store")).toBe(false);
      expect(response.headers.get("x-trace-id")).toBe(body.traceId);
    }
  });

  test("dos solicitudes concurrentes con la misma clave crean solo un pedido", async () => {
    const responses = await Promise.all([POST(request(input, { key: "concurrent" })), POST(request(input, { key: "concurrent" }))]);
    expect(responses.map(response => response.status).sort()).toEqual([200, 201]);
    const bodies = await Promise.all(responses.map(response => response.json()));
    expect(bodies[0].order.id).toBe(bodies[1].order.id);
    expect(store.orders.size).toBe(1);
    const retrieved = await GET(new Request("http://localhost", { headers: { authorization: "Bearer demo-reader" } }), { params: Promise.resolve({ id: bodies[0].order.id }) });
    expect((await retrieved.json()).order.totalMinor).toBe(17800);
  });

  test("devuelve 409 al cambiar los datos bajo una clave", async () => {
    await POST(request(input, { key: "conflict" }));
    const response = await POST(request({ ...input, quantity: 3 }, { key: "conflict" }));
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("IDEMPOTENCY_CONFLICT");
    expect(store.orders.size).toBe(1);
  });

  test("limita el cuerpo y comprueba JSON y content type antes de guardar", async () => {
    expect((await POST(request(input, { type: "text/plain" }))).status).toBe(415);
    expect((await POST(request({ junk: "a".repeat(5000) }))).status).toBe(413);
    const malformed = new Request("http://localhost", { method: "POST", headers: { authorization: "Bearer demo-buyer", "content-type": "application/json" }, body: "{" });
    expect((await POST(malformed)).status).toBe(400);
    expect(store.orders.size).toBe(0);
  });

  test("acota memoria sin impedir recuperar un resultado previo", () => {
    const state = newStore();
    for (let i = 0; i < 200; i++) createOrder(state, input, String(i));
    expect(() => createOrder(state, input, "overflow")).toThrow("200 pedidos");
    expect(createOrder(state, input, "0").repeated).toBe(true);
  });

  test("confirma idempotentemente sin cambiar el snapshot de creación ni el total", async () => {
    const original = createOrder(store, input, "creation-snapshot").order;
    const context = { params: Promise.resolve({ id: original.id }) };
    const confirm = () => PATCH(new Request("http://localhost", { method: "PATCH", headers: { authorization: "Bearer demo-buyer", "content-type": "application/json; charset=utf-8" }, body: '{"status":"confirmed"}' }), context);
    const responses = await Promise.all([confirm(), confirm()]);
    expect(responses.map(response => response.status)).toEqual([200, 200]);
    const current = await GET(new Request("http://localhost", { headers: { authorization: "Bearer demo-reader" } }), context);
    expect((await current.json()).order).toEqual({ ...original, status: "confirmed" });
    expect(createOrder(store, input, "creation-snapshot").order.status).toBe("created");
    expect(store.orders.size).toBe(1);
    for (const response of responses) {
      const body = await response.json();
      expect(response.headers.get("x-trace-id")).toBe(body.traceId);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(body.order.totalMinor).toBe(original.totalMinor);
    }
  });

  test.each([
    [401, "", "application/json", '{"status":"confirmed"}'],
    [403, "Bearer demo-reader", "application/json", '{"status":"confirmed"}'],
    [415, "Bearer demo-buyer", "text/plain", '{"status":"confirmed"}'],
    [413, "Bearer demo-buyer", "application/json", JSON.stringify({ junk: "a".repeat(5000) })],
    [400, "Bearer demo-buyer", "application/json", "{"],
    [400, "Bearer demo-buyer", "application/json", "null"],
    [400, "Bearer demo-buyer", "application/json", '[]'],
    [400, "Bearer demo-buyer", "application/json", '{"status":"created"}'],
    [400, "Bearer demo-buyer", "application/json", '{"status":"confirmed","totalMinor":1}'],
  ])("PATCH rechaza %s sin modificar el pedido", async (status, auth, type, body) => {
    const order = createOrder(store, input, "seed").order;
    const response = await PATCH(new Request("http://localhost", { method: "PATCH", headers: { authorization: String(auth), "content-type": String(type) }, body: String(body) }), { params: Promise.resolve({ id: order.id }) });
    expect(response.status).toBe(status);
    expect((await response.json()).error.message).toBeTruthy();
    expect(store.orders.get(order.id)?.status).toBe("created");
  });

  test("PATCH no crea un pedido cuando no existe", async () => {
    const response = await PATCH(new Request("http://localhost", { method: "PATCH", headers: { authorization: "Bearer demo-buyer", "content-type": "application/json" }, body: '{"status":"confirmed"}' }), { params: Promise.resolve({ id: "no-existe" }) });
    expect(response.status).toBe(404); expect(store.orders.size).toBe(0);
  });
  test("AC-6: los tres handlers incluyen challenge Bearer en401", async () => {
    const context = { params: Promise.resolve({ id: "no-existe" }) };
    const responses = await Promise.all([POST(request(input, { auth: "" })), GET(new Request("http://localhost"), context), PATCH(new Request("http://localhost", { method: "PATCH" }), context)]);
    for (const response of responses) {
      expect(response.status).toBe(401);
      expect(response.headers.get("www-authenticate")).toBe('Bearer realm="api-universe-demo"');
      const body = await response.json();
      expect(body.error.code).toBe("UNAUTHENTICATED");
      expect(body.order).toBeUndefined();
    }
    expect(store.orders.size).toBe(0);
  });

  test("0013 AC-3: GET y PATCH instrumentan solo mecanismos observados y mantienen el snapshot POST", async () => {
    const creation = await POST(request(input, { key: "traced" })), original = await creation.json();
    const context = { params: Promise.resolve({ id: original.order.id }) };
    const get = () => GET(new Request("http://localhost", { headers: { authorization: "Bearer demo-reader" } }), context);
    const patch = () => PATCH(new Request("http://localhost", { method: "PATCH", headers: { authorization: "Bearer demo-buyer", "content-type": "application/json" }, body: '{"status":"confirmed"}' }), context);
    for (const [response, expected] of [[await get(), ["route", "authenticate", "authorize", "readStore", "response"]], [await patch(), ["route", "authenticate", "authorize", "validate", "confirmStored", "response"]]] as const) {
      const body = await response.json();
      expect(body.events.map((e: { stage: string }) => e.stage)).toEqual(expected);
      expect(response.headers.get("x-trace-id")).toBe(body.traceId); expect(response.headers.get("cache-control")).toBe("no-store");
      body.events.forEach((e: { id: string; logicalTime: number; provenance: string; dependencies: string[] }, i: number) => {
        expect(e.id).toBe(`${body.traceId}:${i}`); expect(e.logicalTime).toBe(i); expect(e.provenance).toBe("observed");
        expect(e.dependencies).toEqual(i ? [`${body.traceId}:${i - 1}`] : []);
      });
      const captured = body.events.map((e: { input: unknown; output: unknown }) => ({ input: e.input, output: e.output }));
      expect(JSON.stringify(captured)).not.toContain("Bearer");
    }
    expect((await (await get()).json()).order.status).toBe("confirmed");
    expect((await (await POST(request(input, { key: "traced" }))).json()).order).toEqual(original.order);
    expect(store.orders.size).toBe(1);
  });
  test.each([
    ["GET", "", null, 401, "authenticate"], ["GET", "Bearer demo-reader", null, 404, "readStore"],
    ["PATCH", "Bearer demo-reader", { status: "confirmed" }, 403, "authorize"],
    ["PATCH", "Bearer demo-buyer", { status: "paid" }, 400, "validate"],
    ["PATCH", "Bearer demo-buyer", { status: "confirmed" }, 404, "confirmStored"],
  ])("0013 AC-3: %s con rechazo%s termina en%s sin efectos", async (method, auth, body, status, stage) => {
    const context = { params: Promise.resolve({ id: "no-existe" }) };
    const req = new Request("http://localhost", { method: String(method), headers: { authorization: String(auth), "content-type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
    const response = await (method === "GET" ? GET(req, context) : PATCH(req, context)), received = await response.json();
    expect(response.status).toBe(status); expect(store.orders.size).toBe(0);
    expect(received.events.at(-2).stage).toBe(stage); expect(received.events.at(-2).state).toBe("error");
    expect(received.events.at(-1).output.status).toBe(status);
    if (status === 401 || status === 403 || status === 400) expect(received.events.some((e: { actor: string }) => e.actor === "store")).toBe(false);
  });
});
