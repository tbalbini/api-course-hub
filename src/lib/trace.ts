import type { NetworkSettings } from "./network";
import { stageInteractions, type Interaction } from "./interaction";

export type Depth = "intuition" | "engineering" | "internals";
export type Actor = "user" | "browser" | "http" | "server" | "store" | "resolver" | "transport" | "proxy" | "balancer" | "provider";
export type Boundary = "Mismo proceso" | "Red HTTP" | "Aplicación → almacenamiento" | "Consulta DNS" | "Transporte TCP" | "Seguridad TLS" | "Entrada → aplicación" | "IPC local" | "Usuario → kernel" | "Red remota" | "Mensajería asíncrona";
export type Stage = keyof typeof stages;

export interface TraceEvent {
  interaction: Interaction;
  stage: Stage;
  id: string;
  logicalTime: number;
  actor: Actor;
  action: string;
  input: unknown;
  output: unknown;
  state: "ok" | "error";
  dependencies: string[];
  boundary: Boundary;
  provenance: "observed" | "conceptual";
  contract: string;
  explanation: Record<Depth, string>;
  code: string;
  error?: { code: string; message: string };
  lane?: "A" | "B";
  snapshot?: { stack: string[]; memory: Record<string, unknown>; control: string };
}

export interface Capture {
  id: string;
  mode: "real" | "simulation" | "local";
  events: TraceEvent[];
  request?: { method: string; url: string; headers: Record<string, string>; body?: unknown };
  response?: { status: number; headers?: Record<string, string>; body: unknown; rawBody?: string | null; readError?: string };
  measuredMs?: number;
  network?: NetworkSettings;
}

interface Definition {
  action: string;
  actor: Actor;
  boundary: Boundary;
  contract: string;
  code: string;
  explanation: Record<Depth, string>;
}

function step(action: string, actor: Actor, boundary: Boundary, contract: string, code: string, intuition: string, engineering: string, internals: string): Definition {
  return { action, actor, boundary, contract, code, explanation: { intuition, engineering, internals } };
}

export const stages = {
  click: step("El usuario inicia la operación", "user", "Mismo proceso", "Evento click", "<button onClick={buy}>Comprar ahora</button>", "Un click entrega el control a una función de la interfaz.", "El navegador despacha un evento. El handler decide si habrá comunicación remota.", "El evento no implica por sí mismo HTTP. La operación remota depende del código del handler."),
  handler: step("JavaScript prepara los datos", "browser", "Mismo proceso", "OrderInput", 'const input = { sku: "kit-api", quantity };', "La interfaz reúne los datos necesarios para pedir una capacidad.", "El payload contiene un identificador de producto y una cantidad. El cliente no decide el precio.", "El estado React y los argumentos del handler viven en el navegador. El servidor tendrá su propio espacio de memoria."),
  local: step("Solo cambia el estado local", "browser", "Mismo proceso", "Estado booleano de favorito", "setFavorite(value => !value);", "El corazón cambia en esta interfaz. No necesita consultar a otro equipo.", "Un setter de React cambia estado y provoca un render. Este handler no invoca fetch.", "React decide cómo actualizar el DOM. No afirmamos que DOM y JavaScript tengan una implementación interna idéntica en todos los navegadores."),
  request: step("El navegador inicia fetch", "browser", "Red HTTP", "POST /api/orders · application/json", 'fetch("/api/orders", { method: "POST", headers, body: JSON.stringify(input) });', "El navegador solicita al servidor que cree un pedido.", "La operación cruza una frontera de proceso. JSON convierte el objeto en una representación que el servidor puede interpretar.", "fetch no rechaza automáticamente ante 400 o 500. Se debe comprobar response.ok. El reintento usa la misma Idempotency-Key si el resultado anterior es incierto."),
  route: step("El servidor reconoce la ruta", "server", "Mismo proceso", "Route Handler POST /api/orders", "export async function POST(request: Request) { /* ... */ }", "El servidor elige qué código atiende esta operación.", "El método y la ruta seleccionan un Route Handler. Después se comprueban credenciales y datos.", "El servidor de Next.js es otro proceso respecto al navegador. Dentro del servidor, este handler llama funciones locales."),
  authenticate: step("Se reconoce la credencial", "server", "Mismo proceso", "Bearer demostrativo", 'const role = authenticate(request.headers.get("authorization"));', "El servidor comprueba qué identidad de demostración se presentó.", "demo-buyer y demo-reader son valores públicos. Un valor ausente o desconocido recibe 401.", "Esto no es un sistema de login de producción ni una implementación de OAuth. Un token público solo sirve para explorar el mecanismo."),
  authorize: step("Se comprueba el permiso", "server", "Mismo proceso", "Permiso orders:create", 'if (role !== "buyer") return forbidden();', "Ser reconocido no significa poder comprar.", "El rol reader puede consultar, pero no crear. Ese rechazo es 403, distinto de 401.", "La autorización se decide en el servidor. Ocultar el botón del cliente no protege una operación remota."),
  validate: step("Se valida el contrato", "server", "Mismo proceso", "sku permitido · quantity entero de 1 a 5", "validateOrder(input);", "El servidor no confía en que el formulario envíe datos correctos.", "Se comprueban formato, campos admitidos, tipo y rango. Un objeto JSON válido puede incumplir el contrato.", "Se limita el tamaño del cuerpo antes de acumularlo. La validación de interfaz mejora la experiencia, pero no reemplaza esta frontera."),
  business: step("Se aplica la regla de negocio", "server", "Mismo proceso", "total = precio del servidor × cantidad", "const total = PRODUCT.priceMinor * input.quantity;", "El servidor decide el total usando su precio del producto.", "Se usan unidades monetarias enteras. El precio no se toma de un valor arbitrario enviado por el navegador.", "La demostración no cobra ni contacta un proveedor de pagos. El éxito de una petición HTTP no demuestra por sí solo que una compra externa se haya pagado."),
  persist: step("Se guarda el pedido temporal", "store", "Aplicación → almacenamiento", "Map del proceso servidor", "state.orders.set(order.id, order);", "El pedido queda en la memoria del servidor.", "Esta app usa un Map, no una base de datos SQL. Los registros desaparecen al reiniciar el proceso.", "Comprobar e insertar ocurre sin await intermedio en un único proceso. Esto no proporciona coordinación entre instancias ni durabilidad en disco."),
  readStore: step("Se lee el pedido almacenado", "store", "Aplicación → almacenamiento", "id → Order o404", "const order = store.orders.get(id);", "El servidor busca el pedido en su propia memoria.", "La observación rodea una búsqueda real en el Map. No modifica el pedido ni ejecuta SQL.", "Es memoria temporal de un proceso. Una búsqueda fallida no demuestra ausencia del pedido en otro servidor o antes de un reinicio."),
  confirmStored: step("Se confirma el pedido almacenado", "store", "Aplicación → almacenamiento", "id → Order confirmed", "const order = confirmStoredOrder(store, id);", "El servidor confirma un pedido existente.", "La función busca el pedido y reemplaza su estado por una copia confirmed. Repetir conserva el mismo estado.", "El evento observa la llamada a la función, no instrucciones CPU ni una transacción SQL. No cobra ni reserva inventario."),
  deduplicate: step("La clave recupera el pedido previo", "store", "Aplicación → almacenamiento", "Idempotency-Key + payload idéntico", "const previous = state.keys.get(key);", "El reintento recupera el pedido que ya existía.", "La misma clave y datos devuelven el resultado previo con 200. Si cambia el payload bajo esa clave, se devuelve 409.", "La deduplicación solo dura lo que vive este proceso. La semántica del header depende de la implementación; POST no se vuelve idempotente automáticamente."),
  response: step("El servidor construye la respuesta", "server", "Mismo proceso", "HTTP status + headers + JSON", "return Response.json(body, { status, headers });", "El servidor devuelve un resultado interpretable por el cliente.", "Status, headers y body forman partes distintas del mensaje. X-Trace-Id identifica esta ejecución.", "Construir una respuesta no demuestra que el navegador la reciba. El servidor puede completar el efecto y perderse la respuesta en tránsito."),
  receive: step("El navegador recibe la respuesta", "browser", "Red HTTP", "Response de fetch", "const response = await fetch(/* ... */);", "El navegador tiene una respuesta del servidor.", "Se inspecciona el estado HTTP antes de decidir si la operación tuvo éxito.", "Un rechazo HTTP y un fallo de conectividad son distintos: con 401 existe Response; ante algunos fallos de red fetch lanza una excepción sin respuesta HTTP."),
  parse: step("JSON vuelve a ser datos", "browser", "Mismo proceso", "JSON → objeto JavaScript", "const body = await response.json();", "La interfaz interpreta los datos recibidos.", "La deserialización puede fallar aunque la transferencia HTTP haya terminado.", "JSON no es la API ni el transporte. Es la representación elegida aquí. Un contrato podría utilizar otra representación."),
  render: step("El cliente solicita actualizar el estado", "browser", "Mismo proceso", "Datos → solicitud de actualización de estado local", "setActualOrder(body.order);", "El cliente entrega los datos al estado de la interfaz.", "Se registra la llamada al setter y los datos entregados, sin medir cuándo React actualiza la pantalla.", "No se instrumenta el commit de React ni el paint del navegador. Replay solo cambia el punto de observación, sin repetir setters de negocio ni peticiones."),
  dns: step("DNS resuelve el nombre", "resolver", "Consulta DNS", "Hostname → dirección IP", 'resolve("tienda.example") // simulación', "El nombre necesita una dirección para localizar el destino.", "La consulta simulada resuelve tienda.example a 203.0.113.10, una IP de documentación.", "Omitimos recursión, registros intermedios y TTL. Caché válida o conexión ya abierta evitan esta consulta en el modelo."),
  tcp: step("Se establece una conexión TCP", "transport", "Transporte TCP", "Dirección IP + puerto", "// SYN → SYN ACK → ACK, modelo simplificado", "Los extremos preparan un canal ordenado para intercambiar datos.", "TCP ofrece un flujo de bytes ordenado. Aquí solo se representa el establecimiento de una conexión nueva.", "No representamos segmentos, retransmisiones ni congestión. HTTP/3 utiliza QUIC, no este handshake TCP."),
  tls: step("TLS protege la conexión", "transport", "Seguridad TLS", "HTTPS · identidad del servidor y cifrado", "// Negociación TLS conceptual, sin medición", "El cliente prepara comunicación cifrada y verifica la identidad del servidor.", "HTTPS utiliza TLS. El modelo supone certificado válido y una negociación satisfactoria.", "Omitimos mensajes internos, reanudación y 0 RTT. Con proxy terminamos TLS en la entrada; el tramo a la aplicación queda fuera de detalle."),
  wireRequest: step("Se transmite la solicitud", "transport", "Transporte TCP", "Mensaje HTTP/1.1 sobre la conexión", "// Representación → bytes → transporte", "Los datos salen hacia el proveedor.", "Método, ruta, headers y cuerpo viajan por la conexión preparada o reutilizada.", "Esta etapa no prueba entrega. Un fallo posterior puede impedir que la aplicación reciba el mensaje. No es una captura de paquetes."),
  proxy: step("El proxy recibe y reenvía", "proxy", "Entrada → aplicación", "Reverse proxy opcional", "// Entrada → aplicación seleccionada", "La entrada recibe la petición antes de la aplicación.", "Un reverse proxy puede terminar TLS y reenviar solicitudes. No todas las arquitecturas lo requieren.", "El transporte de entrada a aplicación queda fuera de detalle. No inferimos cifrado, latencia ni otra negociación en ese tramo."),
  balancer: step("El balanceador selecciona app-1", "balancer", "Mismo proceso", "Selección de destino ilustrativa", 'const destination = "app-1"; // fixture', "La entrada elige qué aplicación atenderá la operación.", "El destino app-1 es un fixture. No se está midiendo carga ni ejecutando un algoritmo real de balanceo.", "Proxy y balanceador son roles que pueden compartir un componente. No implican necesariamente dos procesos ni dos saltos de red."),
  serverAccept: step("La aplicación recibe el mensaje", "server", "Entrada → aplicación", "Solicitud HTTP entregada al servidor", "// El servidor HTTP entrega una Request", "El mensaje alcanza el proceso que ofrece la capacidad.", "Recepción y selección de ruta son tareas distintas. Esta recepción solo se muestra en la simulación.", "En una captura real no instrumentamos el socket del servidor. El primer evento observado allí es el Route Handler."),
  middleware: step("Se ejecutan funciones de middleware", "server", "Mismo proceso", "Cadena conceptual de comprobaciones", "// authenticate → authorize → validate", "Antes del negocio se comprueban condiciones compartidas.", "Aquí middleware nombra funciones conceptuales de la cadena, no un middleware desplegado de Next.js.", "Ordenar comprobaciones afecta qué trabajo se ejecuta y qué error aparece. En el endpoint real son funciones locales llamadas dentro del Route Handler."),
  endpoint: step("El handler coordina la operación", "server", "Mismo proceso", "Entrada validada → lógica de negocio", "// Datos válidos → operación del dominio", "La función responsable utiliza los datos ya comprobados.", "Distinguimos recepción, routing, comprobaciones y coordinación de negocio como responsabilidades conceptuales.", "Pueden vivir en una sola función o en módulos separados. La simulación no prescribe una arquitectura obligatoria."),
  wireResponse: step("Se transmite la respuesta", "transport", "Transporte TCP", "Mensaje HTTP de retorno", "// Respuesta construida → conexión → cliente", "El resultado debe volver al cliente.", "Construir la respuesta y entregarla son hechos distintos. El camino de vuelta puede fallar.", "El modelo reutiliza el canal de la solicitud y omite buffering, segmentación y pasos internos de reenvío. No inventa duración ni bytes."),
  invokeLocal: step("El consumidor invoca la función", "browser", "Mismo proceso", "sumar(a: number, b: number): number", "const resultado = sumar(a, b);", "El consumidor entrega argumentos a una capacidad definida.", "La firma describe entradas y salida; el contrato también exige que el resultado sea la suma.", "Una llamada local no serializa mensajes ni requiere HTTP. La pila mostrada es conceptual, no un volcado del motor."),
  enterFrame: step("El control entra en sumar", "browser", "Mismo proceso", "Argumentos → parámetros", "// a y b pertenecen al contexto de esta invocación", "La función recibe los valores y comienza su trabajo.", "El modelo agrega un frame con parámetros y una posición de retorno al consumidor.", "Un motor puede optimizar o integrar funciones. Los frames y nombres dibujados no son direcciones de memoria observadas."),
  executeLocal: step("Se ejecuta la implementación", "browser", "Mismo proceso", "Regla del proveedor", "return a + b;", "El código de la función calcula un valor.", "La implementación puede cambiar conservando entradas, salida y significado prometidos.", "Las instrucciones JavaScript no son necesariamente instrucciones individuales de CPU. Aquí se instrumenta el resultado, no el JIT."),
  returnLocal: step("El valor vuelve al consumidor", "browser", "Mismo proceso", "Retorno local", "return resultado;", "La función devuelve el control junto con un valor.", "El frame deja de estar activo en el modelo. El consumidor continúa después de la llamada.", "La salida puede incumplir el contrato aun cuando el código termine sin excepción. TypeScript no añade validación de retorno en runtime."),
  checkContract: step("Se comprueba la promesa de la interfaz", "browser", "Mismo proceso", "number y resultado igual a a + b", 'typeof value === "number" && value === a + b', "El laboratorio comprueba si el consumidor puede utilizar el resultado prometido.", "Esta comprobación explícita verifica tipo y significado para esta entrada, no todos los comportamientos posibles.", "Una firma sola no describe toda la semántica. Comprobar unos ejemplos no prueba compatibilidad general."),
  useResult: step("El consumidor utiliza el resultado", "browser", "Mismo proceso", "Resultado válido → estado local", "mostrar(resultado);", "El resultado sirve para continuar la tarea del consumidor.", "La interfaz permite depender de la capacidad sin copiar todos sus detalles internos.", "La reproducción recorre datos guardados. No vuelve a llamar la función ni altera los efectos ya ejecutados."),
  selectDOM: step("querySelector encuentra el nodo", "browser", "Mismo proceso", "Selector → Element o null", 'container.querySelector("[data-demo-node]")', "JavaScript pide al navegador encontrar un elemento.", "Esta API del navegador busca dentro del contenedor. No envía una petición HTTP.", "DOM es una interfaz del entorno anfitrión. Su implementación puede usar otros lenguajes; no exponemos su arquitectura interna."),
  writeDOM: step("textContent cambia el texto real", "browser", "Mismo proceso", "Texto → contenido del nodo", "node.textContent = texto;", "La interfaz visible cambia sin consultar otro equipo.", "textContent inserta texto, no interpreta HTML. La mutación ocurre en un nodo aislado del ejemplo.", "La traza registra antes y después de esta operación concreta. Otras APIs del navegador sí pueden iniciar red, como fetch."),
  invokeModel: step("Se inicia la interacción modelada", "browser", "Mismo proceso", "Contrato del mecanismo", "// Modelo conceptual", "Un componente necesita una capacidad de otro.", "La ubicación y el estilo de interacción determinan cómo se representa la invocación.", "Este evento es una simulación. No se están ejecutando procesos, syscalls ni brokers reales."),
  crossBoundary: step("La invocación cruza una frontera", "browser", "IPC local", "Mensaje definido", "// Transferencia conceptual", "Los datos cruzan el límite que separa las capacidades.", "La frontera puede ser proceso, privilegio o red. Esas diferencias cambian mecanismos y errores posibles.", "No se puede pasar un puntero del consumidor y suponer que designa memoria válida en otro proceso."),
  providerModel: step("El proveedor procesa la operación", "provider", "Mismo proceso", "Contrato del proveedor", "// Ejecución conceptual", "El proveedor realiza el trabajo solicitado.", "La recepción de un mensaje y su procesamiento son hechos distintos.", "La aceptación de un broker no demuestra que un consumidor haya terminado su trabajo."),
  deliveryModel: step("Se entrega un resultado o evento", "browser", "IPC local", "Entrega definida por el mecanismo", "// Entrega conceptual", "La información llega al componente que la necesita.", "Un retorno, una confirmación y un evento tienen significados distintos en el contrato.", "En una suscripción, registrar interés ocurre antes de recibir eventos. Una entrega asíncrona puede repetirse."),
  failure: step("El flujo se detiene", "browser", "Mismo proceso", "Error explícito", "// Inspeccionar la causa antes de reintentar", "Una etapa no pudo entregar el resultado esperado.", "Se distingue un error HTTP de una operación cuyo resultado remoto es incierto.", "Un timeout no demuestra que el servidor haya cancelado la operación. Reintentar una escritura exige considerar duplicados."),
} satisfies Record<string, Definition>;

export function event(stage: Stage, input: unknown = null, output: unknown = null, provenance: TraceEvent["provenance"] = "observed"): TraceEvent {
  return { ...stages[stage], explanation: { ...stages[stage].explanation }, interaction: structuredClone(stageInteractions[stage]), stage, id: "", logicalTime: 0, dependencies: [], input, output, state: "ok", provenance };
}

export function indexEvents(id: string, events: TraceEvent[]): TraceEvent[] {
  return events.map((entry, i) => ({ ...entry, id: `${id}:${i}`, logicalTime: i, dependencies: i ? [`${id}:${i - 1}`] : [] }));
}

export interface Playback { capture: Capture; cursor: number; running: boolean; speed: number }
export type PlaybackAction =
  | { type: "load"; capture: Capture; autoplay: boolean }
  | { type: "play" | "pause" | "next" | "previous" | "replay" }
  | { type: "seek"; cursor: number }
  | { type: "speed"; speed: number };

export function playback(state: Playback, action: PlaybackAction): Playback {
  const last = state.capture.events.length - 1;
  switch (action.type) {
    case "load": return { ...state, capture: action.capture, cursor: 0, running: action.autoplay };
    case "play": return { ...state, cursor: state.cursor === last ? 0 : state.cursor, running: last > 0 };
    case "pause": return { ...state, running: false };
    case "replay": return { ...state, cursor: 0, running: last > 0 };
    case "next": { const cursor = Math.min(last, state.cursor + 1); return { ...state, cursor, running: state.running && cursor < last }; }
    case "previous": return { ...state, cursor: Math.max(0, state.cursor - 1), running: false };
    case "seek": return { ...state, cursor: Math.max(0, Math.min(last, Math.trunc(action.cursor))), running: false };
    case "speed": return { ...state, speed: [0.5, 1, 2, 4].includes(action.speed) ? action.speed : state.speed };
  }
}
