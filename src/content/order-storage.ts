export const orderInsertSQL = `INSERT INTO orders (
  id, sku, quantity, total_minor, currency, status
)
VALUES ($1, $2, $3, $4, $5, $6);`;

export const orderInsertColumns = ["id", "sku", "quantity", "total_minor", "currency", "status"] as const;

export const storageResponsibilities = [
  { role: "API HTTP", explanation: "Recibe la solicitud y devuelve status, headers y body según el contrato. Expone la capacidad de crear un pedido." },
  { role: "Lógica de negocio", explanation: "Las funciones del servidor comprueban permisos y datos, calculan el total y coordinan la creación y su deduplicación." },
  { role: "Almacenamiento", explanation: "Aquí una llamada local al Map conserva el pedido en memoria de un proceso. En una alternativa SQL, un driver entregaría la sentencia y sus parámetros al motor para guardar una fila." },
] as const;

export const orderInsertLimits = "Esta tabla orders es hipotética y muestra solo seis campos del pedido. Omite fecha, restricciones, índices y transacciones. Los placeholders $1 a $6 usan el estilo de PostgreSQL; los valores se envían separados de la sentencia. Un INSERT aislado no garantiza la deduplicación de toda la operación. Aquí no hay motor SQL: el Map sigue limitado a200 pedidos temporales y se vacía al reiniciar el servidor.";
