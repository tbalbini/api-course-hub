import { event, indexEvents, type Capture } from "./trace";

export const implementations = {
  direct: { name: "Suma directa", code: "return a + b;", run: (a: number, b: number): number | string => a + b },
  fold: { name: "Reducción compatible", code: "return [a, b].reduce((total, n) => total + n, 0);", run: (a: number, b: number): number | string => [a, b].reduce((total, n) => total + n, 0) },
  broken: { name: "Texto incompatible", code: "return String(a + b);", run: (a: number, b: number): number | string => String(a + b) },
};
export type Implementation = keyof typeof implementations;

export function runFunction(a: number, b: number, implementation: Implementation = "direct"): { capture: Capture; value: number | string; valid: boolean } {
  if (![a, b].every(n => Number.isInteger(n) && n >= -1000 && n <= 1000)) throw new Error("Introduce dos enteros entre -1000 y 1000.");
  const invoke = event("invokeLocal", { a, b });
  const enter = event("enterFrame", { a, b }, { parameters: { a, b } }, "conceptual");
  const value = implementations[implementation].run(a, b);
  const execute = event("executeLocal", { a, b }, value);
  execute.code = implementations[implementation].code;
  const returned = event("returnLocal", value, value);
  const valid = typeof value === "number" && value === a + b;
  const check = event("checkContract", { expected: a + b, value, type: typeof value }, { valid });
  if (!valid) { check.state = "error"; check.error = { code: "CONTRACT_VIOLATION", message: "Se esperaba una suma numérica; el proveedor devolvió texto. El laboratorio detecta el incumplimiento explícitamente." }; }
  const events = [invoke, enter, execute, returned, check, ...(valid ? [event("useResult", value, value)] : [])];
  events.forEach((entry, i) => {
    entry.snapshot = { stack: i === 1 || i === 2 ? ["consumidor()", "sumar(a, b)"] : ["consumidor()"], memory: i < 3 ? { a, b, ...(i === 2 ? { retorno: value } : {}) } : { resultado: value }, control: i === 1 || i === 2 ? "sumar" : "consumidor" };
  });
  return { capture: { id: "local-sum", mode: "local", events: indexEvents("local-sum", events) }, value, valid };
}

export function domCapture(before: string, after: string, conceptual = false): Capture {
  const selected = event("selectDOM", { selector: "[data-demo-node]" }, { found: true, textContent: before });
  const write = event("writeDOM", { textContent: before }, { textContent: after });
  if (conceptual) { selected.provenance = "conceptual"; write.provenance = "conceptual"; }
  return { id: "local-dom", mode: conceptual ? "simulation" : "local", events: indexEvents("local-dom", [selected, write]) };
}

export function validDOMText(text: string): boolean { return text.trim().length > 0 && text.length <= 60; }
export const functionChallenge = (a: number, b: number, valid: boolean) => valid && a !== 0 && b !== 0 && a + b === 42;

