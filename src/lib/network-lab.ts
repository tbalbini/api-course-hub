import { interaction } from "./interaction";
import { event, indexEvents, type Capture, type TraceEvent, type Stage } from "./trace";
import { networkProfiles } from "@/content/http";

export interface NetworkLabSettings {
  protocol: keyof typeof networkProfiles; literalIP: boolean; dnsCached: boolean; reuse: boolean;
  drop: boolean; lostResponse: boolean; retry: boolean; oneWayMs: number; processingMs: number;
}
export const defaultNetworkLab: NetworkLabSettings = { protocol: "h1", literalIP: false, dnsCached: false, reuse: false, drop: false, lostResponse: false, retry: false, oneWayMs: 60, processingMs: 20 };
export interface NetworkLabRun { capture: Capture; settings: NetworkLabSettings; delivered: number[]; attempts: number; recovered: boolean; known: boolean; exchangeMs: number }

export function networkLabCapture(options: NetworkLabSettings): NetworkLabRun {
  const settings = { ...options };
  const udp = settings.protocol === "udp";
  const quic = settings.protocol === "h3";
  const entries: TraceEvent[] = [];
  const target = { host: settings.literalIP ? "203.0.113.10" : "tienda.example", ip: "203.0.113.10", port: udp ? 9000 : 443, routers: ["198.51.100.1", "198.51.100.2"] };
  const request = { method: "GET", url: `https://${target.host}/api/lab/http?message=Hola`, headers: { Accept: "application/json" } };
  const add = (stage: Stage, action: string, input: unknown, output: unknown, explanation: string, actor: TraceEvent["actor"] = "transport", returning = false) => {
    const entry = event(stage, input, output, "conceptual");
    entry.interaction = interaction(returning ? "Proveedor de red" : actor === "provider" ? "Proveedor de red" : "Cliente de red", returning ? "Cliente de red" : stage === "dns" ? "Resolver DNS" : actor === "browser" ? "Aplicación cliente" : "Proveedor de red", stage === "dns" ? "DNS" : stage === "tcp" ? "TCP" : stage === "tls" ? "TLS" : udp ? "UDP directo" : networkProfiles[settings.protocol], udp ? "UDP directo puede perder u ordenar de otra forma los datagramas, sin recuperación añadida." : "Pérdida de contenido o de respuesta; transporte fiable no garantiza éxito de aplicación.");
    entry.action = action; entry.actor = actor;
    entry.contract = udp ? "UDP: datagramas, sin garantías añadidas" : `${networkProfiles[settings.protocol]} · GET de diagnóstico`;
    entry.boundary = actor === "provider" || actor === "browser" ? "Mismo proceso" : "Red remota";
    entry.code = `// Modelo conceptual, no captura de paquetes\n${JSON.stringify({ input, output }, null, 2)}`;
    entry.explanation = { intuition: explanation, engineering: `${explanation} Destino ${target.ip}:${target.port}.`, internals: `${explanation} Los bloques numerados son contenido ilustrativo, no tamaños ni paquetes reales. El tiempo lógico solo ordena eventos; no mide red.` };
    entries.push(entry); return entry;
  };
  add("invokeModel", "La aplicación prepara datos", null, udp ? { units: [1, 2, 3] } : request, udp ? "Se envían datos mediante datagramas independientes. No hay petición HTTP en este perfil." : "El contrato de aplicación solicita una representación mediante GET.", "browser");
  if (!settings.literalIP && !settings.dnsCached && !(settings.reuse && !udp)) add("dns", "DNS obtiene una dirección del nombre", { hostname: target.host }, { ip: target.ip }, "Resolver el nombre precede al envío. Esta es una consulta conceptual, no una medición.", "resolver");
  else add("invokeModel", "Se omite la consulta DNS", { literalIP: settings.literalIP, dnsCached: settings.dnsCached, reuse: settings.reuse }, null, settings.literalIP ? "La dirección ya es una IP literal." : "El modelo ya conoce un destino por caché o conexión existente.", "browser");
  if (!udp && !settings.reuse) {
    if (quic) add("crossBoundary", "QUIC prepara transporte y seguridad", target, { udp: true, tls: "integrado", streams: true }, "QUIC usa UDP e integra TLS. No establece primero una conexión TCP.");
    else {
      add("tcp", "TCP establece un flujo de bytes", target, { connected: true }, "Se prepara una conexión TCP fiable y ordenada; omitimos mensajes internos y congestión.");
      add("tls", "TLS protege la conexión TCP", target, { encrypted: true }, "Este perfil HTTPS verifica un servidor y prepara cifrado, sin mostrar claves ni handshake real.");
    }
  } else add("invokeModel", udp ? "UDP no requiere un handshake de conexión" : "Se reutiliza una conexión preparada", target, null, udp ? "Un socket UDP puede tener un destino asociado, pero eso no introduce handshake TCP ni TLS por sí solo." : "La preparación ya ocurrió. No la repetimos para esta solicitud.", "browser");
  let delivered: number[] = [];
  let recovered = false;
  let known = false;
  const attempts = !udp && settings.lostResponse && settings.retry ? 2 : 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt === 2) add("invokeModel", "La aplicación reintenta GET una sola vez", request, { attempt }, "Esta es otra invocación de aplicación sobre la conexión existente, no una retransmisión de transporte. No hacemos reintentos ilimitados.", "browser");
    if (!udp) add("invokeModel", "Se codifica el mensaje HTTP", request, { encoding: settings.protocol === "h1" ? "línea y headers sobre flujo" : "frames de un stream" }, "La semántica del GET se conserva. Cambia la codificación y el transporte, no el objetivo de negocio.", "browser");
    delivered = [];
    for (const unit of [1, 2, 3]) {
      add("crossBoundary", `La unidad ${unit} recorre dos routers`, { unit, route: ["cliente", ...target.routers, target.ip], attempt }, null, "Los routers eligen un siguiente salto a partir de IP. No ejecutan el contrato del handler.");
      if (settings.drop && unit === 2) {
        const loss = add("crossBoundary", "Se pierde la unidad 2 en tránsito", { unit }, { delivered: false }, "Una unidad puede perderse en el camino. La aplicación aún no dispone de todo el contenido.");
        loss.state = "error"; loss.error = { code: "UNIT_LOST", message: "Pérdida conceptual de contenido, no captura de un paquete real." };
      } else delivered.push(unit);
    }
    if (settings.drop && !udp) {
      add("crossBoundary", quic ? "QUIC recupera el contenido perdido" : "TCP recupera el contenido perdido", { missing: 2 }, { recoveredContent: 2 }, quic ? "QUIC vuelve a transportar la información necesaria en nuevos paquetes. No se reenvía un paquete cifrado idéntico." : "TCP retransmite contenido no confirmado y entrega el flujo ordenado. El handler no recibe un request adicional.");
      delivered.push(2); recovered = true;
    }
    if (udp) {
      add("providerModel", "La aplicación recibe datagramas disponibles", { received: delivered }, { complete: delivered.length === 3 }, "UDP no promete recuperar el datagrama ausente ni ordenar este conjunto. El orden mostrado es solo el de este escenario.", "provider");
      known = delivered.length === 3;
    } else {
      delivered.sort((a, b) => a - b);
      add("providerModel", "El proveedor interpreta el mensaje reconstruido", { units: [...delivered], attempt }, { status: 200, message: "Hola", processingMs: settings.processingMs }, "La aplicación procesa el GET después de disponer de los datos del mensaje. El tiempo de procesamiento es un parámetro simulado.", "provider");
      if (settings.lostResponse && attempt === 1) {
        const timeout = add("crossBoundary", "El cliente agota la espera de respuesta", { providerCompleted: true }, { received: false }, "La respuesta se pierde o llega tarde según la condición del modelo. La falta de respuesta no prueba ausencia de ejecución en el proveedor.", "browser");
        timeout.state = "error"; timeout.error = { code: "TIMEOUT", message: "El presupuesto de espera terminó después del procesamiento en este escenario." };
      } else { add("crossBoundary", "El resultado vuelve al consumidor", { status: 200, message: "Hola" }, { received: true }, "La respuesta ha sido entregada en el modelo; ahora el consumidor puede interpretar sus datos.", "transport", true); known = true; }
    }
  }
  add("useResult", known ? "La aplicación dispone de datos" : udp ? "La entrega de datagramas quedó incompleta" : "El consumidor no conoce el resultado", null, { delivered: [...delivered], known }, udp ? "No se inventa una respuesta HTTP o un mecanismo de recuperación en UDP directo." : "Observar la respuesta y ejecutar en el proveedor son hechos distintos.", "browser");
  const id = `network-lab:${settings.protocol}`;
  return { settings, delivered, attempts, recovered, known, exchangeMs: 2 * settings.oneWayMs + settings.processingMs, capture: { id, mode: "simulation", events: indexEvents(id, entries), ...(!udp ? { request, ...(known ? { response: { status: 200, body: { message: "Hola" } } } : {}) } : {}) } };
}
