export const challengeIds = ["architecture", "prediction", "debug", "interface", "contract", "failure", "misconception"] as const;
export type ChallengeId = typeof challengeIds[number];
export const challengeCatalog = [
  {
    id: "architecture", title: "Diagnóstico de arquitectura", level: "Básico", question: "Una API sin internet",
    task: "Una calculadora debe sumar dentro del mismo proceso, sin segundo proceso y sin red entre consumidor y proveedor. Elige la frontera que cumple estas restricciones. El fixture desconecta la red remota, no el equipo entero.",
    cause: "¿Por qué esa frontera permite cumplir el requisito?", correct: 1,
    answers: [
      { text: "Toda API necesita un servidor HTTP, aunque la capacidad esté en el mismo proceso.", feedback: "Una función también expone una capacidad mediante un contrato. API no significa servidor HTTP." },
      { text: "La llamada de función usa el mismo proceso; IPC necesitaría otro proceso y HTTP remoto depende de la red del fixture.", feedback: "La frontera responde a la arquitectura requerida. Una llamada local no necesita internet ni otro proceso." },
      { text: "IPC siempre usa internet, por eso ninguna operación local puede funcionar.", feedback: "IPC puede comunicar procesos del mismo equipo sin internet. Aquí se descarta por requerir otro proceso." },
    ],
    alternative: "IPC es razonable si la capacidad vive en otro proceso del equipo. Una API remota sirve cuando el proveedor está separado y la red está disponible; no todas las redes requieren internet público.", href: "/first-principles?chapter=1",
  },
  {
    id: "prediction", title: "Predicción de ejecución", level: "Básico", question: "¿42 y «42» cumplen la misma promesa?",
    task: 'Predice la ejecución de sumar(19, 23). El contrato exige number y el proveedor ejecuta return String(a + b). El laboratorio comprueba el retorno después de la llamada.',
    cause: "¿Por qué se acepta o rechaza el retorno?", correct: 2,
    answers: [
      { text: "El contrato convierte automáticamente cualquier texto numérico en number.", feedback: "Esta comprobación no convierte tipos: exige typeof value === number." },
      { text: "El proveedor lanza una excepción antes de devolver el resultado.", feedback: "String(42) devuelve texto. Es la comprobación posterior la que detecta el incumplimiento." },
      { text: "La función devuelve texto; representar 42 no satisface el tipo numérico prometido.", feedback: "La llamada termina y devuelve «42». El validador observa un string y rechaza el contrato numérico." },
    ],
    alternative: "Devolver a + b cumple el contrato. Cambiarlo a texto podría ser válido si el consumidor y la promesa se diseñan para texto; no basta con cambiar la implementación.", href: "/first-principles?chapter=0",
  },
  {
    id: "debug", title: "Debug the Request", level: "Intermedio", question: "PATCH llega, pero no confirma",
    task: "Repara una petición conceptual PATCH /orders/PED-1042. Debe terminar en HTTP200 y estado confirmed. El scope de confirmación y la cuota están disponibles; corrige el rol y el body sin ampliar permisos del lector.",
    cause: "¿Qué controles permiten llegar al cambio de estado?", correct: 0,
    answers: [
      { text: "Una identidad válida necesita permiso de confirmación y un body válido antes de ejecutar negocio.", feedback: "Autenticación, autorización y validación son pasos distintos. buyer y {status: confirmed} superan los tres en este fixture." },
      { text: "Una credencial reconocida permite cualquier operación, incluso con rol reader.", feedback: "reader está autenticado, pero confirmar exige otra capacidad. El proveedor devuelve403 antes del negocio." },
      { text: "Cualquier body es válido si se envía mediante PATCH.", feedback: "El método no valida el contenido. Un estado distinto de confirmed devuelve400 después de autorizar." },
    ],
    alternative: "Si solo necesitas consultar, GET con reader es razonable. Obtener otro token sin el permiso necesario no arregla una autorización denegada.", href: "/security?tab=access",
  },
  {
    id: "interface", title: "Choose the Interface", level: "Intermedio", question: "Un requisito concreto de interfaz",
    task: "El consumidor exige confirmar un recurso con PATCH /api/orders/PED-1042 y JSON {status: confirmed}. Elige una representación que cumpla ese contrato y observa el estado final del proveedor.",
    cause: "¿Qué permite elegir entre estas interfaces?", correct: 1,
    answers: [
      { text: "Cualquier mensaje enviado sobre HTTP es REST.", feedback: "JSON-RPC y GraphQL pueden viajar sobre HTTP. Eso no los convierte en el contrato de recursos y método solicitado." },
      { text: "La interfaz de recursos del comparador cumple URI, método y payload; HTTP por sí solo no define REST.", feedback: "REST satisface este requisito concreto del comparador. La misma capacidad de negocio puede exponerse con otros contratos." },
      { text: "GraphQL nunca puede modificar datos y JSON-RPC nunca puede usar HTTP.", feedback: "GraphQL admite mutations y JSON-RPC puede usar HTTP. Aquí sus representaciones no coinciden con PATCH al recurso exigido." },
    ],
    alternative: "Una mutation GraphQL o un procedimiento JSON-RPC pueden confirmar el pedido si se acuerda ese contrato. La elección de interfaz refleja necesidades de consumidores y fronteras, no una superioridad universal.", href: "/compare",
  },
  {
    id: "contract", title: "Design the Contract", level: "Avanzado", question: "Límites que protegen el negocio",
    task: "Diseña los límites de quantity y la forma de error. El negocio admite enteros1..5; el consumidor exige errores JSON con code y message. Deben aceptarse1 y5 y rechazarse0 y6. Los otros campos conservan el contrato base.",
    cause: "¿Qué demuestran estas comprobaciones?", correct: 2,
    answers: [
      { text: "Si un schema permite quantity6, el negocio también pasa a permitirlo.", feedback: "Editar el schema no modifica el requisito de negocio1..5. Se deben comprobar ambas promesas." },
      { text: "Probar cantidad2 demuestra compatibilidad para todos los valores y consumidores.", feedback: "Un caso nominal no detecta límites ni contratos de error. Los fixtures solo demuestran los casos evaluados." },
      { text: "Hay que comprobar límites, forma del error y reglas de negocio por separado.", feedback: "Aceptar1 y5, rechazar0 y6 y mantener code/message satisface estos casos. Un schema válido no demuestra por sí solo un total correcto." },
    ],
    alternative: "Aceptar una cantidad mayor exige cambiar el requisito de negocio y revisar consumidores. Un error de texto sería otro contrato posible, pero rompería a quien espera code/message.", href: "/contracts?tab=design",
  },
  {
    id: "failure", title: "Failure Injection", level: "Avanzado", question: "Escribió, pero la respuesta se perdió",
    task: "La primera respuesta se pierde después de guardar el pedido. Configura el reintento para recuperar el mismo resultado con un solo pedido. El registro de claves no expira en este fixture. Inspecciona los ids y dependencias de los dos intentos en la traza.",
    cause: "¿Por qué puede recuperarse sin duplicar el efecto?", correct: 0,
    answers: [
      { text: "La respuesta perdida no deshace la escritura; conservar clave y payload permite deduplicar y recuperar el resultado.", feedback: "El primer efecto existe aunque no llegó el retorno. La segunda entrega usa la misma identidad y recupera el pedido guardado." },
      { text: "Un timeout demuestra que el proveedor canceló y no guardó nada.", feedback: "El consumidor desconoce el resultado remoto. Este fixture muestra que la escritura terminó antes de perder la respuesta." },
      { text: "Cambiar la clave en cada intento identifica mejor la misma operación.", feedback: "Una clave nueva representa otra operación para el deduplicador y puede crear un segundo pedido." },
    ],
    alternative: "Consultar el estado de una operación conocida también puede ayudar a reconciliar. Cambiar el payload con la misma clave devuelve409. La ventana de dedupe limita la garantía; este modelo no demuestra atomicidad en una DB real.", href: "/contracts?tab=retries",
  },
  {
    id: "misconception", title: "Spot the Misconception", level: "Intermedio", question: "HTTP201, schema válido, total incorrecto",
    task: "El proveedor recibe cantidad2 con precio unitario8900 y devuelve totalMinor1. Clasifica el resultado después de ejecutar e inspeccionar la respuesta. Todos esos valores son fixtures del diseñador de contratos.",
    cause: "¿Qué demuestra realmente HTTP201?", correct: 1,
    answers: [
      { text: "Un status2xx garantiza que todas las reglas del negocio son correctas.", feedback: "El status expresa lo que informó el proveedor. No prueba que haya calculado correctamente el total." },
      { text: "El proveedor informa creación y respeta la forma, pero incumple total = cantidad × precio.", feedback: "HTTP201 y totalMinor entero pasan sus comprobaciones. El total esperado es17800, por eso falla el negocio." },
      { text: "Si el negocio está mal, el JSON necesariamente deja de cumplir el schema.", feedback: "1 sigue siendo un entero no negativo admitido. El schema de este ejemplo no expresa la multiplicación por precio." },
    ],
    alternative: "Comprobar invariantes de negocio complementa status y schema. Si el proveedor detecta el problema debe emitir un error coherente; el consumidor también puede detectar inconsistencias con los datos que conoce.", href: "/contracts?tab=design",
  },
] as const satisfies readonly { id: ChallengeId; title: string; level: string; question: string; task: string; cause: string; correct: number; answers: readonly { text: string; feedback: string }[]; alternative: string; href: string }[];
