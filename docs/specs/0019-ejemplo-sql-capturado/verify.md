# Verificación: ejemplo SQL capturado

Fecha: 23 de octubre de 2026. Derivada de [spec0019](index.md). Comprobaciones completadas para AC-1 a AC-6.

## Recorridos

- [x] Crear un pedido real y seleccionar `persist`: comprobar fragmento Map observado, SQL conceptual no ejecutado y referencias del evento (AC-1,2).
- [x] Comparar cada parámetro con la salida de ese evento: id, sku, quantity, totalMinor, currency y status. Crear otra cantidad y confirmar que cambian cantidad, total e id y se conservan las constantes del producto (AC-1,3).
- [x] Editar cantidad y credencial sin ejecutar; cambiar las tres profundidades, panel, replay y cursor: el ejemplo mantiene los valores capturados y esas acciones no hacen HTTP (AC-3).
- [x] Abrir comparación e inspeccionar la captura anterior con teclado; comprobar pausa desde el inicio, restaurar su escritura y volver a la otra captura. Formulario, aviso, último pedido real e intento pendiente conservan sus fuentes (AC-4,6).
- [x] Provocar respuesta perdida, inspeccionar la compra anterior y reintentar: se conserva exactamente clave, payload y credencial de la operación incierta (AC-4).
- [x] Recorrer consulta200, rechazos400,401,403,404,409,429,500, fallo de red y favoritos: no hay inserción en esos pasos. En timeout y duplicate el ejemplo corresponde solo a la escritura previa, no a su fallo o deduplicación (AC-5).
- [x] Comprobar `persist` con datos incompletos y `persist` fallido: muestran aviso sin rellenar parámetros ni presentar INSERT (AC-5).
- [x] Confirmar responsabilidades de API, negocio y almacenamiento, así como los límites del esquema y del Map. SQL y parámetros permanecen separados y el panel no crea eventos de traza (AC-2,3).
- [x] A390px, recorrer los nuevos controles con teclado, comprobar foco y desplazamiento interno del código y revisar visualmente escritorio y móvil (AC-6).

## Comandos

- [x] `npm run typecheck`.
- [x] `npm run lint`.
- [x] `npm test -- --reporter=dot`.
- [x] `npm run build`.
- [x] `npm run test:delivery`, con producción exclusiva y fuentes coincidentes.

## Fuentes y cobertura

La proyección y estados inválidos se comprueban en `tests/order-storage.test.ts`. Las seis fuentes de parámetros, referencias de traza, procedencia, fragmentos, intercambio e intento pendiente se recorren en `tests/e2e/storage-example.spec.ts`. La suite existente comprueba profundidad, panel, reproducción y frontera HTTP. El contenido editorial se revisa por lectura y en la app; no se atribuyen a estas pruebas resultados de comprensión humana.

## Resultados

Entorno: macOS26.6.2 arm64, Node24.14.0, npm11.9.0. Tipos, lint y build aprobados. Vitest: 20 archivos y758 casos aprobados, incluidos30 casos nuevos. La configuración de entrega arrancó producción exclusiva en `127.0.0.1:3100` y cerró su servidor al terminar.

Playwright: 213 casos aprobados,179 en Chromium,17 en Firefox y17 en WebKit; cero fallos, casos omitidos o inestables. Chromium ejecutó la suite completa y las tres regresiones nuevas; Firefox y WebKit ejecutaron la suite de entrega existente. Inicio UTC: `2026-10-23T16:11:46.129Z`, duración239610.546ms. Informe local: [delivery-report.json](../../../test-results/delivery-report.json).

Una comprobación adicional en Chromium verificó que Código, Request / Response y Explicación causal conservan el panel SQL. A390px se confirmó foco en el código, desplazamiento horizontal con ArrowRight y ausencia de desbordamiento de la página. Se inspeccionaron las capturas de [escritorio](../../../test-results/storage-desktop.png) y [viewport móvil](../../../test-results/storage-mobile-viewport.png): Map, alternativa conceptual y parámetros quedan separados y legibles. Los archivos de `test-results/` están ignorados y pueden reemplazarse al ejecutar pruebas futuras.

La huella de fuentes es SHA256 `a77918c13470f3251bd87e76a3fe898711f4461cdc7ea1cb6d91b7b2c55874dd`. Comprende los167 archivos enumerados en el [manifiesto histórico](../0018-verificacion-entrega/evidence/manifest.json), con su contenido actual, más estos cinco archivos nuevos:

- [src/lib/order-storage.ts](../../../src/lib/order-storage.ts).
- [src/content/order-storage.ts](../../../src/content/order-storage.ts).
- [src/components/order-storage-example.tsx](../../../src/components/order-storage-example.tsx).
- [tests/order-storage.test.ts](../../../tests/order-storage.test.ts).
- [tests/e2e/storage-example.spec.ts](../../../tests/e2e/storage-example.spec.ts).

Son172 archivos en total. Se ordenan rutas y se concatena `ruta`, NUL, SHA256 del archivo y salto de línea antes del hash final. Las14 fuentes públicas generadas para el visor también coinciden con sus archivos actuales. El manifiesto histórico y la evidencia de la fase1 se conservaron.

Este cierre corresponde a la fase2. SQL sigue siendo conceptual y la persistencia real sigue siendo el Map. No se probó un motor SQL ni se repitió la observación humana de VoiceOver o la validación pedagógica con participantes; las fases3 a5 permanecen pendientes.
