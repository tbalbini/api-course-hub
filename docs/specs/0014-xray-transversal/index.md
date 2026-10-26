# 0014. X Ray Mode transversal

**Date**: 2026-10-22
**Status**: Accepted

## Summary

Cada paso de los laboratorios declara quién inicia la interacción, quién la recibe, qué mecanismo usa y qué puede fallar. El inspector compartido muestra esos datos junto al contrato, resultado y procedencia. Cambiar profundidad conserva la captura y solo cambia la explicación.

## Requirements

- **AC-1**: Intuition, Engineering e Internals conservan id de captura, evento, cursor, entrada, salida, resultado, panel abierto y estado de reproducción. Seleccionar profundidad o activar X Ray no ejecuta operaciones, entregas ni peticiones de negocio.
- **AC-2**: Cada TraceEvent tiene interaction obligatorio con initiator, receiver, technology y possibleFailures. Son declaraciones explícitas del productor, nunca deducciones de action, contract o explanation. El inspector distingue actor del evento de iniciador y receptor de la interacción.
- **AC-3**: X Ray muestra iniciador, receptor, tecnología, contrato, frontera, resultado del paso, fallos posibles, error ocurrido, identidad, dependencias y orden lógico. Entrada, salida, código e intercambio siguen disponibles con sus paneles actuales. Los fallos posibles son posibilidades del contrato, no evidencia de que ocurrieron. Un paso ok no acredita éxito global.
- **AC-4**: Cubrir compra y favoritos, funciones/DOM/Anatomy, comparador, GraphQL/RPC, HTTP y red, comunicación/entregas/SSE, seguridad, contratos, sistemas/transacciones y proyecto de pedidos. Los retornos y eventos distinguen dirección inversa. Sistemas diferencia módulo local de servicio remoto; Map se identifica como memoria del mismo proceso. IPC distingue procesos separados sin prometer red.
- **AC-5**: La procedencia sigue siendo observed o conceptual por evento; el modo de captura no convierte datos simulados en mediciones. Conservar las etiquetas de tiempo lógico, fetch + parsing y fragmento representativo. No añadir DNS/TCP/TLS ni intermediarios a una captura real sin instrumentación. SSE identifica EventSource y datos de muestra sin inventar status HTTP.
- **AC-6**: Validar interaction al aceptar eventos del servidor en projectReceipt. Cada texto debe ser no vacío y possibleFailures un array de textos no vacíos, admitiendo vacío cuando el paso no modela fallos adicionales. Capturas inválidas conservan el manejo de incertidumbre y Response original. No cambiar negocio, permisos, idempotencia, almacenamiento ni progreso persistido.
- **AC-7**: Mantener controles semánticos, teclado, foco visible, reducción de movimiento y ancho de390px sin desbordamiento de página. Una captura vacía muestra un estado honesto. Las pruebas comprueban todos los productores, dirección, aislamiento de metadatos, validación, contexto y ausencia de nuevos efectos al inspeccionar.

## Decision

Extender TraceEvent y actualizar en una entrega todos los productores existentes. Usar metadatos canónicos explícitos para las etapas de pedidos y funciones locales. Los productores que cambian de actor, mecanismo o frontera declaran su interaction después de esas decisiones. Reutilizar TracePlayer, CSS, reducer y profundidad compartida. Sin dependencias, endpoints ni almacenamiento nuevos.

**Implementation skills**: `develop`, `ponytail:ponytail`.

## Feature design

### Modelo y superficie

TraceEvent mantiene sus campos y añade `interaction: Interaction`. Interaction contiene `initiator: string`, `receiver: string`, `technology: string`, `possibleFailures: string[]`. No hay nueva entidad persistida ni migración de progreso. Cada event() copia los metadatos canónicos, incluido el array; cada modelo captura su propio bloque. Las declaraciones de modelos no son observaciones adicionales.

modelStep recibe interaction obligatorio. Los ayudantes de cada laboratorio fijan su vocabulario y permiten declarar explícitamente la dirección cuando una misma etapa representa envío y recepción. No inferir dirección buscando palabras del texto. Mantener dependencias, lanes, requestId y atMs originales.

| Valor | Fuente y regla |
|---|---|
| Etapas canónicas | Tabla tipada por Stage en src/lib/interaction.ts, sin efectos. Click usuario→handler; handler interfaz→handler JavaScript; request navegador→endpoint HTTP; receive servidor HTTP→navegador; response handler→constructor Response, no entrega observada; parsing handler JavaScript→parser JSON local; render handler→estado React |
| Almacenamiento real | persist/readStore/confirmStored/deduplicate declaran lógica servidor→Map del proceso servidor, tecnología Map en memoria. Sus fallos posibles incluyen límites temporales y ausencia/conflicto según operación |
| Funciones y DOM | Etapas locales declaran consumidor→función, retorno función→consumidor y JavaScript→API DOM. No inferir arquitectura interna del navegador |
| Anatomy | mechanisms[mode].consumer/provider/name y dirección explícita del paso. ProviderModel ocurre dentro del proveedor; deliveryModel va al consumidor, salvo aceptación inicial del broker declarada expresamente |
| Comparador | interfaces[interfaceId].name/errors y local/remoto ya elegidos por compareRun. Transferencias reciben dirección explícita; las respuestas y notificaciones van proveedor→consumidor |
| Comunicación y entrega | Perfiles de src/content/events.ts y roles explícitos de los ayudantes. Comandos cliente→proveedor; actualizaciones proveedor→cliente; intentos productor/broker→consumidor; ack consumidor→emisor; almacenamiento del log conserva rol propio |
| Red | Configuración capturada, networkProfiles y Stage, con dirección explícita en retorno. UDP directo no se presenta como HTTP ni como QUIC; preparación QUIC se identifica como tal |
| Seguridad y contratos | Políticas y contrato del experimento en los ayudantes existentes. Pasos locales identifican actor y capacidad; cruce de red del modelo conserva frontera y dirección declaradas. Cookies/CORS no implican lectura del Response |
| Sistemas | component, settings.architecture y extra.boundary fijan destino y tecnología. Invocar inventario es módulo local o servicio remoto según configuración; caché y proveedor tienen roles separados. Transacciones declaran participantes y almacenamiento modelados |
| SSE real | Callbacks request/open/update/error/close de sse-demo. Apertura cliente→endpoint; update servidor SSE→listener con validación en el mismo callback; close es operación del cliente. El evento combinado existente conserva Stage parse y frontera Red HTTP; technology declara entrega SSE y validación del payload. No se agrega un evento interno de parsing no instrumentado. Fallos posibles describen canal/payload, sin status inferido |
| Resultado y error | selected.state y selected.error, con texto “Estado del paso”. possibleFailures se muestra por separado como posibilidades declaradas, no comprobaciones exhaustivas |
| Datos/código/tiempo | selected.input/output/code, capture.request/response/measuredMs y selected.logicalTime existentes, sin nuevos efectos |
| Profundidad y contexto | useCourseDepth conserva el nivel compartido; panel e inspectData siguen en TracePlayer. El reducer conserva captura/cursor y no recibe acciones por cambiar profundidad |

### Catálogo de fallos y extremos

Los extremos siempre son roles o componentes ejecutores, nunca datos. En el paso local dentro de un proveedor ambos extremos pueden ser capacidades del mismo proceso. El usuario autoriza redactar el catálogo pedagógico a partir de errores y límites existentes: pedidos usa los rechazos y excepciones de sus handlers; Anatomy usa sus condiciones network/lost y los límites de mechanisms; comparador usa interfaces.errors; comunicación/entregas usan disconnect, faults y límites de perfiles; seguridad usa sus rechazos de políticas; contratos usa validación/compatibilidad/idempotencia; red usa drop/lostResponse y límites de UDP/QUIC; sistemas usa timeout/failure/breaker/cache y transacciones sus fallos configurados. No se promete que todos los fallos declarados puedan inyectarse en cada paso. Click, preparación y cierre local pueden declarar [] y el inspector dice “Este paso no modela fallos adicionales”.

### Interfaz y límites

La composición actual de design.md gobierna el panel. Ampliar el dl xray-metadata con los campos nuevos, permitiendo texto largo y listas. Con X Ray apagado se ocultan metadatos y datos del paso, conservando su estado para recuperarlos. Código e intercambio mantienen sus selectores. No crear otra página o animación.

El validador del proyecto rechaza metadatos incompletos o mal tipados. Los metadatos se añaden en el servidor junto a la instrumentación existente. No exponer Authorization crudo ni ampliar fuentes de código descargables. Una captura sin eventos muestra “No hay eventos capturados” en lugar de acceder a un paso inexistente.

## Standard definition

**Canonical pattern**: `event(stage)` incorpora una copia del contrato canónico. `modelStep(..., interaction)` exige el contrato de su mecanismo. Un productor que cambia la semántica reemplaza interaction explícitamente.

**Replaces**: presentar actor como ambos extremos o heredar metadatos de pedidos en un modelo de otro mecanismo.

**Enforcement**: tipo obligatorio Interaction, validación de receipts y pruebas de los productores existentes.

**Rollout**: una entrega para todos los recorridos disponibles.

**Exceptions**: no atribuir instrumentación a futuras operaciones. Al incorporar fronteras avanzadas se debe declarar interaction y verificar la integración.

## Build plan

1. [x] Completar contrato canónico, modelos de pedidos/locales y validación de receipts (AC-2, AC-4, AC-5, AC-6).
2. [x] Integrar todos los modelos y SSE, preservando direcciones y fronteras (AC-2, AC-4, AC-5).
3. [x] Ampliar inspector compartido y estado vacío, conservando panel/datos/contexto (AC-1, AC-3, AC-7).
4. [x] Probar productores, receipts, navegación del inspector, móvil y reproducción sin efectos; ejecutar regresiones (AC-1 a AC-7).

## Consequences

Los eventos HTTP incorporan un campo obligatorio y sus consumidores del repositorio se actualizan juntos. El catálogo pedagógico de fallos exige mantenimiento y no es una predicción exhaustiva. La entrega cubre los recorridos actuales; el cierre global del bloque7 sigue condicionado a verificar futuras fronteras avanzadas.

## Follow-up

Integrar las futuras operaciones del bloque17 con este contrato sin acreditar que estén construidas. La verificación integral con lectores de pantalla y estudiantes sigue en el bloque20.

## Rationale

Alternativas y fuentes en [rationale.md](rationale.md).
