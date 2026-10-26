"use client";

import { useEffect, useReducer, useState } from "react";
import { networkProfiles } from "@/content/http";
import { defaultNetworkLab, networkLabCapture, type NetworkLabSettings } from "@/lib/network-lab";
import { playback, type Depth } from "@/lib/trace";
import { LabChapter } from "./lab-chapter";
import { TracePlayer } from "./trace-player";
import { useChapterProgress } from "./use-course-progress";

export function NetworkLab({ active }: { active: boolean }) {
  const [settings, setSettings] = useState(defaultNetworkLab);
  const [run, setRun] = useState(() => networkLabCapture(defaultNetworkLab));
  const [state, dispatch] = useReducer(playback, { capture: run.capture, cursor: 0, running: false, speed: 1 });
  const [depth, setDepth] = useState<Depth>("intuition");
  const { goals, setGoals } = useChapterProgress(4);
  useEffect(() => { if (!active) dispatch({ type: "pause" }); }, [active]);
  const selected = state.capture.events[state.cursor];
  const stale = JSON.stringify(run.settings) !== JSON.stringify(settings);
  const udp = settings.protocol === "udp";
  function execute() {
    const next = networkLabCapture(settings); setRun(next); dispatch({ type: "load", capture: next.capture, autoplay: false });
    setGoals(previous => ({ quic: previous.quic || settings.protocol === "h3" && settings.drop && next.recovered, udp: previous.udp || settings.protocol === "udp" && settings.drop && next.delivered.length === 2 }));
  }
  const toggles = [
    ["literalIP", "Usar IP literal"], ["dnsCached", "Caché DNS válida"], ["reuse", "Reutilizar conexión"], ["drop", "Perder la unidad 2"], ["lostResponse", "Perder respuesta del primer GET"], ["retry", "Reintentar GET una vez"],
  ] as const;
  return <><div className="learning-note"><span className="note-symbol">?</span><p>¿Cómo llega un mensaje a otro proceso y qué ocurre si se pierde una parte?<br /><strong>Separa la semántica HTTP de las garantías del transporte.</strong></p></div>
    <section className="panel network-lab-controls" aria-label="Configurar modelo de red"><div className="lab-panel-heading"><div><span className="overline">CAPÍTULO 04 / RED CONCEPTUAL</span><h2>Construye el recorrido</h2></div><span className="pill">Simulación · sin tráfico real</span></div><label htmlFor="network-lab-protocol">Pila del modelo</label><select id="network-lab-protocol" value={settings.protocol} onChange={e => setSettings({ ...settings, protocol: e.target.value as NetworkLabSettings["protocol"] })}>{Object.entries(networkProfiles).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      <div className="network-lab-toggles">{toggles.map(([key, label]) => <label key={key}><input type="checkbox" checked={settings[key]} disabled={udp && (key === "reuse" || key === "lostResponse" || key === "retry")} onChange={e => setSettings({ ...settings, [key]: e.target.checked })} />{label}</label>)}</div><div className="network-lab-times"><div><label htmlFor="network-oneway">Ida simulada: {settings.oneWayMs} ms</label><input id="network-oneway" type="range" min={10} max={250} step={10} value={settings.oneWayMs} onChange={e => setSettings({ ...settings, oneWayMs: Number(e.target.value) })} /></div><div><label htmlFor="network-processing">Procesamiento simulado: {settings.processingMs} ms</label><input id="network-processing" type="range" min={10} max={200} step={10} value={settings.processingMs} onChange={e => setSettings({ ...settings, processingMs: Number(e.target.value) })} /></div></div>
      <div className="http-send-row"><button className="primary-button" onClick={execute}>Ejecutar modelo de red</button></div><p className="operation-notice" role="status">{stale ? "Ajustes pendientes: la captura anterior conserva su configuración." : `Captura: ${networkProfiles[run.settings.protocol]}.`} UDP directo no usa los ajustes de conexión, respuesta HTTP ni retry de GET.</p>
    </section>
    <section className="panel network-lab-diagram" aria-label="Ruta conceptual y entrega"><div className="lab-panel-heading"><h2>De una computadora a otra</h2><span className="pill">Frontera: red conceptual</span></div><div className="network-route" tabIndex={0} role="region" aria-label="Ruta de routers con desplazamiento"><div className={selected.actor === "browser" ? "route-current" : ""}><small>CONSUMIDOR</small><strong>Proceso cliente</strong></div><span aria-hidden="true">→</span><div className={selected.action.includes("routers") ? "route-current" : ""}><small>ROUTER 1</small><strong>198.51.100.1</strong></div><span aria-hidden="true">→</span><div className={selected.action.includes("routers") ? "route-current" : ""}><small>ROUTER 2</small><strong>198.51.100.2</strong></div><span aria-hidden="true">→</span><div className={selected.actor === "provider" ? "route-current" : ""}><small>PROVEEDOR</small><strong>203.0.113.10:{run.settings.protocol === "udp" ? "9000" : "443"}</strong></div></div><p>Ruta fija y direcciones de documentación. Los routers reenvían por IP; el proveedor interpreta el contrato. Las flechas no son captura de paquetes.</p><div className="network-unit-results"><span className="overline">ENTREGA FINAL DEL MODELO</span>{[1, 2, 3].map(unit => <div key={unit} className={run.delivered.includes(unit) ? "unit-delivered" : "unit-missing"}><strong>{unit}</strong><span>{run.delivered.includes(unit) ? "contenido recibido" : "contenido ausente"}</span></div>)}</div><p>{run.recovered ? `${run.settings.protocol === "h3" ? "QUIC" : "TCP"} recuperó contenido antes de entregarlo a la aplicación.` : run.settings.protocol === "udp" ? "UDP no añade recuperación ni orden fiable. Se muestra solo esta entrega." : "No se necesitó recuperar contenido perdido."} {run.attempts} {run.attempts === 1 ? "invocación" : "invocaciones"} de aplicación; retransmitir transporte no cuenta como otro GET.</p><div className="network-lab-estimate"><span>Cálculo simulado para un intercambio HTTP preparado, sin pérdida ni preparación</span><strong>{run.settings.oneWayMs} × 2 + {run.settings.processingMs} = {run.exchangeMs} ms</strong><p>{run.settings.protocol === "udp" ? "Ejercicio de ida/vuelta hipotética: UDP directo no garantiza ese intercambio ni genera una respuesta en esta captura." : "Omite DNS, handshake, recuperación, colas y retries. No predice rendimiento ni decide el fallo de retorno inyectado."}</p></div><div className={`comparison-current ${selected.state === "error" ? "comparison-error" : ""}`} aria-live="polite"><span>{selected.boundary}</span><strong>{selected.action}</strong><small>{state.cursor + 1}/{state.capture.events.length} · tiempo lógico</small></div></section>
    <TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} codeNote="Todo este recorrido de red es conceptual. Las unidades numeradas representan contenido, no tamaños de segmentos o datagramas reales. La calculadora de tiempos no se presenta como una medición." />
    <LabChapter kind="network" activities={[{ label: "HTTP/3 recupera la unidad perdida mediante QUIC", complete: goals.quic }, { label: "UDP directo conserva una entrega incompleta", complete: goals.udp }]} />
  </>;
}
