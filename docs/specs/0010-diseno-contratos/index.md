# 0010. Diseño y evolución de contratos

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El capítulo 9 permite diseñar una interfaz pequeña de pedidos y comprobar sus consecuencias. Mensajes editables, consumidores anteriores, colecciones y reintentos hacen observables los límites de un contrato. Las operaciones son modelos ejecutados en JavaScript, sin publicar las rutas que se diseñan.

## Requirements

- **AC-1**: `/contracts` ofrece Diseñar, Compatibilidad, Colecciones, Reintentos y Capítulo9. Navegación por capítulo9 y práctica I, enlaces ?tab, flechas/Home/End, foco visible, móvil390 y reducción de movimiento funcionan. Ocultar pausa reproducción y conserva ajustes, mensajes y capturas. No hay requests automáticos ni efectos HTTP en modelos o replay.
- **AC-2**: Diseñador guiado permite recursos o comandos, nombre y versión, nombre del campo cantidad, mínimo/máximo, nota ausente/opcional/obligatoria, rechazo de campos desconocidos, nombre/tipo del id de respuesta, presencia de status, tracking adicional y error estructurado o texto. POST se fija porque el problema es crear un pedido con id asignado por proveedor. Valida ajustes antes de ejecutar o exportar. Texto JSON editable limitado a4096 bytes se parsea y valida con errores por campo. Input inválido devuelve400 conceptual antes de negocio. Éxito201 produce id, status elegido por contrato, total y moneda. No ejecuta código arbitrario ni HTTP.
- **AC-3**: Requisito de negocio fijo: sku kit-api, cantidad entera1a5 y total8900×cantidad, monedaPEN. El contrato puede permitir máximo hasta9 para demostrar una decisión que incumple requisitos. Una opción de implementación defectuosa devuelve total1. La comprobación de esquema puede pasar y la de negocio fallar; resultados se muestran separados con causas. Schema valida tipo, required, enum, límites y additionalProperties del subconjunto generado, sin afirmar validación general de JSON Schema.
- **AC-4**: Compatibilidad mantiene baseline POST /v1/orders, cantidad quantity1..5, id string, status obligatorio, sin tracking y errores {code,message}. Compara consumidor anterior→proveedor nuevo y consumidor nuevo→proveedor anterior, mostrando ejecución de referencia antes y ejecución cruzada después. Fixtures nominal, mínimo, máximo e inválido revelan fallos concretos de ruta, input, output y error. Consumidor tolerante acepta propiedades adicionales de respuesta; estricto las rechaza. Informes estructurales explican ampliación/restricción de inputs, renombres, eliminación y tipo de outputs, extras condicionales y errores. No certifican compatibilidad universal por pasar un ejemplo. Conservar /v1/orders mantiene su contrato original solo cuando existe otra ruta; deprecar informa sin retirar automáticamente ni reparar cambios incompatibles en la misma ruta.
- **AC-5**: Colecciones permite filtro de status, orden por id/total ascendente o descendente, limit1..3 y offset o cursor. Siete fixtures, orden total estable con id como desempate, filtro antes de paginar, next derivado de elementos restantes. Cursor codifica clave de orden e id y queda ligado a filtro/orden; se valida, no es secreto ni firma. Input/cursor inválido produce feedback sin avanzar. Insertar un registro anterior a la ventana entre páginas puede repetir un id con offset; keyset evita ese duplicado del escenario, sin prometer snapshot ni observar el registro recién insertado. Se conserva captura anterior hasta avanzar o reiniciar. Reiniciar devuelve los siete fixtures. Cada página muestra query, items, next y duplicados respecto a páginas previas.
- **AC-6**: Reintentos permite misma clave, nueva clave o payload distinto bajo misma clave, protección activa/inactiva, pérdida de primera respuesta y olvido de claves antes de retry. Siempre dos intentos, cada ejecución desde almacén del modelo vacío. Protección+misma identidad y datos devuelve201/200 con un pedido; conflicto409 no añade efecto; clave nueva o protección desactivada puede crear dos pedidos. Olvidar dedupe conserva pedidos pero permite duplicado, explícitamente otro escenario de retención. Identidad de intento no es identidad de operación. Captura conserva efectos y replay no reejecuta.
- **AC-7**: Documentación OpenAPI3.1.1 JSON se genera del contrato vigente y se puede inspeccionar/descargar. Describe POST candidato, errores, schemas y ruta baseline si se conserva; deprecated refleja su anuncio, sin falsear retiro. Documento AsyncAPI3.0 independiente describe un evento order.confirmed con canal y operación, no la ruta HTTP. Descargas reales locales, sin red. Se explica descripción frente a validación/ejecución, estándares frente a transportes y límites del subconjunto, sin anunciar editor general OpenAPI.
- **AC-8**: Capítulo responde pregunta, mecanismo, alternativas, compromisos y límites, con intuición, código, misconception, quiz razonado y desafío. Incluye recursos/comandos, naming, schemas, validación, error contracts, paginación/filtros/orden, versionado, compatibilidad, deprecación, idempotency keys, documentación, testing y contract testing. Actividades de sesión requieren detectar negocio incorrecto con esquema válido, consumidor anterior roto por renombre, duplicado offset tras inserción y reintento de respuesta perdida sin segundo efecto. No cambia progreso0a3.
- **AC-9**: Usa Capture/TraceEvent/reducer/TracePlayer y tres profundidades X Ray. Eventos y ajustes son snapshots estables. Pruebas cubren validación, ambas direcciones de compatibilidad, schema frente a negocio, exportaciones, errores de cursor, orden estable, duplicados, retención e inmutabilidad. Ningún resultado modelado se presenta como petición medida o seguridad de producción.

## Decision

El usuario eligió diseñador guiado y mensajes JSON editables. Se reutilizan stack, estilo y motor existentes. Sin dependencias, endpoints, DB, servicios externos ni variables de entorno nuevos. La nueva API es ficticia y no modifica el contrato HTTP de pedidos real.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`.

## Feature design

**Fuentes de datos y reglas**:

| Valor | Fuente |
|---|---|
| ContractDesign | style resource/command; version v1/v2; name, quantityName, idName strings; min/max integer; note absent/optional/required; extraInput boolean; idType string/integer; includeStatus, tracking, keepV1, deprecatedV1 boolean; errorShape structured/text |
| Defaults | resource, v1, orders, quantity, id, min1/max5, nota ausente, extraInput false, id string, status true, tracking false, keepV1 false, deprecatedV1 false, errores structured |
| Validación del diseño | nombres camelCase de1a24 letras/dígitos empezando por letra minúscula; sin colisión sku/note en input o status/totalMinor/currency/tracking en id; excluir constructor/prototype; min1..9, max≥min y≤9; name sin barras; path deriva /version/name |
| Requisito y precio | PRODUCT del proyecto: kit-api,8900,PEN. El requisito máximo5 no cambia al editar schema |
| Request schema | objeto con sku enum kit-api y campo cantidad integer min/max, nota string maxLength80 cuando se habilita; required depende de nota; additionalProperties depende de extraInput |
| Response schema | objeto con idName del tipo elegido, totalMinor integer mínimo0, currency enumPEN, status enumcreated si activo, tracking string si activo; campos presentes son obligatorios; consumidor tolerante admite extras, estricto no |
| Errores |400 por input inválido; body {code:INVALID_INPUT,message} o texto según diseño.404 estructurado por ruta no disponible. Parse inválido/límite ocurre antes de invocación del modelo |
| Proveedor | JSON validado → cantidad bajo nombre elegido → id PED-1042 o1042 según tipo → totalquantity×8900 (o1 con bug) → representación elegida. No estado persistente de pedidos |
| Comprobación de negocio | cantidad dentro1..5 y total/currency correctos, independiente del schema. Rechazo de input no cuenta como éxito de negocio |
| Comparación | baseline fijo; consumidor conoce su propia ruta/request/response/errors. Nominalqty2, mínimo/máximo según su contrato, inválidoqty0; nuevo añade note si existe. Cada dirección compara antes con su proveedor y después con otro |
| Coexistencia | si keepV1 y path candidato difiere, se conserva handler baseline completo en /v1/orders. Mismo path usa contrato candidato y no queda protegido por checkbox. Deprecación solo metadata |
| Colección inicial | PED-1001..1007, totals8900,17800,8900,26700,17800,35600,8900; status alternado created/confirmed empezando created. Orden id asc por defecto; limit2; filtro all |
| Cursor | Base64URL JSON con filter,sort,last{id,totalMinor}; forma y contexto validados, posición keyset estrictamente posterior al tuple. Sin retención de snapshot. Offset no negativo entero; input numérico validado |
| Inserción | una por recorrido; id PED-1000 para ordenid asc, PED-9999 paraid desc, total1 para total asc o99999 para total desc; status coincide con filtro activo (all usa created). Solo configura nuevo dataset, no muta capturas |
| Reintentos | fixture quantity1, precio PRODUCT; claves key-A/key-B, ids model-1/model-2; body cambiado usa quantity2. Map local por ejecución, fingerprint del input, dos intentos; olvido vacía solo claves antes de segundo intento |
| Docs | OpenAPI desde diseño y schemas; AsyncAPI fijo con payload {eventId,orderId,status:confirmed}, canal orders.confirmed y operación send. Versiones descriptivas elegidas, sin afirmar que sean las últimas |
| Evaluación | flags derivados de resultados nombrados en AC-8, más respuesta causal correcta; memoria de página únicamente |

El subconjunto de schemas solo cubre objetos planos y escalares string/integer, enum, required, minimum/maximum, maxLength y additionalProperties. No acepta schemas arbitrarios, $ref externos, arrays, composición, regex ni código. Longitudes de strings cuentan code points. Mensajes se muestran como texto React, nunca HTML.

**Superficies**: página `/contracts`; funciones puras de diseño/validación, proveedor, consumidor, informe de cambios, exportación, página de colección y reintentos. No migraciones, usuarios nuevos ni endpoints. Las pestañas Diseñar y Compatibilidad comparten borrador de diseño; cada resultado conserva el diseño que ejecutó. Los demás experimentos conservan estado propio. Un cambio de borrador no reinterpreta una captura anterior.

**Composición**: shell existente, pregunta, cinco pestañas. Diseñar agrupa recurso/input/output/evolución, editor JSON, resultado de pruebas, documentos y descargas. Compatibilidad muestra antes/después y causas, con dirección y fixture editables. Colecciones muestra query, tabla, next e ids repetidos. Reintentos muestra dos intentos, identidades y efectos. El capítulo incluye explicación, tabla de decisiones, código y evaluación. Listas largas y código desplazan dentro de paneles.

**Pruebas críticas**: notas requerida/opcional, propiedades desconocidas, null frente a ausencia, Unicode y límites (AC-2/3); response legal con total errado (AC-3); renombre, tipo, extras tolerantes/estrictos, errores y dos direcciones (AC-4); cambio de ruta con/sin coexistencia y deprecated no retira (AC-4/7); filtros, empates, cursor adulterado o contexto distinto, offset duplicado tras inserción (AC-5); payload conflictivo, respuesta perdida y claves olvidadas (AC-6); JSON exportado coherente y descarga, evaluación, teclado/móvil y replay (AC-1/7/8/9).

## Build plan

1. Diseñador, schemas acotados, proveedor, comprobación de negocio y documentos (AC-2/3/7/9).
2. Consumidores y comparación con sus ejecuciones antes/después (AC-4/9).
3. Colecciones y reintentos con modelos y trazas (AC-5/6/9).
4. Página, navegación, capítulo, evaluación y verificación de regresiones (AC-1/8/9).

## Consequences

El feedback deriva de contratos y ejecuciones concretas, sin score editorial arbitrario. Los ejemplos no son un checker universal de compatibilidad ni un validador OpenAPI completo. Paginación keyset evita un duplicado concreto, pero no garantiza una colección congelada. Dedupe es memoria del modelo, no infraestructura durable.

## Follow-up

Systems Lab, proyecto final, temas avanzados y referencia siguen en sus bloques existentes. Persistencia de borradores y publicación de APIs diseñadas no forman parte de este laboratorio.

## Rationale

Decisiones en [rationale.md](rationale.md).
