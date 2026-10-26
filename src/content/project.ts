import type { Stage } from "@/lib/trace";

export interface ProjectSource { id: string; path: string; title: string; description: string; code: string; sha256: string }
export function projectSourceFor(method: string, stage: Stage): string {
  if (["click", "handler", "request", "receive", "parse", "render", "failure"].includes(stage)) return "client";
  if (["authenticate", "business", "persist", "deduplicate", "confirmStored"].includes(stage)) return "domain";
  if (stage === "response") return "instrumentation";
  return method === "POST" ? "post" : "item";
}
export const projectGoals = [
  ["created", "Crear un pedido: POST201"], ["read", "Consultar su estado: GET200"],
  ["confirmed", "Confirmarlo: PATCH200"], ["invalid", "Enviar cantidad0 o6 y observar400"],
  ["forbidden", "Intentar escribir como lector y observar403"], ["repeated", "Repetir POST original con la misma cantidad:200"],
] as const;
export const projectNotes = [
  { title: "El problema y la interfaz", text: "Una pantalla necesita crear, leer y confirmar pedidos sin conocer cómo se guardan. El cliente construye un mensaje; la API define operaciones, datos y errores. Su implementación decide permisos y reglas de negocio. El contrato permite modificar esa implementación sin obligar a cambiar la pantalla." },
  { title: "Del gesto al estado", text: "Un click ejecuta send, que construye y envía fetch. Next dirige el mensaje al handler. Allí se identifica la credencial, se comprueba el permiso y se validan datos antes de tocar el Map. El cliente valida la respuesta y solicita actualizar su estado. La traza une observaciones causales de ambos lados, no paquetes ni un reloj global." },
  { title: "Tres responsabilidades", text: "El cliente recoge la intención y presenta el último resultado conocido. La API impone el contrato y calcula precio y permisos. El almacenamiento conserva datos durante la vida de este proceso. Aquí es un Map de JavaScript, no una base SQL: no hay INSERT real, transacciones persistentes ni coordinación entre instancias." },
  { title: "Identidad de una operación", text: "POST guarda la clave de idempotencia junto con su payload y snapshot. Repetir la misma creación devuelve200 y ese snapshot; cambiar el payload bajo la misma clave devuelve409. PATCH fija confirmed: repetirlo no añade otra confirmación. Ninguna de estas reglas significa que la red entregue exactamente una vez." },
  { title: "Resultado incierto", text: "Si el servidor escribe y se pierde la respuesta, el cliente no puede concluir que falló el efecto. Conserva clave y datos para recuperar POST. Una confirmación incierta conserva el id: consulta ese pedido o repite el PATCH idempotente. AbortController limita la espera del navegador, sin deshacer el trabajo remoto." },
  { title: "Alternativas y compromisos", text: "Una función local evitaría la frontera de red, pero no compartiría por sí sola pedidos con otra computadora. Una base persistente permitiría sobrevivir reinicios y exigiría transacciones para coordinar efecto y dedupe. Un broker permitiría procesamiento posterior y agregaría estados pendientes, entregas y deduplicación. Elegimos HTTP y Map para inspeccionar el recorrido con pocas piezas." },
  { title: "Límites de la demostración", text: "Los tokens demo son públicos. No hay privacidad por persona, cobros, inventario ni sesión segura de producción. Se admiten200 pedidos entre todas las consolas del mismo proceso. Reiniciar borra pedidos y claves. El visor muestra los módulos de esta compilación, no el código nativo, el runtime completo de React ni instrucciones de CPU." },
];
export const projectQuiz = {
  question: "Confirmas un pedido, repites su POST original y recibes created. ¿Qué puedes deducir?",
  options: [
    { id: "undo", label: "POST revirtió la confirmación porque volvió a devolver created.", feedback: "La respuesta de creación conservada no es una escritura que revierta el estado. Observa el GET posterior para distinguir snapshot y dato actual." },
    { id: "snapshot", label: "POST recuperó el snapshot de creación; GET permite observar el estado actual.", feedback: "Correcto. Idempotencia recupera el resultado de esa operación. El GET puede devolver confirmed sin contradecir el snapshot created del POST. La respuesta y el estado actual son cosas distintas." },
    { id: "cache", label: "HTTP200 garantiza que el servidor no ejecutó código.", feedback: "El código200 describe el resultado HTTP. El servidor sí autentica, valida y busca la clave para recuperar el resultado anterior." },
  ],
};
