"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { courseAreas, type CourseArea } from "@/content/course";
import { Icon } from "./icon";
import { CourseSummaryLink } from "./course-summary";

type Area = "click" | "foundations" | "universe" | "compare" | "playground" | "events" | "security" | "contracts" | "systems" | "project" | "advanced" | "course" | "challenges" | "reference";
type ChapterNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
interface NavEntry {
  id: string; href: string; title: string; chapter?: ChapterNumber;
  detail?: string; icon?: "globe" | "arrow" | "layers";
  labs?: { title: string; href: string }[];
}
const chapterByArea: Partial<Record<Area, ChapterNumber>> = { foundations: 0, playground: 5, compare: 6, events: 7, security: 8, contracts: 9, systems: 10, project: 11, advanced: 12 };
const navigation: Record<CourseArea, NavEntry[]> = {
  foundations: [
    { id: "chapter-0", chapter: 0, href: "/first-principles?chapter=0", title: "Primeros principios", labs: [{ title: "A · Función local", href: "/first-principles?chapter=0#local-lab-title" }] },
    { id: "chapter-1", chapter: 1, href: "/first-principles?chapter=1", title: "Contratos e implementaciones", labs: [{ title: "Sustituir la implementación", href: "/first-principles?chapter=1#local-lab-title" }] },
    { id: "chapter-2", chapter: 2, href: "/first-principles?chapter=2", title: "APIs locales y DOM", labs: [{ title: "B · Browser API: DOM sin red", href: "/first-principles?chapter=2#local-lab-title" }] },
    { id: "chapter-3", chapter: 3, href: "/first-principles?chapter=3", title: "Procesos y fronteras", labs: [{ title: "API Anatomy", href: "/first-principles?chapter=3#api-anatomy" }] },
  ],
  execution: [
    { id: "click", href: "/follow-the-click", title: "Follow the Click", detail: "Experimento HTTP real", icon: "arrow" },
    { id: "chapter-11", chapter: 11, href: "/build-api", title: "Proyecto final de pedidos", labs: [{ title: "Aplicación y código ejecutado", href: "/build-api?tab=app" }] },
  ],
  learning: [
    { id: "universe", href: "/api-universe", title: "API Universe", detail: "Mapa conceptual", icon: "globe" },
    { id: "chapter-6", chapter: 6, href: "/compare", title: "Comparar interfaces", labs: [{ title: "Consola HTTP de pedidos", href: "/compare#real-console-heading" }] },
    { id: "chapter-12", chapter: 12, href: "/advanced", title: "Fronteras avanzadas", labs: [{ title: "Binario, bytes y herramientas", href: "/advanced?tab=binary" }] },
    { id: "reference", href: "/reference", title: "Referencia", detail: "Glosario y guía del laboratorio", icon: "layers" },
  ],
  laboratories: [
    { id: "chapter-4", chapter: 4, href: "/playground?tab=network", title: "Red y transporte", labs: [{ title: "Explorar la red conceptual", href: "/playground?tab=network#panel-network" }] },
    { id: "chapter-5", chapter: 5, href: "/playground?tab=http", title: "HTTP: petición y respuesta", labs: [{ title: "C · Editor HTTP real", href: "/playground?tab=http#http-editor-heading" }] },
    { id: "graphql", chapter: 6, href: "/playground?tab=graphql", title: "D · GraphQL", detail: "Práctica del capítulo 6" },
    { id: "rpc", chapter: 6, href: "/playground?tab=rpc", title: "E · RPC y gRPC", detail: "Práctica del capítulo 6" },
    { id: "chapter-7", chapter: 7, href: "/events", title: "Comunicación y eventos", labs: [{ title: "F · Modelos de comunicación", href: "/events?tab=communication" }, { title: "G · Entregas de eventos", href: "/events?tab=delivery" }, { title: "SSE real", href: "/events?tab=sse" }] },
    { id: "chapter-8", chapter: 8, href: "/security", title: "Seguridad y acceso", labs: [{ title: "H · Laboratorio de seguridad", href: "/security#experiment" }] },
    { id: "chapter-9", chapter: 9, href: "/contracts", title: "Diseño de contratos", labs: [{ title: "I · Diseñar una interfaz", href: "/contracts?tab=design" }] },
    { id: "chapter-10", chapter: 10, href: "/systems", title: "Sistemas y fallos parciales", labs: [{ title: "J · Systems Lab", href: "/systems?tab=system" }] },
  ],
  evaluation: [{ id: "challenges", href: "/challenges", title: "Desafíos", detail: "Siete decisiones con evidencia", icon: "arrow" }],
};
const areaByPage: Record<Area, CourseArea> = {
  foundations: "foundations", click: "execution", project: "execution",
  universe: "learning", compare: "learning", reference: "learning", advanced: "learning",
  playground: "laboratories", events: "laboratories", security: "laboratories", contracts: "laboratories", systems: "laboratories",
  course: "evaluation", challenges: "evaluation",
};

export function Sidebar({ active, chapter, practice }: { active: Area; chapter?: ChapterNumber; practice?: "http" | "network" | "graphql" | "rpc" }) {
  const currentArea = areaByPage[active];
  const [navigationState, setNavigationState] = useState<{ current: CourseArea; expanded: CourseArea | null }>({ current: currentArea, expanded: currentArea });
  if (navigationState.current !== currentArea) setNavigationState({ current: currentArea, expanded: currentArea });
  const expanded = navigationState.current === currentArea ? navigationState.expanded : currentArea;
  const navigationId = useId();
  const selectedChapter = chapter ?? chapterByArea[active];
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const link = navRef.current?.querySelector<HTMLElement>(".nav-active");
    const row = link?.closest<HTMLElement>(".nav-group-links");
    if (link && row && row.scrollWidth > row.clientWidth) row.scrollLeft += link.getBoundingClientRect().left - row.getBoundingClientRect().left;
    const sidebar = navRef.current?.closest<HTMLElement>(".sidebar");
    if (link && sidebar && link.getClientRects().length && sidebar.scrollHeight > sidebar.clientHeight) {
      const item = link.getBoundingClientRect(), container = sidebar.getBoundingClientRect();
      if (item.bottom > container.bottom) sidebar.scrollTop += item.bottom - container.bottom + 16;
      else if (item.top < container.top) sidebar.scrollTop -= container.top - item.top + 16;
    }
  }, [active, selectedChapter, practice, expanded]);
  function navigateWithinPage(event: { preventDefault: () => void }, href: string) {
    setNavigationState({ current: currentArea, expanded: currentArea });
    const target = new URL(href, window.location.href);
    if (target.pathname !== window.location.pathname) return;
    event.preventDefault();
    window.history.pushState(null, "", href);
    if (target.hash) document.getElementById(target.hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }
  return <aside className="sidebar">
    <Link prefetch={false} className="brand" href="/" aria-label="The API Universe, inicio"><span className="brand-mark"><Icon name="layers" /></span><span>API<span className="brand-secondary">UNIVERSE</span></span></Link>
    <div className="workspace-label">TU LABORATORIO DE INGENIERÍA</div>
    <nav ref={navRef} aria-label="Navegación principal">
      <CourseSummaryLink current={active === "course"} onNavigate={() => setNavigationState({ current: currentArea, expanded: currentArea })} />
      <label className="mobile-area-picker"><span id={`${navigationId}-label`}>Área del curso</span><select aria-labelledby={`${navigationId}-label`} value={expanded ?? ""} onChange={event => {
        const area = courseAreas.find(area => area.id === event.target.value);
        if (area) setNavigationState({ current: currentArea, expanded: area.id });
      }}><option value="" disabled>Elige un área</option>{courseAreas.map(area => <option key={area.id} value={area.id}>{area.title}</option>)}</select></label>
      <div className="nav-sections">{courseAreas.map(area => {
        const open = expanded === area.id;
        return <div className={`nav-group ${open ? "nav-group-open" : ""}`} key={area.id} role="group" aria-label={area.title}>
          <button className={`nav-area-button ${currentArea === area.id ? "nav-area-current" : ""}`} aria-expanded={open} aria-controls={`${navigationId}-${area.id}`} onClick={() => setNavigationState({ current: currentArea, expanded: open ? null : area.id })}><span>{area.title}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button>
          <div id={`${navigationId}-${area.id}`} className="nav-group-links" hidden={!open}>
            {navigation[area.id].map(item => {
              const current = area.id === currentArea && (item.chapter === undefined ? active === item.id : selectedChapter === item.chapter && (item.id === "graphql" || item.id === "rpc" ? practice === item.id : true));
              return <div className="nav-entry" key={item.id}><Link prefetch={false} href={item.href} onNavigate={event => navigateWithinPage(event, item.href)} className={`nav-item ${current ? "nav-active" : ""}`} aria-current={current ? "page" : undefined} aria-label={item.title} aria-description={item.chapter === undefined ? item.detail : `Capítulo ${item.chapter}`}>
                {item.chapter === undefined ? item.icon && <Icon name={item.icon} /> : <span className="nav-number" aria-hidden="true">{String(item.chapter).padStart(2, "0")}</span>}<span className="nav-copy"><span>{item.title}</span>{item.detail && <small>{item.detail}</small>}</span>
              </Link>{current && item.labs && <div className="nav-labs" role="group" aria-label={`Laboratorios del capítulo ${item.chapter}`}><span className="nav-labs-label">Práctica</span>{item.labs.map(lab => <Link prefetch={false} key={lab.href} href={lab.href} onNavigate={event => navigateWithinPage(event, lab.href)} className="nav-lab-link">{lab.title}</Link>)}</div>}</div>;
            })}
            
          </div>
        </div>;
      })}</div>
    </nav>
    <div className="sidebar-note"><p>Los capítulos siguen el orden del 0 al 12. En Tu recorrido puedes ver el programa completo.</p></div>
    <div className="sidebar-bottom"><div className="status-dot" />Sin cuentas. Sin API keys externas.<small>Ingeniería visible, desde el primer click.</small></div>
  </aside>;
}
