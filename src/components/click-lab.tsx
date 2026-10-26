"use client";

import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import Link from "next/link";
import { Icon } from "./icon";
import { TracePlayer, actorNames } from "./trace-player";
import { useEffect, useReducer, useRef, useState } from "react";
import { TraceViews } from "./trace-views";
import { NetworkControls } from "./network-controls";
import { OrderStorageExample } from "./order-storage-example";
import { defaultNetwork } from "@/lib/network";
import { creationUncertain } from "@/lib/http-editor";
import { PRODUCT } from "@/lib/product";
import type { Order } from "@/lib/orders";
import { localCapture, scenarioNames, scenarios, simulate, type Scenario } from "@/lib/scenarios";
import { event, indexEvents, playback, type Capture, type Depth, type TraceEvent } from "@/lib/trace";

const money = (minor: number) => new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(minor / 100);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
type Receipt = { order?: Order; error?: { code: string; message: string }; traceId: string; events: TraceEvent[]; repeated?: boolean };


export function ClickLab() {
  const [state, dispatch] = useReducer(playback, undefined, () => ({ capture: simulate("201"), cursor: 0, running: false, speed: 1 }));
  const [mode, setMode] = useState<"real" | "simulation">("real");
  const [scenario, setScenario] = useState<Scenario>("201");
  const [network, setNetwork] = useState(defaultNetwork);
  const [quantity, setQuantity] = useState(1);
  const [credential, setCredential] = useState("demo-buyer");
  const [favorite, setFavorite] = useState(false);
  const [depth, setDepth] = useState<Depth>("intuition");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("La traza inicial es una simulación. Pulsa Comprar ahora para capturar una operación real.");
  const [actualOrder, setActualOrder] = useState<Order | null>(null);
  const [previous, setPrevious] = useState<Capture | null>(null);
  const [compare, setCompare] = useState(false);
  const attempt = useRef<{ key: string; input: { sku: string; quantity: number } } | null>(null);
  const requestInFlight = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const { capture, cursor } = state;
  const selected = capture.events[cursor];

  useEffect(() => () => abort.current?.abort(), []);

  function load(next: Capture) {
    setPrevious(capture);
    dispatch({ type: "load", capture: next, autoplay: !reducedMotion() });
  }

  function inspectPrevious() {
    if (!previous || requestInFlight.current) return;
    setPrevious(capture);
    dispatch({ type: "load", capture: previous, autoplay: false });
  }

  async function buy() {
    if (requestInFlight.current) return;
    if (mode === "simulation") {
      load(simulate(scenario, quantity, network));
      setNotice(`${scenarioNames[scenario]}. Escenario simulado, sin enviar una petición.`);
      return;
    }
    requestInFlight.current = true;
    setBusy(true);
    setNotice("Capturando una petición HTTP real…");
    attempt.current ??= { key: crypto.randomUUID(), input: { sku: PRODUCT.sku, quantity } };
    const { key, input } = attempt.current;
    const headers = { "Content-Type": "application/json", "Idempotency-Key": key, ...(credential ? { Authorization: `Bearer ${credential}` } : {}) };
    const request = { method: "POST", url: "/api/orders", headers, body: input };
    const entries = [event("click"), event("handler", null, input), event("request", request)];
    abort.current = new AbortController();
    const timeout = window.setTimeout(() => abort.current?.abort(), 10000);
    const start = performance.now();
    let observed: Capture["response"];
    try {
      const response = await fetch(request.url, { method: request.method, headers, body: JSON.stringify(input), signal: abort.current.signal });
      const responseHeaders = Object.fromEntries(response.headers.entries());
      observed = { status: response.status, headers: responseHeaders, body: null, rawBody: null };
      observed.rawBody = await response.text();
      const body = JSON.parse(observed.rawBody) as Receipt;
      observed.body = body;
      if (!body || typeof body.traceId !== "string" || !Array.isArray(body.events)) throw new Error("La respuesta no cumple el contrato de pedidos.");
      const measuredMs = performance.now() - start;
      entries.push(...body.events, event("receive", null, { status: response.status, headers: responseHeaders }), event("parse", null, { order: body.order, error: body.error, traceId: body.traceId }));
      const uncertain = creationUncertain(response.status, body, true, pending);
      const message = response.ok && !uncertain ? `${body.repeated ? "Pedido recuperado, sin duplicar" : "Pedido real creado"}: ${body.order?.id}. Reproducir no repetirá la compra.` : `HTTP ${response.status}: ${body.error?.message ?? "Respuesta inesperada"}${uncertain ? " La creación sigue sin resolverse. Reintentar conservará la clave y los datos." : ""}`;
      if (body.order) setActualOrder(body.order);
      setNotice(message);
      const render = event("render", body, { ...(body.order ? { order: body.order } : {}), notice: message });
      render.code = body.order ? "setActualOrder(body.order);\nsetNotice(message);" : "setNotice(message);";
      if (!response.ok) {
        render.contract = "Error HTTP → aviso local";
        render.explanation = { intuition: "El cliente entrega el aviso de error al estado local.", engineering: `Se observa el setter setNotice con el rechazo HTTP ${response.status}. El aviso no confirma una compra exitosa.`, internals: "Se observa la solicitud de actualizar el aviso de error, no el commit de React ni el paint. Replay no repite la petición." };
        render.state = "error"; render.error = body.error;
      }
      entries.push(render);
      load({ id: body.traceId, mode: "real", events: indexEvents(body.traceId, entries), request, response: observed, measuredMs });
      setPending(uncertain);
      if (!uncertain) attempt.current = null;
    } catch (cause) {
      const message = observed ? `HTTP ${observed.status} recibido. ${observed.rawBody === null ? "No se pudo leer el body." : "No se pudo interpretar el body según el contrato de pedidos."} Status y headers se conservan. El resultado del servidor puede ser incierto.` : cause instanceof Error && cause.name === "AbortError" ? "No llegó una respuesta en 10 segundos. El servidor podría haber guardado el pedido." : "No se pudo recibir o interpretar una respuesta. El resultado del servidor puede ser incierto.";
      if (observed) {
        entries.push(event("receive", null, { status: observed.status, headers: observed.headers }));
        if (observed.rawBody === null) observed.readError = cause instanceof Error ? cause.message : "No se pudo leer el body.";
      }
      const failure = event("failure", request, { uncertain: true });
      failure.state = "error"; failure.error = { code: observed ? observed.rawBody === null ? "BODY_READ_FAILURE" : "INVALID_ORDER_RESPONSE" : "FETCH_FAILED", message };
      entries.push(failure);
      const id = crypto.randomUUID();
      load({ id, mode: "real", events: indexEvents(id, entries), request, ...(observed ? { response: observed } : {}), measuredMs: performance.now() - start });
      setPending(true);
      setNotice(`${message} Reintentar conservará la clave y los datos.`);
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
      requestInFlight.current = false;
    }
  }

  function changeLocal() {
    const value = !favorite;
    setFavorite(value);
    load(localCapture(value));
    setNotice(`Favorito ${value ? "activado" : "desactivado"}. Este botón solo cambió estado local, sin fetch.`);
  }

  return <div className="app-shell">
    <a className="skip-link" href="#experiment">Saltar al experimento</a>
    <Sidebar active="click" />
    <div className="main-shell">
      <header className="topbar"><span className="breadcrumb">Laboratorio <span>/</span> <strong>Follow the Click</strong></span><XRayToggle /></header>
      <main id="experiment" tabIndex={-1}>
        <div className="page-heading"><div><div className="overline"><span className="tiny-square" /> DEL EVENTO AL EFECTO</div><h1>Sigue el click<span>.</span></h1><p>Un botón. Dos procesos. Todas las piezas que los conectan.</p><Link className="course-start-link" href="/first-principles?chapter=0">¿Empiezas de cero? Prueba una función local →</Link></div><div className="chapter-stamp"><span>EXPERIMENTO</span><strong>01 <span>/ ∞</span></strong></div></div>
        <div className="learning-note"><span className="note-symbol">?</span><p>¿Cómo puede un click cambiar algo en otra computadora?<br /><strong>Provoca una operación y observa cada frontera.</strong></p><span className="badge">Aprende explorando</span></div>
        <section className="experiment-grid" aria-label="Compra y recorrido causal">
          <div className="panel shop-panel">
            <div className="panel-heading"><span className="overline">01 / PROVOCA UNA ACCIÓN</span><span className="pill">Tienda ficticia</span></div>
            <div className="product-art" aria-hidden="true"><svg viewBox="0 0 280 160"><defs><pattern id="product-grid" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" /></pattern></defs><rect width="280" height="160" fill="url(#product-grid)" /><path className="box-back" d="m140 19 63 35-63 35-63-35Z" /><path className="box-left" d="m77 54 63 35v62l-63-35Z" /><path className="box-right" d="m140 89 63-35v62l-63 35Z" /><path className="box-seam" d="m108 37 64 35v29m-32-12v62" /><text x="94" y="103" transform="rotate(28 94 103)">API</text><circle cx="226" cy="36" r="4" /><path d="M226 46v20m-13-10h26" /></svg><span>CAPACIDADES, EMPAQUETADAS.</span></div>
            <div className="product-title"><div><h2>{PRODUCT.name}</h2><p>Una compra para entender el mecanismo.</p></div><strong>{money(PRODUCT.priceMinor)}</strong></div>
            <div className="purchase-fields"><div><label htmlFor="quantity">Cantidad</label><select id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} disabled={busy || pending}>{[1, 2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}</select></div><div><label htmlFor="credential">Credencial demostrativa</label><select id="credential" value={credential} onChange={e => setCredential(e.target.value)} disabled={busy || pending || mode === "simulation"}><option value="demo-buyer">Comprador · puede crear</option><option value="demo-reader">Lector · solo consulta</option><option value="">Sin credencial</option></select></div></div>
            <fieldset className="mode-switch"><legend>Tipo de experimento</legend><label><input type="radio" name="mode" checked={mode === "real"} onChange={() => setMode("real")} disabled={busy || pending} /> HTTP real</label><label><input type="radio" name="mode" checked={mode === "simulation"} onChange={() => setMode("simulation")} disabled={busy || pending} /> Simulación</label></fieldset>
            {mode === "simulation" && <label className="scenario-label">Inyectar condición<select value={scenario} onChange={e => setScenario(e.target.value as Scenario)}>{scenarios.map(value => <option key={value} value={value}>{scenarioNames[value]}</option>)}</select></label>}
            {mode === "simulation" && <NetworkControls value={network} onChange={setNetwork} />}
            <button className="primary-button" onClick={buy} disabled={busy} aria-busy={busy}>{busy ? "Capturando…" : mode === "simulation" ? "Ejecutar escenario" : pending ? "Reintentar misma operación" : "Comprar ahora"}<Icon name="arrow" /></button>
            <button className={`local-button ${favorite ? "is-favorite" : ""}`} aria-pressed={favorite} disabled={busy} onClick={changeLocal}><Icon name="heart" />{favorite ? "Quitar de favoritos" : "Guardar en favoritos"}<span>SOLO LOCAL</span></button>
            <p className="shop-footnote">Sin cobro. Credenciales públicas. Los pedidos se pierden al reiniciar el servidor.</p>
            {actualOrder && <div className="receipt"><span className="overline">ÚLTIMO PEDIDO REAL · YA EJECUTADO</span><strong>{actualOrder.quantity} {actualOrder.quantity === 1 ? "kit" : "kits"} · {money(actualOrder.totalMinor)}</strong><small>{actualOrder.id}</small></div>}
          </div>
          <div className="panel flow-panel"><div className="panel-heading"><span className="overline">02 / SIGUE EL RECORRIDO</span><span className={`pill mode-${capture.mode}`}>{capture.mode === "real" ? "Captura real" : capture.mode === "local" ? "Solo local" : "Simulación"}</span></div><TraceViews capture={capture} cursor={cursor} onSelect={index => dispatch({ type: "seek", cursor: index })} /><div className={`current-event ${selected.state === "error" ? "event-error" : ""}`}><span className={`actor-dot actor-${selected.actor}`} /><div><small>PASO {String(cursor + 1).padStart(2, "0")} · {actorNames[selected.actor]}</small><strong>{selected.action}</strong></div><span className="step-boundary">{selected.boundary}</span></div></div>
        </section>
        <div className={`operation-notice ${pending || notice.startsWith("HTTP 4") || notice.startsWith("HTTP 5") ? "notice-warning" : ""}`} role="status">{notice}</div>
        <TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} />
        <OrderStorageExample captureId={capture.id} entry={selected} />
        <div className="support-grid"><section className="support-card"><span className="overline">UNA DISTINCIÓN FUNDAMENTAL</span><h2>No todos los clicks cruzan una red.</h2><p>Comprar invoca una API HTTP entre dos procesos. Guardar en favoritos cambia estado en el navegador. Una interfaz también puede exponer capacidades dentro de un mismo proceso.</p></section><section className="support-card"><span className="overline">CAPTURA ≠ REEJECUCIÓN</span><h2>Retroceder no deshace una compra.</h2><p>El servidor ya terminó cuando inspeccionas la captura. Play y replay recorren eventos guardados, sin volver a enviar la operación.</p>{previous && <button className="text-button" aria-expanded={compare} onClick={() => setCompare(!compare)}>{compare ? "Cerrar comparación" : "Comparar con la captura anterior"}<Icon name="arrow" /></button>}</section></div>
        {compare && previous && <section className="panel comparison"><h2>Dos ejecuciones, dos resultados</h2><button className="text-button" disabled={busy} onClick={inspectPrevious}>Inspeccionar captura anterior</button><p>Intercambia estas dos capturas y pausa al inicio. El formulario, el último pedido real y cualquier intento pendiente conservan sus datos. El aviso de la operación más reciente permanece.</p><div className="exchange-grid">{[previous, capture].map((item, i) => <div key={i}><h3>{i ? "Actual" : "Anterior"} · {item.mode === "real" ? "Real" : item.mode === "local" ? "Local" : "Simulada"}</h3><p>{item.events.length} eventos · {item.response ? `HTTP ${item.response.status}` : "Sin respuesta HTTP"}</p><ol>{item.events.map(entry => <li key={entry.id}>{entry.action}{entry.error ? ` · ${entry.error.code}` : ""}</li>)}</ol></div>)}</div><p className="muted">Compara pasos y efectos. El número de eventos no mide rendimiento.</p></section>}
        <details className="architecture-details"><summary>Qué observa esta app y qué simplifica</summary><p>HTTP ocurre realmente entre el navegador y el servidor local. Las flechas son un modelo de esa topología, no una captura de paquetes. En localhost con HTTP no hay negociación TLS; no afirmamos observar DNS, routers, proxies ni balanceadores. En un despliegue remoto podrían intervenir, según su configuración.</p><p>Los pedidos se guardan en un Map del servidor. Al seleccionar un paso de guardado puedes inspeccionar una alternativa SQL conceptual con sus parámetros; aquí no se ejecuta SQL. El límite de 200 pedidos acota la memoria y no representa un rate limiter de producción. El estado de reintento solo dura mientras permanece abierta esta página.</p><p>Los capítulos 0 a 12, los laboratorios A a J, la referencia y los siete desafíos están disponibles. Las simulaciones usan tiempo lógico, datos ficticios y una secuencia simplificada. La validación de comprensión con participantes sigue pendiente. Puedes consultar el <Link prefetch={false} href="/course">programa completo</Link> y la <Link prefetch={false} href="/reference?view=guide">guía del laboratorio</Link>.</p></details>
        <footer><span>THE API UNIVERSE <span className="footer-separator">/</span> Ingeniería que puedes inspeccionar.</span><span>Sin cobros · Sin servicios externos</span></footer>
      </main>
    </div>
  </div>;
}
