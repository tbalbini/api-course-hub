# 0015. Fronteras avanzadas

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El capítulo12 conecta interfaces binarias, mensajes de base de datos y llamadas a herramientas con las fronteras ya conocidas. Tres experimentos permiten cambiar un contrato, inspeccionar bytes y observar por qué una operación se acepta o se detiene. WebAssembly ejecuta un módulo fijo real; las llamadas nativas, transporte, base de datos y modelo de IA son modelos explícitos, sin proveedores externos.

## Requirements

- **AC-1**: `/advanced` ofrece Binario y Wasm, Mensajes y bytes, Herramientas y Capítulo12 mediante `?tab=binary/wire/tools/chapter`. Los paneles permanecen montados y ocultar pausa reproducción sin perder borrador o captura. Navegación por capítulo12 y área Aprendizaje y mapa, teclado, foco, skip link,390px y reducción de movimiento. Abrir o inspeccionar no inicia HTTP ni compila Wasm automáticamente.
- **AC-2**: El modelo ABI conserva la API restar(a,b), muestra dos int32 little endian en8 bytes y compara layout esperado frente a argumentos interpretados. Layout invertido con argumentos distintos cambia el resultado. FFI con memoria liberada se rechaza antes de invocar al proveedor. Es una convención binaria de juguete, sin ABI de CPU, ejecución nativa ni punteros reales. Explica tamaños, offsets, alineación, calling conventions, ownership/lifetime y native bindings sin prometer portabilidad universal.
- **AC-3**: WebAssembly instancia bytes constantes de un módulo sin imports ni memoria exportada y llama a dividir(i32,i32):i32. Inputs enteros entre−1000 y1000.10/3 produce3, dividir por0 captura RuntimeError real. Guardas de entrada y indisponibilidad del runtime son errores claros. WAT, bytes y export coinciden. Solo el click ejecuta/compila; replay no instancia otra vez. No eval, WAT editable, fetch, WASI ni acceso a archivos.
- **AC-4**: El experimento wire codifica un mensaje PostgreSQL Simple Query: tag Q, Int32 big endian con longitud que incluye sus4 bytes y String UTF-8 terminada en0. Dos sentencias fijas (`SELECT 1;` y `SELECT 'á';`) permiten distinguir caracteres y bytes. Chunk1/4/8/64, entrega completa/truncada/longitud inválida. El parser solo decodifica un frame completo, rechaza longitud<5 o>256, tag incorrecto, terminador/UTF-8 inválidos y frames extra. El único NUL del payload debe ser el byte final; un NUL anterior se rechaza. La traza conserva buffer por evento y el diagrama sigue el cursor. Incompleto al fin produce error, sin afirmar ejecución SQL o respuesta DB. TCP/chunks son conceptuales; encode/decode usa JS real. No se muestra como parser general de PostgreSQL ni captura de red.
- **AC-5**: Herramientas ofrece una propuesta JSON editable acotada a2048 bytes con id,name,arguments; solo get_order y confirm_order y argumentos exactos orderId:string1..80. Registry fijo, sin eval ni URLs. JSON inválido, estructura/argumentos inválidos, herramienta desconocida, pedido ausente y rol none/reader/buyer detienen el paso correspondiente. Confirmar requiere buyer; un schema válido no autoriza. Cada ejecución parte de un pedido aislado PED-1042created y no toca el Map real. Mensaje de resultado correlacionado por call id. El proveedor de IA es una fixture, no inferencia ni API externa; un agente coordina propuesta, ejecución y resultado y no convierte al modelo en ejecutor autorizado.
- **AC-6**: El mismo laboratorio permite salida proveedor v1 {id,status} o v2 {id,state}, con consumidor v1 fijo y adaptador opcional v2→v1. Sin adaptador la lectura del resultado falla aunque el efecto de confirmar exista; con adaptador valida y recupera confirmed. Mostrar efecto final, resultado recibido y contrato por separado. No deshacer efecto por error de consumo ni fingir negociación automática. Explicar APIs como productos, compatibilidad, inventario de consumidores, rollout, deprecación y operación.
- **AC-7**: Contenido separado cubre12 temas: API/ABI, FFI, Wasm, bindings, wire DB, tiempo real/streams, APIs de modelos, tool calling, agente/herramienta, schemas, producto y evolución. Cada tema tiene problema/pregunta, mecanismo, compromisos, alternativas, límites, código, misconception, pregunta con feedback causal y enlace al experimento relevante. Incluye desafío conjunto y enlaces a eventos/contratos/sistemas donde se profundiza. No equiparar chunk de bytes, mensaje, token y evento ni confundir schema con permiso o verdad del resultado.
- **AC-8**: Progreso común capítulo12 conserva seis actividades (`abiMismatch`, `lifetime`, `wasmTrap`, `wireIncomplete`, `toolDenied`, `evolved`) y doce preguntas comprobadas. Los ids de preguntas son flags qAbi/qFfi/qWasm/qBindings/qDatabase/qStreams/qModel/qTools/qAgents/qSchema/qProduct/qEvolution. Las actividades se acreditan solo desde nuevas ejecuciones: abiMismatch con resultado distinto del esperado; lifetime al rechazar antes de invocar; wasmTrap con RuntimeError real; wireIncomplete al observar EOF incompleto; toolDenied con confirmación rechazada por permiso; evolved con confirmación v2 adaptada y consumida como confirmed. QuizPassed solo después de comprobar correctamente las12; completar exige también las seis actividades. Las selecciones sin comprobar, visitas y replay no acreditan. Persistir solo flags, quiz y ubicación permitida; ningún bytecode, JSON, permiso, captura o pedido se almacena. Preservar formatos y logros anteriores y admitir sesión sin almacenamiento.
- **AC-9**: Eventos reutilizan TraceEvent, interaction obligatorio, indexEvents para estas cadenas lineales y reducer puro. Cada productor declara extremos, tecnología, frontera, fallos posibles y procedencia. ABI/wire/tools son modelos; Wasm y sus guardas/call/trap son observados. Código del inspector representativo, tiempos solo lógicos, sin métricas inventadas. Datos de ejecución no cambian al editar el siguiente borrador. Inspección y replay no ejecutan módulos ni herramientas.
- **AC-10**: Pruebas esenciales cubren bytecode real y trap, ABI/FFI, framing con cortes y UTF-8, validación y permisos de herramientas, efectos y adaptación, inmutabilidad, contexto/progreso, teclado/móvil y ausencia de red/repetición. Tipos, lint, lógica, build y navegador pasan. Se documentan simplificaciones y pendientes sin declarar completados referencia, desafíos generales o entrega integral.

## Decision

Reutilizar TypeScript, SVG/HTML y el reproductor existente. No dependencias nuevas. Tres módulos de lógica (`binary-boundary.ts`, `database-wire.ts`, `tool-boundary.ts`) y tres experimentos, coordinados por `advanced-lab.tsx`. El contenido vive en `src/content/advanced.ts`. ContractPlayer admite etiqueta y nota de código opcionales para distinguir Wasm real de modelos sin duplicar controles.

Las recomendaciones iniciales de Wasm real y sistema visual actual se aplican por defecto conforme a AGENTS.md; el selector devolvió respuestas vacías. El stack, el progreso y la ausencia de credenciales ya estaban decididos. No hay nueva persistencia ni migración de base de datos.

**Implementation skills**: `develop`, `test`, `check`, `sync`, `ponytail:ponytail`, `vercel:react-best-practices`.

## Feature design

### Datos, acciones y fuentes

| Valor | Fuente y regla |
|---|---|
| Argumentos binarios | Dos inputs numéricos,10 y3 iniciales; enteros finitos−1000..1000. API restar y dividir son distintas operaciones explícitas |
| ABI | DataView escribe a en offset0 y b en4, int32 LE. Proveedor aligned lee0/4, swapped lee4/0. Resultado calculado left−right. expected=a−b. Bytes se copian. Alineación y registros reales se explican, no se simulan como una ABI existente |
| FFI | lifetime alive/released del control. released produce LIFETIME antes de la llamada modelada. No acceso real a memoria liberada |
| Wasm | Uint8Array fijo: módulo v1 con export dividir, dos i32 y retorno i32, opcode i32.div_s. WAT fijo equivalente. instantiate y llamada solo en handler; busy+lock evita doble ejecución simultánea; capture local observada, RuntimeError tipado. Sin medición de latencia |
| Run binario | mode, argumentos, layout, lifetime, bytes, expected/result nullable, error nullable, Capture. Snapshot por ejecución. Cambiar controles no altera el run previo |
| SQL | Selector de dos literales, sin SQL libre. Tag81, length=4+UTF8.length+1; mensaje completo ocupa1+length. Parser bounded admite solo Query y exactamente un frame; no conexión, startup, TLS, auth, Parse/Bind/Execute ni resultados DB |
| Wire run | settings copiados, frame:number[], entregado:number[], decoded:string|null, error, capture y snapshots por evento. Fragmentos calculados por chunkSize; truncado elimina último byte y length inválida escribe3. EOF incompleto es error distinto del formato inválido |
| Visual wire | Bytes con etiqueta tag/longitud/payload y estado recibido, snapshot del cursor. No métricas de TCP ni throughput. Pausar/retroceder no entrega de nuevo |
| Propuesta | Textarea JSON inicial get_order para PED-1042. Presets consultar, confirmar, herramienta inventada y argumentos inválidos cambian borrador sin ejecutar. Root exacto id/name/arguments, id1..80,name string no vacío,arguments objeto. UTF-8≤2048 antes de JSON.parse |
| Registro y validación | Dos capacidades fijas con argumento orderId exacto y schema JSON ilustrado con type/required/maxLength/additionalProperties. Validador implementa este subconjunto, sin afirmar implementación general de JSON Schema |
| Autorización | Rol local none/reader/buyer: none rechaza invocación; reader consulta; buyer consulta/confirma. Sin tokens reales ni HTTP statuses ficticios. Solo después de validar propuesta/registro/argumentos/permiso se llama al modelo del proveedor |
| Pedido y efecto | Fixture nueva por run, idPED-1042,statuscreated. confirm fija confirmed idempotentemente. Otro id produce NOT_FOUND. Nunca importa orders.ts ni usa almacenamiento real. Efecto observable conserva confirmed aunque falle consumidor v1 |
| Evolución | Selector v1/v2 y checkbox adaptar. v1 devuelve id/status; v2 id/state. Consumidor exige id y enum status. Adaptador explícito traduce state, luego valida. Modelo de retorno incluye callId de propuesta y result o error estructurado |
| Contenido y preguntas | Catálogo editorial de12 temas, seis ejes por tema, código y3 respuestas con feedback. Topic selector conserva respuesta de sesión por tema; logros comprobados sí se guardan. Acertar otra vez no borra ni duplica logros |
| Progreso | `courseGoals[12]`, useChapterProgress(12), flags anteriores y doce qFlags. El componente comprueba todas las qFlags al resolver la última; solo entonces check(true). courseLocation admite /advanced?tab conocida; catálogo y menú pasan12 a disponible |
| Navegación | Área learning del menú actual por cinco áreas. Sustituir el aviso pendiente del capítulo12 por enlace y prácticas; no alterar las demás áreas. Server page con metadata y Suspense para useSearchParams |

### Estados y superficies

Binario inicia con modelo alineado pausado. Ejecutar captura validación→representación→comprobación de vida→invocación→retorno o error. Modo Wasm ejecuta validación→instantiate→export→call→resultado/trap. Error de runtime no se confunde con HTTP.

Wire construye una traza con snapshots incrementales, decodificación solo al completar y EOF explícito. Herramientas recorre propuesta prefabricada/editada→parseo→registro→argumentos→permiso→negocio→resultado proveedor→adaptación/consumo→retorno correlacionado. Fallos detienen pasos posteriores; fallo de consumo puede ocurrir después del efecto.

Los cuatro paneles se conservan montados. Encabezado, pregunta, pestañas, experimento y reproductor siguen design.md. En capítulo se elige un tema, se lee su mecanismo y se comprueba su pregunta; el desafío combina las seis actividades. Tablas/código desplazan dentro del panel. No nuevas imágenes ni servicios.

### Escenarios críticos

- API estable pero layout inverso cambia10−3 en3−10; lifetime released impide invocar. AC-2,AC-9.
- Bytes Wasm válidos,10/3=3 y10/0 es RuntimeError; replay no llama otra vez. AC-3,AC-9.
- Todos los cortes del frame, header incompleto, UTF-8 multibyte, length inválida, null ausente y fin prematuro. AC-4.
- JSON/args inválidos y herramienta inventada no producen efecto; reader no confirma; buyer confirma. AC-5.
- v2 sin adaptador rechaza retorno después de confirmar; con adaptador consumidor observa confirmed. Cada run aislado. AC-6.
- Seis resultados y12 comprobaciones, recarga y resumen; visita, selección y replay no acreditan. Contexto, móvil, foco y no HTTP. AC-1,AC-7 a10.

## Build plan

1. Completar recorrido binario y Wasm real, errores y pruebas (AC-2,AC-3,AC-9,AC-10).
2. Completar framing DB, visualización del cursor y fallos (AC-4,AC-9,AC-10).
3. Completar herramientas, permisos y evolución del resultado (AC-5,AC-6,AC-9,AC-10).
4. Integrar contenido, doce comprobaciones, progreso y navegación (AC-1,AC-7,AC-8).
5. Verificar runtime, accesibilidad, fuentes y regresiones; documentar límites y cierre (AC-1 a10).

## Consequences

El capítulo ejecuta Wasm y validadores locales sin instalar compiladores o servidores de bases de datos. No demuestra una FFI nativa, una ABI de plataforma ni inferencia de IA real. El parser es deliberadamente acotado a un mensaje y el schema a dos herramientas. Las afirmaciones de compatibilidad se limitan al contrato enseñado. La integración exige preservar metadatos X Ray y código compartido modificado en paralelo.

## Follow-up

Referencia, desafíos generales y verificación integral conservan sus bloques. La integración avanzada aporta evidencia al bloque7 sin cerrar por sí sola trabajos concurrentes de X Ray no comprobados.

## Rationale

Decisión y límites en [rationale.md](rationale.md).
