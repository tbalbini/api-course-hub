"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { communicationProfiles, deliveryProfiles, eventNotes, eventsQuiz } from "@/content/events";
import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import { useChapterProgress } from "./use-course-progress";
import { CommunicationLab, DeliveryLab, type EventGoal } from "./event-models";
import { SSEDemo } from "./sse-demo";

const tabs = [{ id: "communication", name: "Comunicación", detail: "F / Chat y actualizaciones" }, { id: "delivery", name: "Entregas", detail: "G / Webhook y brokers" }, { id: "sse", name: "SSE real", detail: "HTTP / Eventos observados" }, { id: "chapter", name: "Capítulo 7", detail: "Razona sobre garantías" }] as const;

export function EventsLab() {
  const requestedTab = useSearchParams().get("tab");
  const tab = tabs.find(item => item.id === requestedTab)?.id ?? "communication";
  function setTab(id: string) { window.history.replaceState(null, "", `/events?tab=${id}`); }
  const { goals, setGoals, quizPassed, check } = useChapterProgress(7);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chosen = eventsQuiz.options.find(option => option.id === answer);
  const completed = Object.values(goals).every(Boolean) && (quizPassed || checked && answer === "duplicate");
  const profiles = [...Object.values(communicationProfiles), ...Object.values(deliveryProfiles)];
  function observed(goal: EventGoal) { setGoals(previous => previous[goal] ? previous : { ...previous, [goal]: true }); }
  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="events" /><div className="main-shell"><header className="topbar"><span className="breadcrumb">API Universe <span>/</span><strong>Comunicación y eventos</strong></span><span className="pill">Entrega ≠ procesamiento</span><XRayToggle /></header><main id="experiment" tabIndex={-1}><div className="page-heading"><div><span className="overline">CAPÍTULO 07 / LABORATORIOS F Y G</span><h1>Después de enviar<span>.</span></h1><p>Recibir un mensaje, aplicar su efecto y confirmar son hechos distintos. Haz visibles sus fronteras.</p></div></div><div className="playground-tabs" role="tablist" aria-label="Laboratorios de eventos">{tabs.map((item, index) => <button key={item.id} role="tab" id={`event-tab-${item.id}`} aria-controls={`event-panel-${item.id}`} aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} ref={element => { tabRefs.current[index] = element; }} onClick={() => setTab(item.id)} onKeyDown={e => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault(); setTab(tabs[next].id); tabRefs.current[next]?.focus();
  }}><strong>{item.name}</strong><span>{item.detail}</span></button>)}</div>
    <div role="tabpanel" id="event-panel-communication" aria-labelledby="event-tab-communication" hidden={tab !== "communication"}><CommunicationLab active={tab === "communication"} onObserved={observed} /></div>
    <div role="tabpanel" id="event-panel-delivery" aria-labelledby="event-tab-delivery" hidden={tab !== "delivery"}><DeliveryLab active={tab === "delivery"} onObserved={observed} /></div>
    <div role="tabpanel" id="event-panel-sse" aria-labelledby="event-tab-sse" hidden={tab !== "sse"}><SSEDemo active={tab === "sse"} /></div>
    <div role="tabpanel" id="event-panel-chapter" aria-labelledby="event-tab-chapter" hidden={tab !== "chapter"}><div className="learning-note"><span className="note-symbol">?</span><p>¿Puede un efecto existir aunque su emisor no haya recibido éxito?<br /><strong>Razonar sobre garantías exige identificar qué confirma cada mensaje.</strong></p></div><section className="panel event-chapter"><span className="overline">CAPÍTULO 07 / DE RESPUESTAS A EVENTOS</span><h2>Diseña qué puede saber cada componente</h2><div className="reasoning-grid">{eventNotes.map(note => <div key={note.title}><h3>{note.title}</h3><p>{note.text}</p></div>)}</div><div className="table-scroll" role="region" aria-label="Comparación de comunicación y entrega" tabIndex={0}><table><thead><tr><th>Mecanismo</th><th>Dirección y duración</th><th>Acoplamiento y límites</th></tr></thead><tbody>{profiles.map(profile => <tr key={profile.name}><th scope="row">{profile.name}</th><td>{profile.direction}<p>{profile.lifetime}</p></td><td>{profile.coupling}<p>{profile.limit}</p></td></tr>)}</tbody></table></div><div className="http-response-columns event-code-pair"><div><h3>Comando separado de SSE</h3><pre>{communicationProfiles.sse.code}</pre></div><div><h3>Id estable y efecto atómico del modelo</h3><pre>{deliveryProfiles.webhook.code}</pre></div></div><div className="learning-note"><span className="note-symbol">!</span><p>Error frecuente: un webhook es una conexión WebSocket. Un webhook es un callback remoto, normalmente una petición HTTP entre servidores; WebSocket es un canal bidireccional persistente.</p></div></section><section className="panel lab-assessment"><span className="overline">EXPLICA LA CAUSA</span><h2>{eventsQuiz.question}</h2><fieldset><legend>Elige una explicación</legend>{eventsQuiz.options.map(option => <label key={option.id}><input type="radio" name="events-answer" checked={answer === option.id} onChange={() => { setAnswer(option.id); setChecked(false); }} />{option.label}</label>)}</fieldset><button className="secondary-button" disabled={!chosen} onClick={() => { setChecked(true); check(answer === "duplicate"); }}>Comprobar garantías</button>{checked && <p className="operation-notice" role="status">{chosen?.feedback}</p>}<div className="lab-challenge"><h3>Desafío: perder una confirmación</h3><p>Identifica quién recibe, quién procesa y quién sigue sin conocer el resultado.</p><ul><li><span>{goals.sseCommand ? "✓" : "○"}</span>Enviar un mensaje con SSE y observar POST separado · {goals.sseCommand ? "observado" : "pendiente"}</li><li><span>{goals.webhookDedupe ? "✓" : "○"}</span>Webhook con confirmación perdida y deduplicación activa · {goals.webhookDedupe ? "observado" : "pendiente"}</li><li><span>{goals.pubsubLag ? "✓" : "○"}</span>Pub/sub con revisión2 primero y agotamiento de Pedidos, dejando Analítica adelantada · {goals.pubsubLag ? "observado" : "pendiente"}</li></ul><p className="operation-notice" role="status">{completed ? "Exploración completa: garantías y actividades comprobadas en esta sesión." : "Completa las tres actividades y comprueba la explicación correcta."}</p><p className="muted">Logros guardados en este dispositivo cuando el almacenamiento está disponible. No modifican el progreso de capítulos 0 a 3 ni certifican aprendizaje. Pagos y entregas son modelos; solo la pestaña SSE real abre un transporte real.</p></div></section></div>
    </main><footer>Un hecho de negocio puede sobrevivir a una confirmación perdida.</footer></div></div>;
}
