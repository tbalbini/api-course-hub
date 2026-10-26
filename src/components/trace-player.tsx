"use client";

import { useEffect, useId, useState, type Dispatch } from "react";
import type { Depth, Playback, PlaybackAction } from "@/lib/trace";
import { Icon } from "./icon";
import { useCourseDepth } from "./use-course-progress";
import { useXRay } from "./xray-mode";
import { referenceForStage } from "@/lib/reference-target";

export const actorNames = { user: "Usuario", browser: "Navegador", http: "HTTP", server: "Servidor", store: "Almacenamiento", resolver: "Resolver DNS", transport: "Transporte", proxy: "Reverse proxy", balancer: "Balanceador", provider: "Proveedor" };
const depths: { value: Depth; title: string; description: string }[] = [{ value: "intuition", title: "Intuition", description: "Comprende la causa" }, { value: "engineering", title: "Engineering", description: "Inspecciona el contrato" }, { value: "internals", title: "Internals", description: "Explora los límites" }];
const json = (value: unknown) => JSON.stringify(value ?? null, null, 2);

export function TracePlayer({ state, dispatch, onDepth, codeNote = "El endpoint ejecutable está en src/app/api/orders/route.ts. Almacenamiento real en memoria, sin SQL." }: { state: Playback; dispatch: Dispatch<PlaybackAction>; depth: Depth; onDepth: (depth: Depth) => void; codeNote?: string }) {
  const { enabled: xray } = useXRay();
  const [depth, saveDepth] = useCourseDepth();
  function setDepth(next: Depth) { saveDepth(next); onDepth(next); }
  const headingId = useId();
  const [panel, setPanel] = useState<"explanation" | "code" | "exchange">("explanation");
  const [inspectData, setInspectData] = useState(false);
  const { capture, cursor } = state;
  const selected = capture.events[cursor];
  useEffect(() => {
    if (!state.running || !capture.events.length) return;
    const timer = window.setTimeout(() => dispatch({ type: "next" }), 1400 / state.speed);
    return () => window.clearTimeout(timer);
  }, [state.running, state.speed, cursor, dispatch, capture.events.length]);
  if (!selected) return <section className="panel inspector"><p className="operation-notice" role="status">No hay eventos capturados. Ejecuta una operación para inspeccionarla.</p></section>;
  return <>
        <section className="panel playback-panel" aria-label="Controles de reproducción">
          <div className="playback-toolbar"><div className="transport"><button className="icon-button" onClick={() => dispatch({ type: "replay" })} aria-label="Reproducir desde el inicio"><Icon name="replay" /></button><button className="icon-button" onClick={() => dispatch({ type: "previous" })} disabled={cursor === 0} aria-label="Paso anterior"><Icon name="back" /></button><button className="play-button" onClick={() => dispatch({ type: state.running ? "pause" : "play" })} aria-label={state.running ? "Pausar" : "Reproducir"}><Icon name={state.running ? "pause" : "play"} />{state.running ? "Pausar" : "Play"}</button><button className="icon-button" onClick={() => dispatch({ type: "next" })} disabled={cursor === capture.events.length - 1} aria-label="Paso siguiente"><Icon name="next" /></button><span className="cursor-count">{String(cursor + 1).padStart(2, "0")} <span>/ {capture.events.length}</span></span></div><label className="speed-label">Velocidad<select value={state.speed} onChange={e => dispatch({ type: "speed", speed: Number(e.target.value) })}>{[0.5, 1, 2, 4].map(speed => <option key={speed} value={speed}>{speed}×</option>)}</select></label></div>
          <div className="timeline" aria-label="Timeline de eventos">{capture.events.map((entry, i) => <button key={entry.id} onClick={() => dispatch({ type: "seek", cursor: i })} aria-label={`Paso ${i + 1}: ${entry.action}`} aria-current={i === cursor ? "step" : undefined} className={`timeline-stop ${i <= cursor ? "reached" : ""} ${i === cursor ? "current" : ""} ${entry.state === "error" ? "failed" : ""}`}><span /><small>{String(i + 1).padStart(2, "0")}</small></button>)}</div>
          <div className="timeline-footer"><span>Tiempo lógico, sin unidades de latencia</span><span>{capture.measuredMs !== undefined ? `${capture.measuredMs.toFixed(1)} ms observados · fetch + parsing` : "Sin medición de red"}</span></div>
        </section>
        <section className="panel inspector" aria-labelledby={headingId} data-capture-id={capture.id} data-event-id={selected.id}>
          <div className="inspector-top"><div><div className="overline">03 / ENTIENDE LA CAUSA</div><h2 id={headingId}>Lo que sucede por dentro</h2></div><div className="depth-selector" role="group" aria-label="Profundidad">{depths.map((level, index) => <button key={level.value} aria-pressed={depth === level.value} title={level.description} onClick={() => setDepth(level.value)}><span>{index + 1}</span>{level.title}</button>)}</div></div>
          <div className="inspector-tabs" role="group" aria-label="Panel del inspector"><button aria-pressed={panel === "explanation"} onClick={() => setPanel("explanation")}>Explicación causal</button><button aria-pressed={panel === "code"} onClick={() => setPanel("code")}>Código</button><button aria-pressed={panel === "exchange"} onClick={() => setPanel("exchange")}>Request / Response</button></div>
          {panel === "explanation" && <div className="inspector-body"><div className="explanation"><span className={`actor-label actor-${selected.actor}`}>{actorNames[selected.actor]}</span><h3>{selected.action}</h3><p>{selected.explanation[depth]}</p>{selected.error && <div className="error-detail"><strong>{selected.error.code}</strong><p>{selected.error.message}</p></div>}<div className="provenance"><span className="status-dot" />{selected.provenance === "observed" ? "Evento observado por la instrumentación de esta app" : "Evento conceptual de un escenario simulado"}</div></div>{xray && <dl className="xray-metadata">
            <div><dt>Iniciador</dt><dd>{selected.interaction.initiator}</dd></div>
            <div><dt>Receptor</dt><dd>{selected.interaction.receiver}</dd></div>
            <div><dt>Tecnología</dt><dd>{selected.interaction.technology}</dd></div>
            <div><dt>Contrato</dt><dd>{selected.contract}</dd></div>
            <div><dt>Frontera</dt><dd>{selected.boundary}</dd></div>
            <div><dt>Estado del paso</dt><dd>{selected.state === "error" ? "Error en este paso" : "Paso completado"}. No determina el resultado global.</dd></div>
            <div><dt>Fallos posibles</dt><dd>{selected.interaction.possibleFailures.length ? <><span>Posibilidades declaradas, no fallos observados.</span><ul>{selected.interaction.possibleFailures.map((failure, index) => <li key={index}>{failure}</li>)}</ul></> : "Este paso no modela fallos adicionales."}</dd></div>
            <div><dt>Evento / dependencia</dt><dd>{selected.id}<br />{selected.dependencies.join(", ") || "Inicio de la traza"}</dd></div>
            <div><dt>Tiempo lógico</dt><dd>{selected.logicalTime} · {selected.provenance === "conceptual" ? "tiempo del modelo" : "orden de observación"}</dd></div>
          </dl>}</div>}
          {panel === "code" && <div className="code-panel"><div className="code-caption">Fragmento representativo del mecanismo · lenguaje según el contrato</div><pre><code>{selected.code}</code></pre><p>{codeNote}</p></div>}
          {panel === "exchange" && <div className="exchange-grid"><div><div className="code-caption">REQUEST {capture.request ? `· ${capture.request.method}` : "· ninguna petición"}</div><pre><code>{capture.request ? json(capture.request) : capture.mode === "simulation" ? "Esta captura conceptual no detalla un intercambio HTTP. Inspecciona el contrato y los datos de cada evento." : "Esta operación no envió mensajes por HTTP."}</code></pre></div><div><div className="code-caption">RESPONSE {capture.response ? `· ${capture.response.status}` : "· sin respuesta HTTP"}</div><pre><code>{capture.response ? json({ ...capture.response, body: capture.response.body && typeof capture.response.body === "object" ? Object.fromEntries(Object.entries(capture.response.body).filter(([key]) => key !== "events")) : capture.response.body }) : "No existe una respuesta HTTP en esta captura."}</code></pre></div></div>}
          {xray && <div className="data-disclosure"><button aria-expanded={inspectData} onClick={() => setInspectData(!inspectData)}>{inspectData ? "Ocultar" : "Inspeccionar"} datos de este paso <span>{inspectData ? "−" : "+"}</span></button>{inspectData && <div className="exchange-grid"><div><div className="code-caption">INPUT</div><pre>{json(selected.input)}</pre></div><div><div className="code-caption">OUTPUT</div><pre>{json(selected.output)}</pre></div></div>}</div>}
          <a className="reference-lookup" href={referenceForStage(selected.stage)} target="_blank" rel="noopener noreferrer">Consultar concepto en Referencia (otra pestaña)</a>
        </section>
  </>;
}
