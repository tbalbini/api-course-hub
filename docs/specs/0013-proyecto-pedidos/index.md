# 0013. Proyecto final de pedidos

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El capítulo11 conecta una aplicación, un cliente HTTP, validación, permisos y almacenamiento temporal en un recorrido real. La explicación permite abrir los archivos que ejecuta esta compilación y contrastar sus contratos con los datos de cada traza. Se amplían los handlers existentes, sin otra implementación del negocio.

## Requirements

- **AC-1**: `/build-api` ofrece Aplicación, Código ejecutado y Capítulo11, con enlaces ?tab, navegación por capítulo11, teclado, móvil390, foco y reducción de movimiento. Ocultar pausa reproducción sin perder pedido, borradores ni creación incierta. Abrir página, pestañas, archivos o replay no envía HTTP de negocio.
- **AC-2**: Reutiliza OrderConsole y endpoints POST/GET/PATCH existentes. En modo proyecto, cantidad editable0a9 permite observar validación servidor1a5; el total deriva de PRODUCT. Credenciales buyer/reader/none siguen públicas. Id de consulta editable (máximo80, encodeURIComponent) permite404. POST201, GET200, PATCH200, input400,401,403,404 y409 son respuestas reales, no escenarios animados. No pagos, inventario ni DB nuevos.
- **AC-3**: GET y PATCH devuelven eventos de instrumentación real además de order/error y traceId, preservando status, headers no-store y challenge Bearer401. GET registra routing, autenticación, permiso de lectura y búsqueda. PATCH registra routing, autenticación, autorización, validación y confirmación en Map. Fallos detienen el flujo antes de negocio/escritura, con error en la etapa correspondiente. POST conserva semántica e instrumentación. Ningún evento afirma captura de DNS, sockets, SQL o render completado por React.
- **AC-4**: La consola une click/handler/fetch, eventos servidor, recepción/parsing y solicitud de actualización de estado. Trace ID del header y JSON coincide en el modo proyecto; datos originales y Response parcial se conservan ante error. Cliente no aplica un Order mal formado. Un botón abre el archivo relevante del evento seleccionado. Tiempos observados solo cubren fetch+lectura/parsing; logicalTime ordena observaciones. Replay no vuelve a escribir ni revierte efectos.
- **AC-5**: Un POST incierto conserva clave/payload/credencial, bloquea edición de operación y permite retry. Repetir POST original con la misma cantidad recupera snapshot de creación; cambiar cantidad bajo esa clave produce409 sin otro pedido. El reintento normal de operación incierta ignora el borrador cambiado. GET posterior a confirmar devuelve estado actual. La UI identifica que el último Order conocido no siempre representa el estado actual del servidor.
- **AC-6**: Explorador muestra archivos reales leídos en servidor desde lista fija, nombre, SHA256, papel del módulo, fuente completa y descarga local de cada archivo. No editor/eval, endpoint de lectura arbitraria ni secretos. El snapshot JSON se importa al bundle y no se lee ni regenera en runtime. Se prueba build→editar fuente temporal→start manteniendo texto/hash/descarga compilados. En dev representa el arranque; tras editar se regenera/reinicia para actualizarlo. Es código de esta compilación, no inspección del código nativo, framework o JIT. Instrucciones ejecutan el repo completo con npm ci/dev y build/start, Node24; descarga de un archivo no se anuncia como proyecto independiente. Código representativo del inspector se diferencia del archivo ejecutado.
- **AC-7**: Vista contractual y explicación usan las operaciones reales: inputs, outputs, permisos, errores, precio, cantidad, Map200, idempotencia y snapshot. Capítulo incluye pregunta, recorrido, intuición, mecanismo, código mediante explorador, alternativas, compromisos, límites, misconception, quiz causal y práctica. Explica cliente/API/DB como responsabilidades distintas; no afirma SQL ni transacción distribuida.
- **AC-8**: Objetivos de capítulo11 se integran con progreso común: crear201, consultar200, confirmar200, observar validación400, permiso403 y recuperación POST200 repeated. Se exigen resultados HTTP válidos del capítulo, no visitas ni selección de respuesta. Quiz correcto más objetivos completa capítulo y resumen del curso tras recargar. Ningún payload, pedido ni credencial se persiste en progreso.
- **AC-9**: Pruebas cubren los tres handlers, errores sin efectos, snapshots, trace ID, eventos observados, reintento incierto,409, fuente exacta/descarga, navegación, progreso y ausencia de requests en replay. Integraciones existentes mantienen comportamiento. No dependencias nuevas ni cambios destructivos del Map.

## Decision

El usuario eligió archivos reales. Reutilizar OrderConsole con modo proyecto y handlers existentes. Instrumentación HTTP compartida pequeña conserva errores estructurados. Un script Node previo a dev/build/typecheck/test incorpora un JSON generado desde allowlist; el Server Component importa ese snapshot estático y pasa strings al cliente. Sistema visual actual, sin assets ni proveedores nuevos.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`, `vercel:react-best-practices`.

## Feature design

### Datos y fuentes

| Valor | Fuente y regla |
|---|---|
| Order/Input | Tipos y reglas actuales en orders.ts, status en order-status.ts y producto en product.ts. No se amplía negocio ni formato de persistencia |
| Inputs proyecto | quantity1 por defecto, control numérico0..9 (JSON finito; fuera del rango del servidor provoca400); id de consulta vacío inicialmente, se llena con id de POST válido y es editable hasta80; rol buyer inicial |
| POST | /api/orders; sku de PRODUCT, quantity del borrador; Idempotency-Key nueva por operación y conservada ante incertidumbre. Sin price enviado |
| Original | Ref de última operación nueva con respuesta válida, incluso recuperada en retry: key,input. Botón repetir usa esa clave y cantidad actual editable para recuperar o demostrar409. Solo se reemplaza al resolver una operación nueva; repetir explícitamente no la reemplaza. Un flag del attempt conserva si procede de repetición explícita o creación nueva |
| Bloqueo | Busy usa lock ref y AbortController10s existentes; pending bloquea rol/cantidad/id/repetición explícita y permite solo retry con attempt guardado. Cambiar pestaña conserva refs y no aborta ni repite por sí mismo |
| GET/PATCH | Id de borrador del proyecto, codificado como segmento; GET sin body, PATCH exactamente {status:confirmed}. Fuera del modo proyecto conservan id del pedido conocido y cantidad1 |
| Resultados | Captura de respuesta, request, body original y Order válido; UI distingue último dato recibido/snapshot frente a estado actual consultable. No extrapola éxito de negocio por solo200 |
| Order válido cliente | Objeto con id no vacío,sku kit-api,quantity integer1..5,totalMinor igual a precio×cantidad,currencyPEN,statuscreated/confirmed y createdAt string interpretable. No aplica Order de una respuesta no exitosa |
| Receipt proyecto | Objeto JSON con traceId no vacío coincidente con X-Trace-Id, events array de TraceEvent estructuralmente válidos (stage/actor/boundary/state/provenance admitidos, ids/timestamp/dependencies y explicación/código tipados); servidor observado. Datos de inputs/outputs permanecen unknown. Error code/message strings si existe. Error HTTP requiere error contractual. Eventos observados, ids únicos exactamente traceId:index, logicalTime consecutivo, dependencias anteriores existentes y response terminal con status igual al HTTP. Éxito exige correlación: POST sku/quantity del request, statuscreated y201 repeatedfalse/200 repeatedtrue; GET/PATCH id del segmento; PATCH confirmed. Éxito inválido se conserva como incierto y no cambia UI |
| Eventos servidor | Helper por request genera UUID propio, add(stage,input,output) y respond/fail. Copia datos al capturar. Nunca incluye Authorization crudo ni secretos. Evento response registra status; ids se indexan una vez en servidor y la cadena combinada se reindexa solo para reproducción lineal |
| GET tracing | route→authenticate→authorize(read ambos roles)→readStore (Map.get)→response;404 en readStore. GET no escribe. Función readOrder devuelve copia |
| PATCH tracing | route→authenticate→authorize(buyer)→validate(body exacto, readJSON límites)→confirmStored(confirmStoredOrder)→response. confirmStored expresa llamada observada que lee/reemplaza Map; no promete CPU ni SQL |
| POST tracing | Secuencia actual preservada, incluyendo persist/deduplicate y errores. Helper comparte headers/codificación sin decidir negocio. Error inesperado500 loguea solo traceId/stage/code |
| Fuentes | Allowlist estática declarada en el script Node: rutas POST e item, orders, order-status, product, read-json, order-trace, order-receipt, trace, order-console, build-api-lab, project contenido, page y loader. Script scripts/project-sources.mjs lee UTF8 y SHA256 y escribe src/generated/project-sources.json (ignorado por Git). npm predev/prebuild/pretypecheck/pretest ejecutan el generador. Page importa JSON estático sin fs runtime. No ruta elegida por usuario ni lectura de .env |
| SourceLink | Mapeo de stage+method: cliente para click/handler/request/receive/parse/render/failure; domain para auth/business/persist/dedupe/confirmStored; item para readStore; handlerPOST/item para route/authorize/validate; instrumentation para response. Selector manual da acceso a todos los archivos |
| Descarga | Blob text/plain local, filename deriva de path fijo reemplazando barras por doble guion bajo. No solicita backend ni promete ejecutar un archivo aislado |
| Progreso | api-universe-course-v1 capítulo11, flags created/read/confirmed/invalid/forbidden/repeated, quiz correcto. Datos guardados solo booleanos/ids de logros y contexto permitido /build-api?tab=app/code/chapter |

### Incertidumbre, correlación y objetivos

POST sin respuesta contractual válida (sin red, body ilegible, JSON o trace inválidos, Order no correlacionado,500) mantiene attempt y bloqueo. Un rechazo concluyente4xx en primer intento no bloquea; si ya había incertidumbre, un4xx posterior no demuestra que la primera escritura no ocurrió y mantiene bloqueo. GET fallido mantiene último dato sin bloquear creación. PATCH sin resultado contractual o5xx conserva solicitud pendiente para consultar el mismo id; no cambia el pedido conocido ni repite PATCH automáticamente. GET válido del mismo id resuelve observación de estado, sin afirmar quién produjo ese estado. No permite editar id mientras PATCH incierto; permite GET y retryPATCH con cuerpo fijo. No hay cancelación remota por abort de fetch.

Flags solo tras recepción validada y correlacionada, no replay: created POST201, read GET200, confirmed PATCH200confirmed, invalid POST400INVALID_INPUT con quantity fuera de1..5, forbidden POST/PATCH403FORBIDDEN con reader, repeated POST200repeatedtrue. Traza inválida no se reindexa como confiable y solo muestra eventos observados del cliente junto al Response original.

### Superficies y límites

Página `/build-api`: pregunta y tres pestañas. Aplicación incluye contrato visible y consola, inspector y enlace del evento al archivo. Código incluye selector por responsabilidad, explicación, fuente numerada/SHA, descarga e instrucciones del repo. Capítulo incluye camino recomendado, alternativas, validación conceptual y evaluación. Tres paneles permanecen montados. No API nueva para archivos ni almacenamiento durable, cuentas o pagos.

La lista del proyecto ya tiene todo el código ejecutable en el repositorio. Ver fuente no ejecuta el texto mostrado. El orden entre navegador y servidor en la captura combinada es una reconstrucción causal instrumentada; no reloj distribuido ni captura de paquetes. El evento render significa pedir actualización de estado, no confirmar un paint del navegador.

### Pruebas críticas

AC-2/3/9: matrices401/403/400/404, límite de body y rol correcto, persistencia única, lectura sin escritura, confirmación idempotente, retorno POST anterior después de PATCH. AC-4/5/9: header/body traceId, JSON inválido, body interrumpido, Order inválido, pérdida de respuesta después de escribir, misma clave/datos al retry y409 intencional. AC-6/7: fuente idéntica a archivos allowlist y SHA, selección desde evento y descarga real. AC-1/8: teclado/móvil/pausa, objetivos y quiz persistidos sin guardar pedidos.

## Build plan

1. Instrumentar rutas y completar recepción/captura sin cambiar negocio (AC-2a5,AC-9).
2. Preparar fuente y explorador vinculado a eventos, contrato y consola del proyecto (AC-1,AC-6,AC-7).
3. Integrar capítulo, progreso y navegación (AC-7,AC-8).
4. Verificar HTTP, recuperación, código, teclado/móvil y regresiones (AC-1a9).

## Consequences

GET/PATCH amplían sus respuestas con events observados, sin retirar campos. Se actualizan aclaraciones antiguas que solo describían observación del cliente; el contrato anterior de negocio se mantiene. Fuente de compilación puede diferir de archivos editados después: es necesario recompilar para actualizarla. Map sigue temporal y acotado; credenciales públicas no proporcionan privacidad ni seguridad de producción.

## Follow-up

Fronteras avanzadas, catálogo unificado de desafíos, referencia y verificación integral siguen en sus bloques. No se incluyen despliegue, DB durable ni editor arbitrario.

## Rationale

Decisiones y alternativas en [rationale.md](rationale.md).
