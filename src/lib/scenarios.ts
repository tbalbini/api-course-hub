import { Capture, event, indexEvents, Stage, TraceEvent } from "./trace";
import { defaultNetwork, destination, ingress, preparation, type NetworkSettings } from "./network";
import { PRODUCT } from "./product";
import { interaction } from "./interaction";

export const scenarios = ["201", "200", "400", "401", "403", "404", "409", "429", "500", "timeout", "network", "duplicate"] as const;
export type Scenario = typeof scenarios[number];
export const scenarioNames: Record<Scenario, string> = {
  "201": "201 · Pedido creado", "200": "200 · Consulta correcta", "400": "400 · Datos inválidos", "401": "401 · Sin credencial", "403": "403 · Sin permiso", "404": "404 · Pedido inexistente", "409": "409 · Conflicto de clave", "429": "429 · Límite alcanzado", "500": "500 · Error interno", timeout: "Timeout · Respuesta perdida", network: "Fallo de red", duplicate: "Petición duplicada",
};

const failures: Partial<Record<Scenario, { stage: Stage; code: string; message: string }>> = {
  "400": { stage: "validate", code: "INVALID_INPUT", message: "quantity debe ser un entero de 1 a 5." },
  "401": { stage: "authenticate", code: "UNAUTHENTICATED", message: "No se reconoce la credencial." },
  "403": { stage: "authorize", code: "FORBIDDEN", message: "El rol reader no puede crear pedidos." },
  "404": { stage: "business", code: "NOT_FOUND", message: "No existe el pedido solicitado." },
  "409": { stage: "business", code: "IDEMPOTENCY_CONFLICT", message: "La clave ya se utilizó con otra cantidad." },
  "429": { stage: "business", code: "CAPACITY_LIMIT", message: "El almacén demostrativo está lleno." },
  "500": { stage: "business", code: "INTERNAL_ERROR", message: "La operación falló antes de guardar en este escenario." },
};

export function simulate(scenario: Scenario, quantity = 1, settings: NetworkSettings = defaultNetwork): Capture {
  const id = `sim-${scenario}`;
  const input = { sku: "kit-api", quantity: scenario === "400" ? 0 : quantity };
  const order = { id: "pedido-simulado", ...input, totalMinor: PRODUCT.priceMinor * quantity, currency: PRODUCT.currency, status: "created" };
  const query = scenario === "200" || scenario === "404";
  const queryId = scenario === "404" ? "inexistente" : "pedido-simulado";
  const headers: Record<string, string> = scenario === "401" ? {} : { Authorization: scenario === "403" ? "Bearer demo-reader" : "Bearer demo-buyer" };
  if (!query) Object.assign(headers, { "Content-Type": "application/json", "Idempotency-Key": "misma-clave" });
  const request = { method: query ? "GET" : "POST", url: destination(settings).origin + (query ? `/api/orders/${queryId}` : "/api/orders"), headers, ...(query ? {} : { body: input }) };
  const events: TraceEvent[] = [];
  const add = (stage: Stage, output: unknown = null) => {
    const entry = event(stage, input, output, "conceptual");
    if (stage === "request") {
      entry.input = request;
      entry.code = `fetch(${JSON.stringify(request.url)}, { method: "POST", headers, body: JSON.stringify(input) });`;
    }
    if (stage === "serverAccept") { entry.input = request; entry.output = { delivered: true }; }
    if (stage === "route") {
      entry.input = { method: request.method, path: new URL(request.url).pathname };
      entry.output = { handler: query ? "GET /api/orders/[id]" : "POST /api/orders" };
      entry.contract = `Route Handler ${query ? "GET /api/orders/[id]" : "POST /api/orders"}`;
      entry.code = `export async function ${request.method}(request: Request) { /* ... */ }`;
    }
    if (stage === "endpoint" && query) entry.input = { id: queryId };
    if (stage === "middleware") entry.input = { method: request.method, authorization: headers.Authorization ?? null };
    if (stage === "authenticate") {
      entry.input = { authorization: headers.Authorization ?? null };
      entry.output = scenario === "401" ? null : { role: scenario === "403" ? "reader" : "buyer" };
    }
    if (stage === "authorize") {
      entry.input = { role: scenario === "403" ? "reader" : "buyer", permission: "orders:create" };
      entry.output = { allowed: scenario !== "403" };
    }
    if (query && stage === "handler") {
      entry.input = { id: queryId };
      entry.output = { id: queryId };
      entry.code = `const id = ${JSON.stringify(queryId)};`;
      entry.contract = "Identificador del pedido";
      entry.explanation = { intuition: "La interfaz elige qué pedido consultar por su identificador.", engineering: "El consumidor selecciona el identificador del pedido que quiere consultar, sin preparar datos de creación.", internals: "El identificador forma parte de la ruta GET. No se envía un cuerpo ni se decide el precio en el navegador." };
    }
    if (query && stage === "request") {
      entry.contract = "GET /api/orders/[id]";
      entry.code = `fetch(${JSON.stringify(request.url)}, { headers });`;
      entry.explanation = { intuition: "El navegador solicita consultar un pedido existente.", engineering: "Se solicita consultar un pedido mediante GET. No hay cuerpo JSON ni creación en esta operación.", internals: "GET solicita una lectura. fetch entrega una Response incluso ante 404; el cliente comprueba su status antes de utilizar el pedido." };
    }
    if (query && stage === "business") {
      entry.input = { id: queryId };
      entry.action = "Se busca el pedido por identificador";
      entry.code = "const order = store.orders.get(id);";
      entry.contract = "Identificador de pedido → pedido o 404";
      entry.interaction = interaction("Route Handler", "Consulta de pedidos del modelo", "Lectura de fixture por identificador", "404: identificador ausente en el escenario.");
      entry.explanation = { intuition: "El proveedor busca el pedido que el consumidor solicitó.", engineering: "En este escenario se consulta por identificador. Si no existe, el servidor responde 404.", internals: "La lectura no crea pedidos. El dato inicial es un fixture simulado, no un registro consultado en esta app." };
    }
    if (query && stage === "validate") {
      entry.input = { id: queryId };
      entry.output = { id: queryId };
      entry.contract = "Identificador en la ruta";
      entry.code = "const { id } = await context.params;";
      entry.action = "Se obtiene el identificador de la ruta";
      entry.interaction = interaction("Route Handler", "Parámetros de ruta", "Resolución local del identificador");
      entry.explanation = { intuition: "El servidor obtiene qué pedido se quiere consultar.", engineering: "La consulta utiliza el identificador de ruta, sin un cuerpo de creación de pedido.", internals: "Este paso representa obtener context.params. La búsqueda siguiente decide si existe el pedido; no valida JSON ni lee un body." };
    }
    events.push(entry);
  };
  const finish = (response?: Capture["response"]): Capture => ({ id, mode: "simulation", events: indexEvents(id, events), request, network: { ...settings }, ...(response ? { response } : {}) });
  const transmit = (reuse = settings.reuseConnection) => {
    events.push(...preparation({ ...settings, reuseConnection: reuse }));
    events.push(event("wireRequest", request, { inTransit: true }, "conceptual"));
  };
  const enter = () => { events.push(...ingress(settings)); add("serverAccept"); };
  const respond = (status: number, body: unknown) => {
    events.push(event("response", body, { status, body }, "conceptual"), event("wireResponse", { status, body }, { delivered: true }, "conceptual"), event("receive", { status, body }, { status, body }, "conceptual"), event("parse", body, body, "conceptual"));
  };
  add("click"); add("handler"); add("request"); transmit();
  if (scenario === "network") {
    const failure = event("failure", input, null, "conceptual");
    failure.action = "La solicitud no llega al servidor";
    failure.state = "error";
    failure.error = { code: "NETWORK_FAILURE", message: "En esta simulación la conexión falla antes de entregar la solicitud. Otros fallos de red pueden ocurrir después de una escritura." };
    events.push(failure);
    return finish();
  }
  enter();
  const flow: Stage[] = ["route", "middleware", "authenticate", ...(query ? [] : ["authorize" as Stage]), "validate", "endpoint", "business", ...(query ? [] : ["persist" as Stage])];
  const failure = failures[scenario];
  for (const stage of flow) {
    add(stage, stage === "persist" || (query && stage === "business") ? order : null);
    if (failure?.stage === stage) {
      const entry = events[events.length - 1];
      entry.state = "error"; entry.error = { code: failure.code, message: failure.message };
      entry.output = null;
      const body = { error: entry.error, traceId: id };
      respond(Number(scenario), body); add("render", { notice: failure.message });
      const render = events[events.length - 1];
      render.input = body;
      render.contract = "Error HTTP → aviso local";
      render.code = "setNotice(body.error.message);";
      render.explanation = { intuition: "El cliente solicita mostrar el aviso de error recibido.", engineering: `El rechazo HTTP ${scenario} entrega ${failure.code}. El modelo solicita actualizar el aviso, sin aplicar un pedido exitoso.`, internals: "Se modela el setter del aviso de error, no un commit de React ni el paint. Replay no repite la solicitud HTTP." };
      render.state = "error"; render.error = entry.error;
      return finish({ status: Number(scenario), body });
    }
  }
  if (scenario === "timeout") {
    add("response", { status: 201, body: { order, traceId: id } });
    const lost = event("wireResponse", { status: 201, body: { order, traceId: id } }, { delivered: false }, "conceptual");
    lost.state = "error";
    lost.error = { code: "RESPONSE_LOST", message: "La respuesta no llega al consumidor en esta simulación." };
    events.push(lost);
    const entry = event("failure", input, { serverStored: true, clientKnowsResult: false }, "conceptual");
    entry.action = "El pedido existe, pero la respuesta se pierde"; entry.state = "error";
    entry.error = { code: "TIMEOUT", message: "El servidor guardó. El cliente no conoce el resultado. Un reintento debe conservar la clave." };
    events.push(entry);
    return finish();
  }
  if (scenario === "duplicate") {
    respond(201, { order, traceId: id });
    add("request", { retry: true, key: "misma-clave" }); transmit(true); enter();
    for (const stage of ["route", "middleware", "authenticate", "authorize", "validate", "endpoint"] as const) add(stage);
    add("deduplicate", { order, newWrites: 0 });
  }
  const status = query || scenario === "duplicate" ? 200 : 201;
  const body = { order, traceId: id };
  respond(status, body); add("render", order);
  events[events.length - 1].input = body;
  events[events.length - 1].explanation.intuition = query ? "El cliente entrega el pedido consultado al estado local." : scenario === "duplicate" ? "El cliente entrega el pedido recuperado al estado local, sin crear otro." : "El cliente entrega el pedido creado al estado local.";
  return finish({ status, body });
}

export function localCapture(favorite: boolean): Capture {
  const id = "local-favorite";
  const click = event("click");
  click.code = '<button onClick={changeLocal}>Favorito</button>';
  const local = event("local", { favorite: !favorite }, { favorite });
  local.action = "JavaScript calcula el siguiente favorito";
  local.contract = "Booleano actual → siguiente booleano";
  local.code = "const value = !favorite;";
  local.interaction = interaction("Handler changeLocal", "Cálculo JavaScript", "Negación booleana local");
  local.explanation = { intuition: "El handler invierte el valor del favorito en este navegador.", engineering: "Se calcula el siguiente booleano antes de llamar al setter. No se invoca fetch.", internals: "Este cálculo usa el estado conocido por el handler. No cruza procesos ni consulta un servidor." };
  const render = event("render", { favorite: !favorite }, { favorite });
  render.code = "setFavorite(value);";
  render.contract = "Booleano → solicitud de actualización de favorito";
  render.explanation = { intuition: "El cliente entrega el nuevo favorito al estado local.", engineering: "Se observa la llamada al setter setFavorite con el nuevo booleano. Este handler no invoca fetch.", internals: "No se instrumenta el commit de React ni el paint del botón. Replay recorre la captura sin volver a ejecutar setFavorite." };
  return { id, mode: "local", events: indexEvents(id, [click, local, render]) };
}
