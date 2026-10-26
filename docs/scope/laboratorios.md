# Laboratorios de The API Universe

Prácticas de red y HTTP, comunicación, seguridad, contratos y sistemas. Cubren los capítulos 4, 5 y 7 a 10 y los laboratorios C a J. Los laboratorios A y B están en [Fundamentos](fundamentos.md). El proyecto final pertenece al [Recorrido central](recorrido-central.md).

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

Los capítulos conservan el [formato pedagógico común](fundamentos.md).

## Fase 5

### 11. Red, HTTP y laboratorio de requests · done

Completar los capítulos 4 y 5 y los laboratorios C, D y E. Puedes modificar una interacción y observar por qué cambian su contrato, transporte y resultado.

**Done when:** la visualización diferencia DNS, IP, puertos, routing, conexiones, TCP, UDP, TLS, HTTP, HTTP/2 y HTTP/3, paquetes, latencia, transmisión, procesamiento, respuesta, retries y timeouts con simplificaciones identificadas; el editor HTTP acepta método, URL, params, headers y body, ejecuta contra el endpoint local permitido y muestra respuesta y timeline; el inspector explica URL, cookies, tokens, caché, negociación y content types; GET, POST, PUT, PATCH y DELETE muestran semántica, safety e idempotencia sin equipararlos automáticamente con CRUD; seleccionar campos GraphQL modifica la respuesta; RPC y gRPC muestran contrato, serialización y transporte con la parte simulada marcada; errores de edición, serialización y red tienen feedback útil y no ejecutan código arbitrario del editor en el servidor.

- [x] Diseñar los laboratorios (spec): `/architect red http y laboratorio de requests`
- [x] Construir los laboratorios: `/develop red http y laboratorio de requests`
  - [x] Integrar editor, negociación y receptor HTTP acotado.
  - [x] Integrar modelo de transporte y capítulos 4 y 5.
  - [x] Integrar GraphQL, RPC/gRPC y navegación.
- [x] Verificar flujos reales, teclado y móvil: `/check verify red http y laboratorio de requests`
- [x] Probar contratos, modelos y regresiones: `/test red http y laboratorio de requests`

Spec [0007](../specs/0007-http-playground/index.md), código en `src/components/api-playground.tsx`, `src/components/http-editor.tsx`, `src/components/network-lab.tsx`, `src/components/protocol-lab.tsx`, `src/content/http.ts`, `src/lib/http-editor.ts` y `src/app/api/lab/http/route.ts`. [Evidencia](../specs/0007-http-playground/verify.md): capítulos 4 y 5, laboratorios C, D y E, cinco métodos reales, negociación JSON/texto y 304; cuatro perfiles de red modelados. Pasan 288 pruebas de lógica y servidor y 36 de navegador. GraphQL/gRPC y transporte son modelos etiquetados; fetch local y las respuestas HTTP sí son reales.

### 12. Comunicación continua y entregas de eventos · done

Completar el capítulo 7 y los laboratorios F y G. Puedes elegir un mecanismo para chat, actualizaciones de pedidos o callbacks de pagos simulados y observar sus diferencias de entrega.

**Done when:** polling, long polling, WebSocket, SSE, webhooks, queues, publish subscribe y event streams muestran dirección, duración de conexión, mensajes y acoplamiento; puedes enviar mensajes o producir eventos y ver resultados; el flujo Payment confirmed, Event, Webhook, Receiver y Processing permite duplicados, errores y reintentos; acknowledgments, ordering, deduplicación y consistencia eventual afectan el estado cuando corresponden; se distingue callback remoto de conexión bidireccional y no se promete entrega exactamente una vez sin justificar su alcance; cada mecanismo declara qué ejecuta y qué simula.

- [x] Diseñar eventos y conexiones (spec): `/architect comunicación continua y entregas de eventos`
- [x] Construir comunicación y entrega: `/develop comunicación continua y entregas de eventos`
  - [x] Integrar modelos de comunicación y garantías.
  - [x] Integrar SSE real con cancelación.
  - [x] Integrar capítulo 7, laboratorios F/G y evaluación.
- [x] Verificar recorridos, teclado y móvil: `/check verify comunicación continua y entregas de eventos`
- [x] Probar políticas, stream y regresiones: `/test comunicación continua y entregas de eventos`

Spec [0008](../specs/0008-eventos-entrega/index.md), código en `src/components/events-lab.tsx`, `src/components/event-models.tsx`, `src/components/sse-demo.tsx`, `src/lib/communication.ts`, `src/lib/delivery.ts` y `src/app/api/lab/events/route.ts`. [Evidencia](../specs/0008-eventos-entrega/verify.md): capítulo 7, laboratorios F/G, garantías de entrega, ramas independientes, offsets y SSE real finito. Pasan 335 pruebas de lógica y servidor y 45 de navegador. Los pagos, WebSocket, webhooks y brokers son modelos etiquetados; EventSource y HTTP local sí son reales.

### 13. Seguridad y decisiones de acceso · done

Completar el capítulo 8 y el laboratorio H. Puedes observar quién solicita una operación, qué identidad se presenta y por qué un permiso la permite o la rechaza.

**Done when:** activar credenciales y permisos produce diferencias observables entre 401 y 403, tanto en el flujo como en la explicación; se distinguen authentication, authorization, API keys, sessions, cookies, bearer tokens, OAuth 2.0, OpenID Connect, JWT, scopes y roles; TLS, CORS, CSRF, límites de uso, validación y secretos tienen mecanismos y límites explícitos; el simulador de CORS diferencia navegador de otros clientes HTTP; las credenciales demostrativas son públicas y están etiquetadas como inadecuadas para producción; ninguna pantalla transmite secretos ni presenta JWT, OAuth y API key como equivalentes.

- [x] Diseñar seguridad demostrativa (spec): `/architect seguridad y decisiones de acceso`
- [x] Construir los recorridos de seguridad: `/develop seguridad y decisiones de acceso`
  - [x] Integrar acceso y controles del servidor modelado.
  - [x] Integrar políticas CORS/CSRF y credenciales.
  - [x] Integrar consola real, capítulo y evaluación.
- [x] Verificar recorridos, teclado y móvil: `/check verify seguridad y decisiones de acceso`
- [x] Probar matrices, fallos y regresiones: `/test seguridad y decisiones de acceso`

Spec [0009](../specs/0009-seguridad-acceso/index.md), código en `src/components/security-lab.tsx`, `src/components/security-models.tsx`, `src/components/order-console.tsx`, `src/content/security.ts`, `src/lib/security.ts` y `src/app/security/page.tsx`. Los handlers de pedidos incluyen challenge Bearer en 401. [Evidencia](../specs/0009-seguridad-acceso/verify.md): cinco recorridos, capítulo 8, CORS/CSRF, credenciales y permisos reales. Pasan 406 pruebas de lógica y servidor y 65 de navegador, incluidas regresiones de frontend incorporadas en paralelo. Criptografía, proveedores OAuth/OIDC y políticas del navegador son modelos; la consola HTTP sí ejecuta peticiones reales.

## Fase 6

### 14. Diseño y evolución de contratos · done

Completar el capítulo 9 y el laboratorio I. Puedes diseñar una pequeña API a partir de requisitos y probar las consecuencias de cambiar su contrato.

**Done when:** puedes definir recursos o comandos, nombres, inputs, outputs y errores; recibir feedback sobre validación, schemas, paginación, filtros, orden, versiones, compatibilidad, deprecación e idempotency keys; comparar consumidores antes y después de un cambio compatible o incompatible; inspeccionar documentación y descripción del contrato; distinguir OpenAPI y AsyncAPI de protocolos de transporte; ejecutar comprobaciones de contrato y de comportamiento sin que el feedback sea una valoración arbitraria o solo correcto o incorrecto.

- [x] Diseñar el laboratorio de contratos (spec): `/architect diseño y evolución de contratos`
- [x] Construir el laboratorio de contratos: `/develop diseño y evolución de contratos`
  - [x] Integrar diseñador, validación y documentos.
  - [x] Integrar compatibilidad, colecciones y reintentos.
  - [x] Integrar capítulo, navegación y evaluación.
- [x] Verificar recorridos, teclado y móvil: `/check verify diseño y evolución de contratos`
- [x] Probar modelos, exportaciones y regresiones: `/test diseño y evolución de contratos`

Spec [0010](../specs/0010-diseno-contratos/index.md), código en `src/components/contracts-lab.tsx`, `src/components/contract-designer.tsx`, `src/components/contract-compatibility.tsx`, `src/components/contract-collections.tsx`, `src/lib/contracts.ts`, `src/lib/collections.ts` y `src/lib/idempotency.ts`. [Evidencia](../specs/0010-diseno-contratos/verify.md): cinco pestañas, capítulo 9, diseñador, comparación bidireccional, colecciones, retención de claves y descargas. Pasan 487 pruebas de lógica y servidor y 74 de navegador. Los proveedores y rutas son modelos; el parser, la validación y las descargas se ejecutan localmente.

### 15. Systems Lab y fallos parciales · done

Completar el capítulo 10 y el laboratorio J. Puedes construir una arquitectura pequeña y razonar sobre una petición que cruza varios componentes.

**Done when:** puedes añadir o retirar servicios dentro de límites explícitos, cambiar latencia, fallos, retries, timeouts, caché y concurrencia y observar trazas causales; el recorrido distingue reverse proxy, load balancer, API Gateway, monolito, microservicios, funciones y BFF sin afirmar que todos son obligatorios; demuestra comunicación entre servicios, transacciones locales y distribuidas, sagas, circuit breakers, exponential backoff, observabilidad, correlation IDs, tracing, SLAs y SLOs; operaciones concurrentes y fallos parciales producen efectos identificables; tiempo y métricas simulados no se muestran como mediciones reales.

- [x] Diseñar el laboratorio de sistemas (spec): `/architect systems lab y fallos parciales`
- [x] Construir el laboratorio de sistemas: `/develop systems lab y fallos parciales`
  - [x] Integrar constructor y ejecución causal con tracing.
  - [x] Integrar protecciones, caché, métricas y comparación.
  - [x] Integrar transacciones y recuperación.
  - [x] Integrar capítulo, navegación y evaluación.
- [x] Verificar recorridos, teclado y móvil: `/check verify systems lab y fallos parciales`
- [x] Probar modelos y regresiones: `/test systems lab y fallos parciales`

Spec [0011](../specs/0011-sistemas-fallos/index.md), código en `src/lib/systems.ts`, `src/lib/transactions.ts`, `src/content/systems.ts`, `src/components/systems-lab.tsx`, `src/components/system-experiment.tsx` y `src/components/transaction-experiment.tsx`. [Evidencia](../specs/0011-sistemas-fallos/verify.md): constructor, carga, protecciones, métricas, cuatro modos transaccionales y recuperación. Conserva 42 pruebas nuevas de lógica y ocho recorridos de navegador, además de integración con el progreso común del curso, con 545 pruebas de lógica y 89 recorridos comprobados en conjunto y repeticiones focalizadas. Infraestructura y tiempo son modelos, sin pagos ni DB reales.
