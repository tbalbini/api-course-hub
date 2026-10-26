import type { Capture } from "@/lib/trace";

export function ConcurrentTrace({ capture, cursor, onSelect, heading = "DOS INVOCACIONES · DOS CADENAS" }: { capture: Capture; cursor: number; onSelect: (index: number) => void; heading?: string }) {
  return <section className="panel concurrent-trace" aria-label="Cadenas concurrentes A y B"><div className="panel-heading"><span className="overline">{heading}</span><span className="pill">Tiempo lógico</span></div>
    <p>Las líneas conectan dependencias dentro de cada rama. No existe una dependencia entre A y B. Inspeccionar primero A no obliga a que B espere.</p>
    {(["A", "B"] as const).map(lane => <div className="concurrent-lane" key={lane}><strong>Rama {lane}</strong><div className="lane-events">{capture.events.map((entry, index) => ({ entry, index })).filter(({ entry }) => entry.lane === lane).map(({ entry, index }) => <button key={entry.id} aria-label={`Rama ${lane}, tiempo ${entry.logicalTime}: ${entry.action}`} aria-current={index === cursor ? "step" : undefined} className={entry.state === "error" ? "lane-error" : ""} onClick={() => onSelect(index)}><small>t {entry.logicalTime}</small><span>{entry.action.replace(/^[AB] · /, "")}</span><em>{entry.state === "error" ? entry.error?.code : "Modelo"}</em></button>)}</div></div>)}
  </section>;
}
