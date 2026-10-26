import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { referenceEntries, referenceGuides, referenceTopics } from "@/content/reference";
import { technologies } from "@/content/taxonomy";
import { filterReference, parseReferenceState, referenceURL } from "@/lib/reference";
import { referenceForStage } from "@/lib/reference-target";
import { stages } from "@/lib/trace";
const parse = (query: string) => parseReferenceState(new URLSearchParams(query));
const ids = new Set(referenceEntries.map(item => item.id));

describe("0016 AC-2/5/6: catálogo conectado y contrato contextual", () => {
  test("ids únicos, contenido real, relaciones resueltas y cobertura de trece capítulos", () => {
    expect(referenceEntries.length).toBeGreaterThanOrEqual(80); expect(ids.size).toBe(referenceEntries.length);
    expect(new Set(referenceEntries.map(item => item.chapter))).toEqual(new Set(Array.from({ length: 13 }, (_, i) => i)));
    for (const item of referenceEntries) {
      expect(item.id).toMatch(/^[a-z][a-z0-9-]*$/); expect(referenceTopics[item.topic]).toBeDefined();
      expect(item.title.trim().length).toBeGreaterThan(0);
      for (const text of [item.definition, item.mechanism, item.boundary, item.code]) expect(text.trim().length).toBeGreaterThan(5);
      expect(item.related.length).toBeGreaterThan(0); expect(new Set(item.related).size).toBe(item.related.length);
      for (const id of item.related) { expect(ids.has(id), `${item.id}→${id}`).toBe(true); expect(id).not.toBe(item.id); }
    }
  });
  test("taxonomía conserva texto y alternativas canónicas sin otra definición", () => {
    expect(referenceEntries.filter(item => item.source === "taxonomy")).toHaveLength(29);
    for (const source of technologies) {
      const item = referenceEntries.find(item => item.id === source.id)!;
      expect(item.definition).toBe(source.what); expect(item.mechanism).toBe(source.how);
      expect(item.boundary).toContain(source.limits); expect(item.code).toBe(source.code); expect(item.related).toEqual(source.alternatives);
    }
  });
  test("cada vínculo editorial lleva a una página y parámetros realmente permitidos", () => {
    const options: Record<string, string[]> = { "/first-principles": ["0", "1", "2", "3"], "/playground": ["http", "network", "graphql", "rpc"], "/events": ["communication", "delivery", "sse", "chapter"], "/security": ["access", "browser", "credentials", "real", "chapter"], "/contracts": ["design", "compatibility", "collections", "retries", "chapter"], "/systems": ["system", "transactions", "chapter"], "/advanced": ["binary", "wire", "tools", "chapter"], "/build-api": ["app", "code", "chapter"] };
    const links = [...referenceEntries.map(item => item.experiment), ...referenceGuides.flatMap(guide => [...guide.links])];
    for (const link of links) {
      const url = new URL(link.href, "https://course.example"); expect(url.origin).toBe("https://course.example"); expect(url.hash).toBe("");
      expect(existsSync(`src/app${url.pathname}/page.tsx`), link.href).toBe(true);
      for (const [key, value] of url.searchParams) { expect(key).toBe(url.pathname === "/first-principles" ? "chapter" : "tab"); expect(options[url.pathname]).toContain(value); }
    }
  });
  test("todos los stages producen solo un id existente, sin datos de captura", () => {
    for (const stage of Object.keys(stages) as (keyof typeof stages)[]) {
      const url = new URL(referenceForStage(stage), "https://course.example");
      expect([...url.searchParams.keys()]).toEqual(["term"]); expect(ids.has(url.searchParams.get("term")!)).toBe(true); expect(url.pathname).toBe("/reference");
    }
    expect(referenceForStage("authorize")).toBe("/reference?term=authorization");
    expect(referenceForStage("click")).toBe("/reference?term=api");
    expect(readFileSync("src/lib/reference-target.ts", "utf8")).not.toContain("@/content/reference");
  });
  test("guía documenta comandos vigentes, contrato e incertidumbre sin prometer durabilidad", () => {
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    for (const command of ["dev", "build", "start", "typecheck", "lint", "test", "test:e2e"]) expect(manifest.scripts[command]).toBeDefined();
    const content = referenceGuides.map(item => item.text + item.code).join(" ");
    for (const word of ["POST /api/orders", "PATCH", "demo-buyer", "demo-reader", "200 pedidos", "replay", "fetch", "Node.js24", "sin pedidos"]) expect(content).toContain(word);
  });
});

describe("0016 AC-3: búsqueda literal, ranking y temas", () => {
  test.each([["API", "api"], ["OIDC", "oidc"], ["jwt", "jwt"], ["AUTORIZACION", "authorization"], ["pila de llamadas", "call-stack"], ["fs.readFile", "file"], ["rate limiting", "rate-limit"]])("%s encuentra primero el término o alias exacto", (q, expected) => expect(filterReference(q)[0].id).toBe(expected));
  test("varias palabras son AND, sin importar sus posiciones", () => {
    const q = "entrega   duplicados"; const found = filterReference(q);
    expect(found.length).toBeGreaterThan(0);
    expect(found.map(item => item.id)).toEqual(filterReference("duplicados entrega").map(item => item.id));
    expect(filterReference("funcion   local").map(item => item.id)).toContain("function");
  });
  test("texto de límites participa y el filtro se combina", () => {
    expect(filterReference("CPU real").map(item => item.id)).toContain("abi");
    expect(filterReference("permiso", "security").every(item => item.topic === "security")).toBe(true);
    expect(filterReference("zqx-no-existe")).toEqual([]); expect(filterReference(".*")).toEqual([]);
  });
  test("consulta vacía ordena alfabéticamente sin mutar el catálogo", () => {
    const original = referenceEntries.map(item => item.id), items = filterReference("   "), collator = new Intl.Collator("es", { sensitivity: "base" });
    expect(items).toHaveLength(referenceEntries.length);
    for (let i = 1; i < items.length; i++) expect(collator.compare(items[i - 1].title, items[i].title)).toBeLessThanOrEqual(0);
    expect(referenceEntries.map(item => item.id)).toEqual(original);
  });
});

describe("0016 AC-4: URL acotada y selección independiente", () => {
  test("URL vacía empieza en API y valores desconocidos no crean estados ficticios", () => {
    expect(parse("")).toEqual({ q: "", topic: "", term: "api", view: "glossary", invalidTerm: false });
    expect(parse("term=javascript:alert(1)&topic=__proto__&view=otra&token=secreto")).toMatchObject({ term: "api", topic: "", view: "glossary", invalidTerm: true });
  });
  test("recorta query sin ejecutar ni interpretar HTML o regex", () => {
    expect(parse(`q=${"a".repeat(200)}`).q).toHaveLength(160);
    const q = "<img src=x onerror=alert(1)>"; expect(parse(new URLSearchParams({ q }).toString()).q).toBe(q);
    expect(filterReference(q)).toEqual([]);
  });
  test("cada término se puede compartir y recuperar con filtros", () => {
    for (const { id: term } of referenceEntries) {
    const state = { q: "autorización & permiso", topic: "security" as const, term, view: "guide" as const };
    expect(parse(new URL(referenceURL(state), "https://course.example").search.slice(1))).toEqual({ ...state, invalidTerm: false });
    }
  });
  test("filtrar no reemplaza término y el builder elimina entradas no permitidas", () => {
    const state = parse("term=jwt&q=zqx&topic=network"); expect(filterReference(state.q, state.topic)).toEqual([]); expect(state.term).toBe("jwt");
    expect(referenceURL({ ...state, q: "", topic: "" })).toBe("/reference?term=jwt");
    expect(referenceURL({ q: "", topic: "", term: "http://otro", view: "glossary" })).toBe("/reference");
  });
});
