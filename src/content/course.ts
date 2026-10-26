export const courseChapters = [
  { id: 0, title: "Primeros principios", href: "/first-principles?chapter=0", available: true },
  { id: 1, title: "Contratos e implementaciones", href: "/first-principles?chapter=1", available: true },
  { id: 2, title: "APIs locales y DOM", href: "/first-principles?chapter=2", available: true },
  { id: 3, title: "Procesos y fronteras", href: "/first-principles?chapter=3", available: true },
  { id: 4, title: "Red y transporte", href: "/playground?tab=network", available: true },
  { id: 5, title: "HTTP: petición y respuesta", href: "/playground?tab=http", available: true },
  { id: 6, title: "Comparar interfaces", href: "/compare", available: true },
  { id: 7, title: "Comunicación y eventos", href: "/events", available: true },
  { id: 8, title: "Seguridad y acceso", href: "/security", available: true },
  { id: 9, title: "Diseño de contratos", href: "/contracts", available: true },
  { id: 10, title: "Sistemas y fallos parciales", href: "/systems", available: true },
  { id: 11, title: "Proyecto final de pedidos", href: "/build-api", available: true },
  { id: 12, title: "Fronteras avanzadas", href: "/advanced", available: true },
] as const;

export const courseAreas = [
  { id: "foundations", title: "Bases", href: "/first-principles?chapter=0", description: "Empieza con una función local. Descubre contratos, procesos y API Anatomy." },
  { id: "execution", title: "Recorrido central", href: "/follow-the-click", description: "Sigue una operación real y conecta sus piezas en el proyecto de pedidos." },
  { id: "learning", title: "Aprendizaje y mapa", href: "/api-universe", description: "Explora API Universe, compara interfaces y consulta conceptos y fronteras." },
  { id: "laboratories", title: "Laboratorios", href: "/playground?tab=http", description: "Experimenta con red, HTTP, eventos, seguridad, contratos y sistemas." },
  { id: "evaluation", title: "Progreso y evaluación", href: "/challenges", description: "Siete desafíos con resultado operativo, explicación causal y progreso local. Retoma también las actividades de cada capítulo." },
] as const;

export type CourseArea = typeof courseAreas[number]["id"];
