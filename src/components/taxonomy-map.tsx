import { axes, categories, type AxisId, type Technology } from "@/content/taxonomy";
import { dimensions } from "@/lib/taxonomy";

export function TaxonomyMap({ technology, activeAxis, onAxis }: { technology: Technology; activeAxis: AxisId; onAxis: (axis: AxisId) => void }) {
  return <figure className="taxonomy-map"><svg viewBox="0 0 800 450" role="group" aria-label={`Mapa de seis dimensiones de ${technology.name}`}>
    <defs><pattern id="taxonomy-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="currentColor" /></pattern></defs>
    <rect width="800" height="450" fill="url(#taxonomy-grid)" className="taxonomy-grid" />
    {axes.map((axis, i) => {
      const left = i < 3;
      const x = left ? 22 : 562;
      const y = 35 + (i % 3) * 140;
      const values = dimensions(technology, axis.id);
      return <g key={axis.id}><path d={`M${left ? 238 : 562} ${y + 48} C${left ? 290 : 510} ${y + 48} ${left ? 280 : 520} 225 ${left ? 298 : 502} 225`} className={`taxonomy-spoke ${values.defined.length ? "spoke-defined" : values.possible.length ? "spoke-possible" : ""}`} />
        <g role="button" tabIndex={0} aria-label={`Explorar eje ${axis.letter}: ${axis.title}`} aria-pressed={activeAxis === axis.id} onClick={() => onAxis(axis.id)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAxis(axis.id); } }} className={`taxonomy-axis ${activeAxis === axis.id ? "axis-active" : ""}`}>
          <rect x={x} y={y} width="216" height="96" rx="8" /><text x={x + 16} y={y + 24} className="axis-letter">{axis.letter} / DIMENSIÓN INDEPENDIENTE</text><text x={x + 16} y={y + 49} className="axis-title">{axis.title}</text><text x={x + 16} y={y + 74} className="axis-count">Define {values.defined.length} · Usos posibles {values.possible.length}</text>
        </g></g>;
    })}
    <g className="taxonomy-center"><rect x="298" y="171" width="204" height="108" rx="12" /><text x="400" y="195" textAnchor="middle">SELECCIÓN</text><foreignObject x="308" y="207" width="184" height="60"><div className="map-technology-name">{technology.name}<small>{categories[technology.category]}</small></div></foreignObject></g>
  </svg><figcaption>Las líneas son asociaciones conceptuales, no conexiones de red. Verde: rasgo definido. Violeta: uso posible. El detalle textual conserva toda la información.</figcaption></figure>;
}
