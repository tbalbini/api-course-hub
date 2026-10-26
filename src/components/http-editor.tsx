"use client";

import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { creationUncertain, defaultDraft, httpMethods, prepareRequest, replaceHeader, type HTTPMethod, type PreparedRequest, type RequestDraft } from "@/lib/http-editor";
import { interaction } from "@/lib/interaction";
import { event, indexEvents, playback, type Capture, type Depth } from "@/lib/trace";
import { TracePlayer } from "./trace-player";
import { useChapterProgress } from "./use-course-progress";
import { LabChapter } from "./lab-chapter";

const subscribeOrigin = () => () => {};
const currentOrigin = () => window.location.origin;
const serverOrigin = () => null;

export function HTTPEditor({ active }: { active: boolean }) {
  const [draft, setDraft] = useState<RequestDraft>(defaultDraft);
  const origin = useSyncExternalStore(subscribeOrigin, currentOrigin, serverOrigin);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PreparedRequest | null>(null);
  const [notice, setNotice] = useState("Edita el mensaje y envíalo. Los presets preparan datos, nunca envían por sí solos.");
  const [lastId, setLastId] = useState<string | null>(null);
  const [etag, setEtag] = useState<string | null>(null);
  const { goals, setGoals } = useChapterProgress(5);
  const [depth, setDepth] = useState<Depth>("engineering");
  const locked = useRef(false);
  const [state, dispatch] = useReducer(playback, { capture: { id: "empty-http", mode: "local", events: [event("local")] }, cursor: 0, running: false, speed: 1 });
  useEffect(() => { if (!active) dispatch({ type: "pause" }); }, [active]);
  let preview: PreparedRequest | undefined; let editError = ""; let parts: URL | undefined;
  if (origin) { try { preview = prepareRequest(draft, origin); parts = new URL(preview.url); } catch (cause) { editError = cause instanceof Error ? cause.message : "Mensaje inválido."; } }
  const disabled = busy || pending !== null;
  const capture = state.capture;
  const hasCapture = capture.id !== "empty-http";
  function preset(kind: "echo" | "post" | "create" | "read" | "confirm") {
    if (disabled) return;
    const auth = "Accept: application/json\nContent-Type: application/json\nAuthorization: Bearer demo-buyer";
    setDraft(kind === "create" ? { method: "POST", url: "/api/orders", params: "", headers: `${auth}\nIdempotency-Key: ${crypto.randomUUID()}`, body: '{"sku":"kit-api","quantity":1}' } : kind === "read" || kind === "confirm" ? { method: kind === "read" ? "GET" : "PATCH", url: `/api/orders/${lastId ?? "no-existe"}`, params: "", headers: auth, body: '{"status":"confirmed"}' } : { ...defaultDraft, method: kind === "post" ? "POST" : "GET" });
    setNotice("Preset preparado. Revisa el mensaje antes de enviarlo.");
  }

  async function send() {
    if (locked.current) return;
    let request: PreparedRequest;
    try { request = pending ?? prepareRequest(draft, window.location.origin); }
    catch (cause) { setNotice(`Error de edición, sin petición: ${cause instanceof Error ? cause.message : "datos inválidos"}`); return; }
    locked.current = true; setBusy(true);
    const id = crypto.randomUUID();
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10000);
    const initial = event("request", request);
    initial.contract = `${request.method} ${new URL(request.url).pathname}`;
    initial.code = `fetch(${JSON.stringify(request.url)}, ${JSON.stringify({ ...request, url: undefined, cache: "no-store", redirect: "error", credentials: "same-origin" }, null, 2)})`;
    initial.explanation = { intuition: "El navegador envía el mensaje que preparaste al servidor local.", engineering: "El body de texto se transmite tal como aparece en el editor, sin serializarlo otra vez. El navegador puede añadir headers que esta captura no instrumenta.", internals: "No elegimos HTTP/1.1, HTTP/2 ni HTTP/3 para fetch. Capturamos la intención de la llamada, no sus paquetes, DNS ni negociación TLS." };
    const entries = [initial];
    let observed: Capture["response"];
    let parsed: unknown = null;
    let bodyRead = false;
    let problem = "";
    const started = performance.now();
    try {
      const response = await fetch(request.url, { method: request.method, headers: request.headers, body: request.body, signal: controller.signal, cache: "no-store", redirect: "error", credentials: "same-origin" });
      const headers = Object.fromEntries(response.headers.entries());
      observed = { status: response.status, headers, body: null, rawBody: null };
      entries.push(event("receive", null, { status: response.status, headers }));
      const raw = await response.text(); bodyRead = true;
      parsed = raw; observed.rawBody = raw;
      const jsonType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() === "application/json";
      if (raw && jsonType) {
        try { parsed = JSON.parse(raw); }
        catch { problem = "El servidor declaró JSON, pero su body no pudo interpretarse. Conservamos el texto y la respuesta HTTP."; }
      }
      observed.body = parsed;
      const parse = event("parse", raw, parsed);
      parse.interaction = interaction("Handler del editor HTTP", raw && jsonType ? "Parser JSON local" : "Lector de texto local", raw && jsonType ? "JSON · interpretación local" : "Texto HTTP · lectura local", ...(raw && jsonType ? ["JSON inválido; conservar la representación original."] : []));
      parse.action = raw === "" ? "La respuesta no incluye body" : jsonType ? "Se interpreta el JSON recibido" : "Se conserva la representación de texto";
      parse.code = raw === "" ? "// Body vacío, no se llama JSON.parse" : jsonType ? "JSON.parse(raw)" : "const data = raw;";
      parse.contract = `HTTP ${response.status} · ${response.headers.get("content-type") ?? "sin Content-Type"}`;
      parse.explanation = { intuition: raw === "" ? "No hay contenido nuevo que interpretar. Un 304 no trae la representación." : "La respuesta se interpreta según su tipo declarado, conservando también el texto original.", engineering: "Un status y un body son partes separadas. Un 405 vacío, texto plano o JSON inválido no deben borrar la respuesta ya recibida.", internals: "La consola no mantiene una caché automática. If-None-Match se envía por tu acción; un 304 permite revalidar una representación que un cliente con caché podría conservar." };
      if (problem) { parse.state = "error"; parse.error = { code: "INVALID_RESPONSE_JSON", message: problem }; }
      entries.push(parse);
      if (parsed && typeof parsed === "object" && "order" in parsed && parsed.order && typeof parsed.order === "object" && "id" in parsed.order && typeof parsed.order.id === "string") setLastId(parsed.order.id);
      const diagnosticGet = request.method === "GET" && new URL(request.url).pathname === "/api/lab/http";
      setEtag(diagnosticGet ? headers.etag ?? null : null);
      if (diagnosticGet && !problem) setGoals(previous => ({ json: previous.json || response.status === 200 && !!jsonType, text: previous.text || response.status === 200 && headers["content-type"]?.startsWith("text/plain"), conditional: previous.conditional || response.status === 304 }));
    } catch (cause) {
      problem = controller.signal.aborted ? "La espera terminó a los 10 segundos." : cause instanceof Error ? cause.message : "No se pudo completar la comunicación.";
      const failure = event("failure"); failure.state = "error";
      failure.error = { code: observed ? "BODY_READ_FAILURE" : controller.signal.aborted ? "TIMEOUT" : "NETWORK_FAILURE", message: `${problem} ${observed ? "Status y headers recibidos se conservan; el body no se pudo leer." : "No se obtuvo Response. Esto no demuestra que el proveedor no ejecutara."}` };
      if (observed) observed.readError = problem;
      entries.push(failure);
    } finally { window.clearTimeout(timer); }
    const isCreation = request.method === "POST" && new URL(request.url).pathname === "/api/orders";
    const uncertain = isCreation && creationUncertain(observed?.status, parsed, bodyRead, pending !== null);
    setPending(uncertain ? request : null);
    const captureId = observed?.headers?.["x-trace-id"] || id;
    const captured: Capture = { id: captureId, mode: "real", events: indexEvents(captureId, entries), request, ...(observed ? { response: observed } : {}), measuredMs: performance.now() - started };
    dispatch({ type: "load", capture: captured, autoplay: false });
    setNotice(`${observed ? `HTTP ${observed.status}.` : "Sin respuesta HTTP."} ${problem || "Intercambio capturado."} ${uncertain ? "Creación incierta: se conserva exactamente URL, clave y payload para reintentar; el rechazo de un reintento no resuelve la ejecución anterior." : "Replay no envía otra petición."}`);
    locked.current = false; setBusy(false);
  }

  return <><div className="learning-note"><span className="note-symbol">?</span><p>¿Qué datos necesita otro proceso para entender tu intención?<br /><strong>Construye un mensaje y observa una respuesta real.</strong></p></div>
    <section className="panel http-editor-panel" aria-labelledby="http-editor-heading"><div className="lab-panel-heading"><div><span className="overline">LABORATORIO C / HTTP REAL</span><h2 id="http-editor-heading">Construye la petición</h2></div><span className="pill">Solo servidor local</span></div>
      <div className="http-presets" role="group" aria-label="Presets de petición">{([['echo', 'Cargar GET diagnóstico'], ['post', 'Cargar POST diagnóstico'], ['create', 'Cargar creación'], ['read', 'Cargar consulta'], ['confirm', 'Cargar confirmación']] as const).map(([id, label]) => <button key={id} className="secondary-button" disabled={disabled} onClick={() => preset(id)}>{label}</button>)}</div>
      <div className="http-request-line"><div><label htmlFor="http-method">Método HTTP</label><select id="http-method" value={draft.method} disabled={disabled} onChange={e => setDraft({ ...draft, method: e.target.value as HTTPMethod })}>{httpMethods.map(method => <option key={method}>{method}</option>)}</select></div><div><label htmlFor="http-url">URL local</label><input id="http-url" value={draft.url} disabled={disabled} onChange={e => setDraft({ ...draft, url: e.target.value })} spellCheck={false} /></div></div>
      <div className="http-editors"><div><label htmlFor="http-params">Params query · se añaden a los de la URL</label><textarea id="http-params" rows={2} value={draft.params} disabled={disabled} onChange={e => setDraft({ ...draft, params: e.target.value })} spellCheck={false} /><label htmlFor="http-headers">Headers configurados · Nombre: valor</label><textarea id="http-headers" rows={7} value={draft.headers} disabled={disabled} onChange={e => setDraft({ ...draft, headers: e.target.value })} spellCheck={false} /><small>El navegador puede añadir otros headers. Cookie, Host y headers fuera del contrato no se configuran aquí.</small></div><div><label htmlFor="http-body">Body · texto exacto, no código ejecutable</label><textarea id="http-body" rows={11} value={draft.body} disabled={disabled || draft.method === "GET"} onChange={e => setDraft({ ...draft, body: e.target.value })} spellCheck={false} /><small>{draft.method === "GET" ? "GET no enviará body en este editor." : "JSON mal formado puede enviarse para observar el rechazo real del servidor. El eco no crea ni modifica recursos."}</small></div></div>
      <div className="http-send-row"><button className="primary-button" disabled={busy || !origin} onClick={() => void send()}>{busy ? "Esperando respuesta…" : pending ? "Reintentar solicitud exacta" : "Enviar petición"}</button><button className="secondary-button" disabled={disabled || !etag || !preview || preview.method !== "GET" || new URL(preview.url).pathname !== "/api/lab/http"} onClick={() => setDraft({ ...draft, headers: replaceHeader(draft.headers, "If-None-Match", etag!) })}>Usar ETag recibido</button></div><p className="operation-notice" role="status">{notice}</p>
      {editError ? <p className="http-edit-error" role="status">Preparación: {editError}</p> : parts && <dl className="http-url-parts"><div><dt>Scheme</dt><dd>{parts.protocol}</dd></div><div><dt>Host</dt><dd>{parts.hostname}</dd></div><div><dt>Port efectivo</dt><dd>{parts.port || (parts.protocol === "https:" ? "443" : "80")}</dd></div><div><dt>Path</dt><dd>{parts.pathname}</dd></div><div><dt>Query efectiva</dt><dd>{parts.search || "Sin params"}</dd></div><div><dt>Fragmento</dt><dd>{draft.url.includes("#") ? "Se omite al enviar HTTP" : "No hay; no se transmite por HTTP"}</dd></div></dl>}
      <p className="muted">El diagnóstico es público y no persiste datos. Los pedidos usan credenciales públicas y un Map temporal de hasta 200 registros. Los headers de la captura son los configurados para fetch, no un volcado de la conexión. Fetch no-store permite inspeccionar la revalidación manual.</p>
    </section>
    {hasCapture && <><section className="panel http-response-panel" aria-label="Respuesta HTTP observada"><div className="lab-panel-heading"><h2>{capture.response ? `HTTP ${capture.response.status}` : "Sin Response observado"}</h2><span className="pill">Captura real del cliente</span></div><div className="http-response-columns"><div><h3>Headers recibidos</h3><pre>{JSON.stringify(capture.response?.headers ?? {}, null, 2)}</pre></div><div><h3>Body original</h3><pre>{capture.response?.rawBody === null ? "No se pudo leer el body." : capture.response?.rawBody === "" ? "Body vacío. No se parsea como JSON." : capture.response?.rawBody ?? "No se recibió una respuesta."}</pre></div></div>{capture.response?.readError && <p className="http-edit-error">{capture.response.readError}</p>}</section><TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} codeNote="HTTP real observado desde fetch. El editor conserva texto exacto, parsing y Response parcial; no instrumenta DNS, conexión ni código interno del servidor. Reproducir no reenvía la solicitud." /></>}
    <LabChapter kind="http" activities={[{ label: "GET diagnóstico 200 con JSON interpretable", complete: goals.json }, { label: "GET diagnóstico 200 con texto plano", complete: goals.text }, { label: "Revalidación manual con respuesta 304", complete: goals.conditional }]} />
  </>;
}
