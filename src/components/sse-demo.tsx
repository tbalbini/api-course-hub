"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { interaction } from "@/lib/interaction";
import { parseSampleUpdate, type SampleUpdate } from "@/lib/sse";
import { event, indexEvents, playback, type Capture, type Depth, type TraceEvent } from "@/lib/trace";
import { TracePlayer } from "./trace-player";

interface Session { source: EventSource; id: string; events: TraceEvent[] }
export function SSEDemo({ active }: { active: boolean }) {
  const [status, setStatus] = useState("Sin conexión. Abrir stream es una acción explícita.");
  const [connected, setConnected] = useState(false);
  const [updates, setUpdates] = useState<SampleUpdate[]>([]);
  const [depth, setDepth] = useState<Depth>("engineering");
  const sessionRef = useRef<Session | null>(null);
  const [state, dispatch] = useReducer(playback, { capture: { id: "empty-sse", mode: "local", events: [event("local")] }, cursor: 0, running: false, speed: 1 });
  const publish = useCallback((session: Session) => {
    const capture: Capture = { id: session.id, mode: "real", request: { method: "GET", url: "/api/lab/events", headers: {} }, events: indexEvents(session.id, session.events) };
    dispatch({ type: "load", capture, autoplay: false });
  }, []);
  const stop = useCallback((reason: string) => {
    const session = sessionRef.current;
    if (!session) return;
    sessionRef.current = null; session.source.close();
    const entry = event("useResult", null, { reason }); entry.action = "El cliente cierra EventSource"; entry.interaction = interaction("Código cliente", "EventSource", "EventSource.close · cierre local"); entry.contract = "EventSource.close()"; entry.code = "source.close();";
    entry.explanation = { intuition: "La conexión de esta demostración termina por una acción explícita.", engineering: reason, internals: "close impide la reconexión automática de este EventSource. Las capturas y datos ya recibidos se conservan; replay no crea otro objeto EventSource." };
    session.events.push(entry); publish(session); setConnected(false); setStatus(reason);
  }, [publish]);
  useEffect(() => { if (!active) { dispatch({ type: "pause" }); stop("Conexión cerrada al cambiar de pestaña."); } }, [active, stop]);
  useEffect(() => () => { sessionRef.current?.source.close(); sessionRef.current = null; }, []);

  function open() {
    if (sessionRef.current) return;
    const source = new EventSource("/api/lab/events");
    const initial = event("request", { url: "/api/lab/events", api: "EventSource" });
    initial.interaction = interaction("Navegador", "Endpoint SSE local", "EventSource · HTTP real", "El canal puede fallar sin exponer el status HTTP al callback.");
    initial.action = "El navegador crea un EventSource real"; initial.contract = "GET /api/lab/events · EventSource"; initial.code = 'const source = new EventSource("/api/lab/events");';
    initial.explanation = { intuition: "El navegador abre una solicitud para recibir eventos del servidor local.", engineering: "El transporte HTTP es real y aparece en Network. Los datos son fixtures de demostración; no se consultan pedidos ni pagos.", internals: "EventSource no expone status ni headers de Response a este código. Solo registramos constructor, open, eventos, error y cierre observados." };
    const session: Session = { source, id: crypto.randomUUID(), events: [initial] };
    sessionRef.current = session; setConnected(true); setUpdates([]); setStatus("Abriendo stream HTTP real…"); publish(session);
    source.onopen = () => {
      if (sessionRef.current !== session) return;
      const entry = event("receive", null, { event: "open" }); entry.interaction = interaction("EventSource", "Callback open del cliente", "Evento open de EventSource", "La apertura no garantiza recibir todas las actualizaciones."); entry.action = "EventSource notifica apertura"; entry.contract = "Evento open de EventSource"; entry.code = "source.onopen = () => { /* conexión abierta */ };";
      entry.explanation = { intuition: "El navegador ha abierto el stream y puede despachar sus eventos.", engineering: "Todavía no se ha recibido una actualización de negocio. open y update son señales distintas.", internals: "No deducimos latencia, DNS, versión HTTP o headers a partir de open. El cliente cierra esta demo al completar o fallar." };
      session.events.push(entry); setStatus("Conectado: esperando eventos de muestra."); publish(session);
    };
    source.addEventListener("update", (message: MessageEvent<string>) => {
      if (sessionRef.current !== session) return;
      try {
        const data = parseSampleUpdate(message.data);
        const entry = event("parse", { lastEventId: message.lastEventId, data: message.data }, data);
        entry.interaction = interaction("Servidor SSE local", "Listener update del cliente", "Entrega SSE real y validación del payload de muestra", "Desconexión o payload que incumple el contrato de muestra.");
        entry.action = `Se recibe update ${data.sequence}`; entry.boundary = "Red HTTP"; entry.contract = "update {sequence,message,simulatedData:true}"; entry.code = 'source.addEventListener("update", event => parseSampleUpdate(event.data));';
        entry.explanation = { intuition: data.message, engineering: `MessageEvent trae id ${message.lastEventId}. El payload se valida antes de mostrarlo; simulatedData identifica fixtures, aunque HTTP sí es real.`, internals: "id y data pertenecen al formato SSE. No son paquetes observados ni prueban persistencia, deduplicación o recuperación del servidor." };
        session.events.push(entry); setUpdates(previous => [...previous, data]); setStatus(`Recibido update ${data.sequence}/3, sin nueva solicitud por evento.`); publish(session);
      } catch {
        const failure = event("failure", { raw: message.data }); failure.interaction = interaction("Listener update", "Validador de datos de muestra", "Validación local de SSE", "Payload inválido."); failure.state = "error"; failure.error = { code: "INVALID_SSE_DATA", message: "El payload no cumple el contrato de muestra." }; session.events.push(failure); stop("Datos inválidos: stream cerrado.");
      }
    });
    source.addEventListener("complete", () => { if (sessionRef.current === session) stop("Completado: 3 eventos de muestra. Conexión cerrada sin reconexión automática."); });
    source.onerror = () => {
      if (sessionRef.current !== session) return;
      const failure = event("failure", null, { readyState: source.readyState }); failure.interaction = interaction("EventSource", "Callback error del cliente", "Error de EventSource", "Fallo de canal sin status HTTP expuesto por esta API."); failure.state = "error"; failure.error = { code: "EVENT_SOURCE_ERROR", message: "EventSource notificó error. Su API no entrega aquí el status HTTP exacto." }; session.events.push(failure); stop("Error del stream: conexión cerrada. Puedes abrir otro intento explícitamente.");
    };
  }

  return <><div className="learning-note"><span className="note-symbol">?</span><p>¿Necesita cada actualización otra petición del navegador?<br /><strong>Observa tres eventos en una sola respuesta HTTP real.</strong></p></div><section className="panel sse-demo-panel" aria-labelledby="sse-demo-heading"><div className="lab-panel-heading"><div><span className="overline">TRANSPORTE REAL / DATOS DE MUESTRA</span><h2 id="sse-demo-heading">Abre un stream local</h2></div><span className="pill">EventSource real · sin pagos</span></div><p>El servidor emite tres updates a intervalos de 350ms configurados, después complete y cierre. No medimos latencia. Los mensajes no representan pedidos reales.</p><div className="http-send-row"><button className="primary-button" disabled={connected} onClick={open}>Abrir SSE real</button><button className="secondary-button" disabled={!connected} onClick={() => stop("Conexión cerrada por el usuario.")}>Cerrar SSE</button></div><p className="operation-notice" role="status">{status}</p><ol className="sse-feed" aria-label="Actualizaciones observadas">{updates.map((update, index) => <li key={`${update.sequence}:${index}`}><span>sample-{update.sequence}</span><strong>{update.message}</strong><small>Dato simulado recibido por transporte real</small></li>)}</ol><p>EventSource suele reconectar ante interrupciones. Esta demostración lo cierra al completar, fallar, cambiar pestaña o salir de la página. No implementa historial durable ni resume. No fabricamos un Response que su API no expone.</p></section>{state.capture.id !== "empty-sse" && <TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} codeNote="Eventos observados por EventSource. El código no captura headers ni status de Response, DNS o versión HTTP. Los datos son fixtures y replay no abre un nuevo stream." />}</>;
}
