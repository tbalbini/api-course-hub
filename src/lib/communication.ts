import { interaction, type Interaction } from "./interaction";
import { communicationProfiles } from "@/content/events";
import { event, indexEvents, type Actor, type Boundary, type Capture, type Stage, type TraceEvent } from "./trace";

export function modelStep(stage: Stage, action: string, input: unknown, output: unknown, cause: string, actor: Actor, contract: string, code: string, internals: string, interaction: Interaction): TraceEvent {
  const entry = event(stage, structuredClone(input), structuredClone(output), "conceptual");
  const boundary: Boundary = actor === "transport" ? "Red remota" : actor === "store" ? "Aplicación → almacenamiento" : "Mismo proceso";
  return { ...entry, interaction: structuredClone(interaction), action, actor, boundary, contract, code, explanation: { intuition: cause, engineering: `${cause} Contrato: ${contract}. Los datos del paso son snapshots.`, internals } };
}

export type CommunicationMechanism = keyof typeof communicationProfiles;
export interface CommunicationSettings { mechanism: CommunicationMechanism; disconnect: boolean; resume: boolean }
export const defaultCommunication: CommunicationSettings = { mechanism: "polling", disconnect: false, resume: true };
export interface ChatSnapshot { revision: number; messages: { id: string; revision: number; text: string }[] }
export interface CommunicationRun { settings: CommunicationSettings; message: string; provider: ChatSnapshot; client: ChatSnapshot; requests: number; channels: number; capture: Capture }

export function communicationRun(options: CommunicationSettings, input: string): CommunicationRun {
  const text = input.trim();
  if (!text || text.length > 120) throw new Error("El mensaje necesita de 1 a 120 caracteres.");
  const settings = { ...options };
  const profile = communicationProfiles[settings.mechanism];
  const entries: TraceEvent[] = [];
  const provider: ChatSnapshot = { revision: 1, messages: [{ id: "chat-1", revision: 1, text }] };
  const empty: ChatSnapshot = { revision: 0, messages: [] };
  let client = empty;
  let requests = 0; let channels = 0;
  const add = (stage: Stage, action: string, data: unknown, output: unknown, cause: string, actor: Actor = "transport", returning = false, technology: string = profile.name) => {
    const entry = modelStep(stage, action, data, output, cause, actor, profile.contract, profile.code, `${profile.mechanism} ${profile.limit} La pérdida ocurre después del efecto, sin revertir al proveedor.`, interaction(returning ? "Proveedor del chat" : actor === "provider" ? "Proveedor del chat" : "Cliente del chat", returning ? "Cliente del chat" : actor === "browser" ? "Estado del cliente" : "Proveedor del chat", technology, "La actualización o su confirmación puede perderse.", profile.limit));
    entries.push(entry); return entry;
  };
  const request = (action: string, data: unknown, cause: string) => { requests++; add("crossBoundary", action, data, { requestNumber: requests }, cause, "transport", false, "HTTP conceptual"); };
  const receive = (action: string) => { add("crossBoundary", "La actualización atraviesa la red hacia el consumidor", provider, { delivered: true }, "El mensaje del proveedor cruza la frontera antes de actualizar estado local.", "transport", true); client = structuredClone(provider); add("useResult", action, provider, client, "El consumidor aplica la revisión recibida y actualiza su vista local.", "browser"); };
  const drop = () => { const entry = add("crossBoundary", "Se pierde la primera actualización", provider, { received: false }, "El proveedor ya guardó el mensaje, pero el consumidor no recibió la novedad.", "transport", true); entry.state = "error"; entry.error = { code: "UPDATE_LOST", message: "Recepción y ejecución son hechos distintos." }; };
  add("invokeModel", "El usuario inicia el experimento de chat", { text }, empty, "La traza parte de una vista vacía. Enviar este experimento solo modifica datos simulados.", "browser");
  if (settings.mechanism === "polling") request("GET periódico devuelve revisión 0", { method: "GET" }, "La primera consulta obtiene un snapshot vacío.");
  if (settings.mechanism === "longpoll") request("GET queda esperando una revisión nueva", { method: "GET", after: 0 }, "La solicitud sigue pendiente hasta tener un cambio o vencer su espera.");
  if (settings.mechanism === "sse" || settings.mechanism === "websocket") {
    channels++;
    request(settings.mechanism === "sse" ? "Se abre GET del stream SSE" : "Se establece WebSocket con Upgrade HTTP/1.1", { channel: settings.mechanism, cursor: 0 }, "El canal queda disponible. El ejemplo fija su mecanismo de establecimiento, sin capturar una conexión real.");
  }
  if (settings.mechanism === "websocket") add("crossBoundary", "El cliente envía chat.send por WebSocket", { text }, null, "El mismo canal permite enviar frames desde el cliente hacia el servidor.");
  else request("POST separado envía el mensaje", { method: "POST", body: { text } }, "El comando viaja por una solicitud separada. Un stream SSE no lleva ese comando en sentido inverso.");
  add("providerModel", "El proveedor guarda la revisión 1", { text }, provider, "Se actualiza el estado del proveedor dentro del modelo antes de anunciarlo.", "provider");
  if (settings.mechanism !== "websocket") add("crossBoundary", "El POST confirma aceptación del comando", { status: 201 }, null, "Esta respuesta del comando es independiente de la actualización que observa el chat.", "transport", true, "HTTP · respuesta del comando");
  if (settings.mechanism === "polling") request("GET periódico consulta la revisión actual", { after: 0 }, "Polling pregunta de nuevo para detectar un cambio.");
  if (settings.disconnect) drop();
  else receive(settings.mechanism === "longpoll" ? "Responde el GET que esperaba" : settings.mechanism === "polling" ? "Se recibe el snapshot de revisión 1" : "El canal entrega chat.created");
  if (settings.mechanism === "polling") {
    request("Otro GET periódico obtiene el snapshot", { method: "GET" }, "Se consulta de nuevo incluso si ya había llegado la misma revisión. Una lectura posterior también recupera el retorno perdido."); receive("El consumidor conserva la revisión actual");
  } else if (settings.mechanism === "longpoll") {
    request("Se emite el siguiente long poll", { after: client.revision }, settings.disconnect ? "El cliente aún tiene revisión0 y obtiene inmediatamente el snapshot de revisión1." : "Con revisión1, esta nueva solicitud espera otro cambio; no es la misma respuesta anterior.");
    if (settings.disconnect) receive("El nuevo long poll recupera el snapshot");
  } else if (settings.disconnect) {
    channels++;
    request("El cliente reconecta el canal", { channel: settings.mechanism, after: client.revision }, "Abrir otro canal no reproduce por sí mismo mensajes anteriores.");
    if (settings.resume) {
      add("providerModel", "El proveedor consulta historial después del cursor", { after: 0 }, provider, "Este servidor conceptual conserva historial y respeta el cursor de aplicación. Esa política no viene garantizada por el transporte.", "provider"); receive("Se recupera chat.created desde el historial");
    } else add("useResult", "La vista queda retrasada sin recuperación", provider, client, "El canal está conectado otra vez, pero la novedad perdida no llegó. Sin recuperación no prometemos convergencia.", "browser");
  }
  const id = `communication:${settings.mechanism}`;
  return { settings, message: text, provider, client, requests, channels, capture: { id, mode: "simulation", events: indexEvents(id, entries) } };
}
