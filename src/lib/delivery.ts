import { deliveryProfiles, paymentEvents } from "@/content/events";
import { interaction } from "./interaction";
import { modelStep } from "./communication";
import type { Actor, Capture, Stage, TraceEvent } from "./trace";

export type DeliveryMechanism = keyof typeof deliveryProfiles;
export type PaymentEvent = typeof paymentEvents[number];
export interface DeliverySettings { mechanism: DeliveryMechanism; fault: "none" | "reject" | "lost-ack" | "exhaust"; duplicate: boolean; reversed: boolean; deduplicate: boolean; versionGuard: boolean; replayLog: boolean }
export const defaultDelivery: DeliverySettings = { mechanism: "webhook", fault: "none", duplicate: false, reversed: false, deduplicate: true, versionGuard: true, replayLog: false };
export interface Projection { name: string; status: "pending" | PaymentEvent["status"]; revision: number; applications: number; seenIds: string[]; offsetCommitted: number }
export interface DeliveryAttempt { consumer: string; worker: string; eventId: string; offset: number; attempt: number; result: "rejected" | "ack-lost" | "ack"; applied: boolean }
export interface DeliveryRun { settings: DeliverySettings; log: { offset: number; event: PaymentEvent }[]; projections: Projection[]; attempts: DeliveryAttempt[]; failed: string[]; capture: Capture }

export function applySnapshot(projection: Projection, payload: PaymentEvent, deduplicate: boolean, versionGuard: boolean): { projection: Projection; reason: "applied" | "duplicate" | "stale" } {
  const seenIds = projection.seenIds.includes(payload.id) ? [...projection.seenIds] : [...projection.seenIds, payload.id];
  if (deduplicate && projection.seenIds.includes(payload.id)) return { projection: { ...projection, seenIds }, reason: "duplicate" };
  if (versionGuard && payload.revision <= projection.revision) return { projection: { ...projection, seenIds }, reason: "stale" };
  return { projection: { ...projection, status: payload.status, revision: payload.revision, applications: projection.applications + 1, seenIds }, reason: "applied" };
}

export function deliveryRun(options: DeliverySettings): DeliveryRun {
  const settings = { ...options };
  const profile = deliveryProfiles[settings.mechanism];
  const base = settings.reversed ? [...paymentEvents].reverse() : [...paymentEvents];
  const log = base.flatMap(event => event.id === "pay-1" && settings.duplicate ? [event, event] : [event]).map((event, offset) => ({ offset, event: { ...event } }));
  const entries: TraceEvent[] = [];
  const attempts: DeliveryAttempt[] = [];
  const failed: string[] = [];
  const projections: Projection[] = [];
  const id = `delivery:${settings.mechanism}`;
  let count = 0;
  const add = (parent: TraceEvent | undefined, stage: Stage, action: string, input: unknown, output: unknown, cause: string, actor: Actor = "provider", lane?: "A" | "B", initiator = "Productor", receiver = "Mecanismo de entrega") => {
    const entry = modelStep(stage, action, input, output, cause, actor, profile.contract, profile.code, `${profile.mechanism} ${profile.limit} Dedupe y efecto son atómicos solo en este modelo de snapshots.`, interaction(initiator, receiver, profile.name, "Rechazo del receptor o confirmación perdida.", profile.limit));
    entry.id = `${id}:${count++}`; entry.logicalTime = parent ? parent.logicalTime + 1 : 0; entry.dependencies = parent ? [parent.id] : [];
    if (lane) entry.lane = lane;
    entries.push(entry); return entry;
  };
  let root = add(undefined, "invokeModel", "Payment confirmed produce hechos ficticios", null, paymentEvents, "El proveedor afirma hechos de un pago ficticio. No se cobra ni se contacta un sistema de pagos real.");
  for (const record of log) {
    root = add(root, "crossBoundary", `Se publica ${record.event.id} revisión ${record.event.revision}`, record, null, settings.mechanism === "webhook" ? "El emisor prepara un callback HTTP al receptor." : "El productor publica en el broker; aceptar no significa que un consumidor haya procesado.", "transport");
    if (settings.mechanism !== "webhook") root = add(root, "persist", `El broker conserva registro ${record.offset}`, record, { accepted: true, offset: record.offset }, "La retención es una política elegida del modelo. Leer este log no lo borra.", "store", undefined, "Broker", "Log retenido del broker");
  }
  const firstEventId = log[0].event.id;
  let lastHTTP: { request: NonNullable<Capture["request"]>; response?: NonNullable<Capture["response"]> } | undefined;
  for (const [consumerIndex, name] of (settings.mechanism === "pubsub" ? ["Pedidos", "Analítica"] : ["Pedidos"]).entries()) {
    const lane = settings.mechanism === "pubsub" ? (consumerIndex === 0 ? "A" : "B") : undefined;
    let parent = root;
    let projection: Projection = { name, status: "pending", revision: 0, applications: 0, seenIds: [], offsetCommitted: 0 };
    let transientFaultUsed = false;
    const push = (stage: Stage, action: string, input: unknown, output: unknown, cause: string, actor: Actor = "provider", returning = false) => { parent = add(parent, stage, action, input, output, cause, actor, lane, returning || actor !== "transport" ? name : settings.mechanism === "webhook" ? "Emisor del webhook" : "Broker", returning ? settings.mechanism === "webhook" ? "Emisor del webhook" : "Broker" : actor === "transport" ? name : "Proyección y lógica del consumidor"); return parent; };
    const passes = settings.mechanism === "stream" && settings.replayLog ? 2 : 1;
    for (let pass = 0; pass < passes; pass++) {
      if (pass) push("invokeModel", "Se vuelve a leer el log desde offset 0", { readCursor: 0 }, projection, "Se conserva la proyección y el mayor offset confirmado. Releer no publica otros registros ni inventa nuevos event.id.");
      for (const record of log) {
        let acknowledged = false;
        for (let attempt = 1; attempt <= 3; attempt++) {
          if (attempt > 1) push("invokeModel", `Backoff lógico ${2 ** (attempt - 2)} antes de reintentar`, { eventId: record.event.id, attempt }, { waitUnits: 2 ** (attempt - 2) }, "La espera es lógica, sin latencia medida. La identidad de negocio y el offset se conservan.");
          const worker = settings.mechanism === "queue" ? `Worker ${((record.offset + attempt - 1) % 2) ? "B" : "A"}` : name;
          push("crossBoundary", `${worker} recibe ${record.event.id}, intento ${attempt}`, { ...record, attempt }, null, settings.mechanism === "queue" ? "Solo un trabajador recibe este intento de la cola del grupo. A/B comparten proyección e ids procesados." : "Recibir un mensaje todavía no confirma que su efecto se haya aplicado.", "transport");
          if (settings.mechanism === "webhook") lastHTTP = { request: { method: "POST", url: "https://receiver.example/webhook", headers: { "Content-Type": "application/json" }, body: record.event } };
          const target = name === "Pedidos" && record.event.id === firstEventId;
          const rejects = target && (settings.fault === "exhaust" || settings.fault === "reject" && !transientFaultUsed);
          if (rejects) {
            transientFaultUsed = true;
            const rejection = push("providerModel", `${name} rechaza antes de procesar`, record, projection, "El efecto no se ejecutó. El emisor conserva trabajo pendiente para otro intento.");
            rejection.state = "error"; rejection.error = { code: "RECEIVER_REJECTED", message: settings.mechanism === "webhook" ? "HTTP 500 del receptor conceptual, antes del efecto." : "Trabajo no aplicado; confirmación pendiente." };
            attempts.push({ consumer: name, worker, eventId: record.event.id, offset: record.offset, attempt, result: "rejected", applied: false });
            if (lastHTTP) lastHTTP.response = { status: 500, body: { error: "receiver rejected before processing" } };
            continue;
          }
          const applied = applySnapshot(projection, record.event, settings.deduplicate, settings.versionGuard);
          projection = applied.projection;
          push("providerModel", applied.reason === "applied" ? `${name} aplica revisión ${record.event.revision}` : applied.reason === "duplicate" ? `${name} reconoce event.id duplicado` : `${name} omite snapshot antiguo o igual`, record.event, projection, applied.reason === "applied" ? "La proyección y el registro del id cambian en un único paso del modelo. No es una transacción de producción." : "Se evita repetir o retroceder el efecto, pero esta entrega todavía debe confirmarse al emisor.");
          const loseAck = target && settings.fault === "lost-ack" && !transientFaultUsed;
          if (loseAck) {
            transientFaultUsed = true;
            const loss = push("crossBoundary", `${name} pierde la confirmación después del efecto`, projection, { senderKnows: false }, settings.mechanism === "stream" ? "El commit no alcanza al broker, aunque el procesador terminó. Releerá el mismo offset." : "El ACK o respuesta no llega al emisor. El estado del receptor no se revierte.", "transport", true);
            loss.state = "error"; loss.error = { code: "ACK_LOST", message: "Efecto completado, entrega aún sin confirmar para el emisor." };
            attempts.push({ consumer: name, worker, eventId: record.event.id, offset: record.offset, attempt, result: "ack-lost", applied: applied.reason === "applied" });
            continue;
          }
          if (settings.mechanism === "stream") projection = { ...projection, offsetCommitted: Math.max(projection.offsetCommitted, record.offset + 1) };
          push("crossBoundary", settings.mechanism === "stream" ? `${name} confirma siguiente offset ${projection.offsetCommitted}` : settings.mechanism === "webhook" ? "El receptor devuelve HTTP 204 después del efecto" : `${name} envía ACK de procesamiento`, { eventId: record.event.id, attempt }, projection, "Confirmación explícita después de aplicar o reconocer un evento ya aplicado. Aceptación del broker y procesamiento siguen siendo hitos distintos.", "transport", true);
          attempts.push({ consumer: name, worker, eventId: record.event.id, offset: record.offset, attempt, result: "ack", applied: applied.reason === "applied" });
          if (lastHTTP) lastHTTP.response = { status: 204, body: null };
          acknowledged = true; break;
        }
        if (!acknowledged) {
          failed.push(`${name}:${record.offset}:${record.event.id}`);
          const failure = push("failure", `${name} agota tres intentos`, record, projection, settings.mechanism === "stream" ? "El cursor se detiene en este registro sin confirmar. No se salta al siguiente offset." : "La entrega queda fallida tras el límite del modelo; no prometemos convergencia automática.");
          failure.state = "error"; failure.error = { code: "DELIVERY_EXHAUSTED", message: "Política de retry agotada. Recuperar exige una acción posterior." };
          if (settings.mechanism === "stream") break;
        }
      }
    }
    push("useResult", `${name} conserva su proyección final`, null, projection, "Este snapshot final es independiente de la posición del reproductor. El tiempo lógico de la rama no es duración medida.");
    projections.push(structuredClone(projection));
  }
  entries.sort((a, b) => a.logicalTime - b.logicalTime);
  // Las ramas comparten publicación, sin imponer dependencia de un suscriptor al otro.
  const capture: Capture = { id, mode: "simulation", events: entries, ...(lastHTTP ? { request: lastHTTP.request, ...(lastHTTP.response ? { response: lastHTTP.response } : {}) } : {}) };
  return { settings, log, projections, attempts, failed, capture };
}
