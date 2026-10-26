"use client";

import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { credentialProfiles, securityNotes, securityQuiz } from "@/content/security";
import { AccessLab, BrowserPolicyLab, CredentialLab, type SecurityGoal } from "./security-models";
import { OrderConsole } from "./order-console";
import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import { useChapterProgress } from "./use-course-progress";

const tabs = [{ id: "access", name: "Acceso", detail: "Identidad y permisos" }, { id: "browser", name: "CORS y CSRF", detail: "Envío, efecto y lectura" }, { id: "credentials", name: "Credenciales", detail: "Claves, sesiones y tokens" }, { id: "real", name: "HTTP real", detail: "Permisos observados" }, { id: "chapter", name: "Capítulo 8", detail: "Razona sobre confianza" }] as const;

export function SecurityLab() {
  const requested = useSearchParams().get("tab");
  const tab = tabs.find(item => item.id === requested)?.id ?? "access";
  const setTab = (id: string) => window.history.replaceState(null, "", `/security?tab=${id}`);
  const { goals, setGoals, quizPassed, check } = useChapterProgress(8);
  const [answer, setAnswer] = useState(""); const [checked, setChecked] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const chosen = securityQuiz.options.find(option => option.id === answer);
  const complete = Object.values(goals).every(Boolean) && (quizPassed || checked && answer === "effect");
  function observed(goal: SecurityGoal) { setGoals(previous => previous[goal] ? previous : { ...previous, [goal]: true }); }
  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="security" /><div className="main-shell"><header className="topbar"><span className="breadcrumb">API Universe <span>/</span><strong>Seguridad y acceso</strong></span><span className="pill">Identidad ≠ permiso</span><XRayToggle /></header><main id="experiment" tabIndex={-1}><div className="page-heading"><div><span className="overline">CAPÍTULO 08 / LABORATORIO H</span><h1>Acceso bajo control<span>.</span></h1><p>¿Quién solicita una capacidad, quién la permite y quién puede observar el resultado?</p></div></div><div className="playground-tabs security-tabs" role="tablist" aria-label="Laboratorios de seguridad">{tabs.map((item, index) => <button key={item.id} role="tab" id={`security-tab-${item.id}`} aria-controls={`security-panel-${item.id}`} aria-selected={tab === item.id} tabIndex={tab === item.id ? 0 : -1} ref={element => { refs.current[index] = element; }} onClick={() => setTab(item.id)} onKeyDown={e => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault(); setTab(tabs[next].id); refs.current[next]?.focus();
  }}><strong>{item.name}</strong><span>{item.detail}</span></button>)}</div>
    <div role="tabpanel" id="security-panel-access" aria-labelledby="security-tab-access" hidden={tab !== "access"}><AccessLab active={tab === "access"} /></div>
    <div role="tabpanel" id="security-panel-browser" aria-labelledby="security-tab-browser" hidden={tab !== "browser"}><BrowserPolicyLab active={tab === "browser"} onObserved={observed} /></div>
    <div role="tabpanel" id="security-panel-credentials" aria-labelledby="security-tab-credentials" hidden={tab !== "credentials"}><CredentialLab active={tab === "credentials"} /></div>
    <div role="tabpanel" id="security-panel-real" aria-labelledby="security-tab-real" hidden={tab !== "real"}><div className="learning-note"><span className="note-symbol">?</span><p>¿Qué permite un servidor con credenciales válidas pero permisos distintos?<br /><strong>Compara ausencia de credencial, lector y comprador en HTTP real.</strong></p></div><OrderConsole active={tab === "real"} onOutcome={({ status }) => { if (status === 401) observed("real401"); if (status === 403) observed("real403"); }} /></div>
    <div role="tabpanel" id="security-panel-chapter" aria-labelledby="security-tab-chapter" hidden={tab !== "chapter"}><section className="panel event-chapter"><span className="overline">CAPÍTULO 08 / FRONTERAS DE CONFIANZA</span><h2>¿Por qué no basta con conocer la URL?</h2><div className="reasoning-grid">{securityNotes.map(note => <div key={note.title}><h3>{note.title}</h3><p>{note.text}</p></div>)}</div><div className="table-scroll" role="region" aria-label="Responsabilidades de credenciales" tabIndex={0}><table><thead><tr><th>Mecanismo</th><th>Responsabilidad</th><th>Contrato</th><th>Límite</th></tr></thead><tbody>{Object.values(credentialProfiles).map(profile => <tr key={profile.name}><th scope="row">{profile.name}</th><td>{profile.category}</td><td>{profile.contract}</td><td>{profile.limit}</td></tr>)}</tbody></table></div><div className="http-response-columns event-code-pair"><div><h3>Validar antes de autorizar</h3><pre>{credentialProfiles.jwt.code}</pre></div><div><h3>Sesión y defensa de escritura</h3><pre>{'const session = requireSession(cookie.sid);\nverifyCsrfToken(body.csrf, session);\nrequirePermission(session.user, "orders:confirm");\nvalidateBody(body);\nconfirmOrder(order);'}</pre></div></div><div className="learning-note"><span className="note-symbol">!</span><p>Error frecuente: “tiene JWT, por tanto está autorizado”. Leer claims no prueba integridad; una firma válida no garantiza audiencia, vigencia ni permiso para esta operación. OAuth, JWT y API key resuelven problemas diferentes.</p></div></section><section className="panel lab-assessment"><span className="overline">EXPLICA EL MECANISMO</span><h2>{securityQuiz.question}</h2><fieldset><legend>Elige una explicación causal</legend>{securityQuiz.options.map(option => <label key={option.id}><input type="radio" name="security-answer" checked={answer === option.id} onChange={() => { setAnswer(option.id); setChecked(false); }} />{option.label}</label>)}</fieldset><button className="secondary-button" disabled={!chosen} onClick={() => { setChecked(true); check(answer === "effect"); }}>Comprobar seguridad</button>{checked && <p className="operation-notice" role="status">{chosen?.feedback}</p>}<div className="lab-challenge"><h3>Desafío: permiso y observación</h3><p>Demuestra qué componente impide cada operación y qué información puede conocer el cliente.</p><ul>{([['real401', 'Obtener401 en la consola HTTP real'], ['real403', 'Obtener403 con lector en HTTP real'], ['hiddenEffect', 'POST de navegador con efecto aplicado pero sin lectura CORS'], ['csrfReject', 'Servidor rechaza el POST por falta de token CSRF']] as const).map(([id, label]) => <li key={id}><span>{goals[id] ? "✓" : "○"}</span>{label} · {goals[id] ? "observado" : "pendiente"}</li>)}</ul><p className="operation-notice" role="status">{complete ? "Exploración completa: cuatro actividades y razonamiento comprobados." : "Completa las cuatro actividades y comprueba la explicación correcta."}</p><p className="muted">Logros locales, sin cambiar el progreso de capítulos 0 a 3. No introduzcas secretos reales. Las credenciales públicas no protegen datos privados y los modelos no acreditan seguridad de producción.</p></div></section></div>
    </main><footer>Reconocer una identidad no concede todas sus capacidades.</footer></div></div>;
}
