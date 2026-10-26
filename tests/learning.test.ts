import { describe, expect, test } from "vitest";
import { domCapture, functionChallenge, runFunction, validDOMText } from "@/lib/learning";
import { anatomyCapture, mechanisms } from "@/lib/anatomy";
import { award, complete, decodeProgress, initialProgress, mergeProgress } from "@/lib/progress";

const pairs = [[2, 3], [10, 20], [-1000, 1000], [0, 0], [1000, 1000]];
describe("Interfaces locales y contratos", () => {
  test.each(pairs)("implementaciones compatibles para %i y %i", (a, b) => {
    for (const implementation of ["direct", "fold"] as const) {
      const result = runFunction(a, b, implementation);
      expect(result.value).toBe(a + b); expect(result.valid).toBe(true);
      expect(result.capture.request).toBeUndefined();
      expect(result.capture.events.every(entry => entry.boundary === "Mismo proceso")).toBe(true);
      expect(result.capture.events.find(entry => entry.stage === "enterFrame")?.snapshot?.stack).toHaveLength(2);
      expect(result.capture.events.find(entry => entry.stage === "returnLocal")?.snapshot?.stack).toHaveLength(1);
      expect(result.capture.events.find(entry => entry.stage === "executeLocal")?.output).toBe(a + b);
    }
  });
  test.each([NaN, Infinity, 1.5, -1001, 1001])("rechaza argumento fuera del dominio: %s", input => {
    expect(() => runFunction(input, 3)).toThrow(); expect(() => runFunction(2, input)).toThrow();
  });
  test("retorno incompatible conserva el valor defectuoso y detiene su uso", () => {
    const result = runFunction(10, 20, "broken");
    expect(result.value).toBe("30"); expect(result.valid).toBe(false);
    expect(result.capture.events.at(-1)?.error?.code).toBe("CONTRACT_VIOLATION");
    expect(result.capture.events.some(entry => entry.stage === "useResult")).toBe(false);
    expect(result.capture.events.find(entry => entry.stage === "executeLocal")?.code).toContain("String");
  });
  test("el desafío comprueba resultado y argumentos, no solo ejecución", () => {
    expect(functionChallenge(21, 21, true)).toBe(true);
    expect(functionChallenge(0, 42, true)).toBe(false);
    expect(functionChallenge(21, 21, false)).toBe(false);
  });
  test("DOM registra datos locales y acota texto sin evaluar HTML", () => {
    const capture = domCapture("Antes", "<img src=x>");
    expect(capture.request).toBeUndefined();
    expect(capture.events[1].input).toEqual({ textContent: "Antes" });
    expect(capture.events[1].output).toEqual({ textContent: "<img src=x>" });
    expect(validDOMText(" ")).toBe(false); expect(validDOMText("a".repeat(61))).toBe(false);
    expect(validDOMText("<script>texto</script>")).toBe(true);
  });
});

describe("Modelos de frontera", () => {
  test.each(Object.keys(mechanisms) as (keyof typeof mechanisms)[])("%s es conceptual y no tiene una petición real", mode => {
    const capture = anatomyCapture(mode);
    expect(capture.request).toBeUndefined();
    expect(capture.events.every(entry => entry.provenance === "conceptual")).toBe(true);
    if (mode === "function") expect(capture.events.every(entry => entry.boundary === "Mismo proceso")).toBe(true);
    if (mode === "ipc") expect(capture.events.some(entry => entry.boundary.includes("Red"))).toBe(false);
    if (mode === "syscall") {
      expect(capture.events.some(entry => entry.boundary === "Usuario → kernel")).toBe(true);
      expect(capture.events.find(entry => entry.stage === "providerModel")?.output).toMatchObject({ result: { bytesRead: 3 } });
    }
  });
  test.each(["ipc", "http", "rpc"] as const)("%s distingue fallo de entrega de respuesta perdida", mode => {
    expect(anatomyCapture(mode, "network").events.some(entry => entry.stage === "providerModel")).toBe(false);
    const lost = anatomyCapture(mode, "lost");
    expect(lost.events.some(entry => entry.stage === "providerModel")).toBe(true);
    expect(lost.events.at(-1)?.output).toEqual({ providerExecuted: true, clientKnowsResult: false });
    expect(lost.events.at(-1)?.error?.code).toBe("TIMEOUT");
  });
  test("concurrencia tiene dos raíces y dependencias independientes, sin indexado lineal posterior", () => {
    const capture = anatomyCapture("http", "lost", true);
    const byId = new Map(capture.events.map(entry => [entry.id, entry]));
    expect(capture.events.filter(entry => !entry.dependencies.length)).toHaveLength(2);
    expect(capture.events[0].logicalTime).toBe(capture.events[1].logicalTime);
    capture.events.forEach(entry => entry.dependencies.forEach(id => {
      expect(id.split(":")[1]).toBe(entry.id.split(":")[1]);
      expect(byId.get(id)!.logicalTime).toBeLessThan(entry.logicalTime);
    }));
  });
  test("aceptación asíncrona precede ejecución y eventos siguen al registro", () => {
    const messages = anatomyCapture("message").events;
    expect(messages.findIndex(entry => entry.action.includes("confirma aceptación"))).toBeLessThan(messages.findIndex(entry => entry.stage === "providerModel"));
    const subscription = anatomyCapture("subscription").events;
    expect(subscription[0].action).toContain("registra interés");
    expect(subscription.at(-1)?.action).toContain("publicador al suscriptor");
  });
});

describe("Progreso evaluado y versionado", () => {
  test("une logros antiguos de dos pestañas y conserva el contexto recibido sin mutarlas", () => {
    const first = award(initialProgress, 0, ["sum42"], true);
    const second = { ...award(initialProgress, 1, ["compatible"]), lastChapter: 1 as const, depth: "internals" as const };
    const merged = mergeProgress(first, second);
    expect(complete(0, merged.chapters[0])).toBe(true);
    expect(merged.chapters[1].flags).toEqual(["compatible"]);
    expect(merged.lastChapter).toBe(1);
    expect(merged.depth).toBe("internals");
    expect(first.chapters[1].flags).toEqual([]);
    expect(second.chapters[0].quizPassed).toBe(false);
  });
  test.each([null, "{", "[]", '{"version":2}', '"texto"', "a".repeat(9000)])("tolera almacenamiento inválido: %s", raw => {
    expect(decodeProgress(raw)).toBe(initialProgress);
  });
  test("filtra datos ajenos y recupera contexto válido", () => {
    const progress = decodeProgress(JSON.stringify({ version: 1, lastChapter: 3, depth: "internals", chapters: { 0: { quizPassed: "sí", flags: ["sum42", "incompatible", 1] }, 1: { quizPassed: true, flags: ["compatible"] } } }));
    expect(progress.lastChapter).toBe(3); expect(progress.depth).toBe("internals");
    expect(progress.chapters[0]).toEqual({ quizPassed: false, flags: ["sum42"] });
    expect(complete(1, progress.chapters[1])).toBe(false);
    expect(progress.chapters[2]).toEqual({ quizPassed: false, flags: [] });
  });
  test("visitar y resolver solo una condición no completa; reconoce ambas sin mutar el original", () => {
    const original = structuredClone(initialProgress);
    const challenge = award(initialProgress, 0, ["sum42", "ajeno"]);
    expect(complete(0, challenge.chapters[0])).toBe(false);
    const all = award(challenge, 0, [], true);
    expect(complete(0, all.chapters[0])).toBe(true);
    expect(all.chapters[0].flags).toEqual(["sum42"]);
    expect(decodeProgress(JSON.stringify(all))).toEqual(all);
    expect(initialProgress).toEqual(original);
  });
});
