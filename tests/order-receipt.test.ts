import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { isOrder, projectAchievements, projectReceipt } from "@/lib/order-receipt";
import { orderTrace } from "@/lib/order-trace";
import { createOrder, newStore } from "@/lib/orders";
import { projectSourceFor } from "@/content/project";
import { awardCourse, courseComplete, courseGoals, courseLocation, decodeCourseProgress, initialCourseProgress } from "@/lib/course-progress";
import sources from "@/generated/project-sources.json";
import type { Capture, Stage } from "@/lib/trace";

const input = { sku: "kit-api", quantity: 2 };
const order = createOrder(newStore(), input, "seed").order;
async function receipt(method: "POST" | "GET" | "PATCH" = "POST") {
  const trace = orderTrace(method, method === "POST" ? "/api/orders" : "/api/orders/{id}");
  trace.add(method === "GET" ? "readStore" : method === "PATCH" ? "confirmStored" : "persist", input, order);
  const response = trace.respond(method === "POST" ? 201 : 200, { order: { ...order, status: method === "PATCH" ? "confirmed" : "created" }, ...(method === "POST" ? { repeated: false } : {}) });
  return { body: await response.json(), status: response.status, header: response.headers.get("x-trace-id"), request: { method, url: method === "POST" ? "/api/orders" : `/api/orders/${order.id}`, body: input, headers: {} } satisfies NonNullable<Capture["request"]> };
}

describe("AC-4: recepción estructural y correlación del proyecto", () => {
  test.each(["POST", "GET", "PATCH"] as const)("acepta y copia una recepción %s correlacionada", async method => {
    const { body, status, header, request } = await receipt(method);
    const valid = projectReceipt(body, status, header, request);
    expect(valid.order?.id).toBe(order.id);
    valid.events![0].action = "Otra acción";
    expect(body.events[0].action).not.toBe("Otra acción");
    expect(valid.order).not.toBe(body.order);
  });
  test.each([
    ["id", ""], ["sku", "other"], ["quantity", 0], ["quantity", "2"], ["quantity", 1.5],
    ["totalMinor", 1], ["currency", "USD"], ["status", ["created"]], ["status", "paid"], ["createdAt", "no-date"],
  ])("no acepta Order inválido: %s=%j", (field, value) => expect(isOrder({ ...order, [field]: value })).toBe(false));
  test.each([
    "header", "traceId", "missingEvents", "unknownStage", "actor", "boundary", "provenance", "state", "duplicate", "logicalTime", "dependency", "explanation", "code", "terminal", "httpStatus", "route", "quantity", "repeated", "total",
  ])("rechaza %s sin promover eventos inválidos", async fault => {
    const { body, status, header, request } = await receipt(); let receivedHeader = header;
    if (fault === "header") receivedHeader = "another";
    if (fault === "traceId") body.traceId = 12;
    if (fault === "missingEvents") delete body.events;
    if (fault === "unknownStage") body.events[1].stage = "unknown";
    if (fault === "actor") body.events[1].actor = "browser";
    if (fault === "boundary") body.events[1].boundary = "Otra frontera";
    if (fault === "provenance") body.events[1].provenance = "conceptual";
    if (fault === "state") body.events[1].state = ["ok"];
    if (fault === "duplicate") body.events[1].id = body.events[0].id;
    if (fault === "logicalTime") body.events[1].logicalTime = 99;
    if (fault === "dependency") body.events[1].dependencies = ["future"];
    if (fault === "explanation") body.events[1].explanation.engineering = null;
    if (fault === "code") delete body.events[1].code;
    if (fault === "terminal") body.events.pop();
    if (fault === "httpStatus") body.events.at(-1).output.status = 200;
    if (fault === "route") body.events[0].contract = "GET /api/orders/{id}";
    if (fault === "quantity") { body.order.quantity = 3; body.order.totalMinor = 26700; }
    if (fault === "repeated") body.repeated = true;
    if (fault === "total") body.order.totalMinor = 0;
    expect(() => projectReceipt(body, status, receivedHeader, request)).toThrow();
  });
  test.each(["GET", "PATCH"] as const)("%s exige el id solicitado y PATCH exige confirmed", async method => {
    const { body, status, header, request } = await receipt(method);
    expect(() => projectReceipt(body, status, header, { ...request, url: "/api/orders/otro" })).toThrow();
    if (method === "PATCH") { body.order.status = "created"; expect(() => projectReceipt(body, status, header, request)).toThrow(); }
  });
  test("un error contractual requiere code y message, sin aplicar Order", async () => {
    const trace = orderTrace("POST", "/api/orders");
    const response = trace.respond(400, { error: { code: "INVALID_INPUT", message: "Cantidad inválida" }, order });
    const body = await response.json(), request = { method: "POST", url: "/api/orders", headers: {}, body: { ...input, quantity: 0 } };
    const result = projectReceipt(body, 400, response.headers.get("x-trace-id"), request);
    expect(result.order).toBeUndefined(); expect(result.error?.code).toBe("INVALID_INPUT");
    body.error.message = 1;
    expect(() => projectReceipt(body, 400, response.headers.get("x-trace-id"), request)).toThrow();
  });
});
describe("AC-6: snapshot de fuentes de compilación", () => {
  test("cada fuente es exacta y tiene hash correcto, sin leer secretos", async () => {
    expect(sources).toHaveLength(14); expect(new Set(sources.map(s => s.id)).size).toBe(sources.length);
    for (const source of sources) {
      expect(source.path).toMatch(/^(src\/(app|lib|components|content)\/|scripts\/project-sources\.mjs$)/);
      expect(source.code).toBe(await readFile(source.path, "utf8"));
      expect(source.sha256).toBe(createHash("sha256").update(source.code).digest("hex"));
    }
    const page = sources.find(s => s.id === "page")!.code;
    expect(page).toContain('@/generated/project-sources.json'); expect(page).not.toContain("readFile");
  });
  test.each([
    ["POST", "request", "client"], ["GET", "parse", "client"], ["PATCH", "confirmStored", "domain"],
    ["GET", "readStore", "item"], ["POST", "validate", "post"], ["PATCH", "validate", "item"], ["GET", "response", "instrumentation"],
  ])("el evento %s/%s abre el módulo que lo realiza", (method, stage, id) => {
    expect(projectSourceFor(method, stage as Stage)).toBe(id);
    expect(sources.some(source => source.id === id)).toBe(true);
  });
});
describe("AC-8: logros causales y persistencia compatible", () => {
  test("cada resultado válido acredita solo la actividad correspondiente", () => {
    expect(projectAchievements({ method: "POST", status: 201 })).toEqual(["created"]);
    expect(projectAchievements({ method: "GET", status: 200 })).toEqual(["read"]);
    expect(projectAchievements({ method: "PATCH", status: 200 })).toEqual(["confirmed"]);
    expect(projectAchievements({ method: "POST", status: 400, quantity: 0, errorCode: "INVALID_INPUT" })).toEqual(["invalid"]);
    expect(projectAchievements({ method: "PATCH", status: 403, role: "reader", errorCode: "FORBIDDEN" })).toEqual(["forbidden"]);
    expect(projectAchievements({ method: "POST", status: 200, repeated: true })).toEqual(["repeated"]);
  });
  test("no atribuye logros a rechazos distintos ni a lecturas prohibidas", () => {
    expect(projectAchievements({ method: "POST", status: 400, quantity: 0, errorCode: "INVALID_KEY" })).toEqual([]);
    expect(projectAchievements({ method: "POST", status: 400, quantity: 1, errorCode: "INVALID_INPUT" })).toEqual([]);
    expect(projectAchievements({ method: "POST", status: 200 })).toEqual([]);
    expect(projectAchievements({ method: "GET", status: 403, role: "reader", errorCode: "FORBIDDEN" })).toEqual([]);
    expect(projectAchievements({ method: "PATCH", status: 403, role: "buyer", errorCode: "FORBIDDEN" })).toEqual([]);
  });
  test("seis logros y quiz completan11 sin alterar capítulos previos ni guardar datos", () => {
    const before = awardCourse(initialCourseProgress, 10, ["late"]);
    const activities = awardCourse(before, 11, courseGoals[11]); expect(courseComplete(activities, 11)).toBe(false);
    const final = decodeCourseProgress(JSON.stringify(awardCourse(activities, 11, [], true)));
    expect(courseComplete(final, 11)).toBe(true); expect(final.chapters[10]).toEqual(before.chapters[10]);
    expect(courseLocation("/build-api?tab=code&token=private")).toBe("/build-api?tab=code");
    expect(JSON.stringify(final)).not.toContain("Bearer");
  });
});

test.each([undefined, null, {}, { initiator: "", receiver: "API", technology: "HTTP", possibleFailures: [] }, { initiator: "Cliente", receiver: "API", technology: "HTTP", possibleFailures: [42] }, { initiator: "Cliente", receiver: "API", technology: "HTTP", possibleFailures: [" "] }])("AC-6: X Ray rechaza interaction inválido: %j", async interaction => {
  const { body, status, header, request } = await receipt();
  body.events[0].interaction = interaction;
  expect(() => projectReceipt(body, status, header, request)).toThrow("Eventos del servidor inválidos");
});
