# 0019. Ejemplo SQL asociado a una escritura capturada

**Date**: 2026-10-23
**Status**: Accepted

## Summary

Follow the Click mostrará cómo podría representarse una creación de pedido mediante un INSERT SQL. Un panel junto al inspector separará la escritura en memoria de la alternativa conceptual y mostrará parámetros tomados del evento seleccionado. Inspeccionar la captura anterior permitirá comprobar que cambiar el formulario o ejecutar otra compra no modifica ese ejemplo.

## Requirements

**AC-1:** seleccionar un evento `persist` exitoso en Follow the Click muestra un panel identificado como ejemplo SQL conceptual, con una sentencia parametrizada y los seis valores del pedido capturado. Los demás pasos no muestran una inserción como si hubieran escrito.

**AC-2:** el panel distingue la llamada al Map y su procedencia, observada o conceptual, de la alternativa SQL que nunca se ejecuta. Explica las responsabilidades de API HTTP, lógica de negocio y almacenamiento y los límites del esquema ilustrativo.

**AC-3:** editar cantidad o credencial, cambiar profundidad, inspeccionar y reproducir no altera los valores capturados ni envía HTTP. Se muestra el id de captura y evento que origina el ejemplo, sin agregar eventos SQL ni cambiar su procedencia.

**AC-4:** desde la comparación se puede inspeccionar la captura anterior, pausada desde su primer evento. La actual pasa a ser anterior. Volver a seleccionar su escritura recupera sus valores originales, sin cambiar el formulario, el último pedido real, el intento pendiente o sus credenciales y clave.

**AC-5:** una consulta, un rechazo previo a guardar, favoritos y deduplicación no anuncian un INSERT para ese paso. Una escritura conceptual anterior a un timeout o al reintento duplicado sí permite inspeccionar el ejemplo del efecto que representa. Datos de escritura incompletos muestran un aviso, sin completar campos desde el formulario o la respuesta final.

**AC-6:** el panel y el acceso a la captura anterior funcionan mediante teclado y a390px. El código desplaza dentro del panel y los textos distinguen procedencia sin depender del color. Se respeta la reproducción pausada y la preferencia de movimiento reducido.

## Decision

Agregar un panel específico de Follow the Click después del reproductor, visible únicamente cuando `selected.stage === "persist"`. El reproductor y las rutas permanecen con sus contratos actuales. Un botón dentro de la comparación intercambia la captura actual y la anterior sin efectos de negocio.

## Feature design

### Datos y origen de valores

No hay entidades nuevas ni cambios de persistencia. La proyección solo lee una escritura exitosa del evento seleccionado; verifica objeto no array, id no vacío de máximo80 caracteres, sku del producto, cantidad entera de1 a5, total entero igual a la cantidad por el precio del producto, moneda del producto y estado `created`. Los valores se copian desde esa salida; las comprobaciones no sustituyen datos faltantes. `createdAt` se omite deliberadamente porque el fixture de simulación no lo contiene.

| Valor mostrado | Origen |
|---|---|
| Id de captura y evento | `capture.id` y `selected.id` |
| Procedencia de la escritura | `selected.provenance`, con rótulo observado o conceptual |
| Código del mecanismo de esta captura | `selected.code`, siempre rotulado como fragmento del Map |
| Sentencia ilustrativa | Texto editorial fijo con placeholders `$1` a `$6`, estilo PostgreSQL |
| `$1`, columna `id` | `selected.output.id` |
| `$2`, columna `sku` | `selected.output.sku` |
| `$3`, columna `quantity` | `selected.output.quantity` |
| `$4`, columna `total_minor` | `selected.output.totalMinor`, unidades monetarias menores |
| `$5`, columna `currency` | `selected.output.currency` |
| `$6`, columna `status` | `selected.output.status` |
| Responsabilidades y límites | Contenido editorial separado en `src/content/order-storage.ts` |
| Captura a restaurar | Estado `previous` ya existente en ClickLab |

La sentencia es `INSERT INTO orders (id, sku, quantity, total_minor, currency, status) VALUES ($1, $2, $3, $4, $5, $6);`, con saltos de línea editoriales. SQL y valores se presentan separados. La tabla orders es una proyección hipotética: no existe en esta app, no define un esquema de producción y omite fecha, restricciones, índices, transacciones y coordinación de idempotencia. Se explica que, en un backend SQL, un driver entregaría sentencia y parámetros al motor; aquí solo se representan como texto.

### Responsabilidades

La API HTTP recibe y devuelve mensajes según su contrato. Las funciones servidor comprueban permisos y entradas, calculan el total y coordinan la operación. La llamada local al Map conserva el pedido temporalmente en un proceso. Una base de datos SQL podría guardar una fila con las garantías de su motor y configuración; el INSERT aislado no asegura la deduplicación de toda la operación.

### Estados, interfaz y seguridad

Fuera de `persist` no se monta el panel. En `persist` fallido se informa que el paso no confirma una escritura correcta, aunque su salida tenga todos los campos. En `persist` exitoso con salida inválida se muestra un aviso de datos insuficientes. Ninguno de esos dos estados ofrece parámetros o INSERT completado. En escritura válida se muestran procedencia, referencias de captura, fragmento del Map, alternativa conceptual, parámetros con nombres y responsabilidades. Los ids se presentan como referencias de traza: las simulaciones pueden reutilizarlos y no se promete una identidad única de ejecución. No hay botón Ejecutar SQL.

La comparación conserva su resumen y añade el botón `Inspeccionar captura anterior`, deshabilitado durante una petición en curso. Su handler intercambia los dos objetos Capture mediante `load` con `autoplay:false`. No altera cantidad, rol, claves, estado de incertidumbre, aviso de la última operación o último pedido real. Un texto explica esa separación; el cursor vuelve a0 y profundidad y panel permanecen controlados por sus estados actuales.

Todo se procesa localmente. No se interpolan valores en la sentencia ni se interpreta HTML, SQL o código recibido. No hay configuración, secretos, métricas, rutas, registros o almacenamiento adicional. Se reutilizan componentes y estilos de panel, código y comparación; cualquier ajuste de tamaño vive en CSS.

### Escenarios críticos

La lógica comprueba proyección exacta, rechazo de datos incompletos, ausencia en otros pasos e inmutabilidad (AC-1,3,5). El navegador crea cantidades distintas, edita sin ejecutar y restaura una captura anterior; comprueba parámetros, ids, profundidad, replay y ausencia de peticiones adicionales (AC-1 a4). Los escenarios200,400,401,403,404,duplicate,timeout y favoritos comprueban qué pasos permiten el panel (AC-5). Teclado, foco y ancho390px comprueban acceso y desplazamiento interno (AC-6). Una respuesta perdida con intento pendiente comprueba que inspeccionar no sustituye su identidad o datos de reintento (AC-4).

## Build plan

1. [x] Crear la proyección pura y el contenido SQL, con regresiones de valores capturados, pasos admitidos y datos incompletos (AC-1,3,5).
2. [x] Integrar el panel y el intercambio de las dos capturas, sin efectos de negocio (AC-1 a4).
3. [x] Verificar el recorrido real, simulaciones, intento incierto, teclado, móvil y reproducción; ejecutar las comprobaciones apropiadas y registrar evidencia (AC-1 a6).

## Consequences

El alumno puede relacionar datos capturados con una inserción SQL hipotética. El Map sigue siendo temporal, acotado a200 pedidos y sin durabilidad ni coordinación entre instancias. La presentación no es un editor SQL, una captura de consultas o una prueba de base de datos. Las dos capturas permanecen solo en la pantalla y se pierden al recargar.

## Follow-up

Las fases3 a5 de scope2 conservan su alcance. Esta incorporación no acredita la validación pedagógica con personas ni el cumplimiento completo del Master Prompt.

## Rationale

Contexto, opciones y revisión: [rationale.md](rationale.md). Comprobación: [verify.md](verify.md).
