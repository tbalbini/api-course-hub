"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { Order } from "@/lib/orders";
import { PRODUCT } from "@/lib/product";
import { creationUncertain } from "@/lib/http-editor";
import { event, indexEvents, playback, type Capture, type Depth, type TraceEvent } from "@/lib/trace";
import { TracePlayer } from "./trace-player";
import { isOrder, projectReceipt, type OrderOutcome, type OrderReceipt as Receipt } from "@/lib/order-receipt";
import { projectSourceFor } from "@/content/project";

export function OrderConsole({ active = true, project = false, onSource, onOutcome }: { active?: boolean; project?: boolean; onSource?: (id: string) => void; onOutcome?: (outcome: OrderOutcome) => void }) {
  const [quantity, setQuantity] = useState(1), [targetId, setTargetId] = useState("");
  const [patchPending, setPatchPending] = useState(false);
  const [original, setOriginal] = useState<{ key: string; input: { sku: string; quantity: number } } | null>(null);
  const patchAttempt = useRef<string | null>(null);
  const [role, setRole] = useState("buyer");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("Crea un pedido real para consultar y confirmar su estado. Ninguna petición se envía al abrir esta página.");
  const [depth, setDepth] = useState<Depth>("engineering");
  const locked = useRef(false);
  const attempt = useRef<{ key: string; input: { sku: string; quantity: number }; explicit: boolean } | null>(null);
  const [state, dispatch] = useReducer(playback, { capture: { id: "empty", mode: "local", events: [event("local")] }, cursor: 0, running: false, speed: 1 });
  const hasCapture = state.capture.id !== "empty";
  useEffect(() => { if (!active) dispatch({ type: "pause" }); }, [active]);

  async function send(method: "POST" | "GET" | "PATCH", repeatOriginal = false) {
    if (locked.current || (method !== "POST" && !(project ? targetId : order)) || repeatOriginal && !original) return;
    locked.current = true; setBusy(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    if (method === "POST") {
      if (repeatOriginal) attempt.current = { key: original!.key, input: { sku: PRODUCT.sku, quantity }, explicit: true };
      attempt.current ??= { key: crypto.randomUUID(), input: { sku: PRODUCT.sku, quantity: project ? quantity : 1 }, explicit: false };
    }
    const id = project ? patchAttempt.current ?? targetId : order?.id;
    const headers: Record<string, string> = { ...(role === "none" ? {} : { Authorization: `Bearer demo-${role}` }), ...(method === "GET" ? {} : { "Content-Type": "application/json" }), ...(method === "POST" ? { "Idempotency-Key": attempt.current!.key } : {}) };
    const request: NonNullable<Capture["request"]> = { method, url: method === "POST" ? "/api/orders" : `/api/orders/${encodeURIComponent(id!)}`, headers, ...(method === "GET" ? {} : { body: method === "POST" ? attempt.current!.input : { status: "confirmed" } }) };
    const started = performance.now();
    const entries: TraceEvent[] = [];
    if (project) {
      const click = event("click"); click.code = `<button onClick={() => send("${method}")}>...</button>`;
      const handler = event("handler", { method, id, body: request.body }, request); handler.contract = `${method} · datos del handler`; handler.code = "// Construir request con los controles o el attempt conservado.";
      handler.explanation = { intuition: `El cliente prepara la operación ${method} seleccionada.`, engineering: method === "GET" ? "GET utiliza el id en la ruta, sin enviar un cuerpo ni crear otro pedido." : method === "PATCH" ? "PATCH utiliza el id y el cuerpo status:confirmed para fijar el estado del pedido." : "POST prepara sku y quantity, conservando clave y datos si el resultado anterior es incierto.", internals: "Estos datos pertenecen al handler del navegador. La petición siguiente cruza al proceso servidor; preparar sus datos no ejecuta todavía esa petición." };
      entries.push(click, handler);
    }
    const initiated = event("request", request);
    initiated.contract = `${method} ${request.url}`; initiated.code = `fetch(${JSON.stringify(request.url)}, ${JSON.stringify({ method, headers, ...(request.body ? { body: JSON.stringify(request.body) } : {}) }, null, 2)})`;
    initiated.explanation = { intuition: "El navegador inicia esta petición HTTP real.", engineering: "Los datos proceden de los controles y del pedido real del servidor. Puedes inspeccionar la petición en Network.", internals: "El cliente observa fetch, no el socket. No inferimos DNS, TLS, protocolo negociado ni intermediarios." };
    entries.push(initiated);
    let observed: Capture["response"];
    try {
      const response = await fetch(request.url, { method, headers, ...(request.body ? { body: JSON.stringify(request.body) } : {}), signal: controller.signal });
      const responseHeaders = Object.fromEntries(response.headers.entries());
      observed = { status: response.status, headers: responseHeaders, body: null, rawBody: null };
      observed.rawBody = await response.text();
      const parsedBody: unknown = JSON.parse(observed.rawBody);
      observed.body = parsedBody;
      const body = project ? projectReceipt(parsedBody, response.status, response.headers.get("x-trace-id"), request) : parsedBody as Receipt;
      if (!body || typeof body.traceId !== "string") throw new Error("Respuesta sin traceId válido.");
      if (body.events) entries.push(...body.events);
      const parsed = event("parse", null, body);
      if (!response.ok) {
        parsed.action = "El cliente interpreta el rechazo HTTP";
        parsed.state = "error";
        parsed.error = body.error ?? { code: `HTTP_${response.status}`, message: "La solicitud fue rechazada por el servidor." };
      }
      entries.push(event("receive", null, { status: response.status, headers: responseHeaders }), parsed);
      if (response.ok && isOrder(body.order)) {
        setOrder(body.order); if (method === "POST" && project) setTargetId(body.order.id);
        const update = event("render", body.order, body.order);
        update.code = "setOrder(body.order);";
        entries.push(update);
      }
      const capture: Capture = { id: body.traceId, mode: "real", events: indexEvents(body.traceId, entries), request, response: observed, measuredMs: performance.now() - started };
      dispatch({ type: "load", capture, autoplay: false });
      onOutcome?.({ method, status: response.status, role, quantity: method === "POST" ? attempt.current?.input.quantity : undefined, repeated: body.repeated, errorCode: body.error?.code });
      const uncertain = method === "POST" && creationUncertain(response.status, body, true, pending);
      if (method === "POST") {
        setPending(uncertain);
        if (!uncertain) {
          if (response.ok && isOrder(body.order) && !attempt.current!.explicit) setOriginal({ key: attempt.current!.key, input: { ...attempt.current!.input } });
          attempt.current = null;
        }
      }
      if (project && method === "PATCH" && response.status >= 500) { patchAttempt.current = id!; setPatchPending(true); }
      else if (project && (method === "GET" || method === "PATCH") && response.ok) { patchAttempt.current = null; setPatchPending(false); }
      setNotice(response.ok && !uncertain ? `HTTP ${response.status} · ${body.order?.id} · ${body.order?.status}. ${body.repeated ? "Creación recuperada con la misma clave. " : ""}Reproducir no envía otra petición.` : `HTTP ${response.status} · ${body.error?.code ?? "Respuesta inesperada"}: ${body.error?.message ?? "Falta un pedido válido."}${uncertain ? " La creación sigue sin resolverse. Reintenta con la misma clave y datos." : response.status >= 500 ? " Resultado incierto: consulta el estado antes de inferir el efecto." : ""}`);
    } catch (cause) {
      if (method === "POST") setPending(true);
      if (project && method === "PATCH") { patchAttempt.current = id!; setPatchPending(true); }
      if (observed) {
        entries.push(event("receive", null, { status: observed.status, headers: observed.headers }));
        if (observed.rawBody === null) observed.readError = cause instanceof Error ? cause.message : "No se pudo leer el body.";
      }
      const failure = event("failure"); failure.state = "error";
      failure.error = { code: observed ? observed.rawBody === null ? "BODY_READ_FAILURE" : "INVALID_ORDER_RESPONSE" : controller.signal.aborted ? "TIMEOUT" : "NETWORK_OR_PARSE_FAILURE", message: observed ? "Se conservan status y headers recibidos, aunque el body no se pudo leer o interpretar. Esto no revierte cambios remotos." : "No se obtuvo una respuesta interpretable. La falta de respuesta no revierte cambios remotos." };
      entries.push(failure);
      dispatch({ type: "load", capture: { id: crypto.randomUUID(), mode: "real", request, ...(observed ? { response: observed } : {}), events: indexEvents("uncertain", entries), measuredMs: performance.now() - started }, autoplay: false });
      setNotice(`${observed ? `HTTP ${observed.status} recibido. ` : ""}Resultado incierto. ${method === "POST" ? "Reintenta la creación con la misma clave y datos." : "Consulta el estado antes de inferir el efecto."} ${cause instanceof Error ? cause.message : "Fallo de comunicación."}`);
    } finally { window.clearTimeout(timeout); locked.current = false; setBusy(false); }
  }

  return <section className="real-order-console" aria-labelledby="real-console-heading">
    <div className="panel comparison-console-controls"><div className="taxonomy-selection-heading"><div><span className="overline">CONTRASTA EL MODELO CON UNA EJECUCIÓN</span><h2 id="real-console-heading">Un pedido HTTP real</h2></div><span className="pill">HTTP local real · Map temporal</span></div>
      <p>Esta consola usa otro pedido, creado por tu acción. Los modelos de otros laboratorios permanecen aislados. Confirmar fija un estado demostrativo, sin cobrar ni reservar inventario.</p>
      <div className="comparison-console-toolbar"><div><label htmlFor="real-order-role">Credencial real de demostración</label><select id="real-order-role" value={role} disabled={busy || pending || patchPending} onChange={e => setRole(e.target.value)}><option value="buyer">Comprador · consultar y confirmar</option><option value="reader">Lector · solo consultar</option><option value="none">Sin credencial</option></select></div><button disabled={busy || patchPending} className="primary-button" onClick={() => void send("POST")}>{busy ? "Esperando…" : pending ? "Reintentar creación" : "Crear pedido real"}</button><button disabled={busy || !(project ? targetId : order) || pending} className="secondary-button" onClick={() => void send("GET")}>Consultar real</button><button disabled={busy || !(project ? targetId : order) || pending} className="secondary-button" onClick={() => void send("PATCH")}>Confirmar real</button></div>
      {project && <div className="project-request-controls event-control-grid"><div><label htmlFor="project-quantity">Cantidad del pedido (contrato servidor: 1 a 5)</label><input id="project-quantity" type="number" min={0} max={9} step={1} value={quantity} disabled={busy || pending || patchPending} onChange={e => setQuantity(Number(e.target.value))} /><p className="muted">Fuera del contrato puedes enviar para observar400 real. El servidor calcula el precio.</p></div><div><label htmlFor="project-order-id">Id para consultar o confirmar</label><input id="project-order-id" maxLength={80} value={targetId} disabled={busy || pending || patchPending} onChange={e => setTargetId(e.target.value)} /><p className="muted">POST llena este campo. Otro id permite comprobar404 sin crear nada.</p></div><button className="secondary-button" disabled={busy || pending || patchPending || !original} onClick={() => void send("POST", true)}>Repetir POST original</button><p className="muted">Reutiliza su clave y la cantidad actual. Misma cantidad recupera el snapshot; otra cantidad produce409. No es replay.</p></div>}
      <p className="operation-notice" role="status">{notice}</p>
      {project && patchPending && <p className="operation-notice" role="status">Confirmación incierta: se conserva el id. Consulta su estado o repite la confirmación idempotente. El timeout no revierte el servidor.</p>}
      {order && <dl className="comparison-order" aria-label="Último pedido real conocido"><div><dt>Id real</dt><dd>{order.id}</dd></div><div><dt>Estado conocido</dt><dd>{order.status}</dd></div><div><dt>Almacenamiento</dt><dd>Memoria de este proceso</dd></div></dl>}
      <p className="muted">Credenciales públicas, sin privacidad por usuario. Máximo 200 pedidos entre todas las experiencias; reiniciar el servidor los borra. Reintentar POST recupera su snapshot de creación; GET muestra el estado actual. POST/GET/PATCH devuelven instrumentación observada del servidor, además de la captura del cliente. Un POST repetido puede devolver created aunque un GET actual devuelva confirmed.</p>
      
    </div>
    {project && hasCapture && <div className="project-source-link"><span>Evento: {state.capture.events[state.cursor].action}</span><button className="secondary-button" onClick={() => onSource?.(projectSourceFor(state.capture.request?.method ?? "GET", state.capture.events[state.cursor].stage))}>Abrir archivo de este paso</button><p>El inspector muestra un fragmento representativo. El explorador abre el archivo exacto incorporado a esta compilación.</p></div>}
    {hasCapture && <TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} codeNote="Captura HTTP real. Las tres operaciones incluyen instrumentación del servidor. Se observa la solicitud de actualización de estado, no el paint del navegador. Replay conserva el efecto ya ejecutado." />}
  </section>;
}
