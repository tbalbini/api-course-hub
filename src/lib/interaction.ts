import type { Stage } from "./trace";

export interface Interaction {
  initiator: string;
  receiver: string;
  technology: string;
  possibleFailures: string[];
}

export function interaction(initiator: string, receiver: string, technology: string, ...possibleFailures: string[]): Interaction {
  return { initiator, receiver, technology, possibleFailures };
}

export const stageInteractions: Record<Stage, Interaction> = {
  click: interaction("Usuario", "Handler de la interfaz", "Evento del navegador"),
  handler: interaction("Interfaz", "Handler JavaScript", "JavaScript local"),
  local: interaction("Handler JavaScript", "Estado React", "React local"),
  request: interaction("Navegador", "Endpoint HTTP", "fetch · HTTP", "Fallo de conectividad o espera agotada; el resultado remoto puede ser incierto."),
  route: interaction("Servidor HTTP", "Route Handler", "Next.js · routing local", "Ruta o método no disponible."),
  authenticate: interaction("Route Handler", "Comprobación de identidad", "Bearer de demostración · función local", "401: credencial ausente o desconocida."),
  authorize: interaction("Route Handler", "Comprobación de permisos", "Autorización local", "403: identidad reconocida sin permiso para la operación."),
  validate: interaction("Route Handler", "Validador de entrada", "JSON y validación local", "400: datos inválidos.", "Cuerpo demasiado grande o representación no admitida."),
  business: interaction("Route Handler", "Lógica de pedidos", "TypeScript local", "Datos que cumplen el formato pueden incumplir reglas de negocio."),
  persist: interaction("Lógica de pedidos", "Map del proceso servidor", "Map en memoria · mismo proceso", "Capacidad temporal agotada; reiniciar pierde los datos."),
  readStore: interaction("Route Handler", "Map del proceso servidor", "Map.get · mismo proceso", "404: pedido ausente en este proceso."),
  confirmStored: interaction("Lógica de pedidos", "Map del proceso servidor", "Map en memoria · reemplazo local", "404: pedido ausente; reiniciar pierde los datos."),
  deduplicate: interaction("Lógica de pedidos", "Map de claves del proceso servidor", "Idempotencia en memoria · mismo proceso", "409: misma clave con otros datos.", "Olvidar la clave termina la deduplicación."),
  response: interaction("Route Handler", "Constructor Response", "Response.json · mismo proceso", "Construir la respuesta no garantiza su recepción por el cliente."),
  receive: interaction("Servidor HTTP", "Navegador", "fetch · Response HTTP", "Un status de error no demuestra éxito de negocio; la lectura del body aún puede fallar."),
  parse: interaction("Handler JavaScript", "Parser JSON local", "JSON · deserialización local", "JSON ilegible o datos incompatibles con el contrato."),
  render: interaction("Handler JavaScript", "Estado React", "React · solicitud de actualización local"),
  dns: interaction("Cliente", "Resolver DNS", "DNS conceptual", "La resolución puede fallar; no mide red real."),
  tcp: interaction("Cliente TCP", "Servidor TCP", "TCP conceptual", "La conexión puede fallar; no garantiza éxito de aplicación."),
  tls: interaction("Cliente TLS", "Servidor TLS", "TLS conceptual", "La negociación o la validación de identidad puede fallar."),
  wireRequest: interaction("Cliente", "Servidor HTTP", "Transporte HTTP conceptual", "La solicitud puede perderse antes de llegar al proveedor."),
  proxy: interaction("Entrada", "Aplicación", "Reverse proxy conceptual", "El reenvío puede fallar; no implica ejecución en la aplicación."),
  balancer: interaction("Balanceador", "Aplicación seleccionada", "Selección conceptual de destino", "Seleccionar un destino no demuestra que esté disponible."),
  serverAccept: interaction("Entrada", "Servidor HTTP", "Recepción HTTP conceptual", "Recibir no implica terminar la operación."),
  middleware: interaction("Handler", "Cadena de comprobaciones", "Funciones locales conceptuales", "Una comprobación puede detener el flujo antes del negocio."),
  endpoint: interaction("Handler", "Lógica de negocio", "Coordinación local conceptual", "La operación puede rechazar datos antes de producir un efecto."),
  wireResponse: interaction("Servidor HTTP", "Cliente", "Transporte HTTP conceptual", "La respuesta puede perderse después del efecto."),
  invokeLocal: interaction("Consumidor local", "Función sumar", "Llamada JavaScript local", "La implementación puede incumplir el retorno prometido."),
  enterFrame: interaction("Consumidor local", "Función sumar", "Pila conceptual de una llamada local"),
  executeLocal: interaction("Función sumar", "Implementación JavaScript", "JavaScript local", "Un cambio de implementación puede romper el contrato."),
  returnLocal: interaction("Función sumar", "Consumidor local", "Retorno JavaScript local", "Un retorno puede tener tipo o significado incorrecto."),
  checkContract: interaction("Consumidor local", "Comprobador del contrato", "Validación JavaScript local", "El valor puede incumplir el tipo o significado prometido."),
  useResult: interaction("Consumidor", "Estado de la interfaz", "Aplicación local del resultado", "Un snapshot recibido no asegura conocer cambios posteriores."),
  selectDOM: interaction("JavaScript del ejemplo", "API DOM del navegador", "querySelector · sin HTTP", "El selector puede no encontrar un nodo."),
  writeDOM: interaction("JavaScript del ejemplo", "Nodo DOM del ejemplo", "textContent · sin HTTP", "El nodo debe existir antes de modificarlo."),
  invokeModel: interaction("Consumidor del modelo", "Proveedor del modelo", "Invocación conceptual", "La disponibilidad depende del mecanismo elegido."),
  crossBoundary: interaction("Proceso solicitante", "Proceso receptor", "IPC conceptual", "La entrega puede fallar o no confirmarse."),
  providerModel: interaction("Proveedor del modelo", "Implementación del proveedor", "Procesamiento conceptual", "Recibir no garantiza completar la operación."),
  deliveryModel: interaction("Proveedor del modelo", "Consumidor del modelo", "Entrega conceptual", "La entrega puede perderse o repetirse."),
  failure: interaction("Handler JavaScript", "Manejo de errores del cliente", "Error local de la operación", "Un timeout no demuestra que el proveedor haya cancelado el efecto."),
};
