import { describe, expect, test } from "vitest";
import { asyncAPIDocument, baselineDesign, compatibilityRun, contractChanges, designIssues, openAPIDocument, parseContractMessage, provideOrder, requestSchema, sampleInput, validateMessage, type ContractDesign } from "@/lib/contracts";
import { collectionPage, defaultCollection, initialCollection, insertBeforeWindow, type CollectionSettings } from "@/lib/collections";
import { defaultRetry, idempotencyRun, type RetrySettings } from "@/lib/idempotency";
import { playback, type Capture } from "@/lib/trace";

function traceIsStable(capture: Capture) {
  const ids = new Set<string>();
  for (const entry of capture.events) { expect(entry.provenance).toBe("conceptual"); expect(ids.has(entry.id)).toBe(false); for (const dependency of entry.dependencies) expect(ids.has(dependency)).toBe(true); ids.add(entry.id); }
}
describe("AC-2/3/9: contrato frente a negocio", () => {
  test("una respuesta legal puede tener un total incorrecto", () => {
    const good = provideOrder(baselineDesign, sampleInput(baselineDesign));
    expect(good.status).toBe(201); expect(good.body).toMatchObject({ totalMinor: 17800, currency: "PEN" }); expect(good.businessOk).toBe(true);
    const bad = provideOrder(baselineDesign, sampleInput(baselineDesign), "/v1/orders", true);
    expect(bad.inputOk).toBe(true); expect(bad.responseOk).toBe(true); expect(bad.businessOk).toBe(false); expect(bad.body).toMatchObject({ totalMinor: 1 });
    traceIsStable(bad.capture);
  });
  test.each([null, [], "x", {}, { sku: "otro", quantity: 2 }, { sku: "kit-api", quantity: "2" }, { sku: "kit-api", quantity: 0 }, { sku: "kit-api", quantity: 6 }, { sku: "kit-api", quantity: 1.5 }, { sku: "kit-api", quantity: 2, extra: true }])("rechaza input %j antes de negocio", input => {
    const run = provideOrder(baselineDesign, input); expect(run.status).toBe(400); expect(run.issues.length).toBeGreaterThan(0);
    expect(run.capture.events.some(entry => entry.stage === "business")).toBe(false);
  });
  test("nota opcional no implica null, cuenta code points y puede pasar a obligatoria", () => {
    const design: ContractDesign = { ...baselineDesign, note: "optional" }, input = sampleInput(baselineDesign);
    expect(validateMessage(requestSchema(design), input)).toEqual([]);
    expect(validateMessage(requestSchema(design), { ...input, note: null })).not.toEqual([]);
    expect(validateMessage(requestSchema(design), { ...input, note: "🧪".repeat(80) })).toEqual([]);
    expect(validateMessage(requestSchema(design), { ...input, note: "🧪".repeat(81) })).not.toEqual([]);
    expect(validateMessage(requestSchema({ ...design, note: "required" }), input)).toContain("/note: campo obligatorio ausente.");
  });
  test("ampliar schema no cambia el requisito máximo5", () => {
    const run = provideOrder({ ...baselineDesign, max: 9 }, { sku: "kit-api", quantity: 6 });
    expect(run.status).toBe(201); expect(run.responseOk).toBe(true); expect(run.businessOk).toBe(false);
  });
  test.each([{ name: "" }, { name: "../orders" }, { quantityName: "sku" }, { quantityName: "constructor" }, { idName: "totalMinor" }, { min: 0 }, { min: 4, max: 3 }, { max: 10 }])("diseño inválido %j impide ejecutar y exportar", change => {
    const design = { ...baselineDesign, ...change };
    expect(designIssues(design).length).toBeGreaterThan(0);
    expect(() => provideOrder(design, {})).toThrow(); expect(() => openAPIDocument(design)).toThrow();
  });
  test("limita bytes UTF-8, rechaza JSON inválido y no altera prototipos", () => {
    expect(() => parseContractMessage("{")).toThrow("JSON");
    expect(() => parseContractMessage(JSON.stringify({ note: "🧪".repeat(1100) }))).toThrow("4096 bytes");
    const value = parseContractMessage('{"sku":"kit-api","quantity":2,"__proto__":{"polluted":true}}');
    expect(validateMessage(requestSchema(baselineDesign), value)).toContain("/__proto__: campo desconocido.");
    expect(Object.hasOwn({}, "polluted")).toBe(false);
  });
});

describe("AC-4: consumidores y direcciones", () => {
  test.each([
    ["renombrar input", { quantityName: "units" }, "nominal", false, false, false],
    ["nota opcional", { note: "optional" }, "nominal", false, true, false],
    ["nota requerida", { note: "required" }, "nominal", false, false, false],
    ["id integer", { idType: "integer" }, "nominal", false, false, false],
    ["renombrar id", { idName: "orderId" }, "nominal", false, false, false],
    ["retirar status", { includeStatus: false }, "nominal", false, false, true],
    ["tracking tolerado", { tracking: true }, "nominal", false, true, false],
    ["tracking estricto", { tracking: true }, "nominal", true, false, false],
    ["error texto", { errorShape: "text" }, "invalid", false, false, false],
    ["máximo nuevo", { max: 9 }, "maximum", false, true, false],
    ["mínimo restringido", { min: 2 }, "minimum", false, false, true],
  ] as const)("%s", (_name, change, fixture, strict, oldNew, newOld) => {
    const design = { ...baselineDesign, ...change } as ContractDesign;
    for (const [direction, expected] of [["old-new", oldNew], ["new-old", newOld]] as const) {
      const run = compatibilityRun(design, direction, fixture, strict);
      expect(run.beforeIssues).toEqual([]); expect(run.afterIssues.length === 0).toBe(expected);
      traceIsStable(run.after.capture);
    }
  });
  test("coexistir mantiene v1 completa; deprecated no repara la misma ruta", () => {
    const changed: ContractDesign = { ...baselineDesign, version: "v2", quantityName: "units", idType: "integer", keepV1: true, deprecatedV1: true };
    expect(compatibilityRun(changed, "old-new", "nominal", false).afterIssues).toEqual([]);
    expect(compatibilityRun(changed, "new-old", "nominal", false).after.status).toBe(404);
    expect(compatibilityRun({ ...changed, keepV1: false }, "old-new", "nominal", false).after.status).toBe(404);
    expect(compatibilityRun({ ...changed, version: "v1" }, "old-new", "nominal", false).afterIssues.length).toBeGreaterThan(0);
    expect(contractChanges(changed).find(item => item.title === "Deprecación anunciada")?.impact).toBe("información");
  });
  test("los errores cambian sin romper el fixture de éxito", () => {
    const design: ContractDesign = { ...baselineDesign, errorShape: "text" };
    expect(compatibilityRun(design, "old-new", "nominal", false).afterIssues).toEqual([]);
    expect(compatibilityRun(design, "old-new", "invalid", false).afterIssues.length).toBeGreaterThan(0);
  });
});

describe("AC-5: colecciones y cursores", () => {
  const collectionCases = (["offset", "cursor"] as const).flatMap(mode => (["all", "created", "confirmed"] as const).flatMap(filter => (["id-asc", "id-desc", "total-asc", "total-desc"] as const).map(sort => ({ mode, filter, sort }))));
  test.each(collectionCases)("recorre $mode, $filter, $sort sin perder ni repetir registros", changes => {
    const records = initialCollection(); let settings: CollectionSettings = { ...defaultCollection, ...changes }; const ids: string[] = [];
    for (let count = 0; count < 10; count++) {
      const run = collectionPage(records, settings, ids); ids.push(...run.items.map(item => item.id)); expect(run.duplicates).toEqual([]); traceIsStable(run.capture);
      if (!run.next) break;
      settings = { ...settings, ...(settings.mode === "offset" ? { offset: Number(run.next) } : { cursor: run.next }) };
    }
    const expected = records.filter(item => changes.filter === "all" || changes.filter === item.status).map(item => item.id);
    expect([...ids].sort()).toEqual(expected.sort()); expect(new Set(ids).size).toBe(ids.length);
    if (changes.sort === "total-asc" && changes.filter === "all") expect(ids).toEqual(["PED-1001", "PED-1003", "PED-1007", "PED-1002", "PED-1005", "PED-1004", "PED-1006"]);
  });
  test.each(["offset", "cursor"] as const)("insertar antes de ventana afecta %s", mode => {
    const settings = { ...defaultCollection, mode }, records = initialCollection(), first = collectionPage(records, settings);
    const changed = insertBeforeWindow(records, settings);
    const second = collectionPage(changed, { ...settings, ...(mode === "offset" ? { offset: Number(first.next) } : { cursor: first.next! }) }, first.items.map(item => item.id));
    expect(second.duplicates).toEqual(mode === "offset" ? ["PED-1002"] : []);
    expect(second.items.some(item => item.id === "PED-1000")).toBe(false); expect(records).toHaveLength(7);
  });
  test("rechaza cursor inválido o de otro contexto y permite borrar el registro ancla", () => {
    const records = initialCollection(), settings: CollectionSettings = { ...defaultCollection, mode: "cursor" }, first = collectionPage(records, settings);
    expect(() => collectionPage(records, { ...settings, cursor: "!!!" })).toThrow("Cursor");
    expect(() => collectionPage(records, { ...settings, cursor: first.next!, filter: "confirmed" })).toThrow("otro filtro/orden");
    expect(() => collectionPage(records, { ...settings, cursor: first.next!, sort: "total-asc" })).toThrow("otro filtro/orden");
    const page = collectionPage(records.filter(item => item.id !== "PED-1002"), { ...settings, cursor: first.next! });
    expect(page.items[0].id).toBe("PED-1003");
  });
  test.each([{ limit: 0 }, { limit: 4 }, { limit: 1.5 }, { offset: -1 }, { offset: 0.5 }])("rechaza query %j", change => { expect(() => collectionPage(initialCollection(), { ...defaultCollection, ...change })).toThrow(); });
});

describe("AC-6/7/9: retención, documentos y snapshots", () => {
  const retryCases = (["same", "new-key", "changed-body"] as const).flatMap(strategy => [true, false].flatMap(protection => [true, false].map(forgetKeys => ({ strategy, protection, forgetKeys }))));
  test.each(retryCases)("dos intentos con %j", change => {
    const run = idempotencyRun({ ...defaultRetry, ...change });
    const recognized = change.protection && !change.forgetKeys && change.strategy !== "new-key";
    expect(run.orders).toHaveLength(recognized ? 1 : 2);
    expect(run.attempts[0].delivered).toBe(false);
    expect(run.attempts[1].status).toBe(recognized ? change.strategy === "same" ? 200 : 409 : 201);
    expect(run.attempts[1].delivered).toBe(true); traceIsStable(run.capture);
  });
  test("OpenAPI mantiene schemas, versiones y deprecación; AsyncAPI describe mensajes", () => {
    const design: ContractDesign = { ...baselineDesign, version: "v2", quantityName: "units", note: "required", idName: "orderId", keepV1: true, deprecatedV1: true, errorShape: "text" };
    const doc = openAPIDocument(design);
    expect(doc.openapi).toBe("3.1.1"); expect(Object.keys(doc.paths)).toEqual(["/v2/orders", "/v1/orders"]);
    expect(doc.paths["/v2/orders"].post.requestBody.content["application/json"].schema.required).toEqual(["sku", "units", "note"]);
    expect(doc.paths["/v1/orders"].post.deprecated).toBe(true);
    const async = asyncAPIDocument(); expect(async.asyncapi).toBe("3.0.0"); expect(async.operations.publishConfirmation.channel.$ref).toBe("#/channels/confirmed");
    expect(async.channels.confirmed.messages.orderConfirmed.payload.required).toContain("eventId");
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
  });
  test("capturas no comparten inputs, outputs ni ajustes mutables", () => {
    const design = { ...baselineDesign }, input = sampleInput(design), run = provideOrder(design, input); const original = JSON.stringify(run.capture);
    design.quantityName = "units"; input.quantity = 5; (run.body as Record<string, unknown>).totalMinor = 0;
    let state = { capture: run.capture, cursor: 0, running: false, speed: 1 };
    for (const action of [{ type: "replay" }, { type: "next" }, { type: "previous" }] as const) state = playback(state, action);
    expect(JSON.stringify(run.capture)).toBe(original); expect(run.design.quantityName).toBe("quantity");
    const settings: RetrySettings = { ...defaultRetry }, retries = idempotencyRun(settings), snapshot = JSON.stringify(retries.capture);
    retries.orders[0].quantity = 5; settings.protection = false; expect(JSON.stringify(retries.capture)).toBe(snapshot);
  });
});
