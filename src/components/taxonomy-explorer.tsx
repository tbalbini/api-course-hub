"use client";

import Link from "next/link";
import { useState } from "react";
import { axes, categories, classificationExercise, exampleProfile, exerciseCategories, layers, relations, technologies, type AxisId } from "@/content/taxonomy";
import { dimensions, evaluateClassification, facetName, facets, filterTechnologies, type TaxonomyFilters } from "@/lib/taxonomy";
import { Sidebar } from "./sidebar";
import { TaxonomyMap } from "./taxonomy-map";
import { TaxonomyComparison } from "./taxonomy-comparison";

export function TaxonomyExplorer() {
  const [selectedId, setSelectedId] = useState("rest");
  const [otherId, setOtherId] = useState("http");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<TaxonomyFilters>({});
  const [activeAxis, setActiveAxis] = useState<AxisId>("location");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [assessment, setAssessment] = useState<ReturnType<typeof evaluateClassification> | null>(null);
  const selected = technologies.find(item => item.id === selectedId)!;
  const other = technologies.find(item => item.id === otherId)!;
  const results = filterTechnologies(query, filters);
  const selectedVisible = results.some(item => item.id === selectedId);
  const axis = axes.find(item => item.id === activeAxis)!;
  const selectedFacet = axis.facets.find(item => item.id === filters[activeAxis]);
  const related = relations.filter(item => item.a === selected.id || item.b === selected.id);
  function focusAxis(id: AxisId) { setActiveAxis(id); document.getElementById(`filter-${id}`)?.focus(); }
  function applyFacet(id: string) {
    const axis = axes.find(item => item.facets.some(facet => facet.id === id))!;
    setActiveAxis(axis.id); setFilters({ ...filters, [axis.id]: id });
  }
  function clear() { setQuery(""); setFilters({}); }

  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="universe" /><div className="main-shell">
    <header className="topbar"><span className="breadcrumb">API Universe <span>/</span> <strong>Taxonomy Explorer</strong></span><span className="pill">Mapa conceptual · sin tráfico API</span></header>
    <main id="experiment" tabIndex={-1}><div className="page-heading"><div><span className="overline">UNA INTERFAZ, MUCHAS COORDENADAS</span><h1>El universo de las APIs<span>.</span></h1><p>Las tecnologías se entienden por el problema que resuelven y la capa que ocupan.</p></div><div className="chapter-stamp"><span>DIMENSIONES</span><strong>06 <span>/ ∞</span></strong></div></div>
      <div className="learning-note"><span className="note-symbol">?</span><p>¿Una API puede ser privada, REST, HTTP y usar JSON al mismo tiempo?<br /><strong>Sí. Esas etiquetas responden preguntas diferentes.</strong></p></div>
      <section className="panel taxonomy-filter-panel" aria-label="Búsqueda y filtros de dimensiones"><div className="taxonomy-search"><label htmlFor="technology-search">Buscar capacidad, tecnología o rasgo</label><div><input id="technology-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="REST, esquema, bidireccional…" /><button onClick={clear} className="secondary-button" disabled={!query && !Object.values(filters).some(Boolean)}>Limpiar filtros</button></div></div>
        <div className="taxonomy-filters">{axes.map(item => <div key={item.id} className={activeAxis === item.id ? "filter-active" : ""}><label htmlFor={`filter-${item.id}`}><span>{item.letter} / {item.title}</span></label><select id={`filter-${item.id}`} value={filters[item.id] ?? ""} onFocus={() => setActiveAxis(item.id)} onChange={e => { setActiveAxis(item.id); setFilters({ ...filters, [item.id]: e.target.value }); }}><option value="">Todas las facetas</option>{item.facets.map(facet => <option key={facet.id} value={facet.id}>{facet.label}</option>)}</select></div>)}</div>
        <div className="facet-explanation"><span className="overline">{axis.letter} / {selectedFacet?.label ?? axis.title}</span><p>{selectedFacet?.explanation ?? axis.question}</p></div>
        <p className="filter-semantics">Los filtros buscan rasgos definidos o usos posibles declarados, con AND entre ejes. No describen una API desplegada ni prueban todas las combinaciones. Puedes limpiar cada eje eligiendo Todas las facetas.</p>
      </section>
      <div className="taxonomy-workspace"><section className="panel technology-catalog" aria-label="Catálogo de tecnologías"><div className="panel-heading"><span className="overline">EXPLORA UNA RESPONSABILIDAD</span></div><p className="catalog-count" role="status">{results.length} de {technologies.length} fichas</p><div className="catalog-results">{results.length ? results.map(item => <button key={item.id} className="technology-option" aria-label={`Seleccionar ${item.name}`} aria-pressed={item.id === selectedId} onClick={() => setSelectedId(item.id)}><span>{categories[item.category]}</span><strong>{item.name}</strong><small>{layers[item.layer]}</small></button>) : <div className="taxonomy-empty"><h2>Sin coincidencias en este catálogo</h2><p>La selección de asociaciones es limitada. Este resultado no demuestra incompatibilidad técnica.</p><button className="text-button" onClick={clear}>Restablecer búsqueda</button></div>}</div></section>
        <section className="panel taxonomy-selection" aria-labelledby="selected-technology"><div className="taxonomy-selection-heading"><div><span className="overline">{categories[selected.category]} / {layers[selected.layer]}</span><h2 id="selected-technology">{selected.name}</h2></div><span className="pill">Ficha conceptual</span></div>{!selectedVisible && <p className="selection-outside-filter">Esta ficha quedó fuera del filtro actual. Conservamos tu selección para que puedas inspeccionarla y compararla.</p>}
          <TaxonomyMap technology={selected} activeAxis={activeAxis} onAxis={focusAxis} />
          <div className="dimension-legend"><span>Define: parte de la responsabilidad descrita.</span><span>Uso posible: depende de la API y su implementación.</span></div><dl className="technology-dimensions">{axes.map(item => {
            const value = dimensions(selected, item.id);
            return <div key={item.id}><dt>{item.letter} / {item.title}</dt><dd>{!value.defined.length && !value.possible.length ? <p>No especificado por esta ficha; no significa incompatibilidad.</p> : <>{value.defined.length > 0 && <div className="dimension-traits"><small>DEFINE</small>{value.defined.map(id => <button className="trait-defined" key={id} onClick={() => applyFacet(id)}>{facetName(id)}</button>)}</div>}{value.possible.length > 0 && <div className="dimension-traits"><small>USO POSIBLE</small>{value.possible.map(id => <button key={id} onClick={() => applyFacet(id)}>{facetName(id)}</button>)}</div>}</>}</dd></div>;
          })}</dl>
        </section>
      </div>
      <section className="panel taxonomy-mechanism" aria-labelledby="mechanism-heading"><span className="overline">DEDUCE SU PAPEL</span><h2 id="mechanism-heading">Dentro de {selected.name}</h2><div className="reasoning-grid"><div><h3>Por qué existe</h3><p>{selected.why}</p></div><div><h3>Qué es exactamente</h3><p>{selected.what}</p></div><div><h3>Cómo funciona</h3><p>{selected.how}</p></div><div><h3>Decisiones y compromisos</h3><p>{selected.tradeoffs}</p></div></div><div className="taxonomy-limits"><h3>Dónde deja de aplicar</h3><p>{selected.limits}</p></div><div className="code-caption">Ejemplo concreto y representativo · no se ejecuta desde este mapa</div><pre><code>{selected.code}</code></pre>
        <div className="technology-alternatives"><h3>Otras soluciones para examinar</h3><p>Dependen del objetivo. Los enlaces permiten contrastar responsabilidades; no afirman sustitución directa.</p>{selected.alternatives.map(id => <button className="taxonomy-link" key={id} onClick={() => { setOtherId(selected.id); setSelectedId(id); }}>{technologies.find(item => item.id === id)!.name}</button>)}</div>
        {related.length > 0 && <div className="technology-relations"><h3>Relaciones documentadas</h3>{related.map(item => { const id = item.a === selected.id ? item.b : item.a; return <div key={`${item.a}:${item.b}`}><button className="taxonomy-link" onClick={() => { setOtherId(selected.id); setSelectedId(id); }}>{technologies.find(item => item.id === id)!.name}</button><p>{item.explanation}</p></div>; })}</div>}
        {selected.experiment && <Link prefetch={false} className="text-button" href={selected.experiment.href}>{selected.experiment.label} →</Link>}
      </section>
      <TaxonomyComparison a={selected} b={other} onA={setSelectedId} onB={setOtherId} />
      <section className="panel taxonomy-profile" aria-labelledby="profile-heading"><span className="overline">UNA API, VARIAS ETIQUETAS</span><h2 id="profile-heading">Un perfil posible para pedidos</h2><p>Una API de pedidos puede usar REST sobre HTTP, intercambiar JSON, dirigirse a una audiencia privada, exigir credenciales y documentarse con OpenAPI. Son decisiones simultáneas. Una API pública también puede exigir credenciales.</p><div className="profile-facets">{exampleProfile.map(id => <button key={id} onClick={() => applyFacet(id)}>{facetName(id)}</button>)}</div><p className="muted">Perfil ilustrativo. No certifica que el endpoint de esta app cumpla todas las restricciones REST. Seleccionar una etiqueta aplica su filtro.</p></section>
      <section className="panel taxonomy-exercise" aria-labelledby="classification-heading"><span className="overline">COMPRUEBA TU MODELO MENTAL</span><h2 id="classification-heading">Clasifica la responsabilidad</h2><p>Identifica qué describe cada término. Un formato, un protocolo y una audiencia pueden participar en la misma API.</p><div className="classification-rows">{classificationExercise.map((item, index) => <div key={item.label}><label htmlFor={`classify-${index}`}>{item.label}</label><select id={`classify-${index}`} value={answers[item.label] ?? ""} onChange={e => { setAnswers({ ...answers, [item.label]: e.target.value }); setAssessment(null); }}><option value="">Elige una categoría</option>{Object.entries(exerciseCategories).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>{assessment && <p className={assessment[index].correct ? "classification-correct" : "classification-retry"}><strong>{assessment[index].correct ? "Correcto. " : "Revisa. "}</strong>{assessment[index].feedback}</p>}</div>)}</div><button className="primary-button" onClick={() => setAssessment(evaluateClassification(answers))}>Evaluar clasificación</button>{assessment && <p className="classification-summary" role="status">{assessment.filter(item => item.correct).length} de {classificationExercise.length} clasificaciones correctas. {assessment.every(item => item.correct) ? "Has distinguido arquitectura, protocolo, formato, descripción y acceso." : "Puedes revisar las explicaciones y volver a intentarlo."}</p>}</section>
      <footer><span>{axes.length} ejes · {facets.length} facetas · {technologies.length} fichas</span><span>Relaciones conceptuales · fragmentos ilustrativos · sin servicios externos</span></footer>
    </main>
  </div></div>;
}
