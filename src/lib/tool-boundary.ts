import { modelStep } from "./communication";
import { interaction } from "./interaction";
import { indexEvents, type Capture, type Stage, type TraceEvent } from "./trace";

export type ToolName = "get_order" | "confirm_order";
export interface ToolProposal { id: string; name: string; arguments: Record<string, unknown> }
export interface ToolSettings { role: "none" | "reader" | "buyer"; version: "v1" | "v2"; adapt: boolean }
export const defaultToolSettings: ToolSettings = { role: "buyer", version: "v1", adapt: false };
export const toolPresets = {
  read: { id: "call-1", name: "get_order", arguments: { orderId: "PED-1042" } },
  confirm: { id: "call-1", name: "confirm_order", arguments: { orderId: "PED-1042" } },
  invented: { id: "call-1", name: "run_shell", arguments: { command: "echo hola" } },
  invalid: { id: "call-1", name: "confirm_order", arguments: { orderId: "PED-1042", price: 1 } },
} as const;
export const toolArgumentSchema = { type: "object", required: ["orderId"], additionalProperties: false, properties: { orderId: { type: "string", minLength: 1, maxLength: 80, pattern: ".*\\S.*" } } };
export interface ToolRun { settings: ToolSettings; source: string; proposal: ToolProposal | null; order: { id: string; status: "created" | "confirmed" }; providerResult: unknown; consumed: { id: string; status: "created" | "confirmed" } | null; message: unknown; error: string | null; invoked: boolean; capture: Capture }
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0 && [...value].length <= 80;
const exact = (value: Record<string, unknown>, fields: string[]) => Object.keys(value).length === fields.length && fields.every(key => Object.hasOwn(value, key));
class ToolError extends Error { constructor(public code: string, message: string) { super(message); } }
export function parseToolProposal(source: string): ToolProposal {
  if (new TextEncoder().encode(source).length > 2048) throw new ToolError("SIZE_LIMIT", "La propuesta supera2048 bytes UTF-8.");
  let value: unknown;
  try { value = JSON.parse(source); } catch { throw new ToolError("INVALID_JSON", "La propuesta no es JSON. Nunca se evalúa como código."); }
  if (!record(value) || !exact(value, ["id", "name", "arguments"]) || !text(value.id) || !text(value.name) || !record(value.arguments)) throw new ToolError("INVALID_PROPOSAL", "Se exigen exactamente id, name y arguments con los tipos indicados.");
  return { id: value.id, name: value.name, arguments: structuredClone(value.arguments) };
}
export function toolRun(source: string, options: ToolSettings): ToolRun {
  if (!["none", "reader", "buyer"].includes(options.role) || !["v1", "v2"].includes(options.version) || typeof options.adapt !== "boolean") throw new Error("Ajustes de herramientas inválidos.");
  const settings = { ...options }, entries: TraceEvent[] = [];
  const order: ToolRun["order"] = { id: "PED-1042", status: "created" };
  let proposal: ToolProposal | null = null, providerResult: unknown = null, consumed: ToolRun["consumed"] = null, error: string | null = null, message: unknown = null, invoked = false;
  function add(stage: Stage, action: string, input: unknown, output: unknown, cause: string, code: string, initiator: string, receiver: string, technology: string, failures: string[] = []) {
    const entry = modelStep(stage, action, input, output, cause, "browser", "Contrato de herramientas del ejemplo · sin HTTP", code, "La propuesta del modelo es una fixture editable. Validación y ejecución se calculan localmente en este modelo aislado; no hay inferencia, proveedor remoto ni acceso al Map real.", interaction(initiator, receiver, technology, ...failures));
    entries.push(entry); return entry;
  }
  add("deliveryModel", "El coordinador recibe una propuesta prefabricada", { provider: "modelo-simulado", tools: ["get_order", "confirm_order"] }, source, "Una API de modelos puede devolver texto o una propuesta estructurada. Proponer una capacidad no la ejecuta ni concede permiso.", "// Fixture de respuesta de modelo, no inferencia real.\nconst proposalText = fixtureOrEditedJSON;", "Modelo simulado", "Coordinador del ejemplo", "Modelo de API de IA · respuesta estructurada", ["El modelo puede proponer una herramienta inexistente o argumentos inválidos."]);
  try {
    const parsing = add("parse", "El coordinador valida la estructura de la propuesta", source, null, "La frontera acepta datos, no código. El límite de tamaño se comprueba antes del parseo.", "const proposal = parseToolProposal(source);", "Coordinador del ejemplo", "Validador de propuesta", "JSON.parse + estructura local", ["JSON, tamaño o estructura inválidos."]);
    proposal = parseToolProposal(source); parsing.output = structuredClone(proposal);
    const lookup = add("checkContract", "El registro busca una herramienta permitida", proposal.name, null, "El nombre debe corresponder a una capacidad explícita del registro. No se transforma en una ruta, una URL ni código ejecutable.", 'if (name !== "get_order" && name !== "confirm_order") reject();', "Coordinador del ejemplo", "Registro fijo de herramientas", "Allowlist local", ["UNKNOWN_TOOL: herramienta no disponible."]);
    if (proposal.name !== "get_order" && proposal.name !== "confirm_order") throw new ToolError("UNKNOWN_TOOL", "El registro no expone esa herramienta.");
    const name: ToolName = proposal.name; lookup.output = { name };
    const validating = add("validate", "Se validan los argumentos de la herramienta", proposal.arguments, null, "Un objeto JSON puede ser válido como JSON y aun incumplir el contrato de la operación.", 'requireExactKeys(args, ["orderId"]);\nrequireString(args.orderId, 1, 80);', "Registro de herramientas", "Validador de argumentos", "Subconjunto de schema implementado localmente", ["INVALID_ARGUMENTS: campos o tipos fuera del contrato."]);
    if (!exact(proposal.arguments, ["orderId"]) || !text(proposal.arguments.orderId)) throw new ToolError("INVALID_ARGUMENTS", "arguments exige solo orderId, un string no vacío de1 a80 caracteres.");
    const orderId = proposal.arguments.orderId; validating.output = { orderId };
    const authorization = add("authorize", "El ejecutor comprueba permiso independiente del modelo", { role: settings.role, name }, null, "La forma de los argumentos no demuestra autorización. El ejecutor conserva la decisión de permitir el efecto.", 'if (role === "none") reject();\nif (name === "confirm_order" && role !== "buyer") reject();', "Coordinador del ejemplo", "Autorización del ejecutor", "Política local modelada", ["UNAUTHENTICATED: no hay identidad.", "FORBIDDEN: el lector no confirma."]);
    if (settings.role === "none") throw new ToolError("UNAUTHENTICATED", "El ejecutor exige una identidad del modelo de acceso.");
    if (name === "confirm_order" && settings.role !== "buyer") throw new ToolError("FORBIDDEN", "El lector puede consultar, pero no confirmar.");
    authorization.output = { allowed: true };
    const execution = add("providerModel", "La herramienta actúa sobre el pedido aislado", { name, orderId }, null, "Solo después de validar y autorizar se ejecuta la capacidad. Cada run parte de una copia nueva del pedido de muestra.", 'if (orderId !== order.id) reject();\nif (name === "confirm_order") order.status = "confirmed";', "Ejecutor del ejemplo", "Herramienta de pedidos modelada", "Función JavaScript en un modelo aislado", ["NOT_FOUND: pedido desconocido."]);
    invoked = true;
    if (orderId !== order.id) throw new ToolError("NOT_FOUND", "Ese pedido no existe en el ejemplo.");
    if (name === "confirm_order") order.status = "confirmed";
    providerResult = settings.version === "v1" ? { ...order } : { id: order.id, state: order.status }; execution.output = structuredClone(providerResult);
    let incoming = structuredClone(providerResult);
    if (settings.version === "v2" && settings.adapt) {
      if (!record(providerResult)) throw new ToolError("INCOMPATIBLE_RESULT", "El adaptador necesita un objeto.");
      incoming = { id: providerResult.id, status: providerResult.state };
      add("handler", "El adaptador traduce v2 al contrato v1", providerResult, incoming, "El cambio de campo necesita una traducción explícita que conserve significado. Un número de versión no la aplica por sí solo.", 'return { id: result.id, status: result.state };', "Proveedor v2", "Adaptador v2 a v1", "Adaptación local del contrato");
    }
    const consumer = add("checkContract", "El consumidor v1 valida el resultado", incoming, null, "El efecto del proveedor y la capacidad del consumidor de interpretar su resultado son hechos distintos.", 'requireString(result.id);\nrequireEnum(result.status, ["created", "confirmed"]);', settings.adapt && settings.version === "v2" ? "Adaptador v2 a v1" : "Proveedor de herramientas", "Consumidor v1", "Validación de salida local", ["INCOMPATIBLE_RESULT: el consumidor no reconoce la salida."]);
    if (!record(incoming) || typeof incoming.id !== "string" || incoming.status !== "created" && incoming.status !== "confirmed") throw new ToolError("INCOMPATIBLE_RESULT", "El consumidor v1 exige status. El efecto previo no se revierte por este rechazo.");
    consumed = { id: incoming.id, status: incoming.status }; consumer.output = { ...consumed };
    message = { callId: proposal.id, result: { ...consumed } };
    add("returnLocal", "El coordinador devuelve un resultado correlacionado", null, message, "El id enlaza la respuesta con la propuesta. Un coordinador podría incorporarlo al siguiente turno de un modelo, sin que eso implique más permiso.", "return { callId: proposal.id, result };", "Ejecutor del ejemplo", "Coordinador o siguiente turno", "Resultado de herramienta modelado");
  } catch (cause) {
    error = cause instanceof ToolError ? cause.code : "TOOL_FAILURE";
    const failed = entries.at(-1)!; failed.state = "error"; failed.error = { code: error, message: cause instanceof Error ? cause.message : "La llamada no pudo completarse." };
    message = { callId: proposal?.id ?? null, error: { ...failed.error } };
  }
  return { settings, source, proposal, order: { ...order }, providerResult, consumed, message, error, invoked, capture: { id: "advanced:tools", mode: "simulation", events: indexEvents("advanced:tools", entries) } };
}
