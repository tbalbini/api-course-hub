import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Lista cerrada: nunca se aceptan rutas desde una petición o desde el navegador.
const files = [
  ["post", "src/app/api/orders/route.ts", "Crear", "Handler POST: permisos, validación y creación o recuperación por clave."],
  ["item", "src/app/api/orders/[id]/route.ts", "Consultar y confirmar", "Handlers GET y PATCH: consulta, permisos y confirmación idempotente."],
  ["domain", "src/lib/orders.ts", "Reglas y almacenamiento", "Validación, credenciales públicas y Map temporal de un proceso."],
  ["status", "src/lib/order-status.ts", "Transición pura", "Leer devuelve una copia y confirmar fija un estado sin mutar la entrada."],
  ["product", "src/lib/product.ts", "Producto", "SKU y precio compartidos. El servidor calcula el total."],
  ["json", "src/lib/read-json.ts", "Frontera JSON", "Límite de bytes, Content-Type, UTF-8 y parseo del body."],
  ["instrumentation", "src/lib/order-trace.ts", "Instrumentación", "Eventos observados, trace ID y respuestas HTTP consistentes."],
  ["receipt", "src/lib/order-receipt.ts", "Recepción validada", "El cliente comprueba contrato, correlación y estructura de eventos."],
  ["trace", "src/lib/trace.ts", "Modelo causal", "Eventos tipados y reducer de reproducción sin efectos HTTP."],
  ["client", "src/components/order-console.tsx", "Cliente y pantalla", "Construcción de fetch, incertidumbre y último resultado conocido."],
  ["lab", "src/components/build-api-lab.tsx", "Capítulo interactivo", "Navegación, objetivos y visor de archivos de esta compilación."],
  ["content", "src/content/project.ts", "Contenido separado", "Explicaciones, evaluación y relación entre eventos y archivos."],
  ["page", "src/app/build-api/page.tsx", "Página servidor", "Incorpora el snapshot estático. No lee archivos en runtime."],
  ["generator", "scripts/project-sources.mjs", "Generación de fuentes", "Este script lee solo la lista fija antes de dev o build. No se ejecuta en el navegador."],
];
const root = new URL("../", import.meta.url);
const sources = await Promise.all(files.map(async ([id, path, title, description]) => {
  const code = await readFile(new URL(path, root), "utf8");
  return { id, path, title, description, code, sha256: createHash("sha256").update(code).digest("hex") };
}));
await mkdir(new URL("src/generated/", root), { recursive: true });
await writeFile(new URL("src/generated/project-sources.json", root), JSON.stringify(sources) + "\n");
console.log(`Fuentes del proyecto: ${sources.length} archivos incorporados en ${fileURLToPath(root)}`);
