"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { advancedActivities, advancedTopics, type AdvancedExperimentGoal, type AdvancedQuestionGoal } from "@/content/advanced";
import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import { useChapterProgress } from "./use-course-progress";
import { BinaryExperiment } from "./binary-experiment";
import { WireExperiment } from "./wire-experiment";
import { ToolExperiment } from "./tool-experiment";

const tabs = [{ id: "binary", name: "Binario y Wasm", detail: "Representación, vida y ejecución" }, { id: "wire", name: "Mensajes y bytes", detail: "Reconstruir antes de interpretar" }, { id: "tools", name: "Herramientas", detail: "Propuesta, permiso y efecto" }, { id: "chapter", name: "Capítulo 12", detail: "Doce fronteras conectadas" }] as const;
export function AdvancedLab() {
  const requested = useSearchParams().get("tab"), tab = tabs.find(item => item.id === requested)?.id ?? "binary";
  const setTab = (id: string) => window.history.replaceState(null, "", `/advanced?tab=${id}`);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [topicId, setTopicId] = useState("abi"), [answers, setAnswers] = useState<Partial<Record<AdvancedQuestionGoal, number>>>({});
  const [checked, setChecked] = useState<AdvancedQuestionGoal | null>(null);
  const { goals, setGoals, quizPassed, check } = useChapterProgress(12);
  const topic = advancedTopics.find(item => item.id === topicId)!, answer = answers[topic.goal];
  const questionsDone = advancedTopics.filter(item => goals[item.goal]).length, complete = Object.values(goals).every(Boolean) && quizPassed;
  function observed(goal: AdvancedExperimentGoal) { setGoals(previous => previous[goal] ? previous : { ...previous, [goal]: true }); }
  function checkTopic() {
    setChecked(topic.goal);
    if (answer !== topic.correct) return;
    setGoals(previous => ({ ...previous, [topic.goal]: true }));
    if (advancedTopics.every(item => item.goal === topic.goal || goals[item.goal])) check(true);
  }
  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="advanced" /><div className="main-shell"><header className="topbar"><span className="breadcrumb">Capítulo 12 <span>/</span><strong>Fronteras avanzadas</strong></span><span className="pill">De los bytes a las capacidades</span><XRayToggle /></header><main id="experiment" tabIndex={-1}>
    <div className="page-heading"><div><span className="overline">CAPÍTULO 12 / EL CONTRATO SIGUE IMPORTANDO</span><h1>Otras fronteras.<br />El mismo problema<span>.</span></h1><p>¿Qué cambia cuando la interfaz conecta lenguajes, módulos binarios, una base de datos o herramientas propuestas por un modelo? Rompe el acuerdo y sigue sus consecuencias.</p></div></div>
    <div className="playground-tabs advanced-tabs" role="tablist" aria-label="Fronteras avanzadas">{tabs.map((item, index) => <button key={item.id} role="tab" id={`advanced-tab-${item.id}`} aria-controls={`advanced-panel-${item.id}`} aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} ref={element => { refs.current[index] = element; }} onClick={() => setTab(item.id)} onKeyDown={e => {
      let next = index;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (e.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      else return;
      e.preventDefault(); setTab(tabs[next].id); refs.current[next]?.focus();
    }}><strong>{item.name}</strong><span>{item.detail}</span></button>)}</div>
    <div role="tabpanel" id="advanced-panel-binary" aria-labelledby="advanced-tab-binary" hidden={tab !== "binary"}><BinaryExperiment active={tab === "binary"} onObserved={observed} /></div>
    <div role="tabpanel" id="advanced-panel-wire" aria-labelledby="advanced-tab-wire" hidden={tab !== "wire"}><WireExperiment active={tab === "wire"} onObserved={observed} /></div>
    <div role="tabpanel" id="advanced-panel-tools" aria-labelledby="advanced-tab-tools" hidden={tab !== "tools"}><ToolExperiment active={tab === "tools"} onObserved={observed} /></div>
    <div role="tabpanel" id="advanced-panel-chapter" aria-labelledby="advanced-tab-chapter" hidden={tab !== "chapter"}><section className="panel event-controls advanced-topic"><span className="overline">UN MAPA PARA SEGUIR DEDUCIENDO</span><h2>Doce temas, contratos concretos</h2><label htmlFor="advanced-topic">Tema del capítulo</label><select id="advanced-topic" value={topicId} onChange={e => { setTopicId(e.target.value); setChecked(null); }}>{advancedTopics.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.title} · {goals[item.goal] ? "comprobado" : "pendiente"}</option>)}</select><h3>{topic.question}</h3><div className="reasoning-grid">{([['Por qué existe', 'why'], ['Qué es', 'what'], ['Cómo funciona', 'how'], ['Compromisos', 'tradeoffs'], ['Alternativas', 'alternatives'], ['Dónde deja de aplicar', 'boundaries']] as const).map(([label, field]) => <div key={field}><h3>{label}</h3><p>{topic[field]}</p></div>)}</div><pre><code>{topic.code}</code></pre><div className="learning-note"><span className="note-symbol">!</span><p>{topic.misconception}</p></div><button className="secondary-button" onClick={() => { setTab(topic.tab); refs.current[tabs.findIndex(item => item.id === topic.tab)]?.focus(); }}>Abrir experimento asociado</button><div className="advanced-related"><Link href="/events">Profundizar en eventos y streaming</Link><Link href="/contracts">Profundizar en evolución de contratos</Link><Link href="/systems">Profundizar en coordinación y fallos</Link></div></section>
    <section className="panel lab-assessment"><span className="overline">RAZONA SOBRE ESTA FRONTERA</span><h2>{topic.check}</h2><fieldset><legend>Elige una explicación</legend>{topic.answers.map((option, index) => <label key={`${topic.id}:${index}`}><input type="radio" name="advanced-answer" checked={answer === index} onChange={() => { setAnswers(previous => ({ ...previous, [topic.goal]: index })); setChecked(null); }} />{option.text}</label>)}</fieldset><button className="secondary-button" disabled={answer === undefined} onClick={checkTopic}>Comprobar esta frontera</button>{checked === topic.goal && answer !== undefined && <p className="operation-notice" role="status">{topic.answers[answer].feedback}</p>}<p className="operation-notice" role="status">Comprobaciones del capítulo: {questionsDone}/12. {goals[topic.goal] ? "Este tema ya tiene una explicación correcta comprobada." : "Seleccionar sin comprobar no obtiene el logro."}</p><div className="lab-challenge"><h3>Desafío: encontrar qué contrato se rompió</h3><ul>{advancedActivities.map(([id, text]) => <li key={id}><span>{goals[id] ? "✓" : "○"}</span>{text} · {goals[id] ? "observado" : "pendiente"}</li>)}</ul><p className="operation-notice" role="status">{complete ? "Capítulo completo: seis experimentos y doce explicaciones comprobados." : "Completa seis actividades y comprueba los doce temas para cerrar el capítulo."}</p><p className="muted">Se guardan logros y comprobaciones, sin datos de herramientas ni capturas. Las respuestas seleccionadas de esta sesión no sustituyen una comprobación. Reproducir no acredita actividades nuevas.</p></div></section></div>
    </main><footer>La frontera cambia. La necesidad de un contrato permanece.</footer></div></div>;
}
