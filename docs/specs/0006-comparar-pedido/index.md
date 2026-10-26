# 0006. Un pedido, distintas interfaces

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El capítulo 6 compara consultar un pedido y confirmar su estado con diez interfaces. Cada modelo empieza con la misma copia del pedido. Una consola separada ejecuta HTTP local real y conserva sus resultados al reproducir las trazas.

## Requirements

1. **AC-1**: `/compare` permite elegir dos alternativas entre función local, REST, GraphQL, RPC, JSON RPC, XML RPC, gRPC, SOAP, polling y suscripción. Ambas parten de `PED-1042`, estado `created`, y comparten las operaciones consultar y confirmar.
2. **AC-2**: Cada alternativa presenta arquitectura con fronteras etiquetadas, contrato, invocación, resultado, código del proveedor, errores, compromisos, alternativas y límites. Las comparaciones entre categorías lo explican, sin ganador universal ni métricas inventadas.
3. **AC-3**: Un constructor de trazas reutiliza eventos estructurados y el reproductor existente. Inspección, reproducción, retroceso, velocidad, tres profundidades y X Ray funcionan sin ejecutar nuevamente operaciones. La función local ejecuta JavaScript; los mecanismos remotos llevan etiqueta de simulación.
4. **AC-4**: La condición éxito, pedido inexistente o respuesta perdida modifica ambas trazas. Una pérdida remota después de confirmar deja el proveedor confirmado y al consumidor incierto; la función local explica por qué no tiene ese fallo de red. Polling consulta tres veces y observa el cambio en la última; suscripción registra interés, recibe confirmación y después un evento. Ambos usan un comando separado para confirmar, nunca se presentan como mecanismos de escritura.
5. **AC-5**: GraphQL permite seleccionar `id` y `status` con al menos un campo y modifica documento y respuesta; incluye SDL, query, mutation, resolver y subscription, sin asumir transporte obligatorio. gRPC incluye Protocol Buffers y los cuatro modos seleccionables, con flujos de mensajes distinguibles. SOAP muestra Envelope, Body, Fault y contrato WSDL ilustrativo. REST explica todas sus restricciones, interfaz uniforme y limitaciones del ejemplo HTTP, que no demuestra por sí solo cumplimiento REST.
6. **AC-6**: La consola real permite crear un pedido explícitamente, consultar y confirmar mediante POST, GET y PATCH locales. Muestra método, URL, cuerpo, resultado y duración observada. Creación idempotente conserva clave y payload si el resultado es incierto. Confirmar vuelve a fijar el mismo estado y no crea pedidos. Credencial de comprador, lector o ausente produce permisos reales 200, 401 o 403. 400, 404, 413 y 415 tienen contrato estructurado. La consola nunca usa las condiciones del modelo para fabricar una respuesta real.
7. **AC-7**: Capítulo con pregunta fundamental, intuición, explicación técnica, código, alternativa, error frecuente, evaluación razonada y desafío práctico. Respuesta incorrecta explica el porqué y admite reintento. El desafío exige comparar consulta y confirmación; no altera el progreso de capítulos 0 a 3.
8. **AC-8**: Navegación, móvil a 390px, teclado, etiquetas y reducción de movimiento funcionan. Pruebas de dominio, constructores, contratos y navegador cubren igualdad de negocio, pérdida parcial, selección de campos, permisos y reproducción sin escrituras.

## Decision

Reutilizar componentes, CSS y motor existentes. No instalar dependencias ni servidores GraphQL, SOAP o gRPC. Comparación A y B en tarjetas paralelas con tabla común y una traza seleccionable. Consola HTTP real aparte para evitar comparar estados iniciales distintos. El diseño sigue `design.md`.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`.

## Feature design

**Modelo de datos y estados**: `Order.status` pasa de `created` a `created | confirmed`. Función compartida pura confirma una copia; repetir devuelve el mismo estado. No representa pago, inventario ni envío. El almacén sustituye el objeto actual; la respuesta guardada por la clave de creación conserva su snapshot original. GET devuelve el estado actual. Capturas y resultados son inmutables durante reproducción. No hay entidad nueva ni migración persistente.

**Secuencias de observación**: consultar nunca escribe. Polling consulta tres veces; confirmar añade un comando entre lectura dos y tres. Suscripción registra interés y obtiene un snapshot inicial; confirmar envía un comando separado y recibe después el evento. En confirmar con pérdida, se pierde la respuesta del comando, pero la lectura tres o el evento posterior resuelve la incertidumbre. En consultar con pérdida, se pierde la última respuesta o snapshot y el consumidor queda sin resultado. En otros mecanismos remotos se pierde la respuesta final y no hay observación posterior. Pedido inexistente detiene la ejecución antes de escribir y devuelve el error propio de cada interfaz.

**Secuencias gRPC**: unary envía una solicitud y recibe un pedido; server streaming envía una solicitud, recibe un snapshot y cierra; client streaming envía dos solicitudes idénticas, el servidor procesa ambas y devuelve un resumen con dos resultados; bidi intercambia dos pares solicitud y pedido y cierra. Confirmar repetido es idempotente, por lo que las modalidades con dos solicitudes solo cambian una vez de estado. Las consultas siempre devuelven `created`. Los contratos distinguen `OrderRequest`, `Order` y `OrderBatch` y marcan `stream` en el lado pertinente. Se explica que el streaming no aporta ventaja a esta operación mínima.

**Superficie real**:

| Ruta | Método | Entrada | Salida | Permiso y errores |
|---|---|---|---|---|
| `/api/orders` | POST | sku y quantity existentes, clave existente | order, eventos y traceId existentes | Contrato 0002 sin cambios |
| `/api/orders/[id]` | GET | id de ruta | order y traceId | comprador o lector, 401, 404, 500 |
| `/api/orders/[id]` | PATCH | JSON exacto `{status:"confirmed"}`, máximo 4096 bytes | order y traceId | comprador, 400, 401, 403, 404, 413, 415, 500 |

PATCH comprueba autenticación y permiso antes de leer el cuerpo. `Content-Type` acepta application/json con parámetros. Validación estricta, mensaje público y Cache-Control no-store. Reutilizar lector acotado del POST extrayéndolo sin perder errores existentes. La actualización es síncrona dentro del proceso; no afirma coordinación distribuida. Id de usuario de consola procede únicamente del pedido creado por el servidor, no del fixture. POST y PATCH son efectos explícitos, nunca del montaje ni reproducción.

**Fuentes de valores**:

| Acción | Valores | Fuente |
|---|---|---|
| Comparar | alternativas, arquitectura, categorías, mecanismos, contratos, límites y fragmentos | catálogo editorial tipado `src/content/comparison.ts` |
| Consultar | id y estado inicial | fixture `PED-1042`, `created`, clonado en cada ejecución |
| Confirmar | estado final | función pura compartida `confirmOrder`, fija `confirmed` |
| Condiciones | not found, pérdida después del proveedor | selector de modelo; jamás aplicado a fetch real |
| GraphQL | campos y documento | checkboxes id/status, al menos uno, derivados de operación y fixture |
| gRPC | modalidad y mensajes | selector unary, server, client, bidi; contratos Proto ilustrativos, no bytes binarios fingidos |
| Observar | cambio de estado y evento | comando de confirmación explícito en modelo; tres lecturas para polling, registro y entrega para suscripción |
| Inspector | eventos, ids, dependencia, procedencia | constructor común, indexEvents y reducer existentes; tiempo lógico sin latencia |
| HTTP real | pedido, status, headers y traceId | respuestas reales; credencial pública seleccionada; duración performance.now de fetch y parsing |
| Reintento creación | clave y payload | intento guardado en ref, se conserva en excepción o 5xx y se libera con respuesta concluyente |
| Evaluación | soluciones y feedback | catálogo editorial; desafío se deriva de haber ejecutado ambas operaciones |

**Composición**: Sidebar existente; título y pregunta; controles compartidos de operación, condición, alternativas A/B y ajustes específicos; tarjetas de contrato e invocación; tabla de dimensiones y advertencia de categorías; diagrama de fronteras y reproductor de alternativa activa; consola real con resultado independiente; capítulo y evaluación. Diagramas HTML/SVG propios con etiquetas, sin assets externos. Cada tarjeta permite seleccionar su traza mediante botón. Cambiar ajustes prepara la siguiente ejecución y no altera capturas anteriores.

**Seguridad y límites**: credenciales públicas existentes, comprador y lector globales sin propiedad por usuario; almacén temporal de 200 pedidos, sin producción. Consola con bloqueo de doble envío, timeout con AbortController y estados loading/error/vacío. Confirmación sin transacción externa; una respuesta perdida exige GET antes de inferir el resultado. Modelos no ejecutan código del usuario ni acceden a servicios externos. La reducción de movimiento no cambia los mecanismos, toda reproducción comienza pausada.

**Escenarios críticos**: mismo resultado de negocio en diez interfaces y ambas operaciones (AC-1 a AC-5); pérdida después de escritura y ausencia de red local (AC-3, AC-4); create/read/confirm/read reales y reintento idempotente, lector 403 y ausencia 401, rechazo de cuerpos (AC-6); evaluación y móvil con teclado (AC-7, AC-8).

## Build plan

1. Contrato de confirmación, PATCH y pruebas de regresión de creación (AC-1, AC-6).
2. Catálogo de capítulo y constructor común de capturas comparables (AC-1 a AC-5, AC-7).
3. Página, controles, diagrama, reproductor, consola y evaluación (AC-2 a AC-8).
4. Pruebas automatizadas y verificación real de navegador, documentación y alcance (AC-1 a AC-8).

## Consequences

La comparación aísla el negocio y permite inspeccionar mecanismos. Los protocolos distintos de HTTP local son modelos editoriales, sin parsers ni infraestructura real. No se deducen rendimiento, entrega garantizada o conformidad REST completa de estos ejemplos. El lector puede consultar cualquier pedido de este proceso, acorde con la demostración existente.

## Follow-up

Los laboratorios generales de requests, eventos, seguridad y diseño permanecen en sus recorridos de alcance posteriores.

## Rationale

Decisiones en [rationale.md](rationale.md).

## Ampliación posterior

La [spec0013](../0013-proyecto-pedidos/index.md) incorpora instrumentación observada del servidor a GET/PATCH y conserva sus contratos de negocio. La consola recibe ahora esos eventos además de la captura cliente. El capítulo11 añade validación correlacionada, visor de código y repetición explícita de la creación original.
