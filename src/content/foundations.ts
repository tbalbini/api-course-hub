export type ChapterId = 0 | 1 | 2 | 3;
export interface Chapter {
  id: ChapterId;
  title: string;
  question: string;
  intuition: string;
  mechanism: string;
  tradeoffs: string;
  alternative: string;
  limits: string;
  misconception: string;
  code: string;
  concepts: [string, string][];
  quiz: { question: string; options: { text: string; correct: boolean; feedback: string }[] };
  challenge: string;
}

export const chapters: Chapter[] = [
  {
    id: 0, title: "Dos componentes, una capacidad",
    question: "Si desconectamos internet, ¿puede un programa seguir usando una API?",
    intuition: "Un consumidor necesita sumar, pero no necesita decidir cómo implementar la suma. Entrega dos valores a una función y recibe un resultado. Esa capacidad tiene una interfaz incluso sin red.",
    mechanism: "Un programa expresa operaciones sobre datos. Durante su ejecución, una llamada evalúa argumentos y transfiere control a una función. Sus parámetros permiten utilizar esos valores; return entrega un resultado y continúa el consumidor. El call stack modela qué llamadas están activas y dónde continuar al retornar. No se envían mensajes entre computadoras en este ejemplo. Una API es una interfaz definida por la que un componente expone capacidades a otros sin exigir que conozcan toda su implementación.",
    tradeoffs: "La llamada local es directa y permite compartir objetos por referencia cuando el contrato lo admite. Compartir memoria también permite efectos accidentales: un proveedor podría modificar un objeto recibido. Nuestra suma usa números y no modifica estado compartido.",
    alternative: "Podrías escribir la suma dentro de cada consumidor. Evitas una llamada, pero duplicas el conocimiento y debes cambiar cada copia cuando cambie la regla. Una interfaz concentra una capacidad reutilizable.",
    limits: "La pila y memoria de la consola son un modelo, no direcciones físicas ni un perfil del motor. Una función JavaScript no equivale a una instrucción de CPU. Los motores pueden optimizar llamadas; nuestras sumas usan enteros pequeños para evitar problemas de precisión.",
    misconception: "API no significa endpoint HTTP. Una firma local define una forma de usar una capacidad. Tampoco toda función forma una API pública: importa qué interfaz se ofrece y a quién.",
    code: "function sumar(a: number, b: number): number {\n  return a + b;\n}\nconst total = sumar(2, 3);",
    concepts: [
      ["Programa e instrucción", "Un programa describe operaciones. Una instrucción del lenguaje expresa un paso, como asignar un valor; el motor lo interpreta o compila a operaciones de máquina."],
      ["Proceso", "Es una instancia de ejecución administrada por el sistema operativo, con recursos y espacio de direcciones. No es el archivo que contiene el programa ni necesariamente un solo hilo."],
      ["Memoria", "Conserva representaciones de datos que el programa puede leer o modificar. Los nombres del ejemplo identifican valores; no son direcciones físicas observadas."],
      ["Función, inputs y outputs", "Una función define un comportamiento invocable. Los argumentos aportan inputs; un retorno es un posible output. También puede haber efectos secundarios, eventos o excepciones."],
      ["Control y call stack", "Llamar cambia qué código se ejecuta. El modelo de pila mantiene llamadas activas; al retornar se continúa en el consumidor. Recursión agregaría llamadas de la misma función."],
      ["Límite de abstracción", "El consumidor conoce la operación y su promesa. Puede ignorar detalles internos mientras no dependa de ellos. Ocultar detalles no elimina sus costos ni errores."],
    ],
    quiz: { question: "sumar(2, 3) devuelve 5 con internet desconectado. ¿Qué demuestra?", options: [
      { text: "Una interfaz puede ofrecer una capacidad dentro del mismo proceso.", correct: true, feedback: "Sí. Entradas, operación y resultado forman un contrato utilizable sin una petición de red." },
      { text: "No es una API porque no tiene una URL.", correct: false, feedback: "Una URL pertenece a ciertos mecanismos remotos. Una interfaz de funciones también puede ser una API." },
      { text: "El navegador debió consultar un servidor en caché.", correct: false, feedback: "Esta función calcula con sus argumentos. No hay fetch ni un resultado remoto cacheado en el mecanismo." },
    ] },
    challenge: "Obtén 42 con dos argumentos distintos de cero. Ejecuta la llamada y observa cómo regresa el control. Después resuelve la pregunta.",
  },
  {
    id: 1, title: "Una promesa que puede sobrevivir al cambio",
    question: "¿Qué debe permanecer estable cuando cambiamos el interior de un módulo?",
    intuition: "Dos implementaciones pueden cumplir la misma promesa. Si el consumidor depende de esa promesa y no de los detalles, puedes sustituir una sin cambiar al otro.",
    mechanism: "Un consumidor acoplado a una representación interna falla si el proveedor cambia esa representación. Una interfaz concentra operaciones y condiciones observables. Aquí el contrato exige dos números y una suma numérica. Cambiar a reduce mantiene esa conducta para nuestro dominio; devolver texto rompe el tipo prometido aunque muestre los mismos dígitos.",
    tradeoffs: "Encapsular reduce dependencias de detalles, pero obliga a diseñar y mantener el contrato. Una abstracción demasiado amplia expone decisiones internas; una demasiado rígida puede impedir usos válidos. Separar responsabilidades no exige crear un servicio remoto para cada función.",
    alternative: "Compartir directamente el estado interno de un módulo puede resultar cómodo en un programa pequeño. A medida que más consumidores dependen de él, cada cambio tiene más consecuencias. Otra opción es adaptar una implementación nueva con un wrapper que conserve la interfaz anterior.",
    limits: "Compatibilidad incluye tipos, significado, errores, efectos y, en ocasiones, límites de rendimiento. Que dos ejemplos pasen no prueba equivalencia para todas las entradas. TypeScript comprueba tipos durante desarrollo; no valida automáticamente datos arbitrarios en runtime.",
    misconception: "Conservar el nombre de una función no garantiza compatibilidad. Cambiar número por string, unidad monetaria o significado puede romper consumidores aunque la llamada conserve su apariencia.",
    code: "// Consumidor: depende de la promesa\nconst total = sumar(10, 20);\n// Proveedor alternativo compatible en este dominio\nreturn [a, b].reduce((total, n) => total + n, 0);\n// Cambio incompatible\nreturn String(a + b);",
    concepts: [
      ["Encapsulación y acoplamiento", "Encapsular limita qué detalles quedan disponibles. El acoplamiento describe qué decisiones de un componente obligan a cambiar otro. Una interfaz no elimina toda dependencia: concentra la dependencia en su contrato."],
      ["Contrato", "Define operaciones, entradas admitidas, resultados, efectos y condiciones de error. La firma es una parte; el significado de sumar también importa."],
      ["Responsabilidades", "El consumidor decide para qué necesita sumar. El proveedor decide cómo hacerlo. El chequeo del laboratorio verifica lo que prometió el proveedor."],
      ["Evolución y compatibilidad", "Puedes cambiar detalles internos sin afectar el comportamiento prometido. Una nueva condición obligatoria o un retorno distinto puede requerir una nueva versión, adaptación o migración de consumidores."],
    ],
    quiz: { question: "La implementación nueva devuelve \"30\" en vez de 30. ¿Puede el consumidor asumir compatibilidad?", options: [
      { text: "Sí, porque se ven los mismos dígitos.", correct: false, feedback: "La representación visual oculta una diferencia de tipo. Un consumidor que suma 1 puede concatenar texto en vez de sumar." },
      { text: "No: se rompió el retorno numérico prometido.", correct: true, feedback: "Exacto. Una interfaz estable conserva conducta observable, no solo nombres o apariencia. Nuestro chequeo explícito detecta este cambio." },
      { text: "Sí, TypeScript siempre convertirá el string en number.", correct: false, feedback: "TypeScript no transforma automáticamente ese resultado para reparar el contrato en runtime." },
    ] },
    challenge: "Ejecuta la reducción compatible y después el retorno de texto incompatible. Comprueba que el consumidor acepta una y detecta la otra; no basta con cambiar el selector.",
  },
  {
    id: 2, title: "APIs sin internet",
    question: "¿Qué capacidades puedes pedir sin hablar con un servidor remoto?",
    intuition: "El lenguaje, el navegador y el sistema operativo ofrecen capacidades distintas. Encontrar un nodo del DOM no significa descargarlo; pedir al sistema abrir un archivo tampoco equivale por sí solo a enviar HTTP.",
    mechanism: "JavaScript invoca una interfaz del entorno navegador para buscar un Element. Luego asigna textContent y el navegador actualiza el árbol de nodos. El ejemplo registra el valor antes y después. El contrato de querySelector admite null si no hay coincidencia; el consumidor debe manejar esa posibilidad.",
    tradeoffs: "Una API de biblioteca es sencilla de distribuir con el programa. Una API del entorno depende de que ese entorno exista: document no está disponible en todo runtime JavaScript. Usar un wrapper mejora comodidad, pero puede ocultar llamadas adicionales o errores del proveedor subyacente.",
    alternative: "Podrías pedir a un servidor HTML nuevo cada vez, pero para cambiar texto ya disponible no es necesario. React suele coordinar actualizaciones del DOM a partir de estado; aquí aislamos una mutación directa para observar la API del navegador.",
    limits: "No todas las Browser APIs son locales: fetch inicia comunicación. Algunas APIs locales delegan en el sistema operativo. Un cliente de base de datos puede ser embebido o remoto; un SDK puede envolver red u operaciones locales. Debes inspeccionar cada mecanismo, no deducirlo del nombre.",
    misconception: "DOM no es HTTP. Una llamada a document.querySelector no envía por sí misma una petición HTTP. El experimento usa un contenedor aislado para evitar modificar otras partes de la consola.",
    code: 'const node = container.querySelector("[data-demo-node]");\nif (!node) throw new Error("Nodo ausente");\nnode.textContent = texto; // texto, no HTML',
    concepts: [
      ["Language API y Standard Library", "El lenguaje define construcciones y operaciones; su biblioteca estándar expone utilidades como Math.max. No todas las capacidades del runtime forman parte del lenguaje: DOM pertenece al navegador."],
      ["Library API", "Un paquete expone funciones, clases u objetos. Importar una biblioteca no implica ejecutar un servidor; lo que haga cada función depende de su implementación."],
      ["OS API y system call", "Una interfaz del sistema ofrece capacidades como leer un descriptor. Una syscall cruza de modo usuario a kernel. La función de biblioteca que la envuelve no es idéntica al mecanismo de entrada al kernel."],
      ["Archivos y dispositivos", "Leer archivos o controlar un dispositivo puede atravesar wrappers, kernel y drivers. Los permisos y errores del recurso importan. Un archivo puede estar en almacenamiento local o montado desde una red."],
      ["Database client y SDK", "Son superficies de programación. El cliente puede enviar un protocolo por socket o acceder a una base embebida; el SDK puede añadir tipos, reintentos o autenticación alrededor de otra API."],
    ],
    quiz: { question: "El texto del ejemplo cambió mediante textContent. ¿Qué puedes concluir sobre esa operación?", options: [
      { text: "Toda API del navegador necesita HTTP.", correct: false, feedback: "El navegador expone muchas capacidades. Buscar y modificar este nodo no necesita una solicitud HTTP." },
      { text: "Ninguna API del navegador usa red.", correct: false, feedback: "Esta operación es local, pero fetch y WebSocket sí pueden comunicarse. La conclusión debe limitarse al mecanismo observado." },
      { text: "Esta mutación del DOM se hizo localmente, sin fetch.", correct: true, feedback: "Sí. Puedes comprobar el cambio del nodo y la ausencia de solicitudes del experimento sin generalizarlo a todas las Browser APIs." },
    ] },
    challenge: "Aplica dos textos diferentes al nodo real. Inspecciona antes y después; el reproductor no debe volver a modificarlo.",
  },
  {
    id: 3, title: "Cuando la memoria deja de ser compartida",
    question: "Si el proveedor termina pero su respuesta se pierde, ¿qué sabe el consumidor?",
    intuition: "Otro proceso no puede usar sin más los nombres o punteros del consumidor. Necesitas transferir una representación de los datos. Con una red aparecen además destinos remotos y fallos que cada extremo observa de forma distinta.",
    mechanism: "IPC comunica procesos mediante mecanismos como pipes o Unix domain sockets. Estos pueden operar en el mismo equipo. TCP permite un flujo de bytes entre extremos de sockets, también en loopback. Un protocolo define cómo interpretar esos bytes. RPC representa una operación remota como invocación, pero debe serializar, transportar, ejecutar y devolver un resultado: su apariencia de función no elimina esos pasos.",
    tradeoffs: "Separar procesos puede aislar memoria y fallos o permitir repartir trabajo. Introduce copia o coordinación de datos, protocolos, permisos y recuperación. Una red añade incertidumbre: falta de respuesta no indica si la solicitud llegó, comenzó o terminó. Un timeout es una decisión de espera del consumidor, no prueba de cancelación del proveedor.",
    alternative: "Si las capacidades pueden convivir en un proceso, una función local evita transporte. Para desacoplar tiempos puedes enviar mensajes o suscribirte a eventos. Eso cambia la semántica: aceptación no es finalización y una entrega puede duplicarse.",
    limits: "Las trazas de este capítulo son modelos sin procesos, pipes ni conexiones reales. El orden lineal de inspección no impone causalidad entre las ramas A y B. Dos operaciones concurrentes pueden intercalarse sin ejecutarse físicamente en paralelo. Memoria separada no excluye memoria compartida explícitamente configurada por el sistema operativo.",
    misconception: "Una excepción local y un fallo remoto no aportan la misma información. Si se pierde una respuesta tras una escritura, reintentar puede duplicar el efecto; necesitas un contrato de idempotencia o una consulta que reconcilie el resultado.",
    code: 'const bytes = JSON.stringify({ a: 2, b: 3 });\n// transporte al proveedor, modelo\nconst args = JSON.parse(bytes);\nconst result = args.a + args.b;\n// La respuesta puede perderse después de ejecutar.',
    concepts: [
      ["Espacios de memoria e IPC", "Un proceso administra su espacio de direcciones. Compartir información suele exigir copiar una representación o establecer memoria compartida explícita, con sincronización y permisos."],
      ["Pipes y Unix domain sockets", "Un pipe transmite un flujo de bytes entre extremos. Unix domain sockets sirven para IPC local y pueden ofrecer stream o mensajes según su tipo. No requieren que internet esté disponible."],
      ["TCP sockets y serialización", "Un socket es una interfaz de comunicación; TCP no define por sí solo objetos, pedidos ni límites de mensajes de aplicación. Serializar crea una representación transferible; deserializar reconstruye datos bajo un contrato."],
      ["Cliente, servidor y RPC", "Cliente y servidor describen roles de una interacción, no tamaños de máquinas. Un servidor también puede ser cliente de otro servicio. RPC define invocación remota; HTTP es un posible mecanismo subyacente, no un requisito de toda RPC."],
      ["Fallos parciales y timeouts", "Un lado puede seguir trabajando mientras el otro deja de esperar. El consumidor conoce lo que observó, no todo lo que ocurrió en el proveedor. La demostración muestra ambas perspectivas porque es un modelo omnisciente."],
      ["Concurrencia", "Dos operaciones pueden estar pendientes al mismo tiempo. Cada una tiene sus dependencias; completarlas en orden distinto exige identificar resultados y coordinar efectos compartidos."],
    ],
    quiz: { question: "El proveedor ejecutó la operación, pero el consumidor agotó su espera sin recibir respuesta. ¿Qué deduce el consumidor por ese timeout?", options: [
      { text: "El proveedor no ejecutó nada.", correct: false, feedback: "El timeout solo informa sobre la espera local. La operación puede haber terminado sin que llegue su respuesta." },
      { text: "El resultado remoto es incierto; necesita reconciliar o reintentar con garantías.", correct: true, feedback: "Correcto. Tú ves la ejecución porque el modelo muestra ambos extremos. El cliente real no obtiene ese conocimiento solo por agotar el tiempo." },
      { text: "Reintentar cualquier escritura es siempre seguro.", correct: false, feedback: "Sin deduplicación o semántica idempotente, otra invocación puede repetir el efecto ya realizado." },
    ] },
    challenge: "Elige HTTP, respuesta perdida y dos llamadas concurrentes. Ejecuta el modelo e inspecciona las cadenas A y B. Después explica qué sabe el consumidor.",
  },
];

export const apiExamples = [
  { name: "Math.max", code: "Math.max(5, 9) // 9", boundary: "Mismo proceso", explanation: "Biblioteca estándar de JavaScript. Su contrato selecciona el mayor número; no necesita un servidor remoto.", limit: "Conversión de tipos, NaN y precisión numérica pueden importar fuera del ejemplo." },
  { name: "Lenguaje y biblioteca", code: "const xs = [2, 3];\nxs.map(n => n * 2);", boundary: "Mismo proceso", explanation: "La sintaxis declara datos; Array.prototype.map expone una capacidad estándar sobre arrays. DOM no forma parte de esa biblioteca del lenguaje.", limit: "El callback y sus efectos siguen siendo responsabilidad del programa." },
  { name: "Paquete local", code: "import { parse } from './parser';\nparse(texto);", boundary: "Depende del paquete", explanation: "El módulo ofrece una interfaz. Un parser local puede ejecutar dentro del proceso sin enviar nada.", limit: "Un paquete también podría envolver red. Importar no determina su mecanismo." },
  { name: "Browser DOM", code: 'document.querySelector("button")', boundary: "API del navegador · sin HTTP", explanation: "Devuelve el primer Element coincidente o null. Buscar el nodo no equivale a descargarlo.", limit: "Necesita un entorno con DOM; JavaScript también existe fuera del navegador." },
  { name: "File System", code: "await fs.readFile('datos.txt', 'utf8');", boundary: "Biblioteca → sistema operativo", explanation: "En Node.js, la biblioteca coordina lectura de un recurso mediante capacidades del sistema. No es necesariamente una syscall por llamada ni una API HTTP.", limit: "Permisos, inexistencia y almacenamiento montado por red cambian fallos y costos. No se ejecuta aquí." },
  { name: "System call", code: "read(fd, buffer, 3); // ejemplo POSIX", boundary: "Modo usuario → kernel", explanation: "La interfaz solicita leer bytes del recurso asociado a un descriptor. Suele invocarse mediante una función de biblioteca.", limit: "Puede devolver menos bytes o un error. Kernel no significa proceso servidor remoto." },
  { name: "Dispositivo y driver", code: "ioctl(fd, comando, datos); // conceptual", boundary: "Aplicación → kernel → driver", explanation: "Un contrato del dispositivo interpreta comandos y datos. El driver traduce hacia operaciones del hardware.", limit: "Comandos, permisos y soporte son específicos del sistema y dispositivo. No se controla hardware desde esta consola." },
  { name: "Database client", code: "await db.query('SELECT id FROM orders');", boundary: "Embebida o remota, según cliente", explanation: "La API del cliente expone consultas. Un driver remoto puede usar un wire protocol por socket; una biblioteca embebida puede operar localmente.", limit: "La firma por sí sola no revela transporte, transacciones ni ubicación de datos." },
  { name: "SDK y wrapper", code: "await sdk.orders.get(id);", boundary: "Depende de lo que encapsula", explanation: "El SDK puede envolver una API HTTP y añadir tipos o reintentos. El método local y la API remota que invoca son interfaces distintas.", limit: "Inspecciona efectos, autenticación y política de reintento; no los deduzcas de la apariencia de método." },
];
