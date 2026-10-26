"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useReducer, useRef, useState } from "react";
import { apiExamples, chapters, type Chapter, type ChapterId } from "@/content/foundations";
import { anatomyCapture, mechanisms, requestReply, type Mechanism, type ModelCondition } from "@/lib/anatomy";
import { domCapture, functionChallenge, implementations, runFunction, validDOMText, type Implementation } from "@/lib/learning";
import { award, complete, flags, type Progress } from "@/lib/progress";
import { playback, type Capture } from "@/lib/trace";
import { ConcurrentTrace } from "./concurrent-trace";
import { APIAnatomy } from "./api-anatomy";
import { Icon } from "./icon";
import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import { TracePlayer } from "./trace-player";
import { getLearningProgress, saveProgress, useLearningProgress } from "./use-learning-progress";

export function FoundationsLab() {
  const progress = useLearningProgress();
  const requestedChapter = useSearchParams().get("chapter");
  const chapter = chapters.find(item => String(item.id) === requestedChapter) ?? chapters[progress.lastChapter];
  useEffect(() => {
    // La hidratación empieza con un snapshot vacío; conserva los logros ya guardados.
    const latest = getLearningProgress();
    if (requestedChapter === String(chapter.id) && chapter.id !== latest.lastChapter) saveProgress({ ...latest, lastChapter: chapter.id });
  }, [requestedChapter, chapter.id]);
  return <ChapterWorkspace key={chapter.id} chapter={chapter} progress={{ ...progress, lastChapter: chapter.id }} onChapter={id => { window.history.pushState(null, "", `/first-principles?chapter=${id}`); window.scrollTo(0, 0); }} />;
}

function ChapterWorkspace({ chapter, progress, onChapter }: { chapter: Chapter; progress: Progress; onChapter: (id: ChapterId) => void }) {
  const [state, dispatch] = useReducer(playback, undefined, () => ({ capture: chapter.id === 2 ? domCapture("Texto inicial", "Texto de ejemplo", true) : anatomyCapture(chapter.id === 3 ? "http" : "function"), cursor: 0, running: false, speed: 1 }));
  const [mode, setMode] = useState<Mechanism>(chapter.id === 3 ? "http" : "function");
  const [condition, setCondition] = useState<ModelCondition>("success");
  const [concurrent, setConcurrent] = useState(false);
  const [a, setA] = useState("2");
  const [b, setB] = useState("3");
  const [implementation, setImplementation] = useState<Implementation>("direct");
  const [text, setText] = useState("Una API sin internet");
  const [domChanges, setDomChanges] = useState(0);
  const [executions, setExecutions] = useState(0);
  const [lastResult, setLastResult] = useState<{ value: number | string; valid: boolean } | null>(null);
  const [notice, setNotice] = useState("Modelo inicial. Ejecuta el experimento para observar su resultado.");
  const [answer, setAnswer] = useState<number | null>(null);
  const [example, setExample] = useState(0);
  const domRef = useRef<HTMLDivElement>(null);
  const selected = state.capture.events[state.cursor];
  const currentProgress = progress.chapters[chapter.id];
  const passed = complete(chapter.id, currentProgress);

  function persist(next: Progress) {
    if (!saveProgress(next)) setNotice("Progreso conservado en esta sesión. El navegador no permitió guardarlo para futuras visitas.");
  }
  function load(capture: Capture) {
    dispatch({ type: "load", capture, autoplay: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }
  function chooseMode(next: Mechanism) {
    setMode(next); setCondition("success"); setConcurrent(false);
    load(chapter.id === 2 && next === "function" ? domCapture("Texto inicial", "Texto de ejemplo", true) : anatomyCapture(next)); setNotice(`${mechanisms[next].name}: modelo conceptual. No se ejecutó infraestructura.`);
  }
  function execute() {
    if (chapter.id <= 1) {
      if (!a.trim() || !b.trim()) { setNotice("Introduce ambos argumentos antes de llamar a la función."); return; }
      try {
        const active = chapter.id === 0 ? "direct" : implementation;
        const result = runFunction(Number(a), Number(b), active);
        setMode("function"); setLastResult({ value: result.value, valid: result.valid }); load(result.capture); setExecutions(value => value + 1);
        setNotice(result.valid ? `La función devolvió ${result.value} como number, sin red.` : "El proveedor devolvió texto. El chequeo explícito detectó CONTRACT_VIOLATION.");
        const additions = chapter.id === 0 ? functionChallenge(Number(a), Number(b), result.valid) ? ["sum42"] : [] : active === "fold" && result.valid ? ["compatible"] : active === "broken" && !result.valid ? ["incompatible"] : [];
        persist(award(progress, chapter.id, additions));
      } catch (cause) { setNotice(cause instanceof Error ? cause.message : "No se pudo ejecutar."); }
    } else if (chapter.id === 2) {
      if (!validDOMText(text)) { setNotice("Usa texto no vacío de hasta 60 caracteres."); return; }
      const node = domRef.current?.querySelector("[data-demo-node]");
      if (!node) { setNotice("El nodo no existe. querySelector puede devolver null."); return; }
      const before = node.textContent ?? "";
      if (before === text) { setNotice("El texto ya coincide. El desafío requiere un cambio real."); return; }
      node.textContent = text;
      load(domCapture(before, node.textContent)); setMode("function"); setExecutions(value => value + 1); setDomChanges(value => value + 1);
      setNotice("El nodo real cambió mediante textContent. No se llamó a fetch.");
      persist(award(progress, chapter.id, domChanges >= 1 ? ["dom-first", "dom-second"] : ["dom-first"]));
    } else {
      load(anatomyCapture(mode, condition, concurrent));
      setNotice("Modelo ejecutado. Los eventos y dependencias son conceptuales; no se enviaron mensajes reales.");
      persist(award(progress, chapter.id, mode === "http" && condition === "lost" && concurrent ? ["uncertain-concurrent"] : []));
    }
  }
  function respond(index: number) {
    setAnswer(index);
    if (chapter.quiz.options[index].correct) persist(award(progress, chapter.id, [], true));
  }

  return <div className="app-shell">
    <a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="foundations" chapter={chapter.id} />
    <div className="main-shell"><header className="topbar"><span className="breadcrumb">Primeros principios <span>/</span> <strong>Capítulo {chapter.id}</strong></span><XRayToggle /></header>
      <main id="experiment" tabIndex={-1}>
        <div className="page-heading"><div><span className="overline">CAPÍTULO {String(chapter.id).padStart(2, "0")} / FUNDAMENTOS</span><h1>Antes de la red<span>.</span></h1><p>Descubre la interfaz. Después, cambia la frontera.</p></div><div className="chapter-stamp"><span>PROGRESO LOCAL</span><strong>{chapters.filter(item => complete(item.id, progress.chapters[item.id])).length} <span>/ 4</span></strong></div></div>
        <nav className="chapter-navigation" aria-label="Capítulos de primeros principios">{chapters.map(item => <button key={item.id} aria-current={item.id === chapter.id ? "page" : undefined} onClick={() => onChapter(item.id)}><span>{String(item.id).padStart(2, "0")}</span><strong>{item.title}</strong><small>{complete(item.id, progress.chapters[item.id]) ? "Completado" : "Por explorar"}</small></button>)}</nav>
        <div className="learning-note"><span className="note-symbol">?</span><p>{chapter.question}<br /><strong>{chapter.intuition}</strong></p></div>
        <div className="foundations-grid">
          <section className="panel function-experiment" aria-labelledby="local-lab-title"><div className="panel-heading"><span className="overline">{chapter.id === 2 ? "LABORATORIO B · BROWSER API" : "PROVOCA Y OBSERVA"}</span><span className="pill">{chapter.id === 3 ? "Simulación" : "Ejecución real"}</span></div><div className="experiment-body">
            <h2 id="local-lab-title">{chapter.id <= 1 ? "Una función es una interfaz" : chapter.id === 2 ? "Un cambio DOM, cero fetch" : "Una capacidad, varias fronteras"}</h2>
            {chapter.id <= 1 ? <>
              <div className="signature"><span>CONTRATO</span><code>sumar(a: number, b: number): number</code><small>Debe devolver a + b, como número.</small></div>
              <div className="argument-fields"><label>Argumento a<input type="number" min="-1000" max="1000" step="1" value={a} onChange={e => setA(e.target.value)} /></label><label>Argumento b<input type="number" min="-1000" max="1000" step="1" value={b} onChange={e => setB(e.target.value)} /></label></div>
              {chapter.id === 1 && <label className="scenario-label">Implementación del proveedor<select value={implementation} onChange={e => setImplementation(e.target.value as Implementation)}>{Object.entries(implementations).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></label>}
              <pre className="implementation-code"><code>{chapter.id === 0 ? implementations.direct.code : implementations[implementation].code}</code></pre>
              {lastResult && <div className={`local-result ${lastResult.valid ? "" : "invalid-result"}`}><span className="overline">ÚLTIMO RETORNO REAL</span><strong>{JSON.stringify(lastResult.value)}</strong><small>tipo: {typeof lastResult.value} · {lastResult.valid ? "Contrato satisfecho para esta entrada" : "Contrato incumplido"}</small></div>}
            </> : chapter.id === 2 ? <>
              <label className="scenario-label">Texto para el nodo<input maxLength={60} value={text} onChange={e => setText(e.target.value)} /></label>
              <div className="dom-sandbox" ref={domRef}><span className="overline">NODO REAL DEL EJEMPLO</span><output data-demo-node ref={node => { if (node && !node.textContent) node.textContent = "Texto inicial"; }} /></div>
              <p className="muted">La mutación usa textContent y no interpreta HTML. Solo afecta este nodo.</p>
            </> : <>
              <p className="muted">Elige el mecanismo en Anatomy. Compara quién ejecuta y qué puede saber el consumidor.</p>
              <label className="scenario-label">Condición de entrega<select value={condition} onChange={e => setCondition(e.target.value as ModelCondition)} disabled={!requestReply(mode)}><option value="success">Resultado recibido</option><option value="network">Fallo antes de entrega</option><option value="lost">Respuesta perdida tras ejecución</option></select></label>
              <label className="concurrency-field"><input type="checkbox" checked={concurrent} onChange={e => setConcurrent(e.target.checked)} disabled={!requestReply(mode)} /> Dos llamadas concurrentes A y B</label>
              <p className="shop-footnote">Fallos y concurrencia se exploran para IPC, HTTP y RPC. Los demás mecanismos conservan su propia semántica.</p>
            </>}
            <button className="primary-button" onClick={execute}>{chapter.id <= 1 ? "Ejecutar función" : chapter.id === 2 ? "Aplicar cambio DOM" : "Ejecutar modelo"}<Icon name="arrow" /></button>
            {chapter.id < 3 && <p className="execution-count">{executions} {executions === 1 ? "ejecución real" : "ejecuciones reales"} en este capítulo · replay no incrementa este contador</p>}
          </div></section>
          <APIAnatomy mode={mode} onMode={chooseMode} capture={state.capture} dom={chapter.id === 2} />
        </div>
        <div className="operation-notice" role="status">{notice}</div>
        {state.capture.events.some(entry => entry.lane === "B") && <ConcurrentTrace capture={state.capture} cursor={state.cursor} onSelect={cursor => dispatch({ type: "seek", cursor })} />}
        <section className="panel runtime-panel" aria-label="Estado de ejecución conceptual"><div className="panel-heading"><span className="overline">PASO {state.cursor + 1} / {selected.action}</span><span className="pill">{selected.provenance === "observed" ? "Evento observado" : "Evento conceptual"}</span></div>{selected.snapshot ? <div className="runtime-grid"><div><span className="overline">CALL STACK CONCEPTUAL · TOPE ARRIBA</span><ol className="stack-frames">{[...selected.snapshot.stack].reverse().map((frame, i) => <li key={i} className={i === 0 ? "frame-active" : ""}><code>{frame}</code><small>{i === 0 ? "Control activo" : "Espera retorno"}</small></li>)}</ol></div><div><span className="overline">MEMORIA LÓGICA · SIN DIRECCIONES FÍSICAS</span><dl className="memory-values">{Object.entries(selected.snapshot.memory).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{JSON.stringify(value)}</dd></div>)}</dl></div></div> : <p className="runtime-empty">{selected.action}. Inspecciona input, output y dependencias. Este evento no proporciona un snapshot de pila.</p>}<p className="model-disclaimer">La pila y la memoria se reconstruyen como modelo docente. No son una captura interna del motor JavaScript.</p></section>
        <TracePlayer state={state} dispatch={dispatch} depth={progress.depth} onDepth={depth => persist({ ...progress, depth })} codeNote="Código local ejecutable en src/lib/learning.ts y src/components/foundations-lab.tsx. Los fragmentos de infraestructura son modelos, no llamadas reales." />
        <section className="panel chapter-reading" aria-labelledby="chapter-title"><span className="overline">CAPÍTULO {chapter.id} / EL MECANISMO</span><h2 id="chapter-title">{chapter.title}</h2><p>{chapter.mechanism}</p><div className="concept-grid">{chapter.concepts.map(([name, explanation]) => <details key={name}><summary>{name}</summary><p>{explanation}</p></details>)}</div><div className="reasoning-grid"><div><h3>Qué decisión implica</h3><p>{chapter.tradeoffs}</p></div><div><h3>Otra forma de resolverlo</h3><p>{chapter.alternative}</p></div><div><h3>Dónde termina el modelo</h3><p>{chapter.limits}</p></div><div><h3>Un error que conviene detectar</h3><p>{chapter.misconception}</p></div></div><pre><code>{chapter.code}</code></pre></section>
        {chapter.id === 2 && <section className="panel api-examples" aria-label="APIs que no son necesariamente remotas"><div className="panel-heading"><span className="overline">EXPLORADOR DE SUPERFICIES</span><span className="pill">Ejemplos ilustrativos</span></div><div className="examples-layout"><div className="example-options" role="group" aria-label="Ejemplo de API">{apiExamples.map((item, i) => <button key={item.name} aria-pressed={example === i} onClick={() => setExample(i)}>{item.name}</button>)}</div><div className="example-detail"><span className="overline">{apiExamples[example].boundary}</span><h3>{apiExamples[example].name}</h3><p>{apiExamples[example].explanation}</p><pre><code>{apiExamples[example].code}</code></pre><p>{apiExamples[example].limit}</p><small>Este fragmento se explica, no se ejecuta. El experimento DOM de arriba sí es real.</small></div></div></section>}
        <section className="panel knowledge-check" aria-labelledby="quiz-title"><span className="overline">RAZONA, NO MEMORICES</span><h2 id="quiz-title">{chapter.quiz.question}</h2><div className="quiz-options">{chapter.quiz.options.map((option, i) => <button key={option.text} aria-pressed={answer === i} onClick={() => respond(i)}><span>{String.fromCharCode(65 + i)}</span>{option.text}</button>)}</div>{answer !== null && <p className={`quiz-feedback ${chapter.quiz.options[answer].correct ? "correct" : "incorrect"}`} role="status">{chapter.quiz.options[answer].feedback}</p>}
          <div className="practical-challenge"><span className="overline">DESAFÍO PRÁCTICO</span><p>{chapter.challenge}</p><ul><li>{currentProgress.quizPassed ? "✓" : "○"} Pregunta razonada resuelta</li>{flags[chapter.id].map(flag => <li key={flag}>{currentProgress.flags.includes(flag) ? "✓" : "○"} {flagNames[flag]}</li>)}</ul><strong className={passed ? "challenge-passed" : "muted"}>{passed ? "Capítulo completado" : "Se completa al resolver la pregunta y el desafío."}</strong></div>
        </section>
        <div className="chapter-footer"><span>Los modelos no sustituyen la ejecución real.</span>{chapter.id < 3 ? <button className="text-button" onClick={() => onChapter((chapter.id + 1) as ChapterId)}>Explorar capítulo {chapter.id + 1}<Icon name="arrow" /></button> : <Link className="text-button" prefetch={false} href="/follow-the-click">Seguir una petición HTTP real<Icon name="arrow" /></Link>}</div>
      </main>
    </div>
  </div>;
}
const flagNames: Record<string, string> = { sum42: "Resultado numérico 42, con ambos argumentos no cero", compatible: "Reducción compatible ejecutada", incompatible: "Texto incompatible detectado", "dom-first": "Primer cambio real de texto", "dom-second": "Segundo cambio real de texto", "uncertain-concurrent": "HTTP concurrente con respuesta perdida inspeccionable" };
