# The API Universe

Laboratorio en español para entender APIs desde sus mecanismos. Permite crear un pedido HTTP real, inspeccionar su traza y contrastarlo con operaciones locales, otros contratos y comunicación por eventos.

## Ejecutar

Necesitas Node.js 24 y npm. No hay variables de entorno, cuentas ni API keys externas.

```sh
npm ci
npm run dev
```

Abre [el laboratorio local](http://localhost:3000). También están disponibles `/follow-the-click`, el recorrido `/first-principles`, el mapa `/api-universe`, el comparador `/compare`, los laboratorios `/playground`, comunicación y eventos en `/events`, seguridad en `/security` y contratos en `/contracts` y Systems Lab en `/systems`, además del proyecto de pedidos en `/build-api` y fronteras avanzadas en `/advanced`.

El menú organiza el producto en cinco áreas: Bases, Recorrido central, Aprendizaje y mapa, Laboratorios, y Progreso y evaluación. Solo un área se despliega a la vez. Los capítulos conservan sus números y enlaces; el programa completo del 0 al 12 se consulta en `/course`. GraphQL/RPC son prácticas de Laboratorios, el comparador está en Aprendizaje y mapa y el proyecto final acompaña a Follow the Click. Puedes abrir primeros principios con `/first-principles?chapter=0` hasta `chapter=3`; sin ese parámetro se recupera el último capítulo guardado. Navegar conserva los logros y no completa actividades por visitarlas.

`/course` muestra el recorrido completo, los estados de los capítulos y el progreso combinado. Puedes continuar desde el último capítulo o pestaña guardados. El formato anterior de primeros principios se conserva; los capítulos 4 a 12 guardan actividades y razonamiento comprobados en un registro complementario. La profundidad del inspector es común. No se guardan pedidos, credenciales, capturas ni borradores HTTP. Con almacenamiento bloqueado aparece un aviso y los logros duran la sesión.

Desafíos (`/challenges`) reúne siete formatos con resultado operativo y explicación causal. Guarda solo los identificadores completados; las respuestas, configuraciones y capturas se descartan al recargar. La referencia (`/reference`) permite buscar conceptos, contrastar mecanismos y consultar la guía del laboratorio. En móvil, un selector de área y una fila desplazable de destinos evitan desplegar todo el currículo. Ambos funcionan con teclado.

Para producción local:

```sh
npm run build
npm start
```

## Qué funciona

Puedes crear pedidos con cantidad de 1 a 5 y elegir credencial de comprador, lector o ninguna. La petición real aparece en las herramientas de red del navegador. El precio se calcula en el servidor. Un error de respuesta o conectividad conserva clave y payload para reintentar la misma operación mientras permanezca abierta la página.

El reproductor ofrece play, pausa, avance, retroceso, replay, velocidad y selección directa en la timeline. El inspector conserva el evento al cambiar entre Intuition, Engineering e Internals y muestra código representativo, datos, contrato y request o response. Las explicaciones de cada evento son independientes. Los eventos de estado registran solicitudes a setters, sin medir commit de React ni paint del navegador.

Puedes comparar la captura actual con la anterior e intercambiarlas para inspeccionarlas sin repetir sus efectos. Al seleccionar una escritura, un panel muestra el fragmento del Map y una alternativa SQL conceptual parametrizada con los datos de ese evento. No ejecuta SQL ni toma valores del formulario posterior. Los pedidos e intentos inciertos conservan su estado al inspeccionar otra captura.

Las vistas Aplicación, Red e Infraestructura comparten captura, cursor e inspector. En simulación puedes elegir IP local HTTP, nombre remoto HTTP o HTTPS, caché DNS, reutilización de conexión y entrada directa, proxy o proxy con balanceador. Los ajustes se aplican al ejecutar; la captura anterior conserva sus condiciones. DNS, TCP y TLS aparecen cuando corresponden al modelo, con motivos explícitos cuando se omiten. Las capturas reales no inventan esos pasos sin instrumentar.

Las simulaciones incluyen 200, 201, 400, 401, 403, 404, 409, 429, 500, timeout con escritura completada, fallo de red anterior a entrega y petición duplicada. No ejecutan peticiones ni escrituras. El botón de favoritos ejecuta estado local real sin fetch.

## Primeros principios

En `/first-principles` funcionan los capítulos 0 a 3: ejecución y abstracción, contratos y sustitución de implementaciones, APIs locales y DOM, y comunicación entre procesos. Cada capítulo incluye una pregunta, mecanismo técnico, alternativas, compromisos, límites, código, error conceptual, comprobación con feedback y desafío práctico.

El laboratorio A ejecuta realmente la función de suma con argumentos editables. Puedes cambiar entre dos implementaciones compatibles y otra que incumple el retorno numérico. El laboratorio comprueba explícitamente el contrato. B identifica la Browser API del capítulo2: el DOM cambia realmente mediante querySelector y textContent, sin interpretar HTML ni enviar fetch. Su acceso lleva a `/first-principles?chapter=2#local-lab-title`.

API Anatomy tiene acceso propio en `/first-principles?chapter=3#api-anatomy` y muestra siete mecanismos: función, IPC local, system call, HTTP, RPC remoto, mensaje asíncrono y suscripción. Sus otras infraestructuras son modelos. Las llamadas concurrentes se representan en dos filas con dependencias separadas. Pila y memoria son reconstrucciones pedagógicas, no un volcado del motor JavaScript.

El progreso local requiere una respuesta correcta y la actividad del capítulo. Se conservan capítulo, profundidad y logros bajo la clave versionada `api-universe-learning-v1`. No se guardan argumentos ni capturas. Si el navegador bloquea el almacenamiento, el progreso sigue en la sesión y se informa del problema al guardarlo. No constituye una certificación ni se sincroniza entre dispositivos.

## API Universe

En `/api-universe` funciona el Taxonomy Explorer: seis ejes, 49 facetas y 29 fichas, con búsqueda, filtros combinados, mapa interactivo e inspector de responsabilidades. Los rasgos definidos se distinguen de usos posibles; una asociación ausente no prueba incompatibilidad. La selección se conserva al filtrar y existe recuperación cuando no hay resultados.

Puedes comparar dos fichas en ambos sentidos. REST/HTTP, GraphQL/TCP, WebSocket/webhook y JSON/OpenAPI explican diferencias de categoría o capa, sin presentar combinaciones como alternativas excluyentes. El perfil de pedidos demuestra etiquetas simultáneas y una actividad evalúa cinco responsabilidades con feedback y reintento. Esta actividad no altera el progreso de capítulos.

El catálogo ofrece ejemplos concretos, no ejecuta protocolos ni fragmentos y no envía solicitudes externas. Sus enlaces llevan a primeros principios, al comparador y a la pestaña del laboratorio correspondiente en `/playground?tab=…` o `/events?tab=…`. Abrir un enlace solo selecciona el laboratorio; enviar HTTP o abrir SSE requiere una acción explícita. Un valor de tab desconocido abre la pestaña inicial. La [spec 0005](docs/specs/0005-api-taxonomy/index.md) conserva el inventario y las reglas de comparación.

## Un pedido, distintas interfaces

En `/compare` funciona el capítulo 6 y el Comparative Engine: consultar y confirmar el mismo pedido mediante función local, REST/HTTP, GraphQL, RPC, JSON RPC, XML RPC, gRPC, SOAP, polling y suscripción. Cada alternativa comienza con una copia de PED-1042 en created. Contratos, invocaciones, resultados, código, fronteras, errores y compromisos pueden compararse. Una traza seleccionable reutiliza reproducción y X Ray, sin reejecutar efectos.

La selección de campos GraphQL cambia documento y respuesta. gRPC permite explorar unary, server streaming, client streaming y bidi mediante mensajes conceptuales, sin inventar bytes. SOAP muestra Envelope, Fault y extracto WSDL coherente, sin binding de despliegue. El capítulo explica las restricciones REST y los límites del ejemplo HTTP. Polling y suscripción observan cambios, con un comando de confirmación separado. Una observación posterior puede resolver la incertidumbre de una respuesta perdida. La actividad ofrece feedback y registra ambos objetivos explorados, sin alterar progreso de capítulos 0 a 3.

Las funciones compartidas readOrder y confirmOrder ejecutan JavaScript real. Las otras interacciones del comparador son simulaciones etiquetadas, sin servidores de esos protocolos. Una consola aparte crea un pedido HTTP real mediante POST y permite GET y PATCH. Confirmar fija status=confirmed de forma idempotente; no representa un pago. El comprador puede consultar y confirmar, el lector solo consultar. Una creación incierta conserva su clave al reintentar. Repetir POST devuelve el snapshot de creación; GET devuelve el estado actual. POST/GET/PATCH incluyen instrumentación observada del servidor desde el capítulo11, además de los eventos del cliente. La [spec 0006](docs/specs/0006-comparar-pedido/index.md) documenta el contrato y la [verificación](docs/specs/0006-comparar-pedido/verify.md) conserva la evidencia.

## Red y API Playground

En `/playground` funcionan los capítulos 4 y 5 y los laboratorios C, D y E. El editor HTTP permite modificar método, URL, params, headers y body, previsualizar las partes de la URL y enviar al mismo servidor. Admite las rutas de diagnóstico y pedidos, sin proxy ni destinos externos. Los presets solo preparan datos. Reproducir una captura o cambiar de pestaña no envía solicitudes; los borradores y los reintentos inciertos se conservan mientras permanece abierta la página.

`/api/lab/http` es un eco público sin persistencia que responde GET, POST, PUT, PATCH y DELETE. Negocia JSON y texto mediante Accept, con prioridades q y comodines comunes. GET genera ETag y acepta If-None-Match para devolver 304 sin body. El editor envía esa condición manualmente y usa fetch no-store. Muestra status, headers, texto original, parsing y duración observada, incluso ante 405 vacío, JSON de respuesta inválido o fallo al leer un body después de recibir headers. La negociación omite parámetros de medios distintos de q. El eco no crea recursos ni prueba operaciones CRUD.

El modelo de red distingue HTTP/1.1/TCP/TLS, HTTP/2/TCP/TLS, HTTP/3/QUIC/UDP y UDP directo. Puedes cambiar IP o nombre, caché, conexión, pérdida y retry; TCP y QUIC recuperan contenido donde UDP no lo hace por sí solo. Reintentar GET se distingue de recuperación del transporte. Las rutas y tres unidades numeradas son ilustrativas, sin paquetes capturados. El cálculo de latencia se etiqueta como simulado y no decide el fallo de retorno ni compara rendimiento de versiones.

GraphQL y RPC/gRPC reutilizan contratos, proyecciones y trazas del comparador, sin servidores externos. Los capítulos incluyen conceptos, código, semántica de métodos, errores frecuentes, evaluación con feedback y desafíos verificables de sesión. Estos logros no alteran el progreso de capítulos 0 a 3. La [spec 0007](docs/specs/0007-http-playground/index.md) y su [verificación](docs/specs/0007-http-playground/verify.md) conservan contratos y límites.

## Comunicación y eventos

En `/events` funcionan el capítulo 7 y los laboratorios F y G. El chat permite enviar el mismo texto mediante modelos de polling, long polling, WebSocket y SSE. Puedes perder la primera actualización después de guardarla y observar por qué reconectar sin historial ni cursor no recupera el mensaje. SSE envía el comando mediante POST separado; WebSocket usa su canal bidireccional. Los contadores representan solicitudes y canales del modelo, no conexiones TCP ni rendimiento.

El laboratorio de entregas compara webhook, queue, pub/sub y event stream. Permite publicar una copia, invertir revisiones, perder la confirmación, rechazar y agotar reintentos. Deduplicación y control de revisión modifican las aplicaciones de efecto. Pub/sub conserva dos proyecciones independientes; una cola reparte intentos entre dos trabajadores con proyección compartida. En stream, una copia publicada conserva event.id y recibe otro offset; releer mantiene los registros y los ids observados. Un offset fallido impide avanzar al siguiente. Son snapshots ficticios de pagos, sin cobros ni infraestructura de brokers. El efecto y su registro de dedupe solo son atómicos dentro del modelo.

La pestaña SSE real abre `GET /api/lab/events` mediante EventSource. Recibe tres eventos de muestra, separados por 350ms configurados, y un evento complete. HTTP es real; los datos no consultan pedidos. El cliente cierra al completar, fallar, pulsar cerrar, cambiar pestaña o salir; el servidor limpia temporizadores al terminar o cancelar. Replay no vuelve a conectar. No se inventan status, headers de Response ni latencia que EventSource no expone. La demo no conserva historial ni implementa resume durable.

Las cuatro pestañas conservan ajustes y capturas mientras permanece abierta la página y pausan reproducción al ocultarse. El capítulo incluye comparación, código, evaluación con feedback y tres actividades comprobables de sesión. Contratos y evidencia en la [spec 0008](docs/specs/0008-eventos-entrega/index.md) y su [verificación](docs/specs/0008-eventos-entrega/verify.md).

## Seguridad y decisiones de acceso

En `/security` funcionan el capítulo 8 y el laboratorio H. Acceso permite cambiar credencial, rol, operación, concesión de scope, cuota y validez del payload. Los controles producen401,403,429,400 o200 y detienen el negocio en la etapa que rechaza. Consultar conserva el estado; confirmar solo cambia el pedido ficticio si supera todos los controles. El presupuesto de uso es una condición de escenario, no un rate limiter del servidor.

CORS y CSRF distingue envío, efecto y lectura. Puedes comparar formulario safelisted con JSON y preflight, navegador con cliente servidor, origen exacto con wildcard, envío de credenciales, ACAC y defensa CSRF. Un formulario puede producir efecto aunque JavaScript no pueda leer la respuesta. Un preflight fallido impide enviar el POST. La defensa de token CSRF se evalúa en servidor y puede rechazar aunque CORS permita leer. Se supone cookie SameSite=None;Secure permitida por el navegador, sin modelar bloqueo de terceros. Todo este transporte es conceptual; no modifica CORS ni cookies reales de la aplicación.

Credenciales ofrece cinco pipelines: API key, sesión, OAuth 2.0, OpenID Connect y JWT, con fallos por etapa. Distingue lookup, concesión, state, canje PKCE, validación de ID token y autorización de API. Un ID token válido para el cliente no reemplaza al access token de API. Leer claims no verifica una firma. No se ejecuta criptografía ni se conecta un proveedor real; los fixtures no contienen secretos.

HTTP real reutiliza la consola de pedidos y sus credenciales públicas. Permite observar401 sin credencial,403 con lector al confirmar, consulta autorizada y confirmación con comprador. Los401 de POST/GET/PATCH incluyen challenge Bearer en WWW-Authenticate. Cambiar pestaña conserva el pedido, captura y creación incierta; pausa reproducción. El capítulo incorpora código, mecanismos, alternativas, límites, evaluación y cuatro actividades comprobables de sesión. Contratos y evidencia en la [spec 0009](docs/specs/0009-seguridad-acceso/index.md) y su [verificación](docs/specs/0009-seguridad-acceso/verify.md).

## Diseño y evolución de contratos

En `/contracts` funcionan el capítulo 9 y el laboratorio I. El diseñador guiado permite elegir recurso o comando, ruta versionada, campos, tipos, restricciones, outputs y errores. El mensaje JSON editable se parsea localmente, con límite de 4096 bytes UTF-8. El validador implementa objetos planos, string/integer, enum, required, límites y propiedades adicionales. No acepta schemas arbitrarios ni ejecuta código del editor. Una respuesta con total incorrecto puede cumplir el schema y fallar la comprobación de negocio independiente.

Compatibilidad ejecuta el mismo mensaje contra el proveedor de referencia y otro contrato, en ambas direcciones de consumidor/proveedor. Permite fixtures nominal, mínimo, máximo e inválido y lectores de salida tolerantes o estrictos. Conservar v1 mantiene su handler completo cuando el candidato publica otra ruta. Anunciar deprecación no retira rutas ni repara un cambio bajo la misma URL. Pasar un fixture no certifica compatibilidad universal.

Colecciones aplica filtro y orden estable antes de paginar por offset o cursor keyset. Una inserción anterior a la ventana muestra por qué offset puede repetir un id; keyset evita ese duplicado concreto, pero no crea un snapshot ni devuelve el registro recién insertado. El cursor se valida y liga a filtro/orden, sin firma ni secreto. Reintentos modela dos intentos con claves y payloads editables, pérdida de respuesta y retención de dedupe. Olvidar claves conserva pedidos y permite duplicados; no promete exactamente una vez fuera del modelo.

OpenAPI3.1.1 describe el diseño HTTP vigente y AsyncAPI3.0 un evento independiente. Ambos JSON se inspeccionan y descargan realmente en el navegador, sin red. Son versiones elegidas para el ejercicio, sin afirmar que sean las últimas. No instalan handlers ni brokers. Las cinco pestañas conservan borradores y capturas durante la sesión y pausan reproducción al ocultarse. El capítulo ofrece código, alternativas, límites, feedback y cuatro actividades evaluadas. Las rutas diseñadas no están desplegadas ni modifican pedidos reales. Contratos y evidencia en la [spec 0010](docs/specs/0010-diseno-contratos/index.md) y su [verificación](docs/specs/0010-diseno-contratos/verify.md).

## Systems Lab

En `/systems` funcionan el capítulo10 y el laboratorio J. Un constructor guiado permite activar proxy o gateway, balanceador con dos réplicas, BFF, inventario local o separado y caché compartida. El diagrama conserva fronteras explícitas y no dibuja un módulo local como una llamada de red. Funciones incluye un arranque compartido por réplica, con un coste configurado que no representa un proveedor real.

El planificador de eventos discretos ejecuta hasta seis consultas, con concurrencia, separación de llegadas, latencia, deadlines, retries y backoff configurables. Un timeout no elimina el trabajo pendiente: el proveedor puede terminar después. El circuito por réplica usa generaciones, dos fallos para abrir, cooldown y una sonda half open. La caché conserva snapshots completos durante500ms y puede servir revisiones antiguas; expirar no equivale a invalidar todos los cambios concurrentes. No hay single flight ni jitter aleatorio. Todo usa tiempo simulado, sin medir ni llamar infraestructura.

La tabla temporal y el mapa seleccionan eventos del reproductor X Ray. Trace ID, span ID, parent span y dependencias permiten seguir peticiones concurrentes sin convertirlas en una sola cadena. Los resultados finales se separan del cursor y se pueden comparar con el lote anterior. SLI exige respuesta completa y rápida, p95 usa nearest rank y el presupuesto SLO se calcula sobre ese lote pequeño; no se anuncia un SLA ni disponibilidad de producción.

Transacciones compara una DB local, commits independientes, saga y2PC conceptual. Permite rechazar el asiento ficticio, fallar la compensación o detener al coordinador después de registrar commit. Recuperar conserva la historia y no repite reserva ni cobro. Snapshots muestran qué cambios ya eran públicos. No hay dinero, DB, protocolo de consenso ni durabilidad real;2PC simplifica visibilidad entre participantes.

Las tres pestañas conservan ajustes y pausan reproducción al ocultarse. El capítulo incluye mecanismos, código, alternativas, límites, quiz y cuatro logros integrados con el progreso local común del curso incorporado en paralelo. No se guardan arquitecturas ni capturas. Contratos y evidencia en la [spec 0011](docs/specs/0011-sistemas-fallos/index.md) y su [verificación](docs/specs/0011-sistemas-fallos/verify.md).

## Límites explícitos

Los pedidos viven en un Map del proceso servidor y se pierden al reiniciarlo. El máximo de 200 registros acota memoria, no implementa un rate limiter general. No se comparte estado entre procesos o instancias. Las claves de idempotencia solo existen mientras vive ese almacén.

`demo-buyer` y `demo-reader` son credenciales públicas para aprender autenticación y autorización. No son secretos ni protegen datos de producción. No se procesan pagos ni datos personales.

La traza se captura después de ejecutar la operación. Reproducir o retroceder solo cambia el punto de observación, no repite ni revierte efectos reales. El tiempo lógico indica orden, no latencia. La duración observada abarca fetch y parsing en el cliente. No se capturan paquetes, DNS, TCP, TLS, routers, proxies ni balanceadores. Las flechas representan topología, no mediciones.

La red simulada de Follow the Click modela HTTP/1.1 sobre TCP; el Playground amplía la comparación de transportes. No se capturan paquetes, TTL, retransmisiones ni reanudación TLS. En HTTPS con proxy, TLS termina en la entrada; el transporte desde allí a la aplicación queda fuera de detalle. Proxy y balanceador son roles que pueden compartir componente. La cadena de middleware es conceptual, no un middleware de Next.js desplegado.

La tienda, producto, precio y marca visual son material ficticio del experimento. El código del inspector es representativo; el código ejecutado está en `src/app/api/orders/` y `src/lib/orders.ts`.

## Proyecto final de pedidos · capítulo11

En `/build-api`, Aplicación integra contrato, consola, timeline e inspector. Puedes crear, consultar y confirmar con HTTP real, observar400/401/403/404/409 y seguir click, handler, fetch, servidor y recepción. El evento de actualización observa el setter del estado, no el commit ni el paint de React. La duración observada cubre fetch y parsing; el orden lógico no es un reloj distribuido.

La cantidad editable0a9 permite enviar valores fuera del contrato servidor1a5. El id de consulta es editable y se codifica como segmento. Repetir POST original usa la clave de la última creación nueva resuelta, incluso si se recuperó tras perder una respuesta. Con la misma cantidad devuelve su snapshot; con otra devuelve409. Confirmar no altera ese snapshot y GET consulta el estado actual. Una confirmación incierta conserva el id para consultar o repetir el PATCH fijo; una creación incierta conserva clave, datos y credencial. Una respuesta no validada no sustituye el pedido conocido ni obtiene logros.

Código ejecutado ofrece14 archivos de una lista fija, su responsabilidad, texto completo, SHA256 y descarga local. `scripts/project-sources.mjs` genera `src/generated/project-sources.json` antes de dev, build, typecheck y test; el JSON se ignora en Git y se importa estáticamente. El servidor de producción no lee las fuentes al mostrarlo. Editar archivos después del build no cambia el visor: recompila. En desarrollo, reinicia dev tras editar para regenerarlo. Un archivo descargado necesita el resto del repositorio y sus dependencias; no es un proyecto independiente. El fragmento del inspector sigue siendo representativo.

Capítulo11 reúne explicación, alternativas, límites, práctica y quiz. Seis resultados HTTP validados más razonamiento correcto completan el capítulo en el progreso común. Replay, abrir archivos o cambiar pestañas no envían peticiones de negocio. La [spec0013](docs/specs/0013-proyecto-pedidos/index.md) describe contratos y recepción; su [verificación](docs/specs/0013-proyecto-pedidos/verify.md) registra la evidencia. El almacenamiento sigue siendo Map200 temporal y las credenciales siguen siendo públicas.

## Fronteras avanzadas · capítulo12

En `/advanced`, Binario y Wasm contrapone una convención ABI inventada con un módulo WebAssembly real. Dos enteros ocupan offsets explícitos; invertirlos cambia el resultado y liberar el buffer modelado impide invocar. Wasm instancia bytes fijos sin imports ni memoria exportada y ejecuta división entera:10/3 devuelve3 y10/0 produce un RuntimeError real. Solo Ejecutar instancia el módulo; inspección y replay conservan la captura sin repetirlo.

Mensajes y bytes calcula un frame PostgreSQL Query en JavaScript, permite fragmentarlo y muestra el buffer de cada evento. Tag, longitud big endian y String UTF-8 con NUL tienen etiquetas; truncar o declarar una longitud inválida detiene la interpretación. No conecta con PostgreSQL ni ejecuta SQL. Es un parser de un único frame acotado a256 bytes después del tag, no un cliente de base de datos completo.

Herramientas recibe JSON prefabricado o editado, limita tamaño y estructura, valida un registro fijo y comprueba permisos antes del efecto. No evalúa código ni llama a un modelo de IA. Cada ejecución usa un pedido aislado: lector consulta, comprador confirma. La salida v2 rompe al consumidor v1 aunque la confirmación haya ocurrido; un adaptador explícito traduce el resultado sin revertir el efecto. No modifica los pedidos HTTP reales.

Los doce temas incluyen mecanismo, compromisos, alternativas, límites, código y preguntas con feedback. Seis actividades observadas y doce explicaciones comprobadas completan el capítulo; visitar, seleccionar o reproducir no concede logros. Las cuatro pestañas conservan borradores y capturas y comparten X Ray y profundidad. Solo se persisten progreso y ubicación. La [spec0015](docs/specs/0015-fronteras-avanzadas/index.md) documenta contratos y simplificaciones; su [verificación](docs/specs/0015-fronteras-avanzadas/verify.md) conserva los resultados.

## Desafíos y evaluación razonada

`/challenges` ofrece diagnóstico de arquitectura y predicción básicos; depuración de petición, elección de interfaz y detección de una idea equivocada de nivel intermedio; diseño de contrato e inyección de fallos avanzados. Cada intento ejecuta un modelo existente o la suma JavaScript local y contrasta una decisión con su resultado. Exige resultado operativo y explicación causal correctos juntos, ofrece feedback de ambas partes y una alternativa razonable, y permite reintentar sin límite.

El inspector conserva eventos, dependencias, código, datos y X Ray comunes. Las operaciones de red, permisos y negocio son simulaciones; no envían HTTP ni crean pedidos reales. Debug the Request valida el JSON escrito, pero la traza de acceso representa cualquier body inválido con su fixture `{status: "inventado"}`; el resultado conserva por separado el body introducido. La predicción ejecuta `runFunction`; pila y memoria siguen siendo conceptuales.

El progreso común añade solo ids conocidos a `challenges`, con compatibilidad para snapshots anteriores, unión de logros y sesión cuando localStorage no está disponible. La ubicación admite únicamente `?challenge=` con un id conocido. Elegir, visitar, editar o reproducir no acredita. Un logro ya comprobado se conserva al practicar otra vez; nunca completa un capítulo. La [spec0017](docs/specs/0017-desafios/index.md) y su [evidencia](docs/specs/0017-desafios/verify.md) documentan estos casos y límites. Es una evaluación educativa local, sin protección contra manipulación del almacenamiento ni certificación universal.

## Referencia y búsqueda conceptual

`/reference` reúne94 fichas con búsqueda literal por palabras, alias y explicaciones, sin distinguir tildes o mayúsculas. El filtro de tema se combina con la consulta; las coincidencias exactas de nombre o alias tienen prioridad. Con consulta vacía aparece el índice alfabético. Los temas organizan la consulta y no reclasifican las APIs como familias excluyentes. Las29 fichas de taxonomía conservan sus textos canónicos; el resto conecta fundamentos, red, HTTP, eventos, permisos, contratos, sistemas y fronteras avanzadas.

Cada ficha muestra definición, mecanismo, compromisos, límites, código representativo, relaciones y un experimento. URL conserva q, topic, term y view validados; seleccionar o seguir una relación añade historial, mientras escribir o filtrar reemplaza la entrada actual. Filtrar no borra la selección y se informa si queda fuera de resultados. Un id desconocido recupera API; cero coincidencias permite limpiar. No hay búsqueda remota, coincidencias inferidas ni ejecución del código mostrado. La consulta permanece en URL e historial del navegador, sin guardarse en el registro de progreso.

El inspector abre una referencia contextual en otra pestaña para conservar captura, cursor y datos del experimento. El vínculo usa solo stage y un id editorial; no incluye pedidos, credenciales ni otros datos capturados. La guía documenta comandos, contrato HTTP, almacenamiento temporal, incertidumbre, arquitectura y procedencia. Consultar no acredita progreso ni cambia el último experimento guardado. La [spec0016](docs/specs/0016-referencia-conceptual/index.md) define el contrato y su [evidencia](docs/specs/0016-referencia-conceptual/verify.md) registra lo comprobado.

## Estado del proyecto

Los capítulos 0 a 12, la taxonomía, los laboratorios A a J, la referencia y los siete desafíos generales están construidos. El progreso local de capítulos0a3 conserva su formato original; el progreso común cubre logros y quiz de capítulos4a12 y logros independientes de desafíos. El [alcance](docs/scope/index.md) registra la construcción por bloque y [scope2](docs/scope2/index.md) sigue las correcciones posteriores.

La entrega integral del bloque20 está en curso: falta validar comprensión con participantes, fase4 de scope2. La [matriz del Master Prompt completo](docs/scope2/fase5-matriz.md) y la [verificación técnica de fase5](docs/scope2/fase5-verificacion.md) están realizadas sobre fuentes identificadas:758 pruebas de lógica y215 de navegador, tipos, lint y compilación aprobados. La matriz distingue adaptaciones, límites de cobertura y orden histórico no acreditado. Las pruebas técnicas no sustituyen los cinco resultados humanos ni permiten afirmar cumplimiento literal íntegro del prompt.

La [arquitectura](docs/specs/0001-arquitectura-proyecto/index.md) y el [contrato del primer recorrido](docs/specs/0002-recorrido-central/index.md) documentan las decisiones. La [ampliación de red e infraestructura](docs/specs/0003-red-infraestructura/index.md) registra el modelo de conexión y sus límites. `design.md` describe composición y accesibilidad; los valores visuales viven en `src/app/globals.css`.

## Comprobar

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

La entrega tiene una configuración independiente que requiere una compilación previa:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npx playwright install chromium firefox webkit
npm run build
npm run test:delivery
```

`test:delivery` arranca producción en `127.0.0.1:3100`, exige que ese puerto esté libre y no reutiliza un servidor anterior. Ejecuta toda la suite en Chromium y las comprobaciones de entrega en Firefox y WebKit. Estas recorren las quince rutas a390/701/1440px, teclado, foco, nombres accesibles, anclas, errores de consola, contraste de tokens, reducción de movimiento y un recorrido HTTP real con permisos, deduplicación y replay. Deja el informe JSON y sus mediciones en `test-results/`. No usa el Map del servidor de desarrollo abierto en3000.

La [verificación de entrega del22 de octubre](docs/specs/0018-verificacion-entrega/verify.md) conserva entorno, resultados, ocho comprobaciones editoriales, rendimiento local y límites de esa pasada. Las correcciones de trazas se comprobaron después en la [fase1](docs/scope2/fase1-verificacion.md), con728 pruebas de lógica y210 de navegador; el [ejemplo SQL de la fase2](docs/specs/0019-ejemplo-sql-capturado/verify.md), con758 y213. Son cortes distintos; la pasada de esta fase se registra por separado a continuación. Las mediciones locales no predicen rendimiento de alojamiento remoto.

La [fase3](docs/scope2/fase3-verificacion.md) corrige la identificación de B, el acceso a Anatomy y las afirmaciones de disponibilidad y cierre. Su nueva pasada aprueba758 pruebas de lógica y215 de navegador, tipos, lint y build. No acredita los resultados humanos o el contraste completo todavía pendientes.

Los dieciséis puntos de precisión tienen [fuente original y revisión con correcciones posteriores](docs/specs/0018-verificacion-entrega/precision.md). La lectura de campos, resultados400/201/403 y corrección por teclado quedó confirmada por el usuario en el [registro de VoiceOver](docs/specs/0018-verificacion-entrega/reader.md), separada de las pruebas automáticas. Esa confirmación conserva su cobertura original; no es una auditoría WCAG completa ni una validación pedagógica con participantes.

Las pruebas de lógica comprueban validación, cálculo, límites de memoria, permisos, concurrencia, idempotencia, ramas de fallo, reproducción sin mutaciones, matriz de conexión e ingreso y conservación de método y ruta al cambiar origen. Las pruebas de navegador comprueban compra y consulta reales, ausencia de POST durante replay y favoritos, 401 frente a 403, simulaciones sin red, reintento tras perder una respuesta ya procesada vistas con selección compartida, condiciones capturadas inmutables, omisiones de conexión, roles opcionales y disposición móvil con teclado. Playwright inicia el servidor de desarrollo si no hay uno disponible.

### Comprobaciones históricas por entregable

Los siguientes recuentos pertenecen a sus respectivos cortes de construcción. La pasada completa del capítulo11 aprobó597 pruebas de lógica y servidor y99 de navegador. Cubrió resultados locales, compatibilidad, ramas concurrentes, progreso inválido o bloqueado, DOM sin red, cobertura de49 facetas, filtros, relaciones, comparación entre capas, diez interfaces del pedido, GraphQL, gRPC, XML, confirmación HTTP, editor, negociación, ETag,304, respuestas parciales y reintentos. Las entregas de eventos, seguridad, contratos y Systems añadieron sus matrices y recorridos, conservados en las verificaciones enlazadas de cada capítulo.

El proyecto final añade52 pruebas de recepción, fuentes, correlación, logros e instrumentación y nueve recorridos de navegador. También se comprueba que los controles del comparador esperen la hidratación, incluso con JavaScript retrasado.

La compatibilidad posterior con los cambios concurrentes de navegación y X Ray se comprobó con609 pruebas de lógica y nueve recorridos del proyecto sobre el desarrollo de ese corte. La [evidencia del capítulo11](docs/specs/0013-proyecto-pedidos/verify.md) distingue esa comprobación de la compilación de producción anterior y del trabajo transversal entonces pendiente.

X Ray transversal declara iniciador, receptor, tecnología y fallos posibles por evento, con validación de los metadatos recibidos por el proyecto. Las tres profundidades conservan captura, evento, datos y panel; inspección y replay no repiten efectos. La [evidencia de la spec0014](docs/specs/0014-xray-transversal/verify.md) registra610 pruebas de lógica,124 de navegador de la suite completa y el caso adicional de reproducción en marcha, con tipos, lint y build correctos sobre una compilación nueva. La ampliación del capítulo12 se comprueba por separado en la evidencia de la spec0015.

El mismo botón X Ray aparece en la cabecera de todas las pantallas con laboratorios. Su estado se comparte entre inspectores y se conserva al navegar y cambiar de pestaña, incluidos GraphQL, RPC, SSE y las fronteras avanzadas disponibles. Recargar inicia el modo activo. La corrección está comprobada con610 pruebas de lógica y131 de navegador,32 específicas de X Ray.

La pasada final del capítulo12 y cierre transversal de X Ray aprueba669 pruebas de lógica y142 de navegador, incluidos ocho recorridos avanzados y32 de X Ray. Tipos, lint y compilación pasan sobre fuentes y configuración coincidentes. Se comprobaron dieciséis combinaciones de pestaña/tamaño del capítulo nuevo, sin errores JavaScript ni peticiones a `/api/`. La [evidencia avanzada](docs/specs/0015-fronteras-avanzadas/verify.md) registra también la primera pasada y la comprobación posterior con los estilos de curso actuales.

La verificación de referencia aprueba712 pruebas de lógica y155 de navegador sobre una compilación nueva que incorpora los cambios paralelos de desafíos. Incluye19 casos de lógica y seis recorridos nuevos para referencia,16 disposiciones visuales y la selección de las94 fichas. Tipos, lint y build pasan. [Evidencia de referencia](docs/specs/0016-referencia-conceptual/verify.md).

Las verificaciones históricas anteriores automatizaron Chromium. El bloque20 amplía las comprobaciones de entrega a Firefox y WebKit. No se declara una auditoría completa con lectores de pantalla ni una validación pedagógica con estudiantes.

## Dependencias

Las versiones instaladas quedan fijadas en `package-lock.json`. La instalación inicial registró una advertencia de deprecación de ESLint9 y cinco avisos de seguridad en su cadena de desarrollo; ese registro se conserva con la evidencia histórica. La comprobación `npm audit --json` del23 de octubre de2026 devuelve cero vulnerabilidades en desarrollo y producción. Esta revisión no cambió dependencias ni aplicó `audit fix --force`. Los avisos pueden cambiar; `npm audit` permite consultar el estado publicado para el lockfile.

La [verificación inicial de la base visual y continuidad](docs/specs/0012-navegacion-progreso/verify.md) registró 545 pruebas de lógica y 89 de navegador en producción local. La revisión posterior alinea el menú y el recorrido con las cinco áreas, comprueba 65 combinaciones de destino y tamaño y pasa la suite de 99 pruebas de navegador; en ese corte también pasaron compilación y 609 pruebas de lógica. `/course` conserva los logros anteriores y reúne el progreso de capítulos 0 a 12; posteriormente el bloque19 incorporó el catálogo general y su contador independiente.
