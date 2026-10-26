# The API Universe

## Stack

TypeScript estricto, Node.js 24, Next.js App Router, React y Tailwind CSS. npm administra dependencias. SVG representa diagramas y un reducer de React gobierna reproducción. Vitest comprueba lógica y Playwright comprueba navegador. Fuente: `docs/specs/0001-arquitectura-proyecto/index.md`.

## Build approach

Journey (terminar un recorrido completo, con sus errores y su evaluación, antes de abrir el siguiente). Workflow Beta, fuente: `docs/scope/index.md`.

## Commands

`npm ci`, `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e`, `npm run build`, `npm start`. Playwright necesita `npx playwright install chromium` una vez. Las pruebas de navegador arrancan el servidor si no existe uno disponible.

`npm run test:delivery` requiere `npm run build` previo y `npx playwright install chromium firefox webkit`. Arranca producción exclusiva en3100, sin reutilizar desarrollo. Ejecuta toda la suite en Chromium y las comprobaciones de entrega en Firefox/WebKit; guarda informe y mediciones en `test-results/`. Fuente: `docs/specs/0018-verificacion-entrega/index.md`.

## Rules

1. Mantener funciones pequeñas y contratos tipados. No introducir `any`, capas genéricas ni dependencias para operaciones simples.
2. Separar transiciones puras de fetch y almacenamiento. El reducer no ejecuta efectos y nunca repite una escritura al reproducir.
3. Los eventos capturados no se mutan durante reproducción. La construcción de trazas y el Map servidor son efectos explícitos permitidos por la arquitectura, no estado de usuario compartido entre componentes React.
   `event` copia las explicaciones de cada profundidad además de los metadatos de interacción. Personalizar una operación no altera otra captura ni las definiciones canónicas. Los eventos de actualización de estado describen solicitudes a setters; no instrumentan el commit de React ni el paint del navegador.
4. Validar entradas en el servidor. Los errores esperados usan `OrderError` en esa frontera y respuestas JSON estructuradas. Conservar la clave y el payload ante resultado incierto.
5. El Map global es almacenamiento temporal de un proceso, acotado a 200 pedidos. No prometer durabilidad, coordinación entre instancias ni seguridad de producción para las credenciales públicas.
6. Separar constantes compartidas (`product.ts`) de lógica exclusiva del servidor (`orders.ts`). No importar almacenamiento servidor en componentes de cliente.
7. Todo contenido educativo es español. Identificar simulaciones, procedencia de eventos y tiempos lógicos frente a duración observada. No presentar flechas como captura de paquetes.
8. Usar HTML semántico, etiquetas precisas, foco visible, teclado y reducción de movimiento. Los valores visuales viven en CSS y la composición en `design.md`.
9. Mantener la estructura actual de módulos y pruebas. Ejecutar comprobaciones apropiadas y no declarar terminada una experiencia pendiente en el alcance.
10. `TraceEvent.stage` identifica mecanismos sin comparar textos. Copiar `NetworkSettings` en cada captura simulada; los ajustes solo afectan la siguiente ejecución. DNS, TCP, TLS e ingreso conceptual no se agregan a capturas reales sin instrumentación. Fuente: `docs/specs/0003-red-infraestructura/index.md`.
11. El contenido de capítulos se separa en `src/content/`. `snapshot` siempre es conceptual; las ramas concurrentes usan `lane` y conservan dependencias propias, sin pasar después por `indexEvents`. El progreso de primeros principios usa `api-universe-learning-v1`, valida su versión y permite sesión sin almacenamiento. Fuente: `docs/specs/0004-primeros-principios/index.md`.

12. La taxonomía distingue `defined` de `possible` y usa ids únicos para facetas y relaciones. Ausencia de asociación no significa incompatibilidad; comparar categorías o capas distintas exige explicarlo. Fuente: `docs/specs/0005-api-taxonomy/index.md`.

13. `order-status.ts` contiene funciones puras compartidas por modelos y servidor. Confirmar fija `confirmed` sin mutar el objeto anterior; GET devuelve el estado actual y reintentar POST recupera el snapshot de creación. Comparaciones parten de copias aisladas y GET/PATCH no reciben eventos internos sin instrumentación. Fuente: `docs/specs/0006-comparar-pedido/index.md`.

14. El editor HTTP solo envía al mismo origen y rutas permitidas, con body de texto exacto y sin redirecciones. Conserva Response parcial, clave y solicitud ante creación incierta. El diagnóstico es público y no persiste; sus 304 se inspeccionan manualmente, con fetch no-store. UDP directo no hereda garantías de QUIC. Fuente: `docs/specs/0007-http-playground/index.md`.

15. En eventos, event.id identifica negocio, intento identifica entrega y offset identifica registro del log. Releer conserva ids y el mayor offset confirmado; un registro agotado detiene el lector. Pub/sub conserva dependencias por rama. Dedupe y efecto son atómicos solo en el modelo. SSE real es finito y limpia temporizadores; EventSource se cierra al completar, fallar, ocultarse o desmontar, sin inferir status HTTP. Fuente: `docs/specs/0008-eventos-entrega/index.md`.

16. Los modelos de seguridad separan POST enviado, efecto y lectura CORS; un Response bloqueado no aparece como legible. Las cookies de esos modelos asumen SameSite=None;Secure y envío permitido. Validación criptográfica y OAuth/OIDC son conceptuales; el ID token del cliente no sustituye al access token de API. La consola real conserva sus permisos y emite challenge Bearer en401. Fuente: `docs/specs/0009-seguridad-acceso/index.md`.

17. Contratos separa schema de reglas de negocio y compara consumidores en ambas direcciones. Coexistencia conserva el handler v1 completo; deprecated solo informa. Cursores keyset ligan filtro/orden y no representan snapshots. Olvidar claves conserva pedidos pero termina dedupe. Las rutas del diseñador no están desplegadas y las descargas no hacen HTTP. Fuente: `docs/specs/0010-diseno-contratos/index.md`.

18. Systems usa requestId para ramas concurrentes, atMs para tiempo simulado y logicalTime para orden; no pasa por indexEvents. Cada réplica tiene breaker con generaciones; timeout no cancela completaciones tardías. Caché compartida conserva revisiones y TTL. Recuperación transaccional reutiliza captura sin repetir reserva/cobro; 2PC simplifica visibilidad. Capítulo10 usa el progreso común del curso. Fuente: `docs/specs/0011-sistemas-fallos/index.md`.

19. La continuidad usa `api-universe-course-v1` sin sobrescribir `api-universe-learning-v1`. Solo guarda objetivos y quiz comprobados, profundidad y ubicaciones locales validadas por `courseLocation`; nunca pedidos, credenciales, capturas ni borradores HTTP. Las escrituras parten del snapshot actual y admiten sesión sin almacenamiento. Al añadir capítulos, ampliar catálogo, objetivos y destinos permitidos; visitar no completa aprendizaje. Fuente: `docs/specs/0012-navegacion-progreso/index.md`.

   En ambos formatos de progreso, las lecturas de otras pestañas unen los logros conocidos mediante `mergeCourseProgress` o `mergeProgress`; un snapshot parcial o inválido no borra logros de la sesión actual.

20. El capítulo11 valida trace ID, eventos y Order correlacionado antes de aplicar resultados o logros. POST incierto conserva clave/datos/credencial y PATCH incierto conserva id para consulta o repetición fija. POST/GET/PATCH instrumentan servidor; replay no escribe. El visor importa un JSON generado por `scripts/project-sources.mjs` antes de dev/build/typecheck/test, sin lectura de archivos en runtime; actualizar fuentes requiere regenerar/recompilar. Fuente: `docs/specs/0013-proyecto-pedidos/index.md`.

21. X Ray exige `TraceEvent.interaction` con iniciador, receptor, tecnología y fallos posibles declarados por el productor. Los extremos son roles o componentes; no deducirlos del texto ni heredar metadatos canónicos al cambiar mecanismo. `modelStep` recibe ese contrato explícito y `projectReceipt` lo valida. `XRayProvider` comparte el modo durante la navegación; `XRayToggle` vive en la cabecera de cada laboratorio y `TracePlayer` consume ese contexto, sin prop ni interruptores locales. Cambiar profundidad conserva captura, cursor, panel y reproducción; las posibilidades declaradas no son errores observados. Fuente: `docs/specs/0014-xray-transversal/index.md`.

22. En fronteras avanzadas, solo Ejecutar instancia el módulo Wasm fijo; replay nunca compila ni invoca. ABI/FFI y transporte wire son modelos, encode/decode es local y no se ejecuta SQL. Herramientas valida tamaño, registro, argumentos y permisos antes del efecto sobre un pedido aislado; un fallo de consumo no revierte ese efecto. El capítulo12 exige seis resultados y doce respuestas comprobadas, sin persistir propuestas ni capturas. Fuente: `docs/specs/0015-fronteras-avanzadas/index.md`.

23. Challenges evalúa cada borrador mediante modelos existentes: resultado operativo y causa deben ser correctos juntos. Editar invalida el intento visible; replay y visita no acreditan. `CourseProgress.challenges` guarda solo ids conocidos y une logros sin completar capítulos; respuestas, bodies, configuraciones y capturas permanecen en memoria de la pantalla. La ubicación admite únicamente ids de catálogo. Fuente: `docs/specs/0017-desafios/index.md`.

24. La referencia deriva búsqueda y selección de URL con ids y temas validados; no guarda consultas ni acredita progreso. Reutiliza textos de taxonomía. `reference-target.ts` solo mapea stage a ids editoriales, sin importar el catálogo ni enviar datos de captura; el inspector consulta en otra pestaña para conservar contexto. Fuente: `docs/specs/0016-referencia-conceptual/index.md`.

25. El ejemplo SQL de Follow the Click proyecta solo `output` de un evento `persist` exitoso, nunca el formulario ni el resultado final. SQL y parámetros son texto conceptual separado del Map observado o modelado. Inspeccionar la captura anterior intercambia las dos capturas y pausa, sin alterar el intento incierto ni el último pedido real. Fuente: `docs/specs/0019-ejemplo-sql-capturado/index.md`.

## Tooling

ESLint y TypeScript para comprobación estática; Vitest y Playwright para pruebas. Comandos locales, sin hooks de commit ni CI remoto. Los avisos de ESLint se documentan en README. No aplicar `npm audit fix --force` ni bajar Next.js para ocultarlos.

## Git

integration: off. El usuario administra ramas, commits y publicación.

## Specs

`docs/scope2/index.md` sigue las correcciones del Master Prompt. `docs/scope2/fase5-matriz.md` registra el contraste de las secciones1 a19 y `fase5-verificacion.md` identifica la regresión técnica actual. El bloque20 original, las specs0018/0020 y el cierre integral de scope2 permanecen en curso por la comprensión con participantes; pruebas y quizzes no sustituyen esos resultados. B identifica Browser API DOM del capítulo2; API Anatomy tiene acceso propio en `?chapter=3#api-anatomy`.

`docs/specs/` contiene decisiones y contratos. `docs/scope/index.md` contiene el estado global. `README.md` explica ejecución y límites reales. Los capítulos 0 a 3, Anatomy, evaluación y progreso local están implementados en `/first-principles`. El mapa de seis ejes, 49 facetas y 29 fichas funciona en `/api-universe`. El capítulo 6 y el comparador de diez interfaces funcionan en `/compare`, con consola HTTP real de consulta y confirmación. Los capítulos 4 y 5 y laboratorios C, D y E funcionan en `/playground`, con diagnóstico HTTP real y transporte conceptual. El capítulo 7 y laboratorios F y G funcionan en `/events`, con modelos de comunicación y entrega y SSE local real. El capítulo 8 y laboratorio H funcionan en `/security`, con modelos de acceso, CORS/CSRF y credenciales y consola HTTP real. El capítulo 9 y laboratorio I funcionan en `/contracts`, con diseñador, compatibilidad, colecciones, reintentos y exportación de contratos. El capítulo10 y laboratorio J funcionan en `/systems`, con arquitectura guiada, carga, protecciones, métricas y transacciones. El capítulo11 funciona en `/build-api`, con aplicación real integrada, validación de recepción, código de compilación descargable y progreso. El capítulo12 funciona en `/advanced`, con ABI/FFI modeladas, Wasm real, framing acotado y herramientas aisladas. Los siete desafíos funcionan en `/challenges`, con evaluación conjunta de resultado y causa, inspector compartido y logros independientes de capítulos. La referencia mantiene su seguimiento en el bloque18.

## Agent skills

Declined: búsqueda adicional de Agent Skills y servidores MCP para este stack, por elección del usuario. No volver a ofrecerla.

<!-- CODEX-INTERACTIVE-QUESTIONS:START -->
## Preguntas interactivas en Codex

Cuando una skill pida elegir entre opciones, tratar la elección como un override opcional con una recomendación por defecto y usar `request_user_input`; no mostrar el menú como texto. Si una skill menciona `AskUserQuestion`, traducirlo a `request_user_input`. Si el usuario no responde, continuar con la opción recomendada.

Cada llamada debe contener entre 1 y 3 preguntas y entre 2 y 3 opciones por pregunta. Colocar primero la opción recomendada y terminar su etiqueta en `(Recommended)`. No agregar `Other`; Codex lo incorpora automáticamente.

Usar texto libre solamente cuando la respuesta sea realmente obligatoria y no pueda expresarse como opciones, o cuando `request_user_input` no esté disponible. Las autorizaciones, permisos y confirmaciones de acciones destructivas conservan su flujo específico y no usan este selector.
<!-- CODEX-INTERACTIVE-QUESTIONS:END -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
