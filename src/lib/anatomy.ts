import { interaction } from "./interaction";
import { event, indexEvents, type Boundary, type Capture, type TraceEvent } from "./trace";

export const mechanisms = {
  function: { name: "Función local", boundary: "Mismo proceso", left: "Un proceso · una memoria", right: "", consumer: "Módulo consumidor", provider: "Función sumar", contract: "sumar(a: number, b: number): number", execution: "El control entra en la implementación y vuelve al consumidor.", result: "Retorno numérico o excepción local.", code: "const value = sumar(2, 3);", input: { a: 2, b: 3 }, output: 5 },
  ipc: { name: "IPC local", boundary: "IPC local", left: "Proceso A · memoria A", right: "Proceso B · memoria B", consumer: "Proceso solicitante", provider: "Proceso trabajador", contract: "Mensaje {id, a, b} → {id, value}", execution: "Una representación del mensaje cruza un pipe o socket local; otro proceso calcula.", result: "Respuesta correlacionada. Un pipe de bytes necesita framing de aplicación.", code: 'pipe.write(JSON.stringify({ id: "A", a: 2, b: 3 }) + "\\n");', input: { a: 2, b: 3 }, output: 5 },
  syscall: { name: "System call", boundary: "Usuario → kernel", left: "Aplicación · modo usuario", right: "Kernel · modo privilegiado", consumer: "Código en modo usuario", provider: "Kernel del sistema operativo", contract: "read(fd, buffer, count) → bytes leídos o error", execution: "Una transición de privilegio permite que el kernel atienda la operación del descriptor.", result: "Cantidad de bytes leídos; no se garantiza llenar todo el buffer.", code: "read(fd, buffer, 3); // fixture de lectura satisfactoria", input: { fd: 3, count: 3 }, output: { bytesRead: 3, bytes: "API" } },
  http: { name: "HTTP remoto", boundary: "Red remota", left: "Cliente · equipo A", right: "Servidor · equipo B", consumer: "Cliente HTTP", provider: "Endpoint de suma", contract: "POST /sum · JSON {a,b} → {value}", execution: "Serialización, transporte, routing y ejecución del proveedor son pasos distintos.", result: "Respuesta HTTP o ausencia de respuesta observada.", code: 'fetch("https://api.example/sum", { method: "POST", body: JSON.stringify({a:2,b:3}) });', input: { a: 2, b: 3 }, output: 5 },
  rpc: { name: "RPC remoto", boundary: "Red remota", left: "Stub cliente · equipo A", right: "Servicio · equipo B", consumer: "Cliente de procedimiento", provider: "Procedimiento Sum", contract: "Sum({a,b}) → {value}", execution: "El stub representa la invocación, codifica un mensaje y el proveedor despacha el procedimiento.", result: "Resultado remoto correlacionado, error del servicio o fallo de transporte.", code: "await client.Sum({ a: 2, b: 3 }); // modelo", input: { a: 2, b: 3 }, output: 5 },
  message: { name: "Mensaje asíncrono", boundary: "Mensajería asíncrona", left: "Productor · proceso A", right: "Broker y trabajador · roles distintos", consumer: "Productor que solicita trabajo", provider: "Broker que acepta y trabajador que procesa", contract: "SumRequested {id,a,b}; aceptación ≠ finalización", execution: "El broker acepta el mensaje y más tarde un trabajador lo procesa. Un ack de aceptación no es el resultado de negocio.", result: "Confirmación inicial y eventual evento SumCompleted; entrega duplicada requiere deduplicación.", code: 'publish("SumRequested", { id: "A", a: 2, b: 3 });', input: { a: 2, b: 3 }, output: 5 },
  subscription: { name: "Suscripción a eventos", boundary: "Mensajería asíncrona", left: "Suscriptor · proceso A", right: "Publicador · proceso B", consumer: "Suscriptor interesado", provider: "Publicador de cambios", contract: "subscribe(SumCompleted, listener); eventos {id,value}", execution: "Primero se registra interés; después el proveedor entrega eventos al suscriptor. Los eventos circulan en dirección inversa al registro.", result: "Cero, uno o varios eventos hasta cancelar la suscripción. No es un retorno único.", code: 'subscribe("SumCompleted", event => mostrar(event.value));', input: { topic: "SumCompleted" }, output: { id: "A", value: 5 } },
} satisfies Record<string, { name: string; boundary: Boundary; left: string; right: string; consumer: string; provider: string; contract: string; execution: string; result: string; code: string; input: unknown; output: unknown }>;
export type Mechanism = keyof typeof mechanisms;
export type ModelCondition = "success" | "network" | "lost";
export const requestReply = (mode: Mechanism) => mode === "ipc" || mode === "http" || mode === "rpc";

function modelEvents(mode: Mechanism, condition: ModelCondition, lane: "A" | "B"): TraceEvent[] {
  const mechanism = mechanisms[mode];
  const input = { invocation: lane, payload: mechanism.input };
  const entries: TraceEvent[] = [];
  const add = (stage: TraceEvent["stage"], action: string, inputValue: unknown, output: unknown, boundary: Boundary = "Mismo proceso", returning = stage === "deliveryModel") => {
    const entry = event(stage, inputValue, output, "conceptual");
    entry.interaction = interaction(returning ? mechanism.provider : stage === "providerModel" ? mechanism.provider : mechanism.consumer, returning ? mechanism.consumer : mechanism.provider, mechanism.name, ...(requestReply(mode) ? ["Fallo de entrega o respuesta perdida; el resultado puede ser incierto."] : mode === "message" || mode === "subscription" ? ["La aceptación no asegura finalización; una entrega puede repetirse o perderse."] : []));
    entry.lane = lane; entry.action = `${lane} · ${action}`; entry.boundary = boundary; entry.contract = mechanism.contract; entry.code = mechanism.code;
    entry.explanation = { intuition: mechanism.execution, engineering: `${mechanism.consumer}. ${mechanism.provider}. ${mechanism.result}`, internals: "Modelo pedagógico: no se ejecuta esta infraestructura. Las dependencias representan causalidad dentro de esta invocación; no miden latencia ni impiden que otra avance. La representación JSON de IPC y RPC es una elección ilustrativa de este modelo, no un requisito de esos mecanismos." };
    entries.push(entry); return entry;
  };
  add("invokeModel", mode === "subscription" ? "El consumidor registra interés" : "El consumidor invoca la capacidad", input, { initiated: true });
  if (mode !== "function") add("crossBoundary", mode === "syscall" ? "Se cruza de modo usuario a kernel" : mode === "subscription" ? "Se registra la suscripción" : "Se transfiere la representación", input, { represented: mode === "syscall" ? input.payload : JSON.stringify(input) }, mechanism.boundary);
  if (condition === "network" && requestReply(mode)) {
    const failure = add("failure", "Falla la entrega antes del proveedor", input, { delivered: false, clientKnowsResult: false }, mechanism.boundary);
    failure.state = "error"; failure.error = { code: "DELIVERY_FAILED", message: "Este escenario detiene la entrega antes de ejecutar el proveedor. No generaliza todos los fallos de transporte." }; return entries;
  }
  if (mode === "message") { const accepted = add("deliveryModel", "El broker confirma aceptación, no finalización", input, { accepted: true, completed: false }, mechanism.boundary, true); accepted.interaction.initiator = "Broker"; }
  const execution = add("providerModel", mode === "subscription" ? "El publicador produce un evento" : mode === "syscall" ? "El kernel lee el descriptor" : "El proveedor ejecuta el trabajo", input, { result: mechanism.output, providerExecuted: true });
  if (mode === "function") execution.actor = "browser";
  if (condition === "lost" && requestReply(mode)) {
    const failure = add("failure", "La respuesta se pierde después de ejecutar", { providerResult: mechanism.output }, { providerExecuted: true, clientKnowsResult: false }, mechanism.boundary);
    failure.state = "error"; failure.error = { code: "TIMEOUT", message: "El consumidor dejó de esperar. El resultado remoto es incierto para él, aunque este modelo muestre que el proveedor ejecutó." }; return entries;
  }
  add("deliveryModel", mode === "subscription" ? "El evento llega del publicador al suscriptor" : mode === "message" ? "SumCompleted comunica la finalización posterior" : "El resultado vuelve al consumidor", { result: mechanism.output }, { result: mechanism.output, clientKnowsResult: true }, mechanism.boundary);
  return entries;
}

export function anatomyCapture(mode: Mechanism, condition: ModelCondition = "success", concurrent = false): Capture {
  const id = `model-${mode}`;
  const a = modelEvents(mode, condition, "A");
  if (!concurrent || !requestReply(mode)) return { id, mode: "simulation", events: indexEvents(id, a) };
  const b = modelEvents(mode, condition, "B");
  const events: TraceEvent[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    for (const [lane, branch] of [["A", a], ["B", b]] as const) {
      const entry = branch[i];
      if (entry) events.push({ ...entry, id: `${id}:${lane}:${i}`, logicalTime: i, dependencies: i ? [`${id}:${lane}:${i - 1}`] : [] });
    }
  }
  return { id, mode: "simulation", events };
}
