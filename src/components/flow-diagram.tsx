import { Actor, Capture, TraceEvent } from "@/lib/trace";

const nodes: { actor: Actor; x: number; y: number; label: string; detail: string; symbol: string }[] = [
  { actor: "user", x: 55, y: 88, label: "Usuario", detail: "Inicia una acción", symbol: "01" },
  { actor: "browser", x: 245, y: 88, label: "Navegador", detail: "JavaScript + React", symbol: "02" },
  { actor: "http", x: 435, y: 88, label: "Comunicación", detail: "Red + infraestructura", symbol: "03" },
  { actor: "server", x: 435, y: 248, label: "Servidor", detail: "Next.js · otro proceso", symbol: "04" },
  { actor: "store", x: 245, y: 248, label: "Memoria", detail: "Map · sin disco", symbol: "05" },
];

export function FlowDiagram({ capture, selected, onSelect }: { capture: Capture; selected: TraceEvent; onSelect: (index: number) => void }) {
  const local = capture.mode === "local";
  const overviewActor = (actor: Actor) => ["resolver", "transport", "proxy", "balancer"].includes(actor) ? "http" : actor;
  return <figure className="diagram-figure">
    <svg viewBox={local ? "0 0 640 225" : "0 0 640 390"} className="flow-svg" role="group" aria-label={local ? "Operación dentro del navegador, sin red" : "Usuario, navegador, HTTP, servidor y memoria temporal"}>
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.8" className="grid-dot" /></pattern>
        <marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" className="arrow-head" /></marker>
      </defs>
      <rect width="640" height="390" fill="url(#grid)" />
      <rect x="225" y="38" width="174" height="142" rx="12" className="process-boundary" />
      <text x="238" y="58" className="boundary-label">PROCESO DEL NAVEGADOR</text>
      {!local && <><rect x="225" y="223" width="364" height="132" rx="12" className="process-boundary" /><text x="238" y="343" className="boundary-label">PROCESO DEL SERVIDOR · MEMORIA COMPARTIDA</text><path d="M435 199H586" className="network-boundary" /><text x="442" y="214" className="boundary-label">FRONTERA HTTP</text></>}
      <path d="M189 120H242" className="flow-line" markerEnd="url(#arrow)" />
      {!local && <><path d="M379 120H432" className="flow-line" markerEnd="url(#arrow)" /><path d="M502 153V245" className="flow-line network-line" markerEnd="url(#arrow)" /><path d="M435 280H382" className="flow-line" markerEnd="url(#arrow)" /></>}
      {local && <text x="245" y="205" className="local-caption">Estado → renderizado. Ninguna petición HTTP.</text>}
      {(local ? nodes.slice(0, 2) : nodes).map(node => {
        const index = capture.events.findIndex(entry => overviewActor(entry.actor) === node.actor);
        return <g key={node.actor} role="button" tabIndex={index < 0 ? -1 : 0} aria-label={`Inspeccionar ${node.label}`} aria-disabled={index < 0} onClick={() => { if (index >= 0) onSelect(index); }} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && index >= 0) { e.preventDefault(); onSelect(index); } }} className={`flow-node actor-${node.actor} ${overviewActor(selected.actor) === node.actor ? "selected" : ""}`}>
          <rect x={node.x} y={node.y} width="134" height="66" rx="8" />
          <text x={node.x + 12} y={node.y + 22} className="node-number">{node.symbol}</text>
          <text x={node.x + 38} y={node.y + 23} className="node-name">{node.label}</text>
          <text x={node.x + 12} y={node.y + 46} className="node-detail">{node.detail}</text>
          {overviewActor(selected.actor) === node.actor && <circle cx={node.x + 122} cy={node.y + 12} r="3" className="node-indicator" />}
        </g>;
      })}
      {!local && <text x="56" y="285" className="diagram-note"><tspan x="56">Contrato estable.</tspan><tspan x="56" dy="19">Implementación</tspan><tspan x="56" dy="19">inspeccionable.</tspan></text>}
    </svg>
    <figcaption>{local ? "Ejecución local real" : capture.mode === "real" ? "Topología explicativa de esta app. Las flechas no son paquetes capturados." : "Simulación pedagógica. Ningún mensaje de esta captura viaja por la red."}</figcaption>
  </figure>;
}
