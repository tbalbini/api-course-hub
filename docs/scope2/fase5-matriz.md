# Contraste del Master Prompt completo

23 de octubre de2026. Referencia: Master Prompt, secciones1 a19, pegado por el usuario en esta conversación. Esta matriz descompone sus obligaciones por superficie y mecanismo. La [verificación de fase5](fase5-verificacion.md) identifica fuentes, comandos, pruebas, observación directa y límites del corte.

**C** significa comprobado en las superficies y casos indicados. **A** identifica una adaptación permitida o una simplificación declarada. **P** significa pendiente de evidencia humana. **L** indica un límite de la comprobación, sin afirmar cumplimiento literal de una propiedad que no se midió. Las referencias a archivos de pruebas remiten a casos ejecutados en esta pasada, no a una garantía sobre cualquier combinación posible.

Los requisitos compuestos enumeran sus partes para evitar que el título de un capítulo sustituya a su contenido. Una ruta construida no acredita comprensión. Las ocho pruebas de calidad tienen resultados separados en la sección16.

## 1. Misión

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 01.1 | Aplicación interactiva de ingeniería, desde fundamentos hasta sistemas distribuidos | `/first-principles`, `/systems`, `/advanced`; [programa][course], [fundamentos][tf], [sistemas][ts], [avanzado][ta] | C. Trece capítulos con experimentos y evaluación; no se presenta como una landing o blog. |
| 01.2 | Descomponer abstracciones y observar operaciones paso a paso | [TracePlayer][player], [Anatomy][anatomy], [X Ray][tx], [interacción][ti] | C. Selección, contratos, datos, código y fronteras por evento. |
| 01.3 | Una persona sin conocimientos comprende por qué, cómo y límites de APIs | [N1 y V1 de fase4][human] | P. El recorrido existe; cero participantes observados. |

## 2. Principio pedagógico

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 02.1 | Empezar por necesidad de una capacidad, acuerdo y frontera antes de tecnologías | Capítulos0 a3, [contenido de fundamentos][foundations]; pregunta inicial de cada laboratorio | C en la estructura editorial. La navegación permite exploración libre, no fuerza completar capítulos antes de probar HTTP. |
| 02.2 | WHY, WHAT, HOW, TRADE-OFFS, ALTERNATIVES y BOUNDARIES | Fundamentos usa question, intuition, mechanism, tradeoffs, alternative y limits; [taxonomía][taxonomy] y [avanzado][advanced] tienen campos explícitos; capítulos4 a11 agrupan estas respuestas en notas y mecanismos | A de presentación. Se comprueban las seis preguntas por unidad pedagógica; no se repiten seis encabezados en cada frase del inspector. |
| 02.3 | Razonamiento causal sobre latencia, errores, seguridad, concurrencia y evolución | `/playground`, `/security`, `/systems`, `/contracts`; [playground][tp], [seguridad][tsec], [sistemas][ts], [contratos][tc] | C. Los controles cambian resultados; comprenderlos sigue sujeto a fase4. |

## 3. Una API no equivale a Web API

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 03.1 | Definición general, consumidor, proveedor, capacidad, interfaz, contrato e implementación | Capítulos0 y1, `/reference?term=api`, [fundamentos][foundations], [referencia][tr] | C. Función real sin petición HTTP y proveedor intercambiable. |
| 03.2 | Invocación, parámetros, resultado, efecto, evento, abstracción y errores | Anatomy, pila y memoria, eventos y contrato; [fundamentos][tf], [eventos][te] | C. Las representaciones distinguen esos roles. |
| 03.3 | API sin red, HTTP, JSON, servidor, credenciales o proceso separado | Función y DOM reales; [aprendizaje][tl], [fundamentos][tf] | C. No se deduce red de una llamada o de un click. |
| 03.4 | Consumer → Contract → Provider → Execution → Result seleccionables | [api-anatomy.tsx][anatomy], capítulo3; [fundamentos][tf] | C. Los nodos revelan su función. |
| 03.5 | Siete mecanismos: función, IPC, syscall, HTTP, RPC, mensaje y suscripción | [anatomy.ts][anatomy-model], [fundamentos][tf], [interacción][ti] | A. Función/DOM tienen experiencias reales; IPC, syscall y otros transportes de Anatomy son modelos explícitos. |
| 03.6 | El diagrama cambia sin inventar red dentro del mismo proceso | Zonas y frontera de Anatomy; [aprendizaje][tl], [interacción][ti] | C. Función agrupada en un proceso, syscall como privilegio y no segundo proceso obligatorio. |

## 4. Taxonomía multidimensional

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 04.1 | Ejes independientes; REST puede ser remota, HTTP, privada, síncrona y documentada con OpenAPI | `/api-universe`, [catálogo][taxonomy], [taxonomía][tt], [navegador][tte] | C. Diferencia asociaciones definidas y posibles; ausencia no implica incompatibilidad. |
| 04.A | In-process, IPC, OS, remota y embedded/device | Cinco facetas del ejeA | C. Selección y explicación dentro de las49 facetas comprobadas. |
| 04.B | Funciones, bibliotecas, clases/interfaces, syscall, browser, DB, SDK, drivers y mensajes | Nueve facetas del ejeB | C. No se presentan como tecnologías mutuamente excluyentes. |
| 04.C | Síncrona, request-response, asíncrona, fire-and-forget, polling, long polling, streaming, pub/sub, eventos y bidireccional | Diez facetas del ejeC | C. Estilos de interacción separados del transporte. |
| 04.D | REST, RPC, JSON-RPC, XML-RPC, gRPC, GraphQL, SOAP, WebSocket, SSE, webhook, broker y event stream | Doce facetas del ejeD | C. Categorías y capas explícitas. |
| 04.E | Pública, interna, partner y restringida por permisos | Cuatro facetas del ejeE | C. Visibilidad no sustituye contrato o mecanismo de seguridad. |
| 04.F | Firma, tipos, JSON, XML, Protobuf, SDL, OpenAPI, AsyncAPI y compatibilidad | Nueve facetas del ejeF | C. Representación, descripción y transporte permanecen separados. |
| 04.2 | Cada ficha explica problema, dimensiones, combinaciones, alternativas, compromisos y mecanismo |29 fichas con ejemplos, relaciones y filtros; [taxonomía][tt], [navegador][tte] | C. Los ejemplos ilustran mecanismos; no ejecutan cada tecnología de infraestructura. |
| 04.3 | Comparar dos tecnologías y advertir cruces de categorías | Comparación de fichas y actividades; [navegador][tte] | C. Se comprueban comparaciones en ambos sentidos. |

## 5. Currículo obligatorio, capítulos0 a12

La sección9 registra además los nueve elementos pedagógicos de cada capítulo.

| Id | Requisito y partes cubiertas | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 05.0 | Programa, instrucciones, proceso, memoria, función, inputs/outputs, llamada, pila, control, información y abstracción; sumar(2,3); API frente a implementación | Capítulo0, [fundamentos][foundations], [aprendizaje][tl], [navegador][tf] | C. Suma ejecutada; pila y memoria son reconstrucciones conceptuales. |
| 05.1 | Acoplamiento, encapsulación, abstracción, responsabilidades, contrato, sustitución, compatibilidad y evolución | Capítulo1; cambio direct/fold/broken; [aprendizaje][tl], [navegador][tf] | C. Cambiar retorno number por string rompe la promesa aunque se vean iguales los dígitos. |
| 05.2 | APIs de lenguaje, biblioteca estándar, DOM, archivos, OS/syscalls, dispositivos, clientes DB, SDK y wrappers; Math.max, querySelector, readFile y ejemplos OS/DB | Capítulo2, ejemplos de [fundamentos][foundations], Anatomy, [navegador][tf] | A. DOM real sin fetch; archivos, dispositivos y llamadas al kernel se explican y modelan, sin acceso nativo desde el laboratorio web. |
| 05.3 | Procesos, espacios de memoria, IPC, pipes, Unix sockets, TCP sockets, serialización, cliente/servidor, RPC, error parcial, timeout y concurrencia | Capítulo3, Anatomy y ramasA/B; [aprendizaje][tl], [fundamentos][tf] | A. Procesos y transportes conceptuales; comparación real entre función y HTTP local en otros recorridos. |
| 05.4 | IP, puertos, DNS, TCP, UDP, TLS, HTTP1/2/3, conexiones, paquetes, routing, latencia, request/response, timeout y retries | `/playground?tab=network`, [HTTP y red][http-content], [red][tn], [playground][tp] | A. Resolución, establecimiento, seguridad, transmisión, proceso y retorno separados; unidades y tiempos son simulados. |
| 05.5 | URL/scheme/host/port/path/query, headers/body, métodos/status/content types, cookies/tokens, caché y negociación | `/playground?tab=http`, [HTTP y red][http-content], [HTTP][th], [playground][tp] | C. Editor e inspector reales, JSON/texto y304. Headers configurados no se anuncian como volcado completo de red. |
| 05.5M | GET/POST/PUT/PATCH/DELETE: semántica, safety, idempotencia y errores; no equivalen a CRUD | Tabla de métodos, diagnóstico y contrato de pedidos; [HTTP][th], [playground][tp] | C. PUT/DELETE del diagnóstico no implantan una API CRUD de pedidos; PATCH depende de su contrato. |
| 05.6 | REST, GraphQL, RPC, gRPC y SOAP para el mismo pedido: problema, invocación, contrato, proceso, resultado y compromisos | `/compare`, [comparación][comparison], [modelos][tcomp], [navegador][tce] | C. Cada alternativa usa copia aislada del mismo pedido y objetivo. |
| 05.6R | REST como estilo y restricciones, no JSON sobre HTTP | Notas REST, ficha y límites; [taxonomía][taxonomy], [comparación][comparison] | C editorial. La consola HTTP no certifica todas las restricciones REST. |
| 05.6G | GraphQL queries, mutations, schema, resolvers y subscriptions | `/compare`, pestaña GraphQL del Playground; [comparación][tcomp], [playground][tp] | A. Ejecutor educativo y código representativo, sin servidor GraphQL de terceros. |
| 05.6P | Protobuf, RPC y unary/server/client/bidi streaming | Comparador y RPC/gRPC del Playground; [comparación][tcomp], [playground][tp] | A. Objetos y serialización conceptual identificados; no transporte gRPC real. |
| 05.6S | SOAP Envelope/Header/Body, WSDL y contexto de integración | Código XML y WSDL en [comparación][comparison]; [navegador][tce] | A. Contratos representativos con XML comprobado, sin servidor SOAP. |
| 05.7 | Polling, long polling, WebSocket, SSE, webhook, queue, pub/sub, log, eventos y consistencia eventual | `/events`, [contenido][events-content], [eventos][tev], [navegador][te] | A. Dirección, conexiones y acoplamiento cambian; SSE local además es real y finito. |
| 05.7D | ACK, retries, orden, duplicados y recepción frente a efecto; webhook no es WebSocket | Entregas, proyecciones y ramas; [eventos][tev], [navegador][te] | C en el modelo. Retención, dedupe y atomicidad no se atribuyen a infraestructura desplegada. |
| 05.8 | Autenticación/autorización, keys, sesiones/cookies, bearer, OAuth2/OIDC, JWT, scopes/roles, TLS, CORS/CSRF, cuotas, validación y secretos | `/security`, [contenido][security-content], [seguridad][tsecu], [navegador][tsec] | A. Simuladores operativos y consola HTTP real; OAuth, firmas y sesiones son modelos. |
| 05.8D | CORS solo en navegador; API key, OAuth y JWT resuelven responsabilidades distintas | Políticas de navegador y credenciales; [seguridad][tsecu], [navegador][tsec] | C. POST, efecto y lectura se separan; cliente servidor no hereda política CORS del navegador. |
| 05.9 | Recursos/comandos, nombres, schemas, validación, errores, paginación/filtros/orden, versiones/compatibilidad/deprecación, idempotencia, documentación/OpenAPI y pruebas de contrato | `/contracts`, [contenido][contracts-content], [contratos][tcon], [navegador][tc] | A. Diseñador acotado con feedback, compatibilidad bidireccional, colecciones y exportación. No instala rutas ni interpreta schemas arbitrarios. |
| 05.10 | Gateway, balanceador/proxy, monolito/microservicios/serverless/BFF, llamadas entre servicios, DB/transacciones distribuidas/saga, breaker/retry/backoff/caché, observabilidad/tracing/correlación/SLA/SLO | `/systems`, [contenido][systems-content], [sistemas][tsu], [navegador][ts] | A. Arquitectura guiada y scheduler de eventos, fallos parciales y recuperación; no infraestructura remota ni benchmark. |
| 05.11 | Proyecto: UI, cliente, API HTTP, contrato, validación, negocio, almacenamiento, errores, autorización e instrumentación; código ejecutable explicado | `/build-api`, [proyecto][project-content], [pedidos][to], [recepción][tor], [proyecto navegador][tpr] | C. POST/GET/PATCH reales,14 archivos incorporados con hash y descarga, instrucciones del repositorio. Map temporal explícito permitido. |
| 05.12 | API/ABI, FFI, Wasm, bindings, wire DB, streaming, modelos IA, tool calling/agentes, schemas, producto y evolución a escala | `/advanced`,12 temas en [avanzado][advanced], [lógica][tau], [navegador][ta] | A. Wasm real; ABI/FFI, wire, IA y herramientas modelados. No LLM externo, punteros nativos o SQL real. |

## 6. Follow the Click

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 06.A | Usuario pulsa Comprar ahora | `/` y `/follow-the-click`, [click][tclick], [entrega][td] | C. Interfaz de comercio ficticio, sin cobro. |
| 06.B | Evento, handler, JavaScript, estado y fetch | [ClickLab][click], eventos click/handler/request/render; [trazas][ttrace], [click][tclick] | C. El evento de estado observa la llamada al setter, no commit o paint de React. |
| 06.C | Método, URL, headers, body, credenciales y serialización | Inspector Request / Response y datos de pasos; [click][tclick], [proyecto][tpr] | C. Bearer público; no inventa cookies o headers que no se instrumentaron. |
| 06.D | DNS cuando aplica, conexión/TLS, transporte, tiempo y fallos | Vista Red y condiciones de simulación; [red][tn], [navegador][tne] | A. Esas etapas se omiten de capturas reales sin instrumentación. Fetch+parsing observado separado del tiempo lógico. |
| 06.E | Proxy/balanceador, servidor, router, middleware y handler; componentes opcionales | Vista Infraestructura y ajustes de ingreso; [red][tn], [navegador][tne] | A. Roles conceptuales, sin afirmar gateway, proxy o middleware Next desplegados. |
| 06.F | Ruta, autenticación, autorización, validación, negocio, datos y efectos | Eventos del handler real y escenarios; [pedidos][to], [click][tclick], [proyecto][tpr] | C. Rechazos impiden las etapas posteriores correspondientes. |
| 06.G | INSERT INTO orders y responsabilidades de API/negocio/DB | [panel SQL][sql-panel], [proyección][tsql], [navegador][tsqle] | A permitida. Parámetros de la escritura seleccionada, Map real y SQL conceptual; SQL nunca ejecutado. |
| 06.H | Status, headers, body, serialización y regreso | Inspector y pasos response/receive/parse; [click][tclick], [red][tne] | C en observaciones disponibles; retorno por transporte modelado, no paquetes capturados. |
| 06.I | Recibir, interpretar, solicitar estado y cambio visible | `setActualOrder`/`setNotice`, favoritos y DOM; [click][tclick], [fundamentos][tf] | C. Pantalla cambia, sin atribuir medición a render/paint no instrumentados. |
| 06.1 | Play, pausa, avanzar/retroceder, replay, velocidad y timeline | [TracePlayer][player], [trazas][ttrace], [click][tclick], [X Ray][tx] | C. Reducer puro; reproducir no repite efectos. |
| 06.2 | Inspector, código, request/response, datos de fronteras y explicación causal | Inspector compartido, vistas y disclosures; [interacción][ti], [X Ray][tx] | C. Tres profundidades conservan captura, evento y panel. |
| 06.3 |200,201,400,401,403,404,409,429,500, timeout, fallo de red y duplicado |12 escenarios de [scenarios.ts][scenarios]; [trazas][ttrace], [red][tn], [click][tclick], [navegador red][tne] | C. Los fallos cambian etapas y resultado; no se presentan todos como errores HTTP reales. |
| 06.4 | Segundo botón solo local, sin petición remota | Favoritos; [click][tclick], [entrega][td] | C. Se comprueba ausencia de solicitudes, también durante replay. |

## 7. X Ray transversal

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 07.1 | Iniciador/receptor, contrato, datos, tecnología, frontera, código, resultado y errores | [interaction.ts][interaction], [TracePlayer][player], [interacción][ti], [X Ray][tx] | C para operaciones didácticas capturadas de todos los laboratorios. Editar un borrador, buscar o navegar son controles, no nuevas ejecuciones del experimento. |
| 07.2 | Fronteras mismo proceso, IPC, red, servicios y almacenamiento | Anatomy, Systems y pedidos; [interacción][ti], [sistemas][ts] | C. Los extremos vienen del productor, no se deducen del texto. |
| 07.3 | Modelo reproducible, no solo animación prefabricada | [trace.ts][trace], productores puros, eventos instrumentados; [trazas][ttrace], [interacción][ti] | C. Capturas independientes e inmutables durante reproducción. |
| 07.4 | Intuition, Engineering e Internals sin perder contexto | Contexto común de profundidad y X Ray; [X Ray][tx] | C. Prueba durante reproducción en marcha y entre pestañas/rutas. |

## 8. API Playground, laboratoriosA aJ

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 08.A | Función sumar(10,20), firma, argumentos, pila, ejecución y retorno editables | Capítulo0, [aprendizaje][tl], [fundamentos][tf] | C. Función real, pila simplificada. |
| 08.B | DOM real sin tráfico de red | Capítulo2, enlace B del menú, [fundamentos][tf] | C. Anatomy conserva su propio acceso, sin ocupar B. |
| 08.C | HTTP: método, URL, params, headers, body, envío, respuesta y timeline | `/playground?tab=http`, [playground][tp] | C. Mismo origen y rutas permitidas; no redirecciones ni API keys externas. |
| 08.D | GraphQL con selección de campos y respuesta correspondiente | `/playground?tab=graphql`, [playground][tp] | A. Query editable y proyección real del modelo, sin servidor GraphQL desplegado. |
| 08.E | RPC/gRPC: procedimiento, contrato tipado, serialización y transporte simulado | `/playground?tab=rpc`, [playground][tp], [comparador][tce] | A. Simulación identificada. |
| 08.F | Chat WebSocket/SSE/polling, actualizaciones y conexiones | `/events?tab=communication`, [eventos][te] | A. Los modelos funcionan; SSE real es una pestaña adicional finita. |
| 08.G | Pago confirmado, evento, webhook, receptor, proceso; duplicados, errores y retries | `/events?tab=delivery`, [eventos][tev], [navegador][te] | A. Pagos ficticios; intentos y efectos cambian realmente en el modelo. |
| 08.H | Credencial y permiso modificables;401 frente a403 | `/security`, [seguridad][tsec], [pedidos][to] | C. Modelo y HTTP local real, sin seguridad de producción. |
| 08.I | Diseñar interfaz desde requisitos y observar consecuencias de malas decisiones | `/contracts`, [contratos][tc], [desafíos][tch] | A. Constructor guiado acotado; schema, negocio y compatibilidad separados. |
| 08.J | Construir arquitectura y variar latencia, fallos, retry, timeout, caché y concurrencia | `/systems`, [sistemas][ts] | A. Constructor guiado sin editor libre de grafos, coherente con su contrato. |
| 08.1 | Controles operativos y paneles con resultados, no decorativos | Suites de los diez recorridos y [entrega][td] | C en los casos comprobados. No es un censo matemático de todas las combinaciones de controles. |

## 9. Nueve elementos en cada capítulo

P = pregunta, V = intuición visual, D = demostración interactiva, T = explicación técnica, C = código, A = alternativa, E = error frecuente, Q = comprobación con feedback, R = reto práctico. Esta tabla acredita presencia y operación, no resultados humanos.

| Id (capítulo tras el punto) | P, V, D, T, C, A, E, Q y R: ubicación | Comprobación | Resultado y límite |
|---|---|---|---|
| 09.0 | Pregunta y contenido de [fundamentos][foundations]; función, Anatomy, pila, quiz y reto42 | [aprendizaje][tl], [fundamentos][tf] | C. Resultado y razonamiento son necesarios para progreso. |
| 09.1 | Pregunta, contrato visual, implementación intercambiable, técnica/código/alternativa/error y quiz/reto | [fundamentos][foundations], [fundamentos navegador][tf] | C. Retorno incompatible se detecta al ejecutar. |
| 09.2 | Pregunta, DOM/Anatomy, ejemplos, texto técnico/código/alternativas/error, quiz y dos cambios | [fundamentos][foundations], [fundamentos navegador][tf] | C. Leer un ejemplo no ejecuta una syscall. |
| 09.3 | Pregunta, procesos/Anatomy/ramas, modelo de error parcial, texto/código/alternativas/error y reto concurrente | [fundamentos][foundations], [fundamentos navegador][tf] | C. Dependencias por rama, sin orden global inventado. |
| 09.4 | Pregunta inicial de red, ruta visual, transporte modelado, notas/código/alternativas/error, quiz y pérdida de unidad | [HTTP y red][http-content], [LabChapter][labchapter], [playground][tp] | C. Transporte es conceptual. |
| 09.5 | Pregunta inicial HTTP, mensaje visual/editor, notas/métodos/código/alternativas/error, quiz y JSON/texto/304 | [HTTP y red][http-content], [LabChapter][labchapter], [playground][tp] | C. Actividades y razonamiento comprobados. |
| 09.6 | Pregunta de igual negocio, alternativas paralelas, contratos/trazas, notas/código/compromisos/error, quiz y dos objetivos | [comparación][comparison], [comparador][tce] | C. Mecanismos remotos modelados y consola HTTP real separada. |
| 09.7 | Pregunta de confirmación, diagramas de chat/entrega, notas/código/tabla de alternativas/error, quiz y tres actividades | [eventos][events-content], [eventos navegador][te] | C. No promete exactly once universal. |
| 09.8 | Pregunta de acceso, flujo de decisiones, consolas, notas/código/alternativas/error, quiz y cuatro actividades | [seguridad][security-content], [seguridad navegador][tsec] | C. CORS/CSRF distingue envío, efecto y lectura. |
| 09.9 | Pregunta de evolución, diseño antes/después, validación, notas/código/alternativas/error, quiz y cuatro actividades | [contratos][contracts-content], [contratos navegador][tc] | C. Pruebas de schema no garantizan negocio correcto. |
| 09.10 | Pregunta de fallo parcial, mapa/tiempo/transacción, modelo, notas/código/alternativas/error, quiz y cuatro observaciones | [sistemas][systems-content], [sistemas navegador][ts] | C. SLO simulado sin SLA de producción. |
| 09.11 | Pregunta de piezas necesarias, fronteras y UI real, contrato/técnica/código/alternativas/error, quiz y seis resultados | [proyecto][project-content], [proyecto navegador][tpr] | C. Visor y descarga contienen fuentes de esta compilación. |
| 09.12 | Doce preguntas/temas, bytes/buffers/herramienta, seis actividades, why/what/how/código/alternativas/misconception y12 respuestas | [avanzado][advanced], [avanzado navegador][ta] | C. Cada tema avanzado conecta con experimentos compartidos, no doce infraestructuras independientes. |

Las preguntas del prompt sobre APIs sin internet/JSON, local frente a remoto, HTTP frente a REST, webhooks, acceso DB, idempotencia, éxito de negocio, permisos, respuesta perdida, correlación y diseño/arquitectura aparecen entre fundamentos, comparador, seguridad, contratos, sistemas, proyecto y referencia. Las suites prueban feedback y efectos; fase4 evalúa explicaciones propias y transferencia.

## 10. Diseño y navegación

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 10.1 | Instrumento oscuro, tipografía legible, jerarquía, contraste, SVG y movimiento con significado | [design.md][design], tokens CSS, [entrega][td], capturas de fase5 | C en las superficies inspeccionadas. La calidad estética excepcional es un juicio editorial, no una métrica certificada. |
| 10.2 | Código legible, responsive y paneles redimensionables cuando sean útiles | Scroll interno de código/tablas, composición responsive, [entrega][td], suites móviles | A. Paneles con tamaño adaptativo y scroll, sin tiradores de redimensionado; no se exige un editor profesional completo. Light mode es opcional y no se implementa. |
| 10.3 | Colores consistentes para consumidor, contrato, proveedor, datos, error y persistencia, acompañados por etiquetas | [design.md][design], diagramas y31 pares de contraste; [entrega][td] | C en pares de tokens y pantallas comprobadas; no todos los píxeles/estados posibles. |
| 10.4 | Home inicia interacción sin lectura larga, no landing comercial | `/` monta ClickLab; [click][tclick], observación directa de fase5 | C funcional. La demostración es inmediata al operar; comprensión por principiantes en menos de30s no medida. |
| 10.5 | Home, First Principles, Universe, Follow the Click, Playground, Systems, Challenges y Reference |15 rutas públicas, [curso][course], [navegación][tfront], [entrega][td] | A de agrupación. Ocho destinos originales distribuidos en cinco áreas, sin perder accesos o contexto. |

## 11. Stack e ingeniería

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 11.1 | Next App Router, React, TypeScript estricto, estilos, diagramas, estado y pruebas | [arquitectura0001][architecture], package.json, tsconfig y build | A permitida. Tailwind/CSS, SVG y reducer/context sustituyen Motion/React Flow/Monaco/Zustand donde no hacen falta; Vitest y Playwright instalados. |
| 11.2 | Modularidad y separación de contenido y visualización | `src/content`, `src/lib`, `src/components`, `src/app`; typecheck y lint | C en la estructura y límites revisados, sin afirmar una prueba formal de mantenibilidad. |
| 11.3 | Modelo reutilizable, datos estructurados y lógica de reproducción compartida | [trace.ts][trace], [TracePlayer][player], productores; [trazas][ttrace], [interacción][ti] | C. Los escenarios producen eventos; no mantienen animaciones aisladas por pantalla. |
| 11.4 | Navegación funcional y progreso local | [course.ts][course], validadores/merge y dos almacenes versionados; [curso navegador][tco] | C. Visitar no completa; almacenamiento bloqueado permite sesión sin persistencia. |
| 11.5 | Teclado y tecnologías de asistencia | Nombres/roles, foco, skip link, pestañas y controles; [entrega][td], suites por laboratorio, [lector histórico][reader] | C para tareas y cobertura declaradas. VoiceOver confirmado previamente por el usuario; no se repitió una sesión humana en fase5 ni se acredita todo lector. |
| 11.6 | Prefers-reduced-motion y rendimiento con animación | Capturas nuevas pausadas bajo preferencia, navegación y medidas locales; [entrega][td], [X Ray][tx] | C para esas condiciones. Sin carga sostenida, laboratorio remoto o presupuesto universal de rendimiento. |
| 11.7 | Pruebas automatizadas esenciales |20 archivos Vitest y suite de entrega; [verificación][verify] | C sobre fuentes identificadas, sin introducir dependencias. |
| 11.8 | Distinguir ejecución, simulación y procedencia sin métricas inventadas | Etiquetas en eventos/capturas, `provenance`, `logicalTime`, `measuredMs` y `atMs`; [interacción][ti], [red][tne], [sistemas][ts] | C. Flechas no se anuncian como captura de paquetes. |
| 11.9 | Al menos un endpoint HTTP real inspeccionable y experiencias esenciales sin servicios/keys externas | POST/GET/PATCH, diagnóstico y SSE locales; [entrega][td], [playground][tp], [eventos][te] | C. Tokens públicos demostrativos no requieren configuración. |

## 12. Motor causal

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 12.1 | UserAction, ClientExecution, Invocation, BoundaryCrossing, ProviderExecution, StateChange, Result y ClientUpdate según caso | `Stage`, escenarios, productores y [trace.ts][trace]; [trazas][ttrace], [interacción][ti] | A de nombres. Etapas por mecanismo; una función no hereda transporte remoto. |
| 12.2 | Id, timestamp lógico, actor, acción, input/output, estado, dependencias y explicación | `TraceEvent` tipado e inspector; [trazas][ttrace], [interacción][ti] | C. `logicalTime` es orden, no timestamp de reloj físico. |
| 12.3 | Código relevante, metadatos de error y profundidad | `code`, `error`, `explanation` con tres profundidades; [X Ray][tx] | A de representación. Profundidad es un registro por nivel, no un campo único que obligue a reemplazar la captura. |
| 12.4 | Replay, avanzar/retroceder, inspección y bifurcaciones | Reducer, errores que cortan/cambian flujo y timeline; [trazas][ttrace], [click][tclick], [red][tne] | C. No se promete un editor libre de ramas. |
| 12.5 | Comparar ejecuciones e inyectar fallos | Captura anterior en Follow the Click, comparador y Systems; [SQL navegador][tsqle], [comparador][tce], [sistemas][ts] | C. Comparar no repite escritura ni sustituye intento incierto. |
| 12.6 | Operaciones concurrentes y asíncronas | AnatomyA/B, pub/sub y scheduler requestId/span; [fundamentos][tf], [eventos][te], [sistemas][ts] | C. Dependencias propias, sin volver a indexar ramas como cadena única. |
| 12.7 | Tiempo simulado frente a observado; no inventar latencia, bytes o rendimiento | `atMs` simulado, `measuredMs` fetch+parsing, Performance del navegador; [entrega][td] | C. Las mediciones del informe especifican muestra, entorno, caché y significado. |

## 13. Comparative Engine

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 13.1 | Un objetivo de negocio común y alternativas local, REST, GraphQL, RPC, gRPC, polling y suscripción | `/compare`, diez interfaces, consultar/confirmar; [comparación][tcomp], [navegador][tce] | C. Incluye además JSON-RPC, XML-RPC y SOAP. |
| 13.2 | Paralelo: arquitectura, contrato, flujo, código, frontera, error, complejidad y compromisos | Tarjetas, tabla de dimensiones e inspector de cada alternativa | C. Complejidad cualitativa; número de eventos no se presenta como benchmark. |
| 13.3 | Comparaciones conceptualmente válidas, categorías distintas explicadas | Categoría/capa en taxonomía y aviso del comparador; [taxonomía][tte], [comparador][tce] | C. Se comparan soluciones al mismo objetivo, no GraphQL y TCP como capas equivalentes. |

## 14. Evaluación

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 14.1 | Diagnóstico de arquitectura y predicción de ejecución | `/challenges`, architecture/prediction; [catálogo][challenges], [desafíos][tch] | C. Restricciones y predicción más causa comprobadas. |
| 14.2 | Debug the Request y Choose the Interface | debug/interface del catálogo; [desafíos][tch] | C. Corregir rol/body y cumplir contrato son parte del resultado. |
| 14.3 | Design the Contract, Failure Injection y Spot the Misconception | contract/failure/misconception; [desafíos][tch] | C. No basta una causa correcta con operación incorrecta. |
| 14.4 | Feedback explicativo y progresión básico a avanzado | Siete desafíos, quizzes de capítulos, reintentos y logros separados | C. La app evalúa sus modelos; no certifica comprensión independiente sin fase4. |

## 15. Precisión técnica

Los quince puntos y la regla de simplificación se numeran P01 a P16 como en el [registro histórico][precision]. Esta columna recoge la comprobación actual; no reutiliza el16/16 inicial como evidencia nueva.

| Id | Distinción requerida | Superficie y evidencia de este corte | Resultado y límite |
|---|---|---|---|
| 15.P01 | API frente a endpoint | Función/DOM, referencia; [fundamentos][tf], [referencia][tr] | C. API general antes de HTTP. |
| 15.P02 | API frente a protocolo | Categorías/capas de taxonomía; [taxonomía][tt], [navegador][tte] | C. Seis dimensiones independientes. |
| 15.P03 | REST frente a HTTP | Restricciones REST y límite del comparador; [comparación][comparison], [taxonomía][taxonomy] | C editorial y comparaciones operativas. No certificado REST del endpoint local. |
| 15.P04 | JSON frente a API | Función local y negociación JSON/texto; [fundamentos][tf], [playground][tp] | C. La representación no define toda la interfaz. |
| 15.P05 | SDK frente a API remota encapsulada | Ejemplos capítulo2, ficha SDK y relaciones; [fundamentos][foundations], [taxonomía][tt] | C editorial. No SDK de tercero ejecutado. |
| 15.P06 | Autenticación frente a autorización | Modelos y401/403 reales; [seguridad][tsec], [pedidos][to], [entrega][td] | C. Rol lector no obtiene permisos de escritura. |
| 15.P07 | JWT frente a OAuth | Credenciales y OIDC; [seguridad][tsec], [contenido][security-content] | C. Firma y proveedor son conceptuales, access token distinto de ID token. |
| 15.P08 | WebSocket frente a webhook | Modelos comunicación/entrega; [eventos][te] | C. Canal bidireccional frente a callback remoto. |
| 15.P09 | Función local frente a remoto | Anatomy, GET/POST corregidos y favoritos; [trazas][ttrace], [click][tclick], [interacción][ti] | C. Explicaciones y metadatos propios por operación. |
| 15.P10 | Distribución no implica sincronía | Pub/sub, stream y finalización tardía; [eventos][te], [sistemas][ts] | C en modelos etiquetados. |
| 15.P11 | No todo click hace red | Favoritos, DOM y replay; [click][tclick], [fundamentos][tf], [entrega][td] | C. Ausencia de solicitudes comprobada. |
| 15.P12 | Backend no implica REST | Módulos/servicios, RPC y mensajes; [comparador][tce], [sistemas][ts] | C. Contratos alternativos visibles. |
| 15.P13 | Gateway, proxy y microservicios son opcionales | Ajustes de ingreso y arquitectura; [red][tne], [sistemas][ts] | C. Capturas reales no inventan componentes. |
| 15.P14 | OpenAPI/AsyncAPI no son transporte | Fichas y exportaciones locales; [taxonomía][tt], [contratos][tc] | C. Descargar no despliega rutas o brokers. |
| 15.P15 | Fallo remoto no equivale a excepción local | Respuesta perdida, timeout, reintento con identidad; [click][tclick], [proyecto][tpr], [sistemas][ts] | C. Efecto remoto puede existir pese a error del cliente. |
| 15.P16 | Simplificaciones correctas y límites visibles | Pila conceptual, SQL no ejecutado, procedencia, setter frente a paint; [fundamentos][tf], [SQL][tsqle], [X Ray][tx] | C para textos y escenarios revisados, sin garantía de ausencia de cualquier error editorial futuro. |

## 16. Ocho pruebas de calidad

| Id | Prueba | Evidencia | Resultado y límite |
|---|---|---|---|
| 16.1 | Principiante explica necesidad y API sin internet | N1, [fase4][human] | P. Sin sesión real. |
| 16.2 | Junior interpreta petición, métodos, headers, body, status y errores | J1, [fase4][human] | P. Sin sesión real. |
| 16.3 | Backend compara interacción, contratos, permisos, fallos y versiones | B1, [fase4][human] | P. Sin sesión real. |
| 16.4 | Arquitecto distingue local, remoto y eventos | A1, [fase4][human] | P. Sin sesión real. |
| 16.5 | Diferencia local/remoto comprendida principalmente por interacción visual | V1, [fase4][human] | P. Sin sesión real. Capturas y agentes no sustituyen a la persona. |
| 16.6 | Causalidad de cada animación | [trazas][ttrace], [interacción][ti], [X Ray][tx], ramas y scheduler | C en productores y recorridos cubiertos. Movimiento deriva del cursor/evento. |
| 16.7 | Sin rutas vacías, controles decorativos o ejercicios sin evaluación anunciados como completos |15 rutas, suites de laboratorios, desafíos y entrega | C en superficies y acciones comprobadas. No promesa sobre toda combinación imaginable. |
| 16.8 | Precisión incluso al simplificar |16 distinciones de sección15, correcciones1 a3 y suites | C en el contraste editorial y operativo de este corte. |

## 17. Plan de ejecución

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 17.1 | Modelo conceptual y design system | Specs0001 a0005, [trace.ts][trace], [design.md][design] | C de entregables presentes, sin atribuir al número de spec una fecha de ejecución. |
| 17.2 | Experiencia central completa, X Ray y HTTP real | ClickLab, inspector transversal y endpoints; [click][tclick], [X Ray][tx] | C actual. La consolidación transversal tiene spec0014; no se acredita haber terminado todo X Ray antes del núcleo educativo. |
| 17.3 | Núcleo, familias y contenido avanzado | Capítulos0 a12 y laboratoriosA aJ; secciones5 y8 de esta matriz | C de alcance construido. |
| 17.4 | Pruebas, correcciones, accesibilidad y precisión | Pasada integral de [fase5][verify] | C en cobertura declarada; validación pedagógica sigue pendiente. |
| 17.5 | Seguir literalmente el orden de las siete fases originales | Alcance Journey/Beta, specs y verificaciones del repositorio | L. El proyecto se construyó por recorridos y tuvo consolidaciones posteriores. El estado actual no prueba ese orden histórico literal ni permite cambiarlo retroactivamente. |
| 17.6 | No declarar terminado con placeholders y documentar incompleto | Scope2, README y Calidad reconciliados | C. Bloques7/8 y20 original permanecen en curso mientras falta aceptación humana; no se crea una aprobación ficticia. |

## 18. Entregables

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 18.1 | App Next funcional y código fuente completo/modular | Repositorio, build, arranque y15 rutas; [verificación][verify] | C. Sin publicación ni cambios Git. |
| 18.2 | Diseño visual de alta calidad | [design.md][design], tokens y capturas/teclado/móvil | C editorial acotado. No acredita una valoración universal de calidad estética. |
| 18.3 | Currículo y taxonomía navegable | Secciones4/5/9, [curso][course], [taxonomía][tte] | C. Resultados de comprensión separados. |
| 18.4 | Follow the Click y X Ray | Secciones6/7, [click][tclick], [X Ray][tx] | C. SQL conceptual y HTTP real diferenciados. |
| 18.5 | Laboratorios y editor/inspector de requests | Sección8, [playground][tp] | C. Experiencias esenciales locales. |
| 18.6 | Comparador y ejercicios | Secciones13/14, [comparador][tce], [desafíos][tch] | C. Feedback y resultados operativos. |
| 18.7 | Pruebas automatizadas, ejecución, arquitectura y simplificaciones | package.json, [README][readme], specs y [verificación][verify] | C. Evidencia nueva separada de los cortes históricos. |
| 18.8 | Sin registro, pago o credenciales de terceros; contenido educativo en español | Arranque local, rutas y contenido; [entrega][td] | C. Términos técnicos y ejemplos de código conservan nombres apropiados. |

## 19. Principio final

| Id | Requisito | Superficie y comprobación | Resultado y límite |
|---|---|---|---|
| 19.1 | Explicar cómo un click cambia otra computadora mediante mecanismos, contratos y fronteras | ClickLab y proyecto real, red conceptual, eventos y sistemas; [click][tclick], [proyecto][tpr], observación directa | C como capacidad del laboratorio. La ejecución real usa dos procesos locales; el trayecto remoto se modela explícitamente. |
| 19.2 | API como uso de capacidades entre componentes, con mapa coherente de tecnologías | Fundamentos, Anatomy, taxonomía, comparador y referencia | C editorial y operativo. No se reduce API a URL o internet. |
| 19.3 | El usuario deduce por qué, cómo y cuándo usar interfaces | [fase4][human], preguntas de transferencia | P. Requiere respuestas reales, no una declaración del agente. |

## Resultado global del contraste

El alcance técnico tiene superficies y pruebas identificadas. Las decisiones de SVG, reducer/context, Map temporal, constructor guiado y protocolos modelados son adaptaciones declaradas, compatibles con las alternativas y simulaciones que permite el prompt. No se encontraron superficies obligatorias anunciadas como implementadas que sigan siendo placeholders en este corte.

No se afirma cumplimiento «al pie de la letra» de todo el prompt: faltan los cinco resultados humanos y no se acredita el orden histórico literal de las fases originales. La matriz conserva también límites editoriales y de cobertura; no convierte superlativos de diseño, ausencia universal de errores o eficacia pedagógica en hechos medidos. El bloque20 y el cierre completo de scope2 siguen en curso.

[verify]: fase5-verificacion.md
[human]: ../specs/0020-validacion-pedagogica/verify.md
[precision]: ../specs/0018-verificacion-entrega/precision.md
[reader]: ../specs/0018-verificacion-entrega/reader.md
[architecture]: ../specs/0001-arquitectura-proyecto/index.md
[design]: ../../design.md
[readme]: ../../README.md
[course]: ../../src/content/course.ts
[foundations]: ../../src/content/foundations.ts
[taxonomy]: ../../src/content/taxonomy.ts
[comparison]: ../../src/content/comparison.ts
[http-content]: ../../src/content/http.ts
[events-content]: ../../src/content/events.ts
[security-content]: ../../src/content/security.ts
[contracts-content]: ../../src/content/contracts.ts
[systems-content]: ../../src/content/systems.ts
[project-content]: ../../src/content/project.ts
[advanced]: ../../src/content/advanced.ts
[challenges]: ../../src/content/challenges.ts
[trace]: ../../src/lib/trace.ts
[interaction]: ../../src/lib/interaction.ts
[scenarios]: ../../src/lib/scenarios.ts
[player]: ../../src/components/trace-player.tsx
[anatomy]: ../../src/components/api-anatomy.tsx
[anatomy-model]: ../../src/lib/anatomy.ts
[click]: ../../src/components/click-lab.tsx
[sql-panel]: ../../src/components/order-storage-example.tsx
[labchapter]: ../../src/components/lab-chapter.tsx
[ttrace]: ../../tests/trace.test.ts
[ti]: ../../tests/interaction.test.ts
[tl]: ../../tests/learning.test.ts
[tn]: ../../tests/network.test.ts
[th]: ../../tests/http.test.ts
[tt]: ../../tests/taxonomy.test.ts
[tcomp]: ../../tests/comparison.test.ts
[tev]: ../../tests/events.test.ts
[tsecu]: ../../tests/security.test.ts
[tcon]: ../../tests/contracts.test.ts
[tsu]: ../../tests/systems.test.ts
[tau]: ../../tests/advanced.test.ts
[to]: ../../tests/orders.test.ts
[tor]: ../../tests/order-receipt.test.ts
[tsql]: ../../tests/order-storage.test.ts
[tf]: ../../tests/e2e/foundations.spec.ts
[tte]: ../../tests/e2e/taxonomy.spec.ts
[tce]: ../../tests/e2e/comparison.spec.ts
[tp]: ../../tests/e2e/playground.spec.ts
[te]: ../../tests/e2e/events.spec.ts
[tsec]: ../../tests/e2e/security.spec.ts
[tc]: ../../tests/e2e/contracts.spec.ts
[ts]: ../../tests/e2e/systems.spec.ts
[tpr]: ../../tests/e2e/project.spec.ts
[ta]: ../../tests/e2e/advanced.spec.ts
[tch]: ../../tests/e2e/challenges.spec.ts
[tr]: ../../tests/e2e/reference.spec.ts
[tco]: ../../tests/e2e/course.spec.ts
[tfront]: ../../tests/e2e/front-regressions.spec.ts
[tclick]: ../../tests/e2e/click-lab.spec.ts
[tne]: ../../tests/e2e/network.spec.ts
[tx]: ../../tests/e2e/xray.spec.ts
[tsqle]: ../../tests/e2e/storage-example.spec.ts
[td]: ../../tests/e2e/delivery.spec.ts
