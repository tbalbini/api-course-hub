import { interaction } from "./interaction";
import { modelStep } from "./communication";
import { PRODUCT } from "./product";
import { indexEvents, type Actor, type Capture, type Stage, type TraceEvent } from "./trace";

export interface ContractDesign {
  style: "resource" | "command"; version: "v1" | "v2"; name: string; quantityName: string; min: number; max: number;
  note: "absent" | "optional" | "required"; extraInput: boolean; idName: string; idType: "string" | "integer";
  includeStatus: boolean; tracking: boolean; errorShape: "structured" | "text"; keepV1: boolean; deprecatedV1: boolean;
}
export const baselineDesign: ContractDesign = Object.freeze({ style: "resource", version: "v1", name: "orders", quantityName: "quantity", min: 1, max: 5, note: "absent", extraInput: false, idName: "id", idType: "string", includeStatus: true, tracking: false, errorShape: "structured", keepV1: false, deprecatedV1: false });
export interface ScalarSchema { type: "string" | "integer"; enum?: readonly (string | number)[]; minimum?: number; maximum?: number; maxLength?: number }
export interface FlatSchema { type: "object"; properties: Record<string, ScalarSchema>; required: string[]; additionalProperties: boolean }
export const contractPath = (design: ContractDesign) => `/${design.version}/${design.name}`;
export function designIssues(design: ContractDesign): string[] {
  const issues: string[] = [];
  for (const [label, value] of [["Nombre", design.name], ["Campo cantidad", design.quantityName], ["Campo id", design.idName]]) {
    if (typeof value !== "string" || !/^[a-z][a-zA-Z0-9]{0,23}$/.test(value) || ["constructor", "prototype"].includes(value)) issues.push(`${label}: usa de 1 a 24 letras/dígitos, empezando por minúscula y sin nombres reservados.`);
  }
  if (["sku", "note"].includes(design.quantityName)) issues.push("El campo cantidad no puede reemplazar sku ni note.");
  if (["status", "totalMinor", "currency", "tracking"].includes(design.idName)) issues.push("El campo id colisiona con otro campo de respuesta.");
  if (!Number.isInteger(design.min) || !Number.isInteger(design.max) || design.min < 1 || design.max > 9 || design.min > design.max) issues.push("El intervalo necesita enteros con 1 ≤ mínimo ≤ máximo ≤ 9.");
  return issues;
}
function requireDesign(design: ContractDesign) { const issues = designIssues(design); if (issues.length) throw new Error(issues.join(" ")); }
export function requestSchema(design: ContractDesign): FlatSchema {
  return { type: "object", properties: { sku: { type: "string", enum: [PRODUCT.sku] }, [design.quantityName]: { type: "integer", minimum: design.min, maximum: design.max }, ...(design.note === "absent" ? {} : { note: { type: "string" as const, maxLength: 80 } }) }, required: ["sku", design.quantityName, ...(design.note === "required" ? ["note"] : [])], additionalProperties: design.extraInput };
}
export function responseSchema(design: ContractDesign, strict = false): FlatSchema {
  const properties: Record<string, ScalarSchema> = { [design.idName]: { type: design.idType }, totalMinor: { type: "integer", minimum: 0 }, currency: { type: "string", enum: [PRODUCT.currency] }, ...(design.includeStatus ? { status: { type: "string" as const, enum: ["created"] } } : {}), ...(design.tracking ? { tracking: { type: "string" as const } } : {}) };
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: !strict };
}
const errorSchema: FlatSchema = { type: "object", properties: { code: { type: "string" }, message: { type: "string" } }, required: ["code", "message"], additionalProperties: true };
export function validateMessage(schema: FlatSchema, value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return ["/: se esperaba un objeto, no null, array ni escalar."];
  const data = value as Record<string, unknown>, issues: string[] = [];
  const pointer = (key: string) => `/${key.replaceAll("~", "~0").replaceAll("/", "~1")}`;
  for (const key of schema.required) if (!Object.hasOwn(data, key)) issues.push(`${pointer(key)}: campo obligatorio ausente.`);
  for (const [key, item] of Object.entries(data)) {
    if (!Object.hasOwn(schema.properties, key)) { if (!schema.additionalProperties) issues.push(`${pointer(key)}: campo desconocido.`); continue; }
    const rule = schema.properties[key];
    if (rule.type === "string" ? typeof item !== "string" : typeof item !== "number" || !Number.isInteger(item)) { issues.push(`${pointer(key)}: se esperaba ${rule.type}.`); continue; }
    if (rule.enum && !rule.enum.includes(item as string | number)) issues.push(`${pointer(key)}: valor fuera de enum.`);
    if (typeof item === "number" && (rule.minimum !== undefined && item < rule.minimum || rule.maximum !== undefined && item > rule.maximum)) issues.push(`${pointer(key)}: fuera del intervalo ${rule.minimum}..${rule.maximum}.`);
    if (typeof item === "string" && rule.maxLength !== undefined && Array.from(item).length > rule.maxLength) issues.push(`${pointer(key)}: supera ${rule.maxLength} caracteres.`);
  }
  return issues;
}
export function parseContractMessage(source: string): unknown {
  if (new TextEncoder().encode(source).length > 4096) throw new Error("El mensaje supera 4096 bytes UTF-8.");
  try { return JSON.parse(source); } catch { throw new Error("El mensaje no es JSON válido. No se ejecuta código del editor."); }
}
export function contractStep(entries: TraceEvent[], stage: Stage, action: string, input: unknown, output: unknown, cause: string, actor: Actor = "provider", code = "// Modelo de contrato, sin HTTP real") {
  const entry = modelStep(stage, action, input, output, cause, actor, "Contrato explícito del experimento", code, `${cause} Este modelo solo implementa el subconjunto documentado. Tiempo lógico, sin latencia medida.`, interaction(stage === "response" ? "Proveedor del contrato" : actor === "transport" || actor === "browser" ? "Consumidor del contrato" : "Proveedor del contrato", stage === "response" ? "Consumidor del contrato" : actor === "store" ? "Almacenamiento del modelo" : actor === "browser" ? "Validador del consumidor" : "Proveedor del contrato", actor === "transport" ? "HTTP conceptual" : actor === "store" ? "Almacenamiento conceptual" : "TypeScript · modelo de contratos", "Incompatibilidad de schema o reglas de negocio.", "Una respuesta puede perderse después del efecto."));
  entries.push(entry); return entry;
}
export function contractCapture(id: string, events: TraceEvent[], extra: Partial<Capture> = {}): Capture { return { id, mode: "simulation", events: indexEvents(id, events), ...structuredClone(extra) }; }
export interface ProviderRun { design: ContractDesign; status: number; body: unknown; inputOk: boolean; responseOk: boolean; businessOk: boolean; issues: string[]; capture: Capture }
export function provideOrder(design: ContractDesign, input: unknown, path = contractPath(design), bug = false): ProviderRun {
  requireDesign(design);
  const serving = path === "/v1/orders" && contractPath(design) !== path && design.keepV1 ? baselineDesign : design;
  const entries: TraceEvent[] = [];
  const request = { method: "POST", url: `https://design.example${path}`, headers: { "Content-Type": "application/json" }, body: input };
  contractStep(entries, "request", "El consumidor invoca el contrato", request, null, "Es una invocación modelada. Estas rutas no están desplegadas.", "transport");
  let status = 404, body: unknown = { code: "NOT_FOUND", message: "La ruta solicitada no está disponible." }, inputOk = false, businessOk = false;
  let issues: string[] = [];
  const route = contractStep(entries, "route", "Resolver la ruta publicada", { requested: path, candidate: contractPath(design), keepV1: design.keepV1 }, { serving: contractPath(serving) }, "Conservar v1 significa mantener su handler y su contrato, no renombrar la ruta del contrato nuevo.");
  if (path !== contractPath(serving)) { route.state = "error"; route.error = { code: "NOT_FOUND", message: "El proveedor no ofrece esa ruta." }; issues = [route.error.message]; }
  else {
    issues = validateMessage(requestSchema(serving), input); inputOk = issues.length === 0;
    const validation = contractStep(entries, "validate", "Validar inputs contra el schema", input, { valid: inputOk, issues }, "Tipos, campos obligatorios y límites se comprueban antes de ejecutar negocio.", "provider", "validateMessage(requestSchema, input);");
    if (!inputOk) {
      status = 400; body = serving.errorShape === "structured" ? { code: "INVALID_INPUT", message: issues.join(" ") } : `INVALID_INPUT: ${issues.join(" ")}`;
      validation.state = "error"; validation.error = { code: "INVALID_INPUT", message: issues.join(" ") };
    } else {
      const quantity = (input as Record<string, unknown>)[serving.quantityName] as number;
      const order = { [serving.idName]: serving.idType === "string" ? "PED-1042" : 1042, totalMinor: bug ? 1 : quantity * PRODUCT.priceMinor, currency: PRODUCT.currency, ...(serving.includeStatus ? { status: "created" } : {}), ...(serving.tracking ? { tracking: "TRK-1042" } : {}) };
      body = order; status = 201;
      businessOk = quantity >= 1 && quantity <= 5 && order.totalMinor === quantity * PRODUCT.priceMinor && order.currency === PRODUCT.currency;
      contractStep(entries, "business", "Construir el pedido del modelo", { quantity, unitMinor: PRODUCT.priceMinor, bug }, body, "El requisito mantiene cantidad1..5 y total=8900×cantidad aunque edites el schema.", "provider", "const totalMinor = quantity * unitMinor;");
    }
  }
  const responseOk = status === 201 ? validateMessage(responseSchema(serving), body).length === 0 : status === 400 && serving.errorShape === "text" ? typeof body === "string" : validateMessage(errorSchema, body).length === 0;
  contractStep(entries, "response", `El proveedor devuelve HTTP ${status}`, null, { status, body }, "La respuesta tiene una representación; su forma no prueba que cumpla reglas de negocio.", "transport");
  contractStep(entries, "providerModel", "Separar prueba de schema y prueba de negocio", { responseSchema: status === 201 ? responseSchema(serving) : serving.errorShape }, { responseOk, businessOk }, "Un total1 sigue siendo un entero permitido por el schema, pero no es el total correcto del pedido. Un rechazo no es un pedido creado.", "browser", "checkResponseSchema(body);\ncheckBusinessRequirement(body, input);");
  return { design: { ...design }, status, body: structuredClone(body), inputOk, responseOk, businessOk, issues, capture: contractCapture("contract:provider", entries, { request, response: { status, body } }) };
}

export type ContractFixture = "nominal" | "minimum" | "maximum" | "invalid";
export function sampleInput(design: ContractDesign, fixture: ContractFixture = "nominal"): Record<string, unknown> {
  const quantity = fixture === "invalid" ? 0 : fixture === "minimum" ? design.min : fixture === "maximum" ? design.max : Math.min(design.max, Math.max(design.min, 2));
  return { sku: PRODUCT.sku, [design.quantityName]: quantity, ...(design.note === "absent" ? {} : { note: "Entregar con cuidado" }) };
}
export function consumeOrder(consumer: ContractDesign, input: unknown, run: ProviderRun, strict: boolean): string[] {
  const expectedStatus = validateMessage(requestSchema(consumer), input).length ? 400 : 201;
  if (run.status !== expectedStatus) return [`El consumidor esperaba HTTP ${expectedStatus} y recibió ${run.status}.`];
  if (run.status === 201) return validateMessage(responseSchema(consumer, strict), run.body);
  return consumer.errorShape === "text" ? typeof run.body === "string" ? [] : ["El consumidor esperaba error de texto."] : validateMessage(errorSchema, run.body);
}
export function compatibilityRun(design: ContractDesign, direction: "old-new" | "new-old", fixture: ContractFixture, strict: boolean) {
  requireDesign(design);
  const consumer = direction === "old-new" ? baselineDesign : design, target = direction === "old-new" ? design : baselineDesign;
  const input = sampleInput(consumer, fixture), path = contractPath(consumer);
  const before = provideOrder(consumer, input, path), after = provideOrder(target, input, path);
  for (const run of [before, after]) {
    const issues = consumeOrder(consumer, input, run, strict);
    const entries = [...run.capture.events];
    const check = contractStep(entries, "parse", "El consumidor comprueba su propio contrato", run.body, { accepted: !issues.length, issues }, "El consumidor no aprende automáticamente el schema del nuevo proveedor. Solo usamos este fixture, no una certificación universal.", "browser", "checkExpectedStatusAndRepresentation(response, consumerContract);");
    if (issues.length) { check.state = "error"; check.error = { code: "CONSUMER_CONTRACT_BROKEN", message: issues.join(" ") }; }
    run.capture = contractCapture(`contract:${run === before ? "before" : "after"}`, entries, { request: run.capture.request, response: run.capture.response });
  }
  return { design: { ...design }, direction, fixture, strict, input, before, after, beforeIssues: consumeOrder(consumer, input, before, strict), afterIssues: consumeOrder(consumer, input, after, strict) };
}
export interface ContractChange { title: string; impact: "ruptura" | "condicional" | "información"; reason: string }
export function contractChanges(design: ContractDesign): ContractChange[] {
  const changes: ContractChange[] = [];
  const add = (title: string, impact: ContractChange["impact"], reason: string) => changes.push({ title, impact, reason });
  if (contractPath(design) !== "/v1/orders") add("Ruta diferente", design.keepV1 ? "información" : "ruptura", design.keepV1 ? "v1 conserva su handler original; el consumidor nuevo aún no puede llamar esa ruta en un proveedor antiguo." : "El consumidor anterior llama /v1/orders. Sin conservarla recibirá404.");
  if (design.quantityName !== "quantity") add("Renombre de input", "ruptura", "El consumidor anterior envía quantity; el nuevo contrato exige otro campo. Convivir en otra ruta puede aislar el cambio.");
  if (design.min > 1 || design.max < 5) add("Inputs restringidos", "ruptura", "Se rechazan cantidades antes válidas. Prueba mínimo y máximo del consumidor anterior.");
  if (design.max > 5) add("Inputs ampliados", "condicional", "El proveedor nuevo admite más valores; el antiguo no. Además el máximo de negocio sigue siendo5.");
  if (design.note !== "absent") add("Nuevo input note", design.note === "required" ? "ruptura" : "condicional", design.note === "required" ? "El consumidor anterior no envía note y será rechazado." : "Añadir un input opcional permite requests anteriores. El proveedor antiguo rechaza ese campo nuevo.");
  if (design.extraInput) add("Aceptar inputs desconocidos", "condicional", "Amplía lo que acepta este proveedor, pero no actualiza proveedores antiguos ni define significado para esos campos.");
  if (design.idName !== "id" || design.idType !== "string" || !design.includeStatus) add("Output anterior alterado", "ruptura", "Renombrar id, cambiar su tipo o retirar status incumple expectativas del consumidor anterior.");
  if (design.tracking) add("Nuevo output tracking", "condicional", "El consumidor anterior tolerante acepta extras; uno estricto los rechaza. El nuevo consumidor exige tracking y el proveedor antiguo no lo produce.");
  if (design.errorShape === "text") add("Contrato de error cambiado", "ruptura", "El consumidor que lee code/message falla aunque las respuestas de éxito sigan siendo compatibles. Prueba el fixture inválido.");
  if (design.deprecatedV1) add("Deprecación anunciada", "información", "deprecated informa. No retira la ruta, no migra consumidores ni repara un cambio incompatible.");
  if (design.style === "resource" && /create|update|delete|confirm/i.test(design.name)) add("Naming orientado a comando", "información", "Para el estilo de recursos elegido, una colección como orders expresa mejor el recurso. Un comando explícito también es una interfaz válida con otro propósito.");
  if (!changes.length) add("Sin cambios en las dimensiones del diseñador", "información", "Los fixtures prueban ejemplos. No cubren todos los consumidores, valores o efectos de una API real.");
  return changes;
}

export function openAPIDocument(design: ContractDesign) {
  requireDesign(design);
  const operation = (contract: ContractDesign, deprecated: boolean) => ({ summary: contract.style === "resource" ? "Crear un pedido en la colección" : "Ejecutar el comando de creación", deprecated, requestBody: { required: true, content: { "application/json": { schema: requestSchema(contract), example: sampleInput(contract) } } }, responses: { "201": { description: "Pedido creado en el modelo", content: { "application/json": { schema: responseSchema(contract) } } }, "400": { description: "Input rechazado antes de negocio", content: contract.errorShape === "text" ? { "text/plain": { schema: { type: "string" } } } : { "application/json": { schema: errorSchema } } } } });
  const paths: Record<string, { post: ReturnType<typeof operation> }> = { [contractPath(design)]: { post: operation(design, design.deprecatedV1 && design.version === "v1") } };
  if (design.keepV1 && contractPath(design) !== "/v1/orders") paths["/v1/orders"] = { post: operation(baselineDesign, design.deprecatedV1) };
  return { openapi: "3.1.1", info: { title: "Pedidos diseñados en el laboratorio", version: design.version === "v1" ? "1.0.0" : "2.0.0", description: "Modelo educativo. Estas rutas no están desplegadas; este documento no instala validación ni handlers." }, paths };
}
export function asyncAPIDocument() {
  return { asyncapi: "3.0.0", info: { title: "Evento independiente de confirmación", version: "1.0.0", description: "Ejemplo descriptivo, sin broker desplegado. No es la operación HTTP del diseñador." }, channels: { confirmed: { address: "orders.confirmed", messages: { orderConfirmed: { name: "OrderConfirmed", payload: { type: "object", properties: { eventId: { type: "string" }, orderId: { type: "string" }, status: { type: "string", enum: ["confirmed"] } }, required: ["eventId", "orderId", "status"] } } } } }, operations: { publishConfirmation: { action: "send", channel: { $ref: "#/channels/confirmed" }, messages: [{ $ref: "#/channels/confirmed/messages/orderConfirmed" }] } } };
}
