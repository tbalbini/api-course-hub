"use client";

import Link from "next/link";
import { useReducer, useState } from "react";
import { useSearchParams } from "next/navigation";
import { challengeCatalog, type ChallengeId } from "@/content/challenges";
import { evaluateChallenge, initialChallengeDraft, type ChallengeAttempt, type ChallengeDraft } from "@/lib/challenges";
import { awardChallenge } from "@/lib/course-progress";
import { playback, type Playback } from "@/lib/trace";
import { ContractPlayer } from "./contract-player";
import { Sidebar } from "./sidebar";
import { updateCourseProgress, useCourseProgress } from "./use-course-progress";
import { XRayToggle } from "./xray-mode";

const emptyPlayback: Playback = { capture: { id: "challenge:empty", mode: "simulation", events: [] }, cursor: 0, running: false, speed: 1 };

function ChallengeControls({ id, draft, change }: { id: ChallengeId; draft: ChallengeDraft; change: (patch: Partial<ChallengeDraft>) => void }) {
  switch (id) {
    case "architecture": return <label>Frontera elegida<select value={draft.mechanism} onChange={e => change({ mechanism: e.target.value as ChallengeDraft["mechanism"] })}><option value="function">Función en el mismo proceso</option><option value="ipc">IPC en otro proceso del equipo</option><option value="http">HTTP hacia otro equipo</option></select></label>;
    case "prediction": return <><pre><code>{'// Contrato: sumar(a: number, b: number): number\nfunction sumar(a, b) { return String(a + b); }\nsumar(19, 23);'}</code></pre><label>Retorno previsto<select value={draft.prediction} onChange={e => change({ prediction: e.target.value as ChallengeDraft["prediction"] })}><option value="number">number42, contrato válido</option><option value="string">string «42», contrato incumplido</option><option value="throws">Excepción antes del retorno</option></select></label></>;
    case "debug": return <><label>Credencial del fixture<select value={draft.credential} onChange={e => change({ credential: e.target.value as ChallengeDraft["credential"] })}><option value="none">Sin credencial</option><option value="reader">reader: puede consultar</option><option value="buyer">buyer: puede confirmar</option></select></label><label>Body JSON de PATCH<textarea rows={3} maxLength={4096} spellCheck={false} value={draft.body} onChange={e => change({ body: e.target.value })} /></label></>;
    case "interface": return <label>Interfaz para confirmar<select value={draft.interfaceId} onChange={e => change({ interfaceId: e.target.value as ChallengeDraft["interfaceId"] })}><option value="rest">REST: recurso HTTP</option><option value="jsonrpc">JSON-RPC: procedimiento</option><option value="graphql">GraphQL: mutation</option></select></label>;
    case "contract": return <><div className="challenge-bounds"><label>Cantidad mínima<input type="number" min={1} max={9} step={1} value={draft.minimum} onChange={e => change({ minimum: e.target.value })} /></label><label>Cantidad máxima<input type="number" min={1} max={9} step={1} value={draft.maximum} onChange={e => change({ maximum: e.target.value })} /></label></div><label>Forma del error<select value={draft.errorShape} onChange={e => change({ errorShape: e.target.value as ChallengeDraft["errorShape"] })}><option value="structured">JSON: code y message</option><option value="text">Texto</option></select></label></>;
    case "failure": return <><label>Estrategia de reintento<select value={draft.strategy} onChange={e => change({ strategy: e.target.value as ChallengeDraft["strategy"] })}><option value="same">Misma clave y mismo payload</option><option value="new-key">Nueva clave, mismo payload</option><option value="changed-body">Misma clave, otro payload</option></select></label><label className="challenge-toggle"><input type="checkbox" checked={draft.protection} onChange={e => change({ protection: e.target.checked })} />Deduplicación del proveedor activa</label></>;
    case "misconception": return <label>Clasificación del resultado<select value={draft.diagnosis} onChange={e => change({ diagnosis: e.target.value as ChallengeDraft["diagnosis"] })}><option value="success">Éxito HTTP, schema y negocio</option><option value="schema">Error de schema de respuesta</option><option value="business">HTTP y schema válidos, fallo de negocio</option></select></label>;
  }
}

function ChallengeExercise({ id, active, completed }: { id: ChallengeId; active: boolean; completed: boolean }) {
  const exercise = challengeCatalog.find(item => item.id === id)!;
  const [draft, setDraft] = useState<ChallengeDraft>({ ...initialChallengeDraft });
  const [attempt, setAttempt] = useState<ChallengeAttempt | null>(null), [error, setError] = useState("");
  const [state, dispatch] = useReducer(playback, emptyPlayback);
  function change(patch: Partial<ChallengeDraft>) {
    setDraft(previous => ({ ...previous, ...patch })); setAttempt(null); setError(""); dispatch({ type: "pause" });
  }
  function check() {
    setError("");
    try {
      const next = evaluateChallenge(id, draft);
      setAttempt(next); dispatch({ type: "load", capture: next.capture, autoplay: false });
      if (next.passed) updateCourseProgress(previous => awardChallenge(previous, id));
    } catch (cause) {
      setAttempt(null); dispatch({ type: "pause" });
      setError(cause instanceof Error ? cause.message : "No se pudo comprobar. Revisa los campos y vuelve a intentarlo.");
    }
  }
  return <section id={`challenge-${id}`} aria-labelledby={`challenge-heading-${id}`} hidden={!active}>
    <form className="panel lab-assessment challenge-form" noValidate onSubmit={event => { event.preventDefault(); check(); }}>
      <span className="overline">{exercise.level} / {exercise.title}</span><h2 id={`challenge-heading-${id}`}>{exercise.question}</h2><p>{exercise.task}</p>
      <fieldset className="challenge-operation" aria-invalid={error ? true : undefined} aria-describedby={error ? `challenge-error-${id}` : undefined}><legend>1. Decide qué ejecutar o predecir</legend><ChallengeControls id={id} draft={draft} change={change} /></fieldset>
      <fieldset><legend>2. {exercise.cause}</legend>{exercise.answers.map((answer, index) => <label key={index}><input type="radio" name={`cause-${id}`} checked={draft.answer === index} onChange={() => change({ answer: index })} />{answer.text}</label>)}</fieldset>
      <button className="primary-button" type="submit">Comprobar intento</button>
      <p className="muted">Se requieren resultado operativo y causa correctos en el mismo intento. Puedes reintentar sin límite. {completed ? "Logro ya guardado; practicar de nuevo lo conserva." : "Visitar, seleccionar o reproducir no acredita."}</p>
      {error && <p id={`challenge-error-${id}`} className="error-detail" role="alert">{error} Corrige el formulario y comprueba de nuevo. Este intento no acredita.</p>}
      {attempt && <div className="challenge-feedback" role="status"><h3>{attempt.passed ? "Desafío completado" : "Intento por revisar"}</h3><p><strong>Resultado operativo: {attempt.operational ? "correcto" : "por corregir"}.</strong> {attempt.summary}</p><p><strong>Explicación causal: {attempt.causal ? "correcta" : "por corregir"}.</strong> {draft.answer === null ? "Selecciona una explicación y comprueba de nuevo." : exercise.answers[draft.answer].feedback}</p><p><strong>Otra opción razonable.</strong> {exercise.alternative}</p></div>}
      <Link className="challenge-lab-link" href={exercise.href}>Practicar en el laboratorio asociado →</Link>
    </form>
    {attempt && <><section className="panel event-controls"><h2>Resultado final del intento</h2><p>Snapshot final, separado del paso seleccionado en el inspector.</p>{attempt.fixtures && <div className="table-scroll"><table><caption>Casos del contrato diseñado</caption><thead><tr><th>Cantidad</th><th>HTTP</th><th>Schema de respuesta</th><th>Pedido correcto</th></tr></thead><tbody>{attempt.fixtures.map(fixture => <tr key={fixture.quantity}><th scope="row">{fixture.quantity}</th><td>{fixture.status}</td><td>{fixture.schemaOk ? "Válido" : "Inválido"}</td><td>{fixture.status === 201 ? fixture.businessOk ? "Sí" : "No" : "No creado"}</td></tr>)}</tbody></table></div>}<pre><code>{JSON.stringify(attempt.details, null, 2)}</code></pre>{id === "contract" && <p>La tabla muestra los cuatro fixtures; el inspector reproduce el de cantidad 5.</p>}{id === "debug" && <p>submittedBody conserva tu JSON. La traza usa los fixtures de acceso: cualquier body rechazado se representa como {"{status: inventado}"}; no es una captura del texto enviado por HTTP.</p>}</section><ContractPlayer active={active} state={state} dispatch={dispatch} label={id === "prediction" ? "Suma JavaScript local ejecutada · pila y memoria conceptuales" : "Simulación ejecutable · sin HTTP ni infraestructura real"} codeNote={id === "prediction" ? "El retorno y la comprobación se ejecutan en JavaScript local. Pila y memoria son una representación conceptual; reproducir no vuelve a llamar sumar." : "Código representativo de los modelos existentes. Las rutas no están desplegadas. Reproducir solo observa esta captura, sin volver a ejecutar operaciones ni acreditar logros."} /></>}
  </section>;
}

export function ChallengesLab() {
  const requested = useSearchParams().get("challenge"), selected = challengeCatalog.find(item => item.id === requested)?.id ?? "architecture";
  const progress = useCourseProgress();
  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar a los desafíos</a><Sidebar active="challenges" /><div className="main-shell"><header className="topbar"><span className="breadcrumb">Tu recorrido <span>/</span><strong>Desafíos</strong></span><span className="pill">Decide, observa y explica</span><XRayToggle /></header><main id="experiment" tabIndex={-1}>
    <div className="page-heading"><div><span className="overline">SIETE FORMATOS / TRES NIVELES</span><h1>Demuestra lo que<br />puedes explicar<span>.</span></h1><p>Resuelve una operación, sigue su traza y explica la causa. Del mismo proceso a una escritura cuya respuesta se pierde.</p></div></div>
    <section className="panel course-hero" aria-labelledby="challenge-progress"><div><h2 id="challenge-progress">{progress.challenges.length} de 7 desafíos completados</h2><progress value={progress.challenges.length} max={7} aria-label="Progreso de desafíos" /><p>Dos criterios transparentes: resultado operativo y explicación causal. Ambos deben ser correctos en el mismo intento.</p><p className="muted">Solo se guardan identificadores completados. Formularios, respuestas y capturas viven en esta pantalla; recargar los descarta. Los capítulos conservan su propio progreso.</p></div><Link className="secondary-button" href="/course">Ver mi recorrido</Link></section>
    <nav className="challenge-catalog" aria-label="Catálogo de desafíos">{challengeCatalog.map((exercise, index) => <button className={`panel challenge-card ${selected === exercise.id ? "challenge-selected" : ""}`} key={exercise.id} aria-pressed={selected === exercise.id} aria-controls={`challenge-${exercise.id}`} onClick={() => window.history.pushState(null, "", `/challenges?challenge=${exercise.id}`)}><span className="overline">0{index + 1} / {exercise.level}</span><strong>{exercise.title}</strong><span>{progress.challenges.includes(exercise.id) ? "Completado" : "Por resolver"}</span></button>)}</nav>
    {challengeCatalog.map(exercise => <ChallengeExercise key={exercise.id} id={exercise.id} active={selected === exercise.id} completed={progress.challenges.includes(exercise.id)} />)}
    <footer>Un resultado observado y una causa comprobada. Cada logro corresponde a estos fixtures.</footer>
  </main></div></div>;
}
