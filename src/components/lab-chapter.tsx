"use client";

import { useState } from "react";
import { chapterQuizzes, httpNotes, methodLessons, networkNotes } from "@/content/http";
import { useChapterProgress } from "./use-course-progress";

export function LabChapter({ kind, activities }: { kind: "http" | "network"; activities: { label: string; complete: boolean }[] }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const { quizPassed, check } = useChapterProgress(kind === "http" ? 5 : 4);
  const quiz = chapterQuizzes[kind];
  const option = quiz.options.find(item => item.id === answer);
  const passed = (quizPassed || checked && answer === quiz.correct) && activities.every(item => item.complete);
  return <>
    <section className="panel lab-chapter" aria-labelledby={`${kind}-chapter-heading`}><span className="overline">CAPÍTULO {kind === "http" ? "05 / ANATOMÍA DEL MENSAJE" : "04 / DE UN PROCESO A OTRA COMPUTADORA"}</span><h2 id={`${kind}-chapter-heading`}>{kind === "http" ? "Una petición expresa una intención" : "Un mensaje necesita un camino"}</h2><div className="reasoning-grid">{(kind === "http" ? httpNotes : networkNotes).map(note => <div key={note.title}><h3>{note.title}</h3><p>{note.text}</p></div>)}</div>
      <div className="code-caption">Código representativo · {kind === "http" ? "el editor sí ejecuta fetch" : "pseudocódigo de transporte, no se ejecuta un socket"}</div><pre><code>{kind === "http" ? 'const response = await fetch(url, { method, headers, body });\n// No asumas que un 4xx o 5xx rechaza la promesa.\nconst raw = await response.text();\n// 304 no incluye body; valida el tipo antes de parsear JSON.' : 'const address = await resolveIfNeeded(host);\nconst channel = await connectIfNeeded(address, protocol);\nawait channel.send(encodedMessage);\n// Deadline del cliente ≠ prueba de cancelación del proveedor.'}</code></pre>
      {kind === "http" && <div className="table-scroll" role="region" aria-label="Semántica de métodos HTTP" tabIndex={0}><table><thead><tr><th>Método</th><th>Semántica</th><th>Safety e idempotencia</th></tr></thead><tbody>{methodLessons.map(item => <tr key={item.method}><th scope="row">{item.method}</th><td>{item.meaning}<p>{item.caveat}</p></td><td>Safe: {item.safe ? "sí" : "no"}.<br />Idempotente: {item.idempotent}.</td></tr>)}</tbody></table></div>}
      <div className="learning-note"><span className="note-symbol">!</span><p>{kind === "http" ? "Error frecuente: Content-Type y Accept significan lo mismo. Uno describe el body enviado; el otro expresa qué respuesta admite el consumidor." : "Error frecuente: HTTP/3 usa UDP, por eso pierde datos sin recuperación. QUIC construye garantías adicionales sobre UDP; analiza toda la pila."}</p></div>
    </section>
    <section className="panel lab-assessment" aria-labelledby={`${kind}-quiz-heading`}><span className="overline">COMPRUEBA EL MECANISMO</span><h2 id={`${kind}-quiz-heading`}>{quiz.question}</h2><fieldset><legend>Elige una explicación</legend>{quiz.options.map(item => <label key={item.id}><input type="radio" name={`${kind}-answer`} checked={answer === item.id} onChange={() => { setAnswer(item.id); setChecked(false); }} />{item.label}</label>)}</fieldset><button className="secondary-button" disabled={!option} onClick={() => { setChecked(true); check(answer === quiz.correct); }}>Comprobar {kind === "http" ? "HTTP" : "red"}</button>{checked && <p className="operation-notice" role="status">{option?.feedback}</p>}<div className="lab-challenge"><h3>Desafío práctico</h3><p>{kind === "http" ? "Negocia dos representaciones y revalida una de ellas. Un cambio de formato produce otro ETag; el 304 no trae un body nuevo." : "Compara qué llega al perder una unidad en HTTP/3 y en UDP directo. Explica qué capa recupera la información."}</p><ul>{activities.map(activity => <li key={activity.label}><span>{activity.complete ? "✓" : "○"}</span>{activity.label} · {activity.complete ? "observado" : "pendiente"}</li>)}</ul><p role="status">{passed ? "Exploración completa: actividad y razonamiento comprobados en esta sesión." : "Completa las actividades y comprueba la explicación correcta."}</p><p className="muted">Logros de sesión; no alteran el progreso de capítulos 0 a 3 ni certifican comprensión.</p></div></section>
  </>;
}
