"use client";
import { useReducer, useState } from "react";
import { defaultWire, wireQueries, wireRun, type WireSettings } from "@/lib/database-wire";
import { playback } from "@/lib/trace";
import type { AdvancedExperimentGoal } from "@/content/advanced";
import { ContractPlayer } from "./contract-player";

export function WireExperiment({ active, onObserved }: { active: boolean; onObserved: (goal: AdvancedExperimentGoal) => void }) {
  const [settings, setSettings] = useState({ ...defaultWire }), [run, setRun] = useState(() => wireRun(defaultWire)), [byte, setByte] = useState(0);
  const [state, dispatch] = useReducer(playback, { capture: run.capture, cursor: 0, running: false, speed: 1 });
  const snapshot = run.snapshots[state.cursor], field = byte === 0 ? "Tag Q" : byte < 5 ? "Longitud Int32 big endian" : byte === run.frame.length - 1 ? "Terminador NUL" : "Payload UTF-8";
  function execute() {
    const next = wireRun(settings); setRun(next); setByte(0); dispatch({ type: "load", capture: next.capture, autoplay: false });
    if (next.error === "INCOMPLETE_FRAME") onObserved("wireIncomplete");
  }
  return <><section className="panel event-controls"><div className="lab-panel-heading"><h2>Un mensaje puede llegar en varios fragmentos</h2><span className="pill">Wire protocol · transporte modelado</span></div><p className="contract-requirement">Codifica un Query de PostgreSQL y observa qué sabe el parser en cada evento. Encode/decode se calculan en JavaScript; no se abre una conexión ni se ejecuta SQL.</p><div className="event-control-grid">
    <div><label htmlFor="wire-query">Sentencia fija del ejemplo</label><select id="wire-query" value={settings.query} onChange={e => setSettings({ ...settings, query: e.target.value as WireSettings["query"] })}>{Object.entries(wireQueries).map(([id, query]) => <option key={id} value={id}>{query}</option>)}</select></div>
    <div><label htmlFor="wire-chunk">Bytes por fragmento conceptual</label><select id="wire-chunk" value={settings.chunkSize} onChange={e => setSettings({ ...settings, chunkSize: Number(e.target.value) })}>{[1,4,8,64].map(size => <option key={size} value={size}>{size} bytes</option>)}</select></div>
    <div><label htmlFor="wire-fault">Condición del mensaje</label><select id="wire-fault" value={settings.fault} onChange={e => setSettings({ ...settings, fault: e.target.value as WireSettings["fault"] })}><option value="none">Completo</option><option value="truncated">Omitir el último byte y terminar</option><option value="length">Longitud declarada inválida</option></select></div>
    </div><button className="primary-button" onClick={execute}>Ejecutar framing</button><p className="operation-notice" role="status">{JSON.stringify(settings) !== JSON.stringify(run.settings) ? "Ajustes pendientes. El frame conserva la captura anterior." : run.error ? `Resultado final: ${run.error}. No se ejecutó SQL.` : "Resultado final: sentencia decodificada; no se ejecutó SQL."}</p></section>
    <section className="panel event-controls" aria-label="Buffer del cursor"><div className="lab-panel-heading"><h2>Bytes disponibles en este evento</h2><span className="pill">Cursor {state.cursor + 1}/{run.capture.events.length}</span></div><div className="advanced-wire-path"><span>Cliente modelado<br /><small>Encoder de Query</small></span><b>Flujo de bytes conceptual →</b><span>Receptor modelado<br /><small>Buffer y parser</small></span></div><p className="contract-requirement">Tag: byte0. Longitud: bytes1 a4, incluye sus4 bytes y excluye el tag. Payload: UTF-8 y un único NUL final. Protocolo del ejemplo con encoding UTF-8 acordado; se omiten startup, autenticación y protocolo extendido.</p>
    <div className="advanced-byte-grid" role="group" aria-label="Bytes del mensaje Query">{run.frame.map((value, index) => <button key={index} className={`advanced-byte ${index === 0 ? "byte-tag" : index < 5 ? "byte-length" : "byte-data"} ${index >= snapshot.received ? "byte-pending" : ""}`} aria-pressed={byte === index} aria-label={`Byte ${index}: ${value.toString(16).padStart(2, "0")}, ${index < snapshot.received ? "recibido" : "pendiente"}`} onClick={() => {
      setByte(index); const cursor = run.snapshots.findIndex(s => s.received > index); dispatch({ type: "seek", cursor: cursor < 0 ? run.snapshots.length - 1 : cursor });
    }}><small>{index}</small><strong>{value.toString(16).padStart(2, "0")}</strong><span>{index < snapshot.received ? "✓" : "·"}</span></button>)}</div>
    <p className="advanced-byte-detail">Byte seleccionado: {byte} · {field} · decimal {run.frame[byte]}. Seleccionarlo busca el primer evento que lo recibe o el fin incompleto.</p><div className="advanced-result-grid"><div><span>Bytes recibidos en el cursor</span><strong>{snapshot.received}/{run.frame.length}</strong></div><div><span>Estado del parser en el cursor</span><strong>{snapshot.state}</strong></div></div><pre aria-label="Sentencia disponible en el cursor">{snapshot.query ?? "Todavía no hay una sentencia completa."}</pre><p className="contract-requirement">El límite de256 bytes es del parser pedagógico. Un chunk no es un mensaje, una fila ni un evento de negocio. Producción requiere otros límites, estados de conexión, backpressure y recuperación.</p></section>
    <ContractPlayer active={active} state={state} dispatch={dispatch} label="Modelo de transporte · parser local acotado" codeNote="Bytes calculados, transporte conceptual y ninguna consulta SQL ejecutada. El parser acepta un Query acotado, no implementa el protocolo completo. Replay solo inspecciona los snapshots del buffer." />
  </>;
}
