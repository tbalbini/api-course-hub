"use client";

import { useReducer, useState, useSyncExternalStore } from "react";
import { chapterNotes, comparisonQuiz, conditionNames, interfaces, operationNames, streamNames, type InterfaceId } from "@/content/comparison";
import { compareRun, initialSettings, type CompareSettings, type ComparisonRun, type Condition, type Operation, type OrderField, type StreamMode } from "@/lib/comparison";
import { playback, type Depth } from "@/lib/trace";
import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import { TracePlayer } from "./trace-player";
import { OrderConsole } from "./order-console";
import { useChapterProgress } from "./use-course-progress";

const json = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value, null, 2);

function ComparisonCard({ run, lane, active, onSelect }: { run: ComparisonRun; lane: string; active: boolean; onSelect: () => void }) {
  const item = interfaces.find(item => item.id === run.interfaceId)!;
  return <article className={`panel comparison-card ${active ? "comparison-active" : ""}`} aria-label={`Alternativa ${lane}: ${item.name}`}>
    <div className="comparison-card-heading"><div><span className="overline">ALTERNATIVA {lane} / {item.category}</span><h2>{item.name}</h2></div><span className="pill">{run.interfaceId === "local" ? "JavaScript real · sin red" : "Simulación pedagógica"}</span></div>
    <p>{item.architecture}</p><div className="comparison-result" role="status"><span className="overline">PROVEEDOR / CONSUMIDOR</span><strong>{run.provider?.status ?? "No existe"} <span>→</span> {run.uncertain ? "Resultado incierto" : run.settings.condition === "missing" ? "Error recibido" : "Resultado conocido"}</strong><small>{run.changes} cambios de estado · conteo del modelo, sin medición de rendimiento</small></div>
    <details open><summary>Contrato</summary><pre><code>{run.contract}</code></pre></details>
    <details open><summary>Invocación representativa</summary><pre><code>{run.invocation}</code></pre></details>
    <details open><summary>Resultado recibido</summary><pre data-testid={`result-${lane}`}><code>{json(run.result)}</code></pre></details>
    <details><summary>Implementación del proveedor</summary><pre><code>{run.providerCode}</code></pre></details>
    <button className="secondary-button" aria-pressed={active} onClick={onSelect}>Inspeccionar traza {lane}</button>
  </article>;
}

// El HTML inicial no debe aceptar selecciones antes de conectar sus handlers.
const subscribeReady = () => () => {};
export function ComparisonLab() {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const [a, setA] = useState<InterfaceId>("local");
  const [b, setB] = useState<InterfaceId>("rest");
  const [settings, setSettings] = useState<CompareSettings>(initialSettings);
  const [runs, setRuns] = useState<[ComparisonRun, ComparisonRun]>(() => [compareRun("local", initialSettings), compareRun("rest", initialSettings)]);
  const [lane, setLane] = useState(0);
  const [state, dispatch] = useReducer(playback, { capture: runs[0].capture, cursor: 0, running: false, speed: 1 });
  const [depth, setDepth] = useState<Depth>("intuition");
  const { goals, setGoals, quizPassed, check } = useChapterProgress(6);
  const done = (["read", "confirm"] as const).filter(operation => goals[operation]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const current = runs[lane];
  const left = interfaces.find(item => item.id === runs[0].interfaceId)!;
  const right = interfaces.find(item => item.id === runs[1].interfaceId)!;
  const selected = state.capture.events[state.cursor];
  const stale = a !== runs[0].interfaceId || b !== runs[1].interfaceId || JSON.stringify(settings) !== JSON.stringify(runs[0].settings);
  function execute() {
    const next: [ComparisonRun, ComparisonRun] = [compareRun(a, settings), compareRun(b, settings)];
    setRuns(next); dispatch({ type: "load", capture: next[lane].capture, autoplay: false });
    setGoals(previous => ({ ...previous, [settings.operation]: true }));
  }
  function select(index: number) { setLane(index); dispatch({ type: "load", capture: runs[index].capture, autoplay: false }); }
  function toggleField(field: OrderField) {
    const fields = settings.fields.includes(field) ? settings.fields.filter(item => item !== field) : [...settings.fields, field];
    if (fields.length) setSettings({ ...settings, fields });
  }
  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="compare" /><div className="main-shell">
    <header className="topbar"><span className="breadcrumb">API Universe <span>/</span><strong>Comparative Engine</strong></span><XRayToggle /></header>
    <main id="experiment" tabIndex={-1}><div className="page-heading"><div><span className="overline">CAPÍTULO 06 / UNA NECESIDAD, VARIAS INTERFACES</span><h1>El mismo pedido.<br />Distintos caminos<span>.</span></h1><p>Consultar y confirmar son capacidades. El contrato y la frontera cambian cómo las utilizamos.</p></div><div className="chapter-stamp"><span>INTERFACES</span><strong>10 <span>/ 1 pedido</span></strong></div></div>
      <div className="learning-note"><span className="note-symbol">?</span><p>¿Qué cambia si pido lo mismo mediante una función, GraphQL o un stream?<br /><strong>Mantén el negocio fijo y observa el mecanismo.</strong></p></div>
      <section className="panel comparison-controls" aria-label="Configurar comparación"><div className="comparison-settings"><div><label htmlFor="interface-a">Interfaz A</label><select disabled={!ready} id="interface-a" value={a} onChange={e => setA(e.target.value as InterfaceId)}>{interfaces.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div><label htmlFor="interface-b">Interfaz B</label><select disabled={!ready} id="interface-b" value={b} onChange={e => setB(e.target.value as InterfaceId)}>{interfaces.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div><label htmlFor="comparison-operation">Objetivo de negocio</label><select disabled={!ready} id="comparison-operation" value={settings.operation} onChange={e => setSettings({ ...settings, operation: e.target.value as Operation })}>{Object.entries(operationNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div><div><label htmlFor="comparison-condition">Condición del modelo</label><select disabled={!ready} id="comparison-condition" value={settings.condition} onChange={e => setSettings({ ...settings, condition: e.target.value as Condition })}>{Object.entries(conditionNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></div></div>
        {(a === "graphql" || b === "graphql") && <fieldset className="comparison-fields"><legend>Campos GraphQL</legend>{(["id", "status"] as OrderField[]).map(field => <label key={field}><input type="checkbox" checked={settings.fields.includes(field)} disabled={settings.fields.length === 1 && settings.fields.includes(field)} onChange={() => toggleField(field)} />{field}</label>)}<span>Al menos un campo. Solo cambia la proyección, no el negocio.</span></fieldset>}
        {(a === "grpc" || b === "grpc") && <div className="comparison-stream"><label htmlFor="grpc-stream">Modalidad gRPC ilustrativa</label><select id="grpc-stream" value={settings.stream} onChange={e => setSettings({ ...settings, stream: e.target.value as StreamMode })}>{Object.entries(streamNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><p>Para un solo pedido basta unary. Las secuencias adicionales muestran el contrato, sin ventaja de rendimiento implícita.</p></div>}
        <div className="comparison-run-controls"><button disabled={!ready} className="primary-button" onClick={execute}>Ejecutar comparación</button><p role="status">{stale ? "Ajustes pendientes. Ejecuta para generar nuevas capturas." : `Capturas de ${operationNames[current.settings.operation].toLowerCase()} · ${conditionNames[current.settings.condition].toLowerCase()}.`} Cada ejecución comienza con una copia de PED-1042 en created.</p></div>
      </section>
      <div className="comparison-pair">{runs.map((run, index) => <ComparisonCard key={index} run={run} lane={index ? "B" : "A"} active={lane === index} onSelect={() => select(index)} />)}</div>
      <section className="panel comparison-dimensions" aria-labelledby="comparison-dimensions-heading"><h2 id="comparison-dimensions-heading">Compara responsabilidades</h2><p className="operation-notice">{left.category === right.category ? "Estas alternativas comparten categoría, pero sus contratos y garantías dependen de la implementación." : `Categorías distintas: ${left.category.toLowerCase()} frente a ${right.category.toLowerCase()}. Comparamos soluciones concretas al mismo objetivo, no capas equivalentes.`}</p><div className="table-scroll" role="region" aria-label="Dimensiones de comparación" tabIndex={0}><table><thead><tr><th scope="col">Dimensión</th><th scope="col">A · {left.name}</th><th scope="col">B · {right.name}</th></tr></thead><tbody>{([['Mecanismo', 'processing'], ['Compromisos', 'tradeoffs'], ['Modelo de errores', 'errors'], ['Fronteras y límites', 'limits'], ['Alternativas', 'alternative']] as const).map(([title, field]) => <tr key={field}><th scope="row">{title}</th><td>{left[field]}</td><td>{right[field]}</td></tr>)}</tbody></table></div></section>
      <section className="panel comparison-flow" aria-label="Fronteras de la alternativa activa"><div className="panel-heading"><span className="overline">TRAZA {lane ? "B" : "A"} / {interfaces.find(item => item.id === current.interfaceId)!.name}</span><span className="pill">{current.capture.mode === "local" ? "Mismo proceso" : "Modelo remoto"}</span></div><div className="comparison-flow-nodes"><div className={`consumer-node ${selected.actor === "browser" ? "node-active" : ""}`}><span>CONSUMIDOR</span><strong>Solicita capacidad</strong></div><div className={`contract-node ${selected.stage === "crossBoundary" ? "node-active" : ""}`}><span>CONTRATO</span><strong>{current.interfaceId === "local" ? "Llamada local" : "Mensaje definido"}</strong></div><div className={`provider-node ${selected.stage === "providerModel" ? "node-active" : ""}`}><span>PROVEEDOR · ESTADO FINAL</span><strong>Pedido {current.provider?.status ?? "inexistente"}</strong></div></div><p>{current.interfaceId === "local" ? "Los tres roles viven en el mismo proceso. Transferir control no implica transmitir un paquete." : "Las etiquetas representan roles a través de una red conceptual, sin prescribir proxy, gateway ni microservicios."}</p><div className={`comparison-current ${selected.state === "error" ? "comparison-error" : ""}`} aria-live="polite"><span>{selected.boundary}</span><strong>{selected.action}</strong><small>{state.cursor + 1} / {state.capture.events.length} eventos · orden lógico</small></div></section>
      <TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} codeNote="Los fragmentos representan contratos y adaptadores. Solo la función de dominio local ejecuta JavaScript aquí; el resto es un modelo sin servidores de esos protocolos. La consola siguiente ejecuta HTTP real." />
      <OrderConsole />
      <section className="panel comparison-chapter" aria-labelledby="comparison-chapter-heading"><span className="overline">CAPÍTULO 06 / DEDUCE LA ELECCIÓN</span><h2 id="comparison-chapter-heading">La interfaz responde al problema</h2><div className="reasoning-grid">{chapterNotes.map(note => <div key={note.title}><h3>{note.title}</h3><p>{note.text}</p></div>)}</div><div className="learning-note"><span className="note-symbol">!</span><p>Error frecuente: “un 200 significa que el negocio terminó bien”. GraphQL o JSON RPC pueden transportar errores de aplicación dentro de HTTP 200. Inspecciona el contrato del resultado.</p></div></section>
      <section className="panel comparison-assessment" aria-labelledby="comparison-assessment-heading"><span className="overline">RAZONA, NO MEMORICES</span><h2 id="comparison-assessment-heading">{comparisonQuiz.question}</h2><fieldset><legend>Elige una explicación</legend>{comparisonQuiz.options.map(option => <label key={option.id}><input type="radio" name="comparison-answer" value={option.id} checked={answer === option.id} onChange={() => { setAnswer(option.id); setFeedback(null); }} />{option.label}</label>)}</fieldset><button className="secondary-button" disabled={!answer} onClick={() => { setFeedback(comparisonQuiz.options.find(option => option.id === answer)!.feedback); check(answer === comparisonQuiz.correct); }}>Comprobar razonamiento</button>{feedback && <p className="operation-notice" role="status">{feedback}</p>}<div className="comparison-challenge"><h3>Desafío: conserva el negocio</h3><p>Ejecuta consultar y confirmar, cambia la condición a respuesta perdida y compara una función con polling. Explica qué hecho permite conocer confirmed aunque una respuesta no llegue.</p><p role="status">Operaciones exploradas: {done.length}/2. {quizPassed && done.length === 2 ? "Capítulo completado y guardado en este dispositivo. " : ""} {done.length === 2 ? "Ambos objetivos ejecutados. Contrasta ahora qué sabe cada consumidor." : "Ejecuta los dos objetivos para completar esta exploración."}</p><p className="muted">Esta actividad no marca completados los capítulos 0 a 3 ni certifica comprensión solo por visitar la página.</p></div></section>
    </main><footer className="page-footer">Un contrato define capacidades. La ubicación determina qué fronteras hay que cruzar.</footer>
  </div></div>;
}
