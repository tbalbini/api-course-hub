import { describe, expect, test } from "vitest";
import { creationUncertain, defaultDraft, prepareRequest, replaceHeader, type RequestDraft } from "@/lib/http-editor";
import { etagMatches, negotiate } from "@/lib/http-representation";
import { GET, POST, PUT, PATCH, DELETE } from "@/app/api/lab/http/route";

const origin = "http://localhost:3000";

describe("Frontera del editor HTTP", () => {
  test("conserva query repetida, codifica params y excluye fragmento y body GET", () => {
    const request = prepareRequest({ ...defaultDraft, url: "/api/lab/http?a=1#local", params: "a=2&message=hola+mundo" }, origin);
    expect(request.url).toBe(`${origin}/api/lab/http?a=1&a=2&message=hola+mundo`);
    expect(request.body).toBeUndefined();
    const post = prepareRequest({ ...defaultDraft, method: "POST", body: "{no es JSON}" }, origin);
    expect(post.body).toBe("{no es JSON}");
  });
  test.each(["https://example.com/api/lab/http", "//example.com/api/orders", "http://user:pass@localhost:3000/api/orders", "/api/lab/http/extra", "/api/orders/a%2Fb", "/api/private", "/first-principles", "http://localhost:3001/api/lab/http"])("rechaza destino fuera del contrato %s", url => {
    expect(() => prepareRequest({ ...defaultDraft, url }, origin)).toThrow("Solo se permiten");
  });
  test.each(["Host: example.com", "Cookie: secret", "X-Other: value", "Accept application/json", "Accept: text/plain\naCCept: application/json", "X-Demo-Note: hola\rmal"])("rechaza headers que no puede representar fielmente: %s", headers => {
    expect(() => prepareRequest({ ...defaultDraft, headers }, origin)).toThrow();
  });
  test("acota caracteres y bytes, exige clave de creación y no modifica el borrador", () => {
    expect(() => prepareRequest({ ...defaultDraft, params: "x".repeat(2100) }, origin)).toThrow("2048");
    expect(() => prepareRequest({ ...defaultDraft, headers: "x".repeat(8200) }, origin)).toThrow("8192");
    expect(() => prepareRequest({ ...defaultDraft, body: "á".repeat(2049) }, origin)).toThrow("4096");
    expect(() => prepareRequest({ ...defaultDraft, url: "/api/orders", method: "POST" }, origin)).toThrow("Idempotency-Key");
    const draft: RequestDraft = { ...defaultDraft, method: "POST", url: "/api/orders", headers: "Idempotency-Key: fixed-key\nContent-Type: application/json" };
    const before = JSON.stringify(draft); const request = prepareRequest(draft, origin);
    expect(request.headers["idempotency-key"]).toBe("fixed-key"); expect(JSON.stringify(draft)).toBe(before);
    expect(replaceHeader("Accept: application/json\nIf-None-Match: old", "if-none-match", '"new"')).toBe('Accept: application/json\nif-none-match: "new"');
  });
  test.each([
    [undefined, null, false, false, true], [500, { error: "server" }, true, false, true], [201, {}, true, false, true],
    [201, { order: { id: "real" } }, false, false, true], [201, { order: { id: "real" } }, true, true, false],
    [400, { error: "bad" }, true, false, false], [403, { error: "forbidden" }, true, true, true],
  ])("conserva incertidumbre con status %s y evidencia parcial", (status, parsed, read, previous, uncertain) => {
    expect(creationUncertain(status as number | undefined, parsed, Boolean(read), Boolean(previous))).toBe(uncertain);
  });
});

describe("Negociación y revalidación", () => {
  test.each([
    [null, "application/json"], ["text/plain", "text/plain"], ["application/json;q=0, */*;q=0.8", "text/plain"],
    ["text/*;q=0.9, application/json;q=0.3", "text/plain"], ["text/plain;q=0.5, application/json;q=0.5", "application/json"],
    ["image/png", null], ["*/*;q=0", null], ["application/json;q=1.1", null],
  ])("Accept %s elige %s", (accept, type) => { expect(negotiate(accept)).toBe(type); });
  test("If-None-Match compara tags débiles, listas y asterisco", () => {
    expect(etagMatches('W/"abc"', '"abc"')).toBe(true);
    expect(etagMatches('"other", W/"abc"', '"abc"')).toBe(true);
    expect(etagMatches("*", '"abc"')).toBe(true);
    expect(etagMatches('"ABC"', '"abc"')).toBe(false);
    expect(etagMatches(null, '"abc"')).toBe(false);
  });
  test("GET produce JSON estable, variantes y 304 sin body", async () => {
    const url = `${origin}/api/lab/http?message=Hola&x=1&x=2`;
    const json = await GET(new Request(url, { headers: { Accept: "application/json" } }));
    const tag = json.headers.get("etag")!;
    expect(json.status).toBe(200); expect(tag).toMatch(/^"[a-f0-9]{64}"$/);
    expect(json.headers.get("cache-control")).toBe("private, no-cache");
    const data = await json.json(); expect(data.query).toEqual([["message", "Hola"], ["x", "1"], ["x", "2"]]);
    expect(data.body).toBeNull(); expect(data.diagnostic).toBe(true);
    const revalidated = await GET(new Request(url, { headers: { Accept: "application/json", "If-None-Match": `W/${tag}` } }));
    expect(revalidated.status).toBe(304); expect(await revalidated.text()).toBe("");
    expect(revalidated.headers.get("x-trace-id")).toBeTruthy();
    const text = await GET(new Request(url, { headers: { Accept: "text/plain", "If-None-Match": tag } }));
    expect(text.status).toBe(200); expect(text.headers.get("etag")).not.toBe(tag); expect(text.headers.get("vary")).toBe("Accept");
    expect(await text.text()).toContain("GET: Hola");
  });
  test.each([["POST", POST], ["PUT", PUT], ["PATCH", PATCH], ["DELETE", DELETE]] as const)("%s interpreta datos, sin fingir persistencia", async (method, handle) => {
    const request = new Request(`${origin}/api/lab/http`, { method, headers: { "Content-Type": "application/json" }, body: '{"nested":{"value":2}}' });
    const response = await handle(request);
    expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
    expect((await response.json()).body).toEqual({ nested: { value: 2 } });
    const empty = await handle(new Request(`${origin}/api/lab/http`, { method }));
    expect((await empty.json()).body).toBeNull();
  });
  test.each([
    [406, "image/png", "application/json", "{}"], [415, "*/*", "text/plain", "hola"],
    [400, "application/json", "application/json", "{"], [413, "*/*", "application/json", JSON.stringify({ data: "x".repeat(4096) })],
  ])("rechaza entrada con %s y error JSON estructurado", async (status, accept, type, body) => {
    const response = await POST(new Request(`${origin}/api/lab/http`, { method: "POST", headers: { Accept: String(accept), "Content-Type": String(type) }, body: String(body) }));
    expect(response.status).toBe(status); const data = await response.json();
    expect(data.error.message).toBeTruthy(); expect(response.headers.get("x-trace-id")).toBe(data.traceId);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  test("limita query, conserva UTF-8 válido y rechaza bytes inválidos", async () => {
    const long = await GET(new Request(`${origin}/api/lab/http?message=${"a".repeat(201)}`));
    expect(long.status).toBe(400);
    const many = await GET(new Request(`${origin}/api/lab/http?${Array.from({ length: 21 }, (_, i) => `p${i}=1`).join("&")}`)); expect(many.status).toBe(400);
    const utf8 = await POST(new Request(`${origin}/api/lab/http`, { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"texto":"á ñ"}' })); expect((await utf8.json()).body.texto).toBe("á ñ");
    const bad = await POST(new Request(`${origin}/api/lab/http`, { method: "POST", headers: { "Content-Type": "application/json" }, body: new Uint8Array([0xff]) })); expect(bad.status).toBe(400);
  });
});
