# 0008. Comunicación continua y garantías de entrega

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El capítulo 7 permite enviar un mensaje de chat mediante cuatro modelos de comunicación y seguir eventos de pago ficticios mediante webhooks o brokers. Una conexión SSE local real contrasta esos modelos con eventos recibidos por el navegador. Recepción, procesamiento y confirmación se distinguen en cada traza.

## Requirements

- **AC-1**: `/events` ofrece laboratorio F de polling, long polling, WebSocket y SSE, laboratorio G de webhook, queue, publish/subscribe y event stream, demostración SSE real y capítulo 7. Navegación, teclado, móvil 390px y reducción de movimiento funcionan. Cambiar de pestaña conserva ajustes y captura, pausa reproducción y no inicia efectos.
- **AC-2**: F acepta texto de 1 a 120 caracteres y envía un mensaje dentro del modelo. Consumidor y proveedor muestran revisión y mensajes finales. SSE usa un POST separado para enviar y un stream solo de retorno; WebSocket envía y recibe por canal bidireccional; polling consulta snapshots y long polling mantiene una solicitud pendiente hasta el cambio. Cantidades se etiquetan como requests o canales lógicos, nunca equivalen automáticamente a conexiones TCP ni a rendimiento.
- **AC-3**: F inyecta pérdida del evento después de guardar el mensaje y permite recuperación con cursor en SSE/WebSocket. Polling y long polling recuperan mediante otra lectura; streaming sin recuperación deja la vista retrasada, sin prometer convergencia. Repetir con cursor requiere historial disponible en este modelo; SSE y WebSocket no garantizan replay por sí mismos. El flujo y datos difieren realmente ante el fallo. Reproducción nunca vuelve a enviar.
- **AC-4**: G modela Payment confirmed → Event → Delivery → Receiver → Processing. Dos eventos con ids `pay-1`, `pay-2`, revisiones 1/2 y snapshots confirmed/refunded de PED-1042 permiten observar orden causal. Opciones: duplicar pay-1, invertir orden, deduplicar ids y rechazar revisión antigua o igual. Cada proyección inicia pending, revisión0, cero aplicaciones. Dedupe y revisión se comprueban antes del efecto; se guardan ids también si se omite un snapshot antiguo. El cambio de proyección y el registro del id son un paso atómico del modelo, sin garantía distribuida real.
- **AC-5**: Fallos ninguno, rechazo inicial antes de procesar, confirmación perdida después de procesar o agotamiento antes de procesar generan distintos recorridos. Máximo tres intentos por entrega, con backoff lógico de 1 y 2 unidades. Duplicados y reintentos conservan id del evento y distinguen número de intento de identidad. Con ambos filtros desactivados, confirmación perdida o duplicado repite aplicaciones. Con deduplicación activa, no repite efectos aunque haya más entregas. No se promete exactamente una vez de extremo a extremo.
- **AC-6**: Queue asigna cada entrega a un trabajador entre A/B de un mismo grupo y almacén de proyección compartido. Pub/sub tiene suscripciones durables Pedidos y Analítica con proyecciones, ids procesados y confirmaciones independientes; el fallo afecta solo a Pedidos. Sus trazas forman ramas con dependencias propias e intercalado lógico, sin dependencia A→B. Stream conserva log de una partición con offsets0/1 (o 0/1/2 con copia publicada), commit del siguiente offset después de éxito, detención ante registro agotado y opción de releer desde offset0 dentro del mismo experimento conservando dedupe. Invertir revisiones en stream invierte publicación, no viola el orden de offsets. Broker acepta no equivale a consumidor procesa.
- **AC-7**: `/api/lab/events` GET abre text/event-stream real público y acotado. Emite tres `update` de muestra con ids sample-1..3, `{sequence,message,simulatedData:true}`, separados por 350ms del reloj servidor, después `complete` y cierre. No lee ni modifica pedidos. Cliente EventSource solo se abre por botón, muestra datos y mensajes observados, permite cerrar, limpia al desmontar o cambiar pestaña y cierra en complete o error. Se explica la reconexión por defecto de EventSource, desactivada por cierre explícito en esta demo. Replay no abre otro stream. Sin métricas de latencia inventadas ni captura de headers que EventSource no expone.
- **AC-8**: Capítulo responde por qué, qué, cómo, compromisos, alternativas y límites, con pregunta fundamental, intuición, código, error conceptual, evaluación y desafío. Explica dirección, duración, entrega, acoplamiento, ACK, retries, ordering, duplicados, retención y consistencia eventual condicionada a recuperación. Webhook es callback HTTP entre servidores, WebSocket es canal bidireccional; todas las entregas webhook aquí son simuladas. Desafío de sesión requiere SSE con comando separado, webhook con respuesta perdida y dedupe activo, pub/sub con retraso parcial, y explicación correcta de incertidumbre tras perder ACK. No cambia progreso 0 a 3.
- **AC-9**: Motor reutiliza TraceEvent, Capture, reducer y TracePlayer. Input/output son snapshots estables, ids y dependencias correctos, tres profundidades y X Ray disponibles. Ajustes solo preparan nueva ejecución. Pruebas cubren matrices de mecanismos y fallos, replay, filtros de id/revisión, offsets, ramas, cancelación del stream, recepción real y regresiones de navegador.

## Decision

Reutilizar stack, motor y `design.md` sin dependencias nuevas. Un modelo de chat y uno de entrega producen eventos desde datos y políticas; las animaciones solo representan esas trazas. El usuario eligió añadir SSE local real. WebSocket, webhooks y brokers no se levantan como infraestructura real.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`.

## Feature design

**Datos**:

| Registro | Campos y fuentes |
|---|---|
| Mensaje de F | id chat-1, revision1, texto del input; anterior snapshot vacío rev0 |
| Ajustes F | mechanism polling/longpoll/websocket/sse; disconnect boolean; resume boolean, aplicable solo a streams |
| Evento G | id pay-1/pay-2, orderId PED-1042, revision1/2, type payment.confirmed/payment.refunded, status confirmed/refunded, todos fixtures ficticios |
| Proyección G | nombre de consumidor, status pending/confirmed/refunded, revision, applications, seenIds; offsetCommitted para stream, next offset0 inicial |
| Ajustes G | mechanism webhook/queue/pubsub/stream; fault none/reject/lost-ack/exhaust; duplicate, reversed, deduplicate, versionGuard, replayLog boolean |
| Evento SSE real | sequence1..3 y mensajes de muestra Recibido/Confirmado/Preparando entrega, simulatedData true; no corresponde a estado persistente de Order |

**Secuencias F**: polling consulta vacío, POST guarda mensaje, consulta nueva (puede perderse), siguiente consulta devuelve snapshot. Long polling abre GET pendiente, POST guarda, responde GET (puede perderse); una segunda lectura con revisión0 obtiene snapshot actual. WebSocket abre canal (handshake HTTP/1.1 elegido en el ejemplo), envía frame y publica respuesta; SSE abre GET de eventos, POST separado guarda, retorna evento. Con fallo se pierde primera entrega del mensaje; streaming reconecta pero solo obtiene el mensaje perdido si resume está activo y el historial de este modelo lo conserva. Reconexión SSE usa cursor de aplicación; Last-Event-ID depende de ids recibidos y política del servidor. No se confunden solicitudes pendientes con conexiones TCP.

**Secuencias G**: cada evento se publica. Primero se invierte la lista si reversed; después se inserta una copia de pay-1 inmediatamente a continuación de su original si duplicate. En stream esa publicación adicional recibe otro offset consecutivo, conservando el mismo event.id. La relectura no publica registros: usa los mismos offsets y mantiene el offset confirmado máximo, además de un cursor de lectura que puede volver a cero. Webhook usa POST conceptual y 204 como acuse después de procesamiento, 500 si rechaza antes. Queue y pub/sub tienen publicación aceptada por broker y ACK de consumidor después de efecto. Rechazo ocurre en primer intento del primer evento entregado a Pedidos; lost-ack procesa ese evento y pierde confirmación del intento1, luego reintenta; exhaust rechaza sus tres intentos. Rechazo inicial y pérdida de ACK se inyectan una sola vez en Pedidos. Agotamiento permanece para ese event.id en Pedidos, incluidas copias y relecturas. Otras entregas y Analítica funcionan. Tras agotar, webhook/queue/pubsub registran entrega fallida y pueden seguir con otros eventos. Stream se detiene en offset no confirmado y no salta al siguiente; perder confirmación significa que commit no llega al broker después del efecto. Releer log repite lectura conservando proyección y seenIds dentro del mismo experimento. No se modifica el registro del broker por lectura.

**Valor y procedencia**:

| Acción | Valores producidos | Fuente |
|---|---|---|
| Enviar modelo F | snapshots y conocimiento del cliente | input validado, mecanismo y políticas de secuencia anteriores |
| Producir G | orden de eventos, offsets y entregas | fixtures rev1/2, reversed, duplicate y replayLog |
| Aplicar G | status/revisión/aplicaciones/ids | comparación de id y revisión en la proyección de ese consumidor |
| Reintentar | identidad estable, intento1..3 y espera1/2 | política acotada por fallo y mecanismo, tiempo lógico sin ms |
| Dibujar ramas | actor, rol, acción y dependencias | eventos seleccionados; pub/sub empieza cada rama después de publicación, sin enlace entre consumidores |
| Abrir stream real | frames, ids y datos recibidos | EventSource y MessageEvent observados; id de captura cliente UUID por conexión |
| Finalizar stream | completo, cerrado, error | complete, botón, error, cambio pestaña o desmontaje; refs impiden callbacks antiguos |
| Evaluar | flags de actividad y feedback | resultados de ejecución de modelo nombrados en AC-8 y respuesta correcta del capítulo |

**Superficie real**: solo GET `/api/lab/events`, público, sin parámetros configurables ni destinos externos. Response con Content-Type text/event-stream;charset=utf-8 y Cache-Control no-store. ReadableStream cancela timer y listener de abort al terminar o cancelar; máximo tres updates y un complete, sin bucle infinito. El cliente no atribuye un status HTTP preciso al onerror de EventSource. No abre automáticamente al montar. Sin variables de entorno.

**Composición**: `/events` con sidebar, pregunta y pestañas Comunicación, Entregas, SSE real y Capítulo7. Paneles conservan estado al ocultarse; los reproductores se pausan. Al salir de SSE se cierra transporte y se conserva la captura. Comunicación ofrece editor de mensaje, mecanismo, fallos y snapshot proveedor/cliente. Entregas ofrece política, flujo de cinco roles, proyecciones y log de intentos; pub/sub añade selector de eventos por rama. SSE muestra estado de conexión, feed observado y replay. Capítulo muestra tabla comparativa, explicación, código y evaluación. Botones seleccionan eventos, no solo decoran. Código y datos desplazan dentro de sus paneles.

**Criterio de retraso parcial del desafío**: ejecutar pub/sub con reversed y exhaust deja Pedidos en revisión1 y Analítica en revisión2. El flag se deriva de comparar ambas revisiones al terminar el modelo; no basta con visitar la pestaña.

**Seguridad y límites**: ningún pago real, ningún webhook enviado, ningún broker externo. Dedupe y proyección son memoria del modelo; no se promete durabilidad. SSE usa datos fijos públicos y duración acotada, con limpieza de recursos, sin estado por usuario. Las APIs con pagos, retención y transacciones de producción quedan fuera de esta demostración. La representación no inventa métricas de performance.

**Escenarios críticos**: SSE POST separado frente a WS dúplex y recuperación con/sin cursor (AC-2/3); ACK perdido con y sin filtros, orden invertido y lector atrasado (AC-4/5); dos ramas independientes y stream que no salta offset fallido (AC-6); EventSource real, completar/cerrar/error sin reconexión involuntaria y replay sin requests (AC-7); evaluación, móvil, teclado y capturas estables (AC-1/8/9).

## Build plan

1. Contenido y modelos puros de comunicación y entrega, con pruebas de políticas y dependencias (AC-2 a AC-6, AC-8/9).
2. Stream SSE real finito y cliente con cancelación, pruebas de recursos (AC-7/9).
3. Página, diagramas, inspectores, evaluación y navegación (AC-1 a AC-9).
4. Verificación real, pruebas de navegador, documentación y alcance (AC-1 a AC-9).

## Consequences

Se comparan mecanismos sin infraestructura adicional y se observa al menos un stream real. La política de retry, retención y ACK pertenece a cada contrato de ejemplo, no a todos los brokers o webhooks. El orden causal del negocio puede diferir del orden de llegada o de offsets. El SSE real es una sesión breve y explícitamente limitada; no implementa replay durable ni autenticación de producción.

## Follow-up

Seguridad, diseño de contratos y Systems Lab conservan los bloques 13 a 15.

## Rationale

Decisiones en [rationale.md](rationale.md).
