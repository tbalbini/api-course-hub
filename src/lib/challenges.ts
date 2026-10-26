import { challengeCatalog, challengeIds, type ChallengeId } from "@/content/challenges";
import { anatomyCapture } from "./anatomy";
import { compareRun, initialSettings } from "./comparison";
import { baselineDesign, parseContractMessage, provideOrder, sampleInput } from "./contracts";
import { defaultRetry, idempotencyRun } from "./idempotency";
import { runFunction } from "./learning";
import { PRODUCT } from "./product";
import { accessRun, defaultAccess } from "./security";
import type { Capture } from "./trace";

export interface ChallengeDraft {
  mechanism: "function" | "ipc" | "http";
  prediction: "number" | "string" | "throws";
  credential: "none" | "reader" | "buyer";
  body: string;
  interfaceId: "rest" | "jsonrpc" | "graphql";
  minimum: string; maximum: string; errorShape: "structured" | "text";
  strategy: "same" | "new-key" | "changed-body"; protection: boolean;
  diagnosis: "success" | "schema" | "business";
  answer: number | null;
}
export const initialChallengeDraft: ChallengeDraft = {
  mechanism: "http", prediction: "number", credential: "reader", body: '{"status":"created"}', interfaceId: "jsonrpc",
  minimum: "1", maximum: "9", errorShape: "text", strategy: "new-key", protection: true, diagnosis: "success", answer: null,
};
export interface ChallengeAttempt {
  operational: boolean; causal: boolean; passed: boolean;
  summary: string; details: unknown; capture: Capture;
  fixtures?: { quantity: number; status: number; schemaOk: boolean; businessOk: boolean; body: unknown }[];
}
function oneOf(value: unknown, allowed: readonly unknown[]) {
  if (!allowed.includes(value)) throw new Error("Elige una de las opciones permitidas.");
}

export function evaluateChallenge(id: ChallengeId, draft: ChallengeDraft): ChallengeAttempt {
  oneOf(id, challengeIds);
  oneOf(draft.answer, [null, 0, 1, 2]);
  const exercise = challengeCatalog.find(item => item.id === id)!;
  let operational = false, summary = "", details: unknown, capture: Capture;
  let fixtures: ChallengeAttempt["fixtures"];
  switch (id) {
    case "architecture": {
      oneOf(draft.mechanism, ["function", "ipc", "http"]);
      capture = anatomyCapture(draft.mechanism, draft.mechanism === "http" ? "network" : "success");
      const returned = capture.events.some(entry => entry.stage === "deliveryModel");
      operational = returned && draft.mechanism === "function";
      summary = operational ? "El modelo devuelve5 dentro del mismo proceso, sin red." : draft.mechanism === "ipc" ? "IPC devuelve5 sin internet, pero requiere otro proceso: incumple esa restricción." : "La llamada HTTP remota no obtiene resultado con la red desconectada del fixture.";
      details = { mechanism: draft.mechanism, returned, sameProcess: draft.mechanism === "function", networkAvailable: false };
      break;
    }
    case "prediction": {
      oneOf(draft.prediction, ["number", "string", "throws"]);
      const run = runFunction(19, 23, "broken");
      operational = draft.prediction === typeof run.value && !run.valid;
      summary = `Retorno ${JSON.stringify(run.value)} · tipo ${typeof run.value} · contrato ${run.valid ? "válido" : "incumplido"}.`;
      details = { prediction: draft.prediction, value: run.value, type: typeof run.value, valid: run.valid }; capture = run.capture;
      break;
    }
    case "debug": {
      oneOf(draft.credential, ["none", "reader", "buyer"]);
      const body = parseContractMessage(draft.body);
      const payloadValid = !!body && typeof body === "object" && !Array.isArray(body) && Object.keys(body).length === 1 && Object.hasOwn(body, "status") && (body as Record<string, unknown>).status === "confirmed";
      const run = accessRun({ ...defaultAccess, credential: draft.credential, payloadValid });
      operational = run.status === 200 && run.order.status === "confirmed";
      summary = `HTTP${run.status} · pedido ${run.order.status}. ${run.status === 401 ? "Falta identidad válida." : run.status === 403 ? "El rol no puede confirmar." : run.status === 400 ? "El body debe contener solo status: confirmed." : "Autorización y validación superadas."}`;
      details = { submittedBody: body, status: run.status, order: run.order, requiredScope: run.requiredScope }; capture = run.capture;
      break;
    }
    case "interface": {
      oneOf(draft.interfaceId, ["rest", "jsonrpc", "graphql"]);
      const run = compareRun(draft.interfaceId, { ...initialSettings, operation: "confirm" });
      operational = run.capture.request?.method === "PATCH" && run.capture.request.url === "/api/orders/PED-1042" && run.provider?.status === "confirmed";
      summary = `Pedido ${run.provider?.status}. ${operational ? "La representación cumple PATCH al recurso solicitado." : "La capacidad funciona, pero su representación no cumple el contrato PATCH solicitado."}`;
      details = { invocation: run.invocation, result: run.result, provider: run.provider, changes: run.changes }; capture = run.capture;
      break;
    }
    case "contract": {
      oneOf(draft.errorShape, ["structured", "text"]);
      const min = Number(draft.minimum), max = Number(draft.maximum);
      if (!draft.minimum.trim() || !draft.maximum.trim() || !Number.isInteger(min) || !Number.isInteger(max) || min < 1 || max > 9 || min > max) throw new Error("Usa enteros con 1 ≤ mínimo ≤ máximo ≤ 9.");
      const design = { ...baselineDesign, min, max, errorShape: draft.errorShape };
      const runs = [0, 1, 5, 6].map(quantity => ({ quantity, run: provideOrder(design, { sku: PRODUCT.sku, quantity }) }));
      operational = runs.every(({ quantity, run }) => quantity === 1 || quantity === 5 ? run.status === 201 && run.businessOk : run.status === 400 && typeof run.body === "object" && run.body !== null && Object.hasOwn(run.body, "code") && Object.hasOwn(run.body, "message"));
      summary = operational ? "Los cuatro fixtures cumplen límites, errores y negocio." : "Algún fixture incumple el límite de negocio o el error JSON esperado.";
      fixtures = runs.map(({ quantity, run }) => ({ quantity, status: run.status, schemaOk: run.responseOk, businessOk: run.businessOk, body: run.body }));
      details = fixtures; capture = runs[2].run.capture;
      break;
    }
    case "failure": {
      oneOf(draft.strategy, ["same", "new-key", "changed-body"]);
      oneOf(draft.protection, [true, false]);
      const run = idempotencyRun({ ...defaultRetry, strategy: draft.strategy, protection: draft.protection });
      const [first, second] = run.attempts;
      operational = run.orders.length === 1 && !first.delivered && second.delivered && second.status === 200 && second.repeated && first.orderId === second.orderId;
      summary = `${run.orders.length} pedido(s) · primera respuesta perdida · reintento HTTP${second.status} · resultado ${second.repeated ? "recuperado" : "sin recuperar"}.`;
      details = { attempts: run.attempts, orders: run.orders }; capture = run.capture;
      break;
    }
    case "misconception": {
      oneOf(draft.diagnosis, ["success", "schema", "business"]);
      const input = sampleInput(baselineDesign), run = provideOrder(baselineDesign, input, undefined, true);
      operational = draft.diagnosis === "business" && run.status === 201 && run.responseOk && !run.businessOk;
      summary = `HTTP${run.status} · schema ${run.responseOk ? "válido" : "inválido"} · negocio ${run.businessOk ? "correcto" : "incorrecto"}.`;
      details = { input, expectedTotalMinor: Number(input.quantity) * PRODUCT.priceMinor, response: run.body }; capture = run.capture;
      break;
    }
  }
  const causal = draft.answer === exercise.correct;
  return { operational, causal, passed: operational && causal, summary, details, capture, fixtures };
}
