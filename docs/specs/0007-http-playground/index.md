# 0007. Red y laboratorio de mensajes HTTP

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El playground permite editar peticiones HTTP reales y estudiar por separado una red conceptual. Completa los capítulos 4 y 5 e integra laboratorios de campos GraphQL y procedimientos RPC reutilizando los contratos del comparador.

## Requirements

- **AC-1**: `/playground` ofrece cuatro pestañas operables, HTTP real, Red conceptual, GraphQL y RPC/gRPC, con navegación y estado conservado al cambiar de pestaña. Las reproducciones ocultas se pausan. Ningún fetch ocurre por montaje, cambio de pestaña o replay.
- **AC-2**: El editor acepta GET, POST, PUT, PATCH y DELETE, URL, params query, headers y body de texto. Previsualiza URL descompuesta, query repetida y fragmento que no se transmite. Solo permite el mismo origen y rutas `/api/lab/http`, `/api/orders` y `/api/orders/{id}`. Sin proxy servidor ni destinos externos. Headers admitidos: Accept, Content-Type, Authorization, Idempotency-Key, If-None-Match y X-Demo-Note. Rechaza duplicados, líneas inválidas y headers fuera del contrato. URL máxima 2048 caracteres, headers 8192 y body 4096 bytes. GET no envía body.
- **AC-3**: Enviar captura método, URL efectiva, headers configurados, body exacto, status, headers de respuesta, texto original, parsing y duración fetch más lectura de body. JSON inválido en el editor puede enviarse para recibir 400; no se ejecuta código arbitrario. Capturas con 304, 405 o body no JSON conservan status y datos sin inventar una excepción de red. Error de edición no envía fetch. Red o aborto a los 10 segundos genera captura sin Response si no se recibió. Creación de pedido incierta conserva clave y solicitud exacta; bloquea edición hasta reintento concluyente. Credenciales siguen públicas.
- **AC-4**: `/api/lab/http` es un receptor público de diagnóstico sin persistencia ni sesiones. GET y cuatro métodos con cuerpo opcional devuelven 200, representación JSON o text/plain negociada con Accept, incluidas prioridades q y comodines comunes. Un body no vacío exige application/json y lector UTF-8 acotado existente. Query máximo 20 entradas, claves 40 y valores 200 caracteres. Message procede del primer parámetro message o Hola. 400, 406, 413 y 415 son errores JSON estructurados. GET ofrece ETag SHA-256 de la representación, Cache-Control private,no-cache y Vary Accept; If-None-Match coincide débilmente, admite lista o *, y devuelve 304 sin body. Otros métodos y errores usan no-store. No se interpreta el eco como operación CRUD ni cumplimiento completo REST.
- **AC-5**: Presets cargan diagnóstico GET/POST, creación, consulta y confirmación de pedidos, sin enviar automáticamente. Último id procede de una respuesta real. Reutilizar ETag modifica If-None-Match explícitamente; solo se ofrece para GET diagnóstico con ETag recibido. Fetch usa no-store para que la consola observe el intercambio condicional manual, sin atribuirlo a caché automática. Permisos y contratos de pedidos permanecen intactos; PUT/DELETE en pedidos pueden devolver 405.
- **AC-6**: El modelo de red cambia entre HTTP/1.1 sobre TCP+TLS, HTTP/2 sobre TCP+TLS, HTTP/3 sobre QUIC+UDP+TLS integrado y UDP directo sin HTTP. Puede elegir IP literal o nombre, caché DNS, conexión reutilizada, pérdida de la segunda unidad ilustrativa, pérdida de respuesta y un reintento GET. DNS, preparación, serialización, envío, routing, procesamiento y retorno son eventos inspeccionables. IP literal omite DNS; reutilización omite preparación; HTTP/3 no dibuja handshake TCP. UDP directo no presume conexión, TLS, reordenación fiable ni respuesta HTTP.
- **AC-7**: Tres unidades numeradas ilustran fragmentación y dos routers muestran decisiones de encaminamiento; no son tamaños, paquetes o rutas capturados. TCP y QUIC recuperan una unidad perdida, UDP directo conserva entrega incompleta. Los perfiles HTTP reconstruyen datos ordenados antes del handler. Una respuesta perdida conserva resultado producido pero no recibido; reintentar agrega otra invocación GET, no solo retransmisión de transporte. Latencia configurable 10 a 250 ms de ida y procesamiento de 10 a 200 ms alimentan un cálculo explícitamente simulado `2 × ida + procesamiento`, sin DNS ni establecimiento, no un benchmark entre protocolos. El fallo de retorno es una condición independiente de ese cálculo. Todas las capturas conservan ajustes y no muestran tiempos simulados como medidos.
- **AC-8**: Capítulo 4 explica IP, puerto, DNS, TCP, UDP, QUIC, TLS, HTTP, versiones, conexión, paquete, routing, latencia, request/response, timeout y retry con límites. Capítulo 5 explica URL, método, query, headers, body, status, tipos de contenido, cookies, tokens, caché y negociación. GET, POST, PUT, PATCH y DELETE tienen semántica, safety e idempotencia correctas. Cada capítulo incluye pregunta, intuición, demostración, código, alternativa, error frecuente, evaluación razonada y desafío verificable por actividad, sin alterar progreso de capítulos 0 a 3.
- **AC-9**: Laboratorio D cambia campos y operación GraphQL y muestra documento, SDL, resolver, resultado y traza. Laboratorio E cambia RPC/gRPC y modalidad, con serialización y transporte modelados. Reutilizan `compareRun` y catálogo 0006; son simulaciones y no un servidor ni parser completo. Funcionan teclado, foco, móvil a 390px y reducción de movimiento. Pruebas cubren parser, whitelist, negociación, caché condicional, fallos de red, matrices de perfiles y flujos reales del editor.

## Decision

Usar el stack y `design.md`, sin dependencias nuevas. Componentes independientes conservados bajo pestañas hidden, con pausa al ocultarse. Reutilizar TracePlayer y reducer, readJSON y contratos de pedidos. Un receptor diagnóstico mínimo da contexto a las partes HTTP sin modificar pedidos.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`.

## Feature design

**Datos**: borrador `{method,url,params,headers,body}` de strings controlados y método enumerado. Preparación pura produce URL efectiva, headers normalizados y body de texto opcional. No hay tabla ni migración. Resultados se guardan en Capture, con cuerpo de request marcado como texto exacto; no se envuelve como JSON otra vez. Eventos observed de cliente, eventos conceptuales de red, sin inferir sockets de fetch. Un intento pendiente guarda la solicitud preparada, su clave y payload.

**Resultado incierto**: después de recibir headers, Capture conserva status y headers aunque falle leer el body. Una creación conserva solicitud exacta ante excepción, aborto, 5xx o 2xx sin JSON interpretable que contenga order.id. Se libera con 2xx y pedido válido. Un primer rechazo 4xx libera edición; un 4xx durante reintento de una ejecución ya incierta informa el rechazo actual pero no demuestra el resultado anterior, por lo que conserva el intento. No se reenvía automáticamente. Las respuestas no JSON se representan como texto cuando su content-type no es JSON; un content-type JSON con texto inválido se muestra junto a error de parsing, sin perder Response.

**Desafíos de sesión**: capítulo 4 requiere ejecutar HTTP/3 con pérdida de unidad y observar recuperación, ejecutar UDP directo con pérdida y observar entrega incompleta, y responder correctamente que QUIC añade garantías sobre UDP. Capítulo 5 requiere GET diagnóstico 200 JSON interpretable, GET diagnóstico 200 text/plain y GET diagnóstico 304 mediante revalidación manual, más respuesta correcta sobre idempotencia y efecto pretendido. Los modelos no marcan logros HTTP. Se muestran condiciones pendientes y feedback; no se modifica progreso 0 a 3 ni se promete certificación.

**Superficies**:

| Superficie | Entrada | Resultado y fuente |
|---|---|---|
| `prepareRequest(draft, origin)` | borrador, location.origin al enviar | whitelist exacta de origen y pathname normalizado; query de URL más params añadidos con URLSearchParams; fragmento excluido |
| `/api/lab/http` GET | query y Accept, If-None-Match | JSON `{diagnostic:true, method, message, query:pares, body:null}` o texto derivado de esos valores; ETag del texto exacto |
| `/api/lab/http` POST/PUT/PATCH/DELETE | query, Accept, cuerpo JSON opcional | mismo objeto con body interpretado, sin almacenamiento |
| Rutas de pedidos | contratos 0002 y 0006 | respuestas existentes, sin adaptar métodos no soportados |
| `networkLabCapture(settings)` | perfil y condiciones nombradas en AC-6/7 | eventos y datos estructurados con fixture tienda.example, IP 203.0.113.10, routers 198.51.100.1 y 198.51.100.2, puerto443 o9000 UDP |
| Laboratorios D/E | operación, campos y modalidad de 0006 | compareRun, sin implementación paralela |

**Negociación**: sin Accept se prefiere JSON. Para cada representación se aplica el rango coincidente más específico y su q; gana mayor q, empates JSON. Los parámetros de medios distintos de q no se implementan y se señala el alcance. No hay compresión o codificación adicional. If-None-Match solo se evalúa en GET diagnóstico después de construir representación; los headers de request no forman parte del body reflejado y no rompen estabilidad del ETag. Query repetida preserva orden.

**Modelo de red**: una invocación prepara destino y conexión, transmite unidades 1,2,3 mediante ruta cliente, router1, router2, proveedor; pérdida descarta2. TCP/QUIC representan recuperación de su contenido, no retransmisión de un paquete QUIC idéntico. UDP no recupera. Perfiles HTTP construyen respuesta 200 conceptual si la aplicación recibe todo. Condición pérdida de retorno se aplica solo al primer intento; si se activa reintento, segundo GET reutiliza conexión y tiene éxito. No se hace retry de UDP, no hay mensaje HTTP o respuesta en su Capture. DNS usa catálogo existente, conexión usa eventos existentes con textos adaptados. El cálculo de intercambio no incluye pérdida, DNS ni establecimiento y no decide los fallos.

**Fuentes de valores**:

| Acción | Valores | Fuente |
|---|---|---|
| Previsualizar y enviar | URL, campos y body | borrador; origen real al montarse y al enviar; URLSearchParams para params |
| Cargar preset | método, ruta y body | constantes editoriales; id última respuesta real o no-existe; clave de creación crypto.randomUUID solo al cargar preset |
| Responder diagnóstico | query y JSON | Request.url y readJSON acotado; mensaje Hola si ausente |
| Negociar y revalidar | content-type, ETag, 304 | Accept, serialización de representación, digest SHA-256 e If-None-Match |
| Capturar HTTP | headers y cuerpo recibido, parsing, traceId | Response real y X-Trace-Id; si no existe, UUID de captura cliente; performance.now para duración observada |
| Reintentar creación incierta | URL, clave, headers y body | solicitud enviada conservada, sin regenerar valores ni leer borrador editado |
| Modelo y tiempos | etapas, unidades, ruta, resultado y cálculo | settings copiados, fixtures documentados y fórmula de AC-7; tiempo lógico del reproductor es ordinal |
| Explicar y evaluar | conceptos, soluciones y feedback | `src/content/http.ts`; logros de actividad de sesión por ejecución observada de cada laboratorio |
| Diagramas | actor activo, etapa y frontera | evento seleccionado, sin paquetes prefabricados independientes |

**Composición**: título y pregunta, pestañas, editor con presets y anatomía de URL junto a respuesta, reproductor e inspector, capítulo y evaluación; pestaña Red con controles, ruta etiquetada, unidades de datos, cálculo simulado, reproductor y capítulo; pestañas D/E con controles, contratos, resultado e inspector. Leyendas y etiquetas conservan colores semánticos existentes. Sin imágenes externas ni botones decorativos.

**Límites y seguridad**: ningún endpoint proxy y ningún destino arbitrario. Redirecciones desactivadas (`redirect:error`), credenciales same-origin. Cuerpos son datos, nunca eval. Headers de navegador que no controla el editor se explican sin fingir su captura. Diagnóstico público refleja solo datos de su propia petición, sin cookies, sesiones ni secretos del servidor. Errores internos genéricos. Máximo de pedidos y credenciales de demo existentes, sin garantías de producción.

**Escenarios críticos**: GET JSON/text, JSON malformed400, media415, Accept406, ETag304, pedidos201/200/401/403/404/405, errores de edición sin fetch y creación incierta con misma clave (AC-2 a AC-5). HTTP3 sin TCP, UDP sin TLS ni recuperación, pérdidas y reintento separado, ajustes inmutables (AC-6/7). Actividades y campos, teclado y móvil, pestañas sin reenvío (AC-1/8/9).

## Build plan

1. Parser y receptor acotado, negociación y condicionales, pruebas de frontera (AC-2 a AC-5).
2. Contenido de capítulos, modelo de red y pruebas de perfiles (AC-6 a AC-8).
3. Editor, diagramas, laboratorios reutilizados y navegación accesible (AC-1 a AC-9).
4. Pruebas de navegador y verificación en producción local, documentación y alcance (AC-1 a AC-9).

## Consequences

HTTP puede observarse realmente sin pedir infraestructura externa. Los modelos de transporte omiten congestión, tamaño y fragmentación reales, selección de ruta, detalles de handshake y negociación de versiones. El receptor no demuestra persistencia ni CRUD y el validador del editor restringe el destino por diseño. No se ofrece elección del protocolo real de fetch, que corresponde al navegador y al servidor.

## Follow-up

Seguridad general, conexiones de eventos y diseño de APIs conservan sus bloques posteriores de alcance.

## Rationale

Decisiones en [rationale.md](rationale.md).
