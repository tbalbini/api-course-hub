import { interaction } from "./interaction";
import { interfaces, type InterfaceId } from "@/content/comparison";
import { confirmOrder, readOrder, type OrderState } from "./order-status";
import { event, indexEvents, type Capture, type Stage, type TraceEvent } from "./trace";

export type Operation = "read" | "confirm";
export type Condition = "success" | "missing" | "lost";
export type StreamMode = "unary" | "server" | "client" | "bidi";
export type OrderField = "id" | "status";
export interface CompareSettings { operation: Operation; condition: Condition; fields: OrderField[]; stream: StreamMode }
export interface ComparisonRun {
  interfaceId: InterfaceId; settings: CompareSettings; capture: Capture;
  contract: string; invocation: string; providerCode: string; result: unknown;
  provider: OrderState | null; uncertain: boolean; changes: number;
}
export const initialSettings: CompareSettings = { operation: "read", condition: "success", fields: ["id", "status"], stream: "unary" };
export const demoOrder: Readonly<OrderState> = { id: "PED-1042", status: "created" };
const json = (value: unknown) => JSON.stringify(value, null, 2);
const envelope = (body: string) => `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:o="urn:orders"><soap:Body>${body}</soap:Body></soap:Envelope>`;
const orderXML = (order: OrderState) => `<o:id>${order.id}</o:id><o:status>${order.status}</o:status>`;

function exchange(kind: InterfaceId, settings: CompareSettings, order: OrderState, missing: boolean) {
  const { operation, stream } = settings;
  const fields = settings.fields.length ? settings.fields : ["id"];
  const procedure = operation === "read" ? "GetOrder" : "ConfirmOrder";
  const id = missing ? "no-existe" : order.id;
  const input = { id };
  const output = missing ? { code: "NOT_FOUND", message: "Pedido inexistente." } : order;
  const common = `function ${operation === "read" ? "getOrder" : "confirmOrder"}(id) {\n  const order = repository.get(id);\n  if (!order) throw notFound();\n  ${operation === "read" ? "return order;" : 'const next = { ...order, status: "confirmed" };\n  repository.set(id, next);\n  return next;'}\n}`;
  const method = operation === "read" ? "GET" : "PATCH";
  const request: NonNullable<Capture["request"]> = { method, url: `/api/orders/${id}`, headers: { "Content-Type": "application/json" }, ...(operation === "confirm" ? { body: { status: "confirmed" } } : {}) };
  let contract: string = interfaces.find(item => item.id === kind)!.contract;
  let invocation = `${procedure}(${json(input)})`;
  let providerCode = common;
  let result: unknown = output;
  let http: Capture["request"];
  let status = missing ? 404 : 200;
  if (kind === "local") invocation = operation === "read" ? "readOrder(order)" : "confirmOrder(order)";
  if (kind === "local") providerCode = operation === "read" ? "function readOrder(order) { return { ...order }; }" : 'function confirmOrder(order) { return { ...order, status: "confirmed" }; }';
  if (kind === "rest" || kind === "polling") { http = request; result = missing ? { error: output } : { order }; invocation = `${method} ${request.url}\n${operation === "confirm" ? json(request.body) : "Accept: application/json"}`; }
  if (kind === "polling") {
    http = { method: "GET", url: request.url, headers: { Accept: "application/json" } };
    invocation = `GET ${request.url} // snapshot 1\nGET ${request.url} // snapshot 2\n${operation === "confirm" ? `PATCH ${request.url} {"status":"confirmed"} // comando separado\n` : ""}GET ${request.url} // snapshot 3\n// El inspector HTTP resume la última consulta.`;
  }
  if (kind === "graphql") {
    const fieldList = fields.join(" ");
    const field = operation === "read" ? "order" : "confirmOrder";
    const query = `${operation === "read" ? "query" : "mutation"} ${procedure}($id: ID!) {\n  ${field}(id: $id) { ${fieldList} }\n}`;
    contract = `enum OrderStatus { created confirmed }\ntype Order { id: ID!, status: OrderStatus! }\ntype Query { order(id: ID!): Order }\ntype Mutation { confirmOrder(id: ID!): Order }\ntype Subscription { orderChanged(id: ID!): Order! }`;
    invocation = `${query}\n\nVariables: ${json(input)}\n\n// Observación alternativa, no se ejecuta aquí:\nsubscription { orderChanged(id: "${id}") { ${fieldList} } }`;
    providerCode = `const resolvers = {\n  Query: { order: (_, { id }, context) => context.requireOrder(id) },\n  Mutation: { confirmOrder: (_, { id }, context) => context.confirm(id) },\n  Subscription: { orderChanged: {\n    subscribe: (_, { id }, context) => context.events.forOrder(id)\n  } }\n};\n// Autorización, validación y notFound dentro de context.\n// Los campos escalares usan el resolver por defecto.`;
    result = missing ? { data: { [field]: null }, errors: [{ message: "Pedido inexistente.", path: [field], extensions: { code: "NOT_FOUND" } }] } : { data: { [field]: Object.fromEntries(fields.map(name => [name, order[name as OrderField]])) } };
    http = { method: "POST", url: "/graphql", headers: { "Content-Type": "application/json" }, body: { query, variables: input } }; status = 200;
  }
  if (kind === "rpc" || kind === "jsonrpc") {
    const body = kind === "jsonrpc" ? { jsonrpc: "2.0", method: procedure, params: input, id: 1 } : { procedure, arguments: input, correlationId: "call-1" };
    result = kind === "jsonrpc" ? { jsonrpc: "2.0", ...(missing ? { error: { code: -32004, message: "Pedido inexistente." } } : { result: order }), id: 1 } : { correlationId: "call-1", ...(missing ? { error: output } : { result: order }) };
    invocation = json(body); http = { method: "POST", url: "/rpc", headers: { "Content-Type": "application/json" }, body }; status = 200;
  }
  if (kind === "xmlrpc") {
    invocation = `<?xml version="1.0"?>\n<methodCall><methodName>${procedure}</methodName><params><param><value><string>${id}</string></value></param></params></methodCall>`;
    result = missing ? `<methodResponse><fault><value><struct><member><name>faultCode</name><value><int>404</int></value></member><member><name>faultString</name><value><string>Pedido inexistente.</string></value></member></struct></value></fault></methodResponse>` : `<methodResponse><params><param><value><struct><member><name>id</name><value><string>${order.id}</string></value></member><member><name>status</name><value><string>${order.status}</string></value></member></struct></value></param></params></methodResponse>`;
    http = { method: "POST", url: "/xmlrpc", headers: { "Content-Type": "text/xml" }, body: invocation }; status = 200;
  }
  if (kind === "soap") {
    invocation = envelope(`<o:${procedure}><o:id>${id}</o:id></o:${procedure}>`);
    result = envelope(missing ? "<soap:Fault><faultcode>soap:Client</faultcode><faultstring>Pedido inexistente.</faultstring></soap:Fault>" : `<o:${procedure}Response>${orderXML(order)}</o:${procedure}Response>`);
    contract = `<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"\n xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:o="urn:orders" targetNamespace="urn:orders">\n <wsdl:types><xs:schema targetNamespace="urn:orders" elementFormDefault="qualified">\n  <xs:element name="${procedure}"><xs:complexType><xs:sequence>\n   <xs:element name="id" type="xs:string"/>\n  </xs:sequence></xs:complexType></xs:element>\n  <xs:element name="${procedure}Response"><xs:complexType><xs:sequence>\n   <xs:element name="id" type="xs:string"/><xs:element name="status" type="xs:string"/>\n  </xs:sequence></xs:complexType></xs:element>\n </xs:schema></wsdl:types>\n <wsdl:message name="Input"><wsdl:part name="parameters" element="o:${procedure}"/></wsdl:message>\n <wsdl:message name="Output"><wsdl:part name="parameters" element="o:${procedure}Response"/></wsdl:message>\n <wsdl:portType name="OrderPort"><wsdl:operation name="${procedure}">\n  <wsdl:input message="o:Input"/><wsdl:output message="o:Output"/>\n </wsdl:operation></wsdl:portType>\n</wsdl:definitions>\n<!-- Extracto sin binding ni service; no es un despliegue completo. -->`;
    http = { method: "POST", url: "/soap", headers: { "Content-Type": "text/xml", SOAPAction: `"urn:orders#${procedure}"` }, body: invocation }; status = missing ? 500 : 200;
  }
  if (kind === "grpc") {
    const clientStream = stream === "client" || stream === "bidi";
    const serverStream = stream === "server" || stream === "bidi";
    const responseType = stream === "client" ? "OrderBatch" : "Order";
    contract = `syntax = "proto3";\npackage orders;\nmessage OrderRequest { string id = 1; }\nmessage Order { string id = 1; string status = 2; }\nmessage OrderBatch { repeated Order orders = 1; }\nservice OrderService {\n  rpc ${procedure}(${clientStream ? "stream " : ""}OrderRequest) returns (${serverStream ? "stream " : ""}${responseType});\n}`;
    invocation = `${procedure}(${clientStream ? `[${json(input)}, ${json(input)}]` : json(input)})\n// Objetos conceptuales, no captura binaria.\n// ${stream === "unary" ? "1 solicitud → 1 respuesta" : stream === "server" ? "1 solicitud → stream con 1 snapshot → cierre" : stream === "client" ? "2 solicitudes idénticas → cierre cliente → resumen de 2 resultados" : "solicitud → respuesta → solicitud → respuesta → cierre"}`;
    result = missing ? { grpcStatus: "NOT_FOUND" } : stream === "client" ? { orders: [order, order], grpcStatus: "OK" } : { order, grpcStatus: "OK" };
    providerCode = `${common}\n// El runtime gRPC decodifica mensajes, invoca el servicio\n// y termina con status gRPC. Sin servidor gRPC en esta app.`;
  }
  if (kind === "subscription") { invocation = `subscribe({ orderId: "${id}" })\n${operation === "confirm" ? `// Canal de comando separado:\nPATCH /orders/${id} {"status":"confirmed"}` : "// Solo snapshot inicial, sin comando ni cambio."}`; result = missing ? { error: output } : { type: operation === "confirm" ? "order.confirmed" : "snapshot", order }; }
  return { contract, invocation, providerCode, result, http, status };
}

export function compareRun(interfaceId: InterfaceId, options: CompareSettings): ComparisonRun {
  const settings = { ...options, fields: [...options.fields] };
  const local = interfaceId === "local";
  const observing = interfaceId === "polling" || interfaceId === "subscription";
  const missing = settings.condition === "missing";
  let provider: OrderState | null = missing ? null : { ...demoOrder };
  let changes = 0;
  const entries: TraceEvent[] = [];
  const finalOrder = !missing && settings.operation === "confirm" ? { ...demoOrder, status: "confirmed" as const } : { ...demoOrder };
  const details = exchange(interfaceId, settings, finalOrder, missing);
  const add = (stage: Stage, action: string, input: unknown, output: unknown, cause: string, code = details.providerCode, returning = false) => {
    const entry = event(stage, input, output, local ? "observed" : "conceptual");
    const profile = interfaces.find(item => item.id === interfaceId)!;
    entry.interaction = interaction(returning ? "Proveedor" : stage === "providerModel" ? "Proveedor" : "Consumidor", returning ? "Consumidor" : stage === "useResult" ? "Estado del consumidor" : "Proveedor", profile.name, profile.errors);
    entry.action = action;
    entry.actor = stage === "providerModel" ? (local ? "browser" : "provider") : stage === "crossBoundary" ? "transport" : "browser";
    entry.boundary = stage === "crossBoundary" ? "Red remota" : "Mismo proceso";
    entry.contract = details.contract;
    entry.code = code;
    entry.explanation = { intuition: cause, engineering: `${cause} ${interfaces.find(item => item.id === interfaceId)!.processing}`, internals: `${cause} ${interfaces.find(item => item.id === interfaceId)!.errors} Los eventos y su tiempo lógico no miden paquetes ni rendimiento.` };
    entries.push(entry); return entry;
  };
  const invoke = () => add("invokeModel", local ? "Llamada JavaScript dentro del proceso" : "El consumidor prepara la invocación", { orderId: missing ? "no-existe" : demoOrder.id }, null, local ? "El laboratorio ejecuta una función real sin red ni serialización." : "El contrato elige el mensaje que representa la capacidad. Este recorrido remoto es conceptual.", details.invocation);
  const execute = () => {
    const before = provider;
    if (provider && settings.operation === "confirm") {
      if (provider.status !== "confirmed") changes++;
      provider = confirmOrder(provider);
    } else if (provider) provider = readOrder(provider);
    add("providerModel", settings.operation === "confirm" ? "El proveedor confirma el pedido" : "El proveedor consulta el estado", before, provider, settings.operation === "confirm" ? "Se fija confirmed. Repetir este mismo comando no vuelve a cambiar el estado ni representa un pago." : "Se obtiene un snapshot sin modificar el pedido.");
  };
  const transfer = (action: string, input: unknown, output: unknown = null, returning = false) => add("crossBoundary", action, input, output, "Se cruza una frontera de red en el modelo. No es captura de tráfico real.", details.invocation, returning);
  const lost = () => {
    const entry = transfer("Se pierde la respuesta remota", provider, { delivered: false }, true);
    entry.state = "error"; entry.error = { code: interfaceId === "grpc" ? "DEADLINE_EXCEEDED" : "RESPONSE_LOST", message: "El proveedor pudo terminar, pero esta respuesta no llegó. El timeout no revierte el efecto." };
  };
  invoke();
  if (!local && (interfaceId !== "polling" || missing)) transfer(interfaceId === "subscription" ? "Se registra la suscripción" : "Se envían los argumentos", { id: missing ? "no-existe" : demoOrder.id });
  let uncertain = false;
  let result: unknown = details.result;
  if (missing) {
    const entry = add("providerModel", "No existe el pedido solicitado", { id: "no-existe" }, details.result, "El proveedor rechaza antes de escribir. Cada interfaz representa el error con su propio contrato.");
    entry.state = "error"; entry.error = { code: "NOT_FOUND", message: "Pedido inexistente, sin cambio de estado." };
    if (!local) transfer("Se entrega el error de aplicación", details.result, { delivered: true }, true);
  } else if (observing) {
    if (interfaceId === "polling") {
      for (let i = 1; i <= 3; i++) {
        if (i === 3 && settings.operation === "confirm") {
          transfer("Se envía un comando separado de confirmación", { status: "confirmed" }); execute();
          if (settings.condition === "lost") lost();
          else transfer("Llega la respuesta del comando", provider, null, true);
        }
        transfer(`Consulta periódica ${i} de 3`, { method: "GET", id: demoOrder.id });
        add("providerModel", `Snapshot ${i} sin escritura`, { id: demoOrder.id }, { ...provider! }, "Consultar no cambia el estado. Entre lecturas puede ocurrir un comando independiente.");
        if (i === 3 && settings.condition === "lost" && settings.operation === "read") { lost(); uncertain = true; result = null; }
        else transfer(`Se recibe el snapshot ${i}`, { ...provider! }, { ...provider! }, true);
      }
    } else {
      add("providerModel", "El proveedor conserva el interés registrado", { orderId: demoOrder.id }, { subscribed: true }, "La suscripción no confirma el pedido y no garantiza por sí sola entrega durable.");
      if (settings.operation === "confirm") {
        transfer("Se entrega el snapshot inicial", { ...provider! }, null, true);
        transfer("Se envía un comando separado de confirmación", { status: "confirmed" }); execute();
        if (settings.condition === "lost") lost();
        else transfer("Llega la respuesta del comando", provider, null, true);
        transfer("El proveedor entrega order.confirmed", { type: "order.confirmed", order: provider }, { ...provider! }, true);
      } else if (settings.condition === "lost") { lost(); uncertain = true; result = null; }
      else transfer("Se entrega el snapshot inicial", provider, provider, true);
    }
  } else {
    const count = interfaceId === "grpc" && (settings.stream === "client" || settings.stream === "bidi") ? 2 : 1;
    for (let i = 0; i < count; i++) {
      if (i) transfer("Se envía el segundo mensaje del stream", { id: demoOrder.id });
      execute();
      if (interfaceId === "grpc" && settings.stream === "bidi") transfer(`Respuesta ${i + 1} del stream`, provider, settings.condition === "lost" ? { delivered: false } : provider, true);
    }
    if (interfaceId === "grpc" && settings.stream === "client") add("invokeModel", "El cliente cierra su stream de entrada", { messages: 2 }, null, "El servidor puede completar el resumen después de recibir el cierre de entrada.");
    if (settings.condition === "lost" && !local) { lost(); uncertain = true; result = null; }
    else if (!local) transfer(interfaceId === "grpc" ? "Llegan los mensajes y status final gRPC" : "El resultado cruza la red de retorno", details.result, details.result, true);
    if (interfaceId === "grpc") add("useResult", "La llamada gRPC termina", null, { status: uncertain ? "DEADLINE_EXCEEDED" : "OK" }, "El status final pertenece a gRPC. No se muestra como un código de respuesta HTTP.");
  }
  add("useResult", uncertain ? "El consumidor conserva incertidumbre" : missing ? "El consumidor interpreta el error" : "El consumidor utiliza el resultado", null, result, uncertain ? "La falta de respuesta no demuestra que el pedido siga created. Consulta el estado antes de inferir el efecto." : observing && settings.condition === "lost" && settings.operation === "confirm" ? "Aunque la respuesta del comando se perdió, esta observación posterior de confirmed resuelve la incertidumbre." : local && settings.condition === "lost" ? "Esta función síncrona no cruza red: la condición de pérdida de respuesta remota no le aplica." : "El resultado depende del contrato y de la ejecución, no solo del formato del mensaje.");
  const id = `compare:${interfaceId}:${settings.operation}:${settings.condition}:${settings.stream}`;
  const capture: Capture = { id, mode: local ? "local" : "simulation", events: indexEvents(id, entries), ...(!local && details.http ? { request: details.http, ...(!uncertain ? { response: { status: details.status, body: details.result } } : {}) } : {}) };
  return { interfaceId, settings, capture, contract: details.contract, invocation: details.invocation, providerCode: details.providerCode, result, provider, uncertain, changes };
}
