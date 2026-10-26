import { describe, expect, test } from "vitest";
import { challengeCatalog, challengeIds, type ChallengeId } from "@/content/challenges";
import { evaluateChallenge, initialChallengeDraft, type ChallengeDraft } from "@/lib/challenges";
import { awardChallenge, awardCourse, courseComplete, courseGoals, courseLocation, decodeCourseProgress, initialCourseProgress, mergeCourseProgress } from "@/lib/course-progress";
import { playback } from "@/lib/trace";

const solved: ChallengeDraft = { ...initialChallengeDraft, mechanism: "function", prediction: "string", credential: "buyer", body: '{"status":"confirmed"}', interfaceId: "rest", maximum: "5", errorShape: "structured", strategy: "same", diagnosis: "business" };
function draftFor(id: ChallengeId): ChallengeDraft { return { ...solved, answer: challengeCatalog.find(item => item.id === id)!.correct }; }

describe("Desafíos con resultado operativo y causa, AC-1/2/3/4", () => {
  test("ofrece siete formatos con ids únicos y tres niveles", () => {
    expect(new Set(challengeCatalog.map(item => item.id)).size).toBe(7);
    expect(new Set(challengeCatalog.map(item => item.level))).toEqual(new Set(["Básico", "Intermedio", "Avanzado"]));
  });
  test.each(challengeIds)("%s requiere resolver y explicar el mismo intento", id => {
    const draft = draftFor(id), result = evaluateChallenge(id, draft);
    expect(result.passed).toBe(true); expect(result.operational).toBe(true); expect(result.causal).toBe(true);
    expect(result.capture.events.length).toBeGreaterThan(0);
    expect(evaluateChallenge(id, { ...draft, answer: (draft.answer! + 1) % 3 }).passed).toBe(false);
    expect(evaluateChallenge(id, { ...draft, answer: null }).passed).toBe(false);
    expect(evaluateChallenge(id, { ...initialChallengeDraft, answer: draft.answer }).passed).toBe(false);
  });
  test("IPC funciona sin internet pero incumple la restricción de mismo proceso", () => {
    const ipc = evaluateChallenge("architecture", { ...draftFor("architecture"), mechanism: "ipc" });
    expect(ipc.details).toMatchObject({ returned: true, sameProcess: false }); expect(ipc.operational).toBe(false);
    expect(evaluateChallenge("architecture", { ...draftFor("architecture"), mechanism: "http" }).details).toMatchObject({ returned: false });
  });
  test("predicción contrasta retorno ejecutado y tipo, sin confundirlo con excepción", () => {
    expect(evaluateChallenge("prediction", draftFor("prediction")).details).toEqual({ prediction: "string", value: "42", type: "string", valid: false });
  });
  test("depurar separa401,403,400 y200 y rechaza campos extra", () => {
    for (const [credential, body, status] of [["none", '{"status":"confirmed"}', 401], ["reader", '{"status":"confirmed"}', 403], ["buyer", '{"status":"created"}', 400], ["buyer", '{"status":"confirmed","admin":true}', 400], ["buyer", '{"status":"confirmed"}', 200]] as const) {
      expect(evaluateChallenge("debug", { ...draftFor("debug"), credential, body }).details).toMatchObject({ status, order: { status: status === 200 ? "confirmed" : "created" } });
    }
  });
  test.each(["jsonrpc", "graphql"] as const)("%s confirma pero no cumple PATCH al recurso", interfaceId => {
    const result = evaluateChallenge("interface", { ...draftFor("interface"), interfaceId });
    expect(result.details).toMatchObject({ provider: { status: "confirmed" }, changes: 1 }); expect(result.passed).toBe(false);
  });
  test("contrato prueba extremos y errores, y distingue schema del negocio", () => {
    const result = evaluateChallenge("contract", draftFor("contract"));
    expect(result.details).toMatchObject([{ quantity: 0, status: 400 }, { quantity: 1, status: 201, businessOk: true }, { quantity: 5, status: 201, businessOk: true }, { quantity: 6, status: 400 }]);
    expect(evaluateChallenge("contract", { ...draftFor("contract"), minimum: "2" }).passed).toBe(false);
    expect(evaluateChallenge("contract", { ...draftFor("contract"), errorShape: "text" }).passed).toBe(false);
    expect(evaluateChallenge("misconception", draftFor("misconception")).details).toMatchObject({ expectedTotalMinor: 17800, response: { totalMinor: 1 } });
  });
  test("respuesta perdida conserva efecto; cambiar clave duplica y cambiar body da409", () => {
    const same = evaluateChallenge("failure", draftFor("failure"));
    expect(same.details).toMatchObject({ orders: [{ id: "model-1" }], attempts: [{ delivered: false, orderId: "model-1" }, { status: 200, repeated: true, orderId: "model-1" }] });
    const changed = evaluateChallenge("failure", { ...draftFor("failure"), strategy: "changed-body" });
    expect(changed.details).toMatchObject({ attempts: [{ status: 201 }, { status: 409 }] }); expect(changed.passed).toBe(false);
    for (const patch of [{ strategy: "new-key" as const }, { protection: false }]) {
      const duplicate = evaluateChallenge("failure", { ...draftFor("failure"), ...patch });
      expect((duplicate.details as { orders: unknown[] }).orders).toHaveLength(2); expect(duplicate.passed).toBe(false);
    }
  });
  test.each([{ minimum: "" }, { minimum: "1.5" }, { minimum: "6", maximum: "5" }, { maximum: "10" }])("rechaza límites inválidos %j", patch => {
    expect(() => evaluateChallenge("contract", { ...draftFor("contract"), ...patch })).toThrow("enteros");
  });
  test("rechaza JSON inválido y datos fuera de catálogo", () => {
    expect(() => evaluateChallenge("debug", { ...draftFor("debug"), body: "{" })).toThrow("JSON válido");
    expect(() => evaluateChallenge("debug", { ...draftFor("debug"), body: "x".repeat(4097) })).toThrow("4096");
    expect(() => evaluateChallenge("architecture", { ...solved, mechanism: "inventado" } as unknown as ChallengeDraft)).toThrow("opciones permitidas");
    expect(() => evaluateChallenge("failure", { ...solved, answer: 99 })).toThrow("opciones permitidas");
  });
  test("nuevos intentos y reproducción no mutan borrador, fixtures ni capturas anteriores", () => {
    const draft = Object.freeze(draftFor("failure")), first = evaluateChallenge("failure", draft), before = JSON.stringify(first);
    const state = { capture: first.capture, cursor: 0, running: false, speed: 1 };
    playback(state, { type: "replay" }); playback(state, { type: "next" });
    evaluateChallenge("failure", { ...draft, strategy: "new-key" });
    expect(JSON.stringify(first)).toBe(before); expect(draft.strategy).toBe("same");
  });
});

describe("Progreso independiente de desafíos, AC-4/5", () => {
  test("migra snapshots anteriores y filtra ids ajenos y duplicados sin guardar respuestas", () => {
    expect(decodeCourseProgress('{"version":1,"chapters":{}}').challenges).toEqual([]);
    const result = decodeCourseProgress(JSON.stringify({ version: 1, chapters: {}, challenges: ["failure", "failure", 1, "inventado"], answer: 0, body: "private" }));
    expect(result.challenges).toEqual(["failure"]); expect(result).not.toHaveProperty("answer"); expect(result).not.toHaveProperty("body");
    expect(decodeCourseProgress('{"version":1,"chapters":{},"challenges":"failure"}').challenges).toEqual([]);
    expect(decodeCourseProgress('{"version":2,"chapters":{},"challenges":["failure"]}')).toEqual(initialCourseProgress);
  });
  test("unir logros conserva capítulos, contexto e inmutabilidad", () => {
    const chapter = awardCourse(initialCourseProgress, 6, courseGoals[6], true), first = awardChallenge(chapter, "failure"), second = awardChallenge(initialCourseProgress, "architecture");
    const merged = mergeCourseProgress(first, second);
    expect(merged.challenges).toEqual(["architecture", "failure"]); expect(courseComplete(merged, 6)).toBe(true);
    expect(awardChallenge(first, "failure")).toBe(first); expect(awardChallenge(first, "unknown" as ChallengeId)).toBe(first);
    expect(mergeCourseProgress(merged, decodeCourseProgress("{")).challenges).toEqual(merged.challenges);
    expect(initialCourseProgress.challenges).toEqual([]); expect(chapter.challenges).toEqual([]); expect(first.challenges).toEqual(["failure"]);
    expect(second.chapters).toEqual({});
  });
  test("continuidad admite solo el id conocido y elimina datos del intento", () => {
    expect(courseLocation("/challenges?challenge=failure&answer=0&body=private#attempt")).toBe("/challenges?challenge=failure");
    expect(courseLocation("/challenges?challenge=unknown")).toBe("/challenges");
  });
});
