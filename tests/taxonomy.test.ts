import { describe, expect, test } from "vitest";
import { axes, classificationExercise, exampleProfile, relations, technologies } from "@/content/taxonomy";
import { compareTechnologies, dimensions, evaluateClassification, facets, filterTechnologies } from "@/lib/taxonomy";

const get = (id: string) => technologies.find(item => item.id === id)!;
const inventory = {
  location: ["a-local", "a-ipc", "a-os", "a-network", "a-device"],
  surface: ["b-function", "b-library", "b-object", "b-syscall", "b-browser", "b-database", "b-sdk", "b-device", "b-message"],
  interaction: ["c-sync", "c-reply", "c-async", "c-forget", "c-poll", "c-longpoll", "c-stream", "c-pubsub", "c-event", "c-bidi"],
  remote: ["d-rest", "d-rpc", "d-jsonrpc", "d-xmlrpc", "d-grpc", "d-graphql", "d-soap", "d-websocket", "d-sse", "d-webhook", "d-broker", "d-eventstream"],
  access: ["e-public", "e-private", "e-partner", "e-restricted"],
  contract: ["f-signature", "f-types", "f-json", "f-xml", "f-protobuf", "f-sdl", "f-openapi", "f-asyncapi", "f-version"],
};

describe("Inventario y referencias de la taxonomía", () => {
  test.each(axes)("el eje $letter conserva sus facetas obligatorias", axis => {
    expect(axis.facets.map(item => item.id)).toEqual(inventory[axis.id]);
    expect(axis.facets.every(item => item.explanation.length > 20)).toBe(true);
  });
  test("ids únicos, 49 facetas y cada faceta tiene asociaciones explorables", () => {
    expect(facets).toHaveLength(49);
    expect(new Set(facets.map(item => item.id)).size).toBe(facets.length);
    expect(new Set(technologies.map(item => item.id)).size).toBe(technologies.length);
    for (const facet of facets) expect(technologies.some(item => [...item.defined, ...item.possible].includes(facet.id))).toBe(true);
  });
  test.each(technologies)("$name tiene información, alternativas y referencias válidas", item => {
    for (const field of [item.why, item.what, item.how, item.tradeoffs, item.limits, item.code]) expect(field.trim().length).toBeGreaterThan(10);
    const associations = [...item.defined, ...item.possible];
    expect(new Set(associations).size).toBe(associations.length);
    for (const id of associations) expect(facets.some(facet => facet.id === id)).toBe(true);
    expect(item.alternatives.length).toBeGreaterThan(0);
    for (const id of item.alternatives) { expect(get(id)).toBeDefined(); expect(id).not.toBe(item.id); }
  });
  test("relaciones y perfil usan referencias únicas y existentes", () => {
    const pairs = relations.map(item => [item.a, item.b].sort().join(":"));
    expect(new Set(pairs).size).toBe(pairs.length);
    for (const relation of relations) { expect(get(relation.a)).toBeDefined(); expect(get(relation.b)).toBeDefined(); expect(relation.a).not.toBe(relation.b); }
    expect(exampleProfile.every(id => facets.some(item => item.id === id))).toBe(true);
    expect(exampleProfile).toContain("e-private"); expect(exampleProfile).toContain("e-restricted");
  });
});

describe("Dimensiones independientes y filtros", () => {
  test("REST no fija audiencia, GraphQL no obliga red y JSON no es transporte", () => {
    expect(dimensions(get("rest"), "access").defined).toEqual([]);
    expect(dimensions(get("rest"), "access").possible).toContain("e-public");
    expect(dimensions(get("rest"), "access").possible).toContain("e-restricted");
    expect(dimensions(get("graphql"), "location")).toEqual({ defined: [], possible: ["a-local", "a-network"] });
    expect(dimensions(get("json"), "location")).toEqual({ defined: [], possible: [] });
    expect(dimensions(get("openapi"), "contract").defined).toEqual(["f-openapi"]);
  });
  test("busca sin acentos o mayúsculas por nombre, responsabilidad y facetas", () => {
    expect(filterTechnologies("GRÁPHQL", {}).some(item => item.id === "graphql")).toBe(true);
    expect(filterTechnologies("BIDIRECCIONAL", {}).some(item => item.id === "websocket")).toBe(true);
    expect(filterTechnologies("jsonrpc", {}).map(item => item.id)).toContain("jsonrpc");
    expect(filterTechnologies("inexistente-xyz", {})).toEqual([]);
  });
  test("combina filtros con AND sin alterar catálogo ni selección externa", () => {
    const original = structuredClone(technologies);
    const results = filterTechnologies("", { location: "a-network", contract: "f-json", access: "e-private" });
    expect(results.some(item => item.id === "rest")).toBe(true);
    expect(results.some(item => item.id === "json")).toBe(false);
    expect(filterTechnologies("", { remote: "d-rest", contract: "f-protobuf" })).toEqual([]);
    expect(filterTechnologies("", { location: "f-json" })).toEqual([]);
    expect(filterTechnologies("", {})).toHaveLength(technologies.length);
    expect(technologies).toEqual(original);
  });
});

describe("Comparaciones por responsabilidad", () => {
  test.each([["rest", "http"], ["graphql", "tcp"], ["websocket", "webhook"], ["json", "openapi"], ["http", "tcp"]])("%s y %s advierten el cruce y conservan relación al invertir", (a, b) => {
    const forward = compareTechnologies(get(a), get(b));
    const backward = compareTechnologies(get(b), get(a));
    expect(forward.crosses).toBe(true);
    expect(forward.explanation).toBe(backward.explanation);
    expect(forward.same).toBe(false);
  });
  test("igualdad y categoría común no inventan sustitución ni compatibilidad", () => {
    expect(compareTechnologies(get("rest"), get("rest")).same).toBe(true);
    const sameLayer = compareTechnologies(get("tcp"), get("udp"));
    expect(sameLayer.crosses).toBe(false);
    expect(sameLayer.explanation).toContain("no demuestra equivalencia");
    const unrelated = compareTechnologies(get("json"), get("device"));
    expect(unrelated.explanation).toContain("no las convierte en alternativas directas");
  });
});

describe("Evaluación razonada", () => {
  test("vacío o respuesta equivocada reciben causa y no se aprueban", () => {
    expect(evaluateClassification({}).every(item => !item.correct && item.feedback.includes("Falta clasificar"))).toBe(true);
    const wrong = evaluateClassification({ REST: "format" });
    expect(wrong[0].correct).toBe(false); expect(wrong[0].feedback).toContain("restricciones de arquitectura");
  });
  test("respuestas correctas completan las cinco responsabilidades", () => {
    const answers = Object.fromEntries(classificationExercise.map(item => [item.label, item.answer]));
    expect(evaluateClassification(answers).every(item => item.correct)).toBe(true);
  });
});
