"use client";
import { useReducer, useRef, useState } from "react";
import { abiRun, defaultBinary, wasmRun, wasmText, type BinarySettings } from "@/lib/binary-boundary";
import { playback } from "@/lib/trace";
import type { AdvancedExperimentGoal } from "@/content/advanced";
import { ContractPlayer } from "./contract-player";

export function BinaryExperiment({ active, onObserved }: { active: boolean; onObserved: (goal: AdvancedExperimentGoal) => void }) {
  const [settings, setSettings] = useState({ ...defaultBinary }), [run, setRun] = useState(() => abiRun(defaultBinary));
  const [busy, setBusy] = useState(false), [error, setError] = useState(""); const lock = useRef(false);
  const [state, dispatch] = useReducer(playback, { capture: run.capture, cursor: 0, running: false, speed: 1 });
  async function execute() {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const next = settings.mechanism === "wasm" ? await wasmRun(settings) : abiRun(settings);
      setRun(next); setError(""); dispatch({ type: "load", capture: next.capture, autoplay: false });
      if (next.settings.mechanism === "abi" && next.invoked && next.result !== next.expected) onObserved("abiMismatch");
      if (next.error === "LIFETIME" && !next.invoked) onObserved("lifetime");
      if (next.error === "WASM_TRAP") onObserved("wasmTrap");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo ejecutar el experimento."); }
    finally { lock.current = false; setBusy(false); }
  }
  const actualWasm = run.settings.mechanism === "wasm", stale = JSON.stringify(settings) !== JSON.stringify(run.settings);
  return <><section className="panel event-controls"><div className="lab-panel-heading"><h2>La misma intención necesita representación</h2><span className="pill">ABI/FFI modeladas · Wasm real</span></div>
    <p className="contract-requirement">Una firma no dice dónde viven los argumentos ni cuánto duran. Cambia el acuerdo binario o ejecuta una interfaz Wasm sin red.</p><div className="event-control-grid">
      <div><label htmlFor="binary-mechanism">Mecanismo de ejecución</label><select id="binary-mechanism" disabled={busy} value={settings.mechanism} onChange={e => setSettings({ ...settings, mechanism: e.target.value as BinarySettings["mechanism"] })}><option value="abi">ABI/FFI · modelo de restar</option><option value="wasm">WebAssembly real · dividir enteros</option></select></div>
      <div><label htmlFor="binary-left">Argumento a (entero −1000 a1000)</label><input id="binary-left" type="number" min={-1000} max={1000} step={1} value={settings.left} disabled={busy} onChange={e => setSettings({ ...settings, left: Number(e.target.value) })} /></div>
      <div><label htmlFor="binary-right">Argumento b (entero −1000 a1000)</label><input id="binary-right" type="number" min={-1000} max={1000} step={1} value={settings.right} disabled={busy} onChange={e => setSettings({ ...settings, right: Number(e.target.value) })} /></div>
      <div><label htmlFor="binary-layout">Layout esperado por el proveedor</label><select id="binary-layout" disabled={busy || settings.mechanism === "wasm"} value={settings.swapped ? "swapped" : "aligned"} onChange={e => setSettings({ ...settings, swapped: e.target.value === "swapped" })}><option value="aligned">a@0, b@4 · compatible</option><option value="swapped">a@4, b@0 · incompatible</option></select></div>
    </div><label className="event-toggle"><input type="checkbox" checked={settings.released} disabled={busy || settings.mechanism === "wasm"} onChange={e => setSettings({ ...settings, released: e.target.checked })} />Liberar el buffer antes de la llamada FFI modelada</label>
    <button className="primary-button" disabled={busy} onClick={() => void execute()}>{busy ? "Instanciando…" : "Ejecutar frontera binaria"}</button>{error && <p className="edit-error" role="alert">{error}</p>}<p className="operation-notice" role="status">{stale ? "Ajustes pendientes. La captura conserva la ejecución anterior." : actualWasm ? "Ejecución local real capturada; replay no vuelve a instanciar." : "Modelo ABI/FFI calculado en JavaScript, sin código nativo ni HTTP."}</p>
    </section><section className="panel event-controls" aria-label="Resultado binario capturado"><div className="lab-panel-heading"><h2>{actualWasm ? "JavaScript → export Wasm → retorno" : "Consumidor → binding → proveedor modelado"}</h2><span className="pill">Mismo proceso · sin flecha de red</span></div><div className="advanced-result-grid"><div><span>Operación capturada</span><strong>{actualWasm ? "dividir" : "restar"}({run.settings.left},{run.settings.right})</strong></div><div><span>Resultado esperado</span><strong>{run.expected ?? "Trap por cero"}</strong></div><div><span>Resultado recibido</span><strong data-testid="binary-result">{run.result ?? run.error ?? "Sin resultado"}</strong></div><div><span>Función invocada</span><strong>{run.invoked ? "Sí" : "No"}</strong></div></div><p className="contract-requirement">Datos de la ejecución completa, independientes del cursor. {actualWasm ? "i32.div_s trunca hacia cero. Los controles impiden valores fraccionarios o fuera del rango del ejemplo; el módulo no importa capacidades ni exporta memoria." : "Convención inventada: dos int32 LE, offsets0 y4, alineación4. El proveedor invertido calcula b−a. Una ABI real también define registros, pila, símbolos y retorno; su incompatibilidad puede producir fallos no predecibles."}</p><h3>{actualWasm ? "Bytes del módulo fijo" : "Ocho bytes de argumentos · representación capturada"}</h3><pre className="advanced-hex" aria-label="Bytes de la ejecución binaria">{run.bytes.map(byte => byte.toString(16).padStart(2, "0")).join(" ")}</pre>
    <details><summary>{actualWasm ? "WAT equivalente al módulo ejecutado" : "Convención y lifetime del ejemplo"}</summary><pre>{actualWasm ? wasmText : "// Consumidor: int32 LE\na@0, b@4\n// Proveedor compatible: a@0, b@4\n// Proveedor incompatible: a@4, b@0\n// released: se rechaza antes de invocar"}</pre></details></section>
    <ContractPlayer active={active} state={state} dispatch={dispatch} label={actualWasm ? "Wasm real · observación del wrapper local" : "Modelo ABI/FFI · representación y vida"} codeNote={actualWasm ? "Se ejecuta el módulo fijo con WebAssembly.instantiate y su export dividir. El fragmento representa el wrapper; no mide CPU ni JIT. Replay solo cambia la observación." : "Código del modelo ABI/FFI. No se compila C, carga un addon ni accede a memoria nativa. Replay conserva los datos capturados."} />
  </>;
}
