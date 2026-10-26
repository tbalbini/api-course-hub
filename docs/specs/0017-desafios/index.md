# Desafíos y evaluación razonada

**Status**: Accepted

## Summary

Siete desafíos en `/challenges` conectan decisiones con resultados inspeccionables. Cada logro exige cumplir la operación y explicar su causa en el mismo intento. Los modelos existentes proporcionan resultados y trazas; el almacenamiento común conserva únicamente los identificadores completados.

## Requirements

- AC-1: funcionan diagnóstico de arquitectura, predicción de ejecución, Debug the Request, Choose the Interface, Design the Contract, Failure Injection y Spot the Misconception, desde nivel básico hasta avanzado.
- AC-2: cada intento recibe explicación de la causa y de alternativas razonables, admite reintento y actualiza progreso sin marcar aprendizaje solo por visitar una página.
- AC-3: los ejercicios abarcan ausencia de internet, llamadas locales frente a remotas, HTTP frente a REST, idempotencia, éxito HTTP frente a éxito de negocio, permisos, pérdida de respuesta después de escritura, trazabilidad y relación entre diseño de API y arquitectura.
- AC-4: un desafío se completa únicamente cuando resultado operativo y explicación causal son correctos en el mismo intento; los borradores y respuestas se conservan solo durante la sesión de la pantalla.
- AC-5: el catálogo, navegación, resumen, continuidad, accesibilidad, móvil, inspector y X Ray quedan integrados sin acreditar capítulos ni persistir datos de operaciones.

## Decision

Reutilizar modelos puros existentes desde un evaluador tipado y una pantalla de ejercicios. Siete identificadores estables, sin otro motor de negocio, peticiones reales, dependencias ni servicios. Las elecciones de formato, cantidad y criterio son las del usuario; persistencia de logros, diseño actual y fuentes locales son las recomendaciones por defecto.

## Rationale

Opciones, fuentes y compromisos: [rationale.md](rationale.md).

## Feature design

**Data model sketch**: catálogo constante de siete ejercicios con id único, formato, nivel, consigna, tres explicaciones con feedback, alternativa y enlace al laboratorio. Borrador por ejercicio con elecciones acotadas y campos numéricos; intento inmutable con resultado, captura, evaluación operativa y causal. `CourseProgress.challenges` añade un array obligatorio en memoria y opcional en JSON anterior, limitado a ids conocidos. No se altera versión ni capítulos; el decoder incorpora `[]` si falta y el merge une logros. Solo una comprobación completa invoca `awardChallenge`.

**State transitions**: sin intento → comprobado incompleto o completado; editar invalida el intento visible, conserva el logro histórico; reintentar evalúa un snapshot nuevo. Cambiar ejercicio conserva sus borradores en memoria; recargar los descarta. Reproducir solo recorre una captura.

**API surface**:

| Función | Entradas | Salidas | Acceso y errores |
|---|---|---|---|
| evaluateChallenge | id conocido, borrador tipado, explicación seleccionada | resultado operativo, causal, captura, resumen y detalles | local; rechaza valores fuera del catálogo y límites, sin efectos |
| awardChallenge | progreso actual, id conocido | progreso con unión del logro | local; nunca altera capítulos |
| courseLocation | ubicación desconocida | destino local permitido o null | añade `/challenges?challenge=id`, descarta parámetros ajenos |

**Value sourcing**:

| Ejercicio, nivel | Acción y resultado | Fuente y condición operativa |
|---|---|---|
| architecture, básico: Diagnóstico de arquitectura | Elegir función, IPC o HTTP para sumar dentro del mismo proceso sin red y sin segundo proceso; inspeccionar pasos | `anatomyCapture(mode, mode === "http" ? "network" : "success")`; solo función cumple ambas restricciones. IPC no requiere internet pero sí otro proceso. HTTP remoto falla en este fixture de red. La arquitectura determina la frontera necesaria. |
| prediction, básico: Predicción de ejecución | Predecir retorno numérico, texto o excepción y contrastar | `runFunction(19,23,"broken")`; devuelve texto `"42"`, contrato numérico incumplido, no excepción. |
| debug, intermedio: Debug the Request | Corregir credencial y body de PATCH para confirmar | `accessRun` con operación confirm, scope/cuota true; credencial none/reader/buyer y payload válido editable. Requiere HTTP200 y estado confirmed. |
| interface, intermedio: Choose the Interface | Elegir REST, JSON-RPC o GraphQL para confirmar con URI de recurso y PATCH HTTP; inspeccionar representación | `compareRun` con confirm/success; requiere rest y una transición confirmed. Las otras interfaces pueden confirmar pero no satisfacen el contrato solicitado; HTTP no implica REST. |
| contract, avanzado: Design the Contract | Editar mínimo/máximo 1..9 y error estructurado/texto; comprobar tabla cantidades 0,1,5,6 | `provideOrder` sobre baseline con esos tres campos; requiere aceptar1 y5 con negocio correcto, rechazar0 y6 con400 y error estructurado. Captura del fixture5. Schema y negocio son comprobaciones separadas. |
| failure, avanzado: Failure Injection | Perder primera respuesta después de escritura, elegir estrategia same/new-key/changed-body y protección | `idempotencyRun`, loseFirst true y forgetKeys false; requiere un pedido, primera respuesta perdida, segundo intento200/repeated con mismo id. Dos intentos son dos entregas, no necesariamente dos negocios. Clave y payload deben conservarse. |
| misconception, intermedio: Spot the Misconception | Clasificar éxito completo, fallo de schema o fallo de negocio después de ejecutar | `provideOrder(baselineDesign, sampleInput(...), undefined, true)`; HTTP201 y schema válidos, total1 incorrecto. Requiere clasificar fallo de negocio. |

La explicación correcta de cada ejercicio identifica la causa indicada en esa fila; las otras dos opciones tienen feedback propio. El resultado enumera id, etapa y dependencias de eventos mediante el inspector compartido y enseña snapshots finales separados del cursor. Tiempos y mecanismos son conceptuales salvo la suma JavaScript local. Niveles, consignas y alternativas son contenido editorial local; precios, estados, datos y capturas provienen de los modelos y PRODUCT.

Cada función de la tabla devuelve su `capture`, incluida `runFunction` en prediction y `provideOrder` en misconception, sin sintetizar pasos adicionales. En failure, protección es un checkbox booleano `protection`, inicialmente true, que activa o desactiva el deduplicador existente. Configuraciones o JSON inválidos se rechazan antes de ejecutar modelos y muestran feedback recuperable sin acreditar; Debug the Request usa el parser acotado del diseñador y solo acepta el body exacto `{status: "confirmed"}` para superar validación.

**Key invariants**: nunca se escribe negocio real ni se evalúa código introducido. Configuración inválida devuelve feedback sin progreso. Cada envío evalúa su propio borrador; no mezcla un resultado anterior con otra explicación. La visita, elección o reproducción no acreditan. Una respuesta correcta aislada no basta. Logros unidos desde el snapshot actual; JSON corrupto/versión desconocida y almacenamiento bloqueado conservan la política común de sesión. Logros de desafíos no modifican los trece capítulos.

**Security model**: público, fixtures locales. No datos sensibles, nuevos endpoints, secretos ni configuración. Validar entradas numéricas y valores enumerados antes de invocar modelos. No persistir respuestas, intentos, trazas ni formularios.

**UI**: cabecera con X Ray, catálogo de siete botones con nivel/formato/estado, área seleccionada con formulario y explicación causal, botón Comprobar intento y feedback separado para resultado y causa. Resultado con detalles y reproductor compartido, alternativa y acceso al laboratorio. Resumen local 0..7 en Challenges y Tu recorrido, separado de capítulos. Navegación por query permitida, historial nativo, etiquetas y fieldsets, estados anunciados, scroll interno de tablas/código, reducción de movimiento y sesión sin almacenamiento.

**Critical test scenarios**:

- AC-1/3: los siete modelos producen éxito y contraejemplos según la tabla, sin mutar fixtures ni capturas previas.
- AC-2/4: resultado correcto con causa incorrecta, y caso inverso, no acreditan; reintentar sí; editar invalida feedback previo.
- AC-4/5: recarga conserva solo ids validados; almacenamiento bloqueado sigue funcionando; merge no borra logros de capítulos ni desafíos; navegación no acredita.
- AC-5: navegador recorre siete formatos, prueba controles y errores, inspector/X Ray, persistencia, query inválida, teclado y móvil sin overflow.

## Build plan

- [x] AC-1/3/4: catálogo, borradores tipados, evaluación pura sobre modelos y pruebas de resultados, causas y errores.
- [x] AC-2/4/5: extender decoder, unión, premio y ubicación común con compatibilidad de snapshots anteriores y pruebas.
- [x] AC-1/2/5: construir pantalla, feedback, reintentos, inspector, navegación y resumen separados de capítulos; retirar copy pendiente de Challenges.
- [x] AC-1/2/3/4/5: verificar aplicación, accesibilidad y móvil; ejecutar comprobaciones y registrar [evidencia](verify.md).

## Consequences

Los siete desafíos son un catálogo finito, con fixtures explícitos, sin examen aleatorio ni vigilancia. El resultado sirve para demostrar los casos documentados; no certifica competencia universal ni resistencia a manipular localStorage. Los borradores se pierden al recargar. Se reutilizan modelos para conservar coherencia con los laboratorios.

## Follow-up

La verificación integral del bloque20 conserva su alcance propio. Referencia del bloque18 continúa independientemente.
