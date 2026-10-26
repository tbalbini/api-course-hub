# 0011. Systems Lab y fallos parciales

**Date**: 2026-10-22
**Status**: Accepted

## Summary

Una petición puede terminar aunque un servicio secundario falle, y un timeout no cancela por sí mismo al proveedor. Este laboratorio permite construir una arquitectura acotada, ejecutar carga y observar decisiones de recuperación. Un segundo experimento compara transacción local, commits independientes, saga y coordinación en dos fases.

## Requirements

- **AC-1**: `/systems` ofrece Sistema, Transacciones y Capítulo10, enlaces ?tab, navegación por capítulo10 y práctica J, teclado, móvil390 y reducción de movimiento. Ajustes y capturas se conservan al ocultarse y la reproducción pausa. No hay HTTP, pagos, DB, timers de infraestructura ni almacenes nuevos.
- **AC-2**: Constructor guiado cambia monolito/microservicios, proceso/funciones, entrada directa/proxy/gateway, balanceador opcional con dos réplicas, BFF, inventario opcional/obligatorio y caché compartida. Topología identifica proceso, red entre servicios y almacenamiento; una llamada local no se dibuja como red. Cada rol explica responsabilidades y alternativas. Controles alteran rutas, resultados, eventos o tiempos del modelo, sin atribuir ventajas universales a un estilo.
- **AC-3**: Carga de1a6 consultas del mismo pedido, concurrencia de cliente1a3 y separación0/100/300ms generan eventos ordenados por un planificador determinista. Cada petición tiene trace ID y spans relacionados. Tabla temporal permite seleccionar cualquier evento e inspeccionar datos, código y tres profundidades. Conserva dependencias por petición y dependencias compartidas de caché/circuito; no pasa por indexEvents. Duraciones y percentiles son simulados, separados del orden lógico y sin measuredMs.
- **AC-4**: Latencia de inventario, timeout por intento, hasta dos retries y backoff exponencial modifican el flujo. Fallos ninguno/primeros dos/todos se aplican al ordinal de llamadas de inventario. Timeout deja trabajo del proveedor pendiente que termina después; un retorno tardío no entrega resultado al intento vencido ni cambia su breaker otra vez. Inventario opcional fallido produce200 parcial, obligatorio503. Sin inventario no se ejecutan estos mecanismos. Reintentos solo leen, no crean efectos.
- **AC-5**: Circuit breaker por réplica abre tras dos fallos consecutivos, permanece abierto300ms y permite una prueba half open; rechaza otras llamadas mientras prueba. Solo la prueba puede cerrar/reabrir tras half open. Caché compartida TTL500ms devuelve resultados completos, evita llamadas de inventario y puede devolver una revisión antigua. Fuente ficticia cambia created→confirmed en150ms si se habilita. No hay single flight ni promesa de frescura. Ajustes solo afectan nueva ejecución. Se puede comparar con captura previa.
- **AC-6**: Resultados muestran status, parcial, revisión, réplica, intentos, cache hit y duración por petición. SLI cuenta respuestas200 completas dentro del umbral configurable50a1000ms, incluidas colas; SLO configurable50a100%, porcentaje y presupuesto calculados sobre este lote. Percentil95 usa nearest rank. Se distingue SLI observado en modelo, objetivo SLO y acuerdo SLA; no se infiere SLA ni disponibilidad de producción de seis consultas.
- **AC-7**: Transacciones compara local en una DB, commits independientes, saga y modelo2PC. Reserva, asiento ficticio de cobro y confirmación de pedido tienen estados públicos inspeccionables por evento. Fallo de pago muestra rollback local frente a reserva persistente independiente o compensación saga. Compensación fallida deja atención pendiente y puede reintentarse sobre esa captura sin reservar/cobrar otra vez.2PC prepara participantes y registra decisión antes de commit; caída del coordinador tras registrar commit deja preparación pendiente y recuperación aplica esa decisión. No promete atomicidad global de lectura ni modela implementación completa de consenso/aislamiento.
- **AC-8**: Capítulo cubre gateways, balanceadores, proxy, monolitos, microservicios, funciones, BFF, service calls, transacciones, sagas, breakers, retry/backoff/jitter, caché, observabilidad, tracing/correlation IDs y SLA/SLO. Incluye pregunta, mecanismo visual, código, alternativas, compromisos, límites, error conceptual, quiz causal y desafío. Cuatro logros de capítulo requieren observar parcial, timeout con finalización tardía, caché antigua y compensación recuperada; más quiz correcto. No modifica progreso0a3.
- **AC-9**: Funciones puras tipadas, validación de límites y snapshots sin alias, ids únicos, dependencias causales anteriores y ejecución reproducible. Pruebas comprueban concurrencia, recuperación, aislamiento de réplicas, caché, métricas, transacciones, recuperación, navegación y replay sin requests. No se añaden dependencias ni se cambia la API real de pedidos.

## Decision

Constructor guiado, elegido por el usuario. Reutilizar SVG, Capture/TraceEvent, reducer y TracePlayer. Planificador local por eventos discretos, sin esperar tiempo de pared. Cada experimento empieza vacío y sus resultados son snapshots. Se mantiene el sistema visual existente y no se requieren assets.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`, `vercel:react-best-practices`.

## Feature design

### Datos y fuentes de valores

| Entidad/valor | Fuente y reglas |
|---|---|
| SystemSettings | architecture monolith/services; runtime process/functions; entry direct/proxy/gateway; balanced,bff,inventory,required,cache,changeSource,breaker boolean; count1..6; concurrency1..3; gap0/100/300; latency20..400; timeout50..500; retries0..2; backoff20..200; threshold50..1000; target50..100; failure none/first-two/all |
| Defaults | services,process,proxy; balanced/bff/cache/changeSource/breaker false; inventory true, required false; count4,concurrency2,gap0,latency80,timeout150,retries1,backoff40,threshold300,target95,failure none |
| Datos | PED-1042,sku kit-api,statuscreated,revision1; fuente cambia a confirmed,revision2 en150ms solo si changeSource. Inventario devuelve available3. Ninguna consulta persiste pedido |
| Entrada | direct0ms,proxy5ms,gateway9ms; balanceador añade2ms y asigna round robin al admitir cada petición. BFF añade3ms y proyecta {id,status,availability}; sin BFF salida incluye objetos order/inventory y partial. Funciones inician un arranque compartido de40ms por réplica. Solicitudes coincidentes esperan readyAt y dependen de ese mismo evento. balancedfalse usa una réplica y balancedtrue dos; el breaker vive en cada réplica de la aplicación de pedidos. No representa costes de un proveedor real |
| Concurrencia | Peticiones llegan en i×gap. Cliente admite hasta concurrency activas, el resto espera FIFO. Liberar slot al recibir resultado o fallo admite otra. Réplicas no implican más capacidad en este modelo de proveedor sin límite de workers |
| Trabajo | Desde admisión: entrada+BFF, espera arranque compartido, lookup de caché; en miss lectura local10ms. Al terminar lectura se toma revisión de fuente, constante durante retries. Hit evita lectura y proveedor. Inventario local tarda latency; separado añade20ms fijos de transporte ida/vuelta. Latencia total prevista es suma. Adaptador usa deadline por intento y reintentos incluso si el módulo es local; se indica que este timeout simulado no interrumpe código síncrono real |
| Fallo de inventario | failure none/first-two/all; ordinal global por llamada admitida al proveedor. Se decide al programar, no al reproducir. Respuesta falla al terminar servicio. Si deadline es anterior, cliente vence y finalización queda como evento tardío. Empate termina antes del deadline |
| Retry | Deadline empieza al invocar inventario y cubre latency+transporte; attempts cuenta llamadas admitidas, no rechazos de breaker. Slot de cliente se conserva durante espera y retries. Primer intento más retries, espera backoff×2^(intento-1). Sin jitter aleatorio para reproducibilidad, se explica riesgo de sincronización y alternativa jitter. Breaker consulta cada intento; rechazo abierto no se reintenta |
| Breaker | Estado closed/open/half-open por réplica, contador de fallos consecutivos; abre a2, cooldown300. Operaciones admitidas antes de abrir no cierran un circuito abierto. Half open admite una sonda. Cada apertura incrementa generación, guardada en la admisión; resultados de generaciones antiguas no alteran contador ni estado. En closed, éxito vigente reinicia y fallo incrementa. Estado temporal vive solo dentro del lote |
| Caché | Compartida entre réplicas, key de resumen PED-1042; TTL500 desde éxito completo. Consulta al llegar a lógica app; cache hit salta consulta a inventario. Fallos/parciales no se guardan. Se permite sobrescribir con un éxito completo antiguo que termina después, sin garantía monotónica. El valor guarda revisión de lectura original, no consulta fuente al servir. Dependencia enlaza al evento que llenó caché |
| SystemEvent | TraceEvent más atMs,requestId,traceId,spanId,parentSpanId,component. logicalTime es índice cronológico, atMs tiempo simulado. Depende del último evento causal de su rama más cache/breaker cuando corresponde; La cola ordena (atMs,prioridad,secuencia): finalizaciones de proveedor prioridad0, resto1, deadlines2. Nueva revisión desde t≥150, caché válida con t<expiresAt y cooldown terminado con t≥openUntil. Se drenan completaciones tardías aunque terminen todos los clientes. Tiempo fuente no equivale a reloj real |
| Result | requestId,traceId,status200/503,partial,revision,replica,attempts,cacheHit,startedAt,endedAt,body. Duración endedAt-arrival, no solo servicio. Métricas: attempts reales, hits, fallos/parciales, p95 nearest rank, SLI y presupuesto floor(N×(1-target/100)); excedente max(0,incumplimientos-presupuesto) |
| Snapshot | Copias de settings, eventos, resultados y cuerpos. Cambios pendientes no reinterpretan capturas. Captura previa opcional se compara por totales, SLI y p95, no benchmark de arquitecturas |
| TransactionSettings | mode local/independent/saga/two-phase; failure none/payment/compensation/coordinator. compensation falla pago y luego liberación solo en saga; coordinator solo se permite en two-phase; controles evitan combinaciones sin significado |
| Estado transaccional | stock3,reserved0,chargedMinor0,ordercreated,preparedfalse,decisionnull inicialmente. Reserva decrementa stock y aumenta reserved; cobro es asiento local ficticio8900; confirmar consume reserved y fija confirmed. Fallo payment no cobra |
| Local | Cambios en working copy; un único commit publica stock2,reserved0,charged8900,confirmed. Fallo deja estado público inicial; no revierte pagos externos porque no existen |
| Independent | Cada paso publica su estado. Fallo payment deja stock2,reserved1,charged0,created y requiere recuperación; sin rollback global |
| Saga | Commit reserva, luego pago. Rechazo provoca liberar stock y cancelar. compensation deja orderattention y reserva1; recovery reintenta liberar una sola vez, conserva historial y no crea nuevo cobro. Recuperación solo disponible con pending compensation |
|2PC | Prepare mantiene valores iniciales y preparedtrue (locks del modelo). Rechazo de participante aborta y libera, sin commit. Éxito registra decisioncommit, luego aplica estado confirmado y libera. coordinator se detiene entre decisión durable conceptual y entrega; recovery lee esa decisión, no la inventa. Se simplifica visibilidad entre participantes |
| Evaluación | Flags partial,late,stale,compensated derivados de resultado y eventos, más respuesta causal correcta. Reutiliza el progreso local del curso incorporado en paralelo, bajo api-universe-course-v1, con sus validación y fallback de sesión; no persiste arquitecturas ni capturas |

### Superficies y contratos

`runSystem(settings): SystemRun` valida y produce topología, eventos, resultados y métricas. `runTransaction(settings): TransactionRun` y `recoverTransaction(run): TransactionRun` producen historia y estados. Todos los números de settings son enteros dentro de límites. Sin inventario, no hay partial y availabilitynull; fallo opcional produce200 partialtrue e inventorynull; obligatorio produce503 {code:DEPENDENCY_UNAVAILABLE,id}, sin proyección de éxito. BFF añade partial al resultado proyectado. No endpoint nuevo, login, secretos, migraciones ni almacenamiento. Datos ficticios públicos.

`/systems`: pregunta inicial y tres pestañas. Sistema agrupa arquitectura, carga y políticas, topología SVG, resultados, comparación previa, tabla temporal seleccionable y reproductor. Transacciones agrupa modo/fallo, estados, recuperación y reproductor. Capítulo explica mecanismos y evaluación. Código y tablas desplazan dentro del panel. Componentes reutilizados y nuevos se limitan a estos recorridos; no editor de grafo arbitrario.

### Recuperación y tiempo de transacciones

Estado order: created/confirmed/cancelled/attention; decision: null/commit/abort. Saga compensada termina stock3,reserved0,chargedMinor0,cancelled; compensación pendiente stock2,reserved1,chargedMinor0,attention. Recover exitoso deriva logro compensated solo si antes había compensación pendiente. Recuperar de nuevo es no-op sin eventos nuevos. Participantes2PC: inventario y libro/pedido; prepare en ese orden, ambos votan sí salvo failurepayment que vota no en segundo. La decisión commit/abort se conserva tras terminar. Commit se publica como snapshot agregado, simplificación explícita que omite visibilidad entre participantes. Eventos transaccionales usan solo orden lógico; no se les asignan milisegundos simulados.

### Invariantes y pruebas críticas

Eventos conservan copias de input/output; dependencias apuntan a eventos ya producidos. Orden de playback no reejecuta scheduler. El límite de cliente se respeta incluso con timeout; proveedor tardío puede continuar después. Un timeout se contabiliza una sola vez en breaker. Cache hit no aumenta llamadas. 2PC recupera decisión conocida; saga recupera compensación pendiente, nunca aplica cobro adicional. Validar ajustes inválidos antes de correr, probar errores por política, empate deadline, dos réplicas, TTL/cambio de fuente, p95/presupuesto y todos los modos transaccionales, con criteriosAC-1a9.

## Build plan

1. Completar consulta del sistema con constructor, scheduler, tracing y replay (AC-1a4,AC-9).
2. Añadir protección, caché, métricas y comparación con captura anterior (AC-5,AC-6,AC-9).
3. Completar transacciones y recuperación con snapshots (AC-7,AC-9).
4. Integrar capítulo, evaluación, navegación, teclado y móvil; verificar y probar recorridos (AC-1,AC-8,AC-9).

## Integración del progreso existente

Durante la construcción se incorporó en paralelo un progreso global para capítulos4a9. El capítulo10 reutiliza useChapterProgress con flags partial/late/stale/compensated y quiz correcto; el catálogo course marca Systems disponible. No añade otro almacén ni cambia resultados o logros previos.

## Consequences

Se hacen reproducibles fallos y carreras acotadas, pero no se mide infraestructura. No se modelan colas de CPU, límites de proveedor, red por paquetes, pérdida aleatoria, consensos, durabilidad ni garantías de producción. Parámetros no predicen rendimiento real. El constructor libre quedó fuera por elección de enfoque, sin eliminar requisitos del capítulo.

## Follow-up

Proyecto final y temas avanzados siguen en sus bloques. Persistencia de arquitecturas y ejecución de microservicios reales no forman parte de este laboratorio.

## Rationale

Decisiones y alternativas en [rationale.md](rationale.md).
