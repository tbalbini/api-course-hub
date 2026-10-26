# 0012. Sistema visual, navegación y progreso

**Date**: 2026-10-22
**Status**: Accepted

## Summary

Completar el bloque 4 sin implementar por adelantado los laboratorios pendientes. Reutilizar el diseño actual, dar una vista del recorrido y conservar progreso evaluado y contexto entre visitas. El usuario eligió páginas de orientación con estado pendiente para las áreas futuras y autorizó corregir el formato actual.

## Requirements

1. **AC-1**: la home mantiene su interacción real inmediata y ofrece entrada clara a primeros principios. `/course` reúne los trece capítulos, sus estados, progreso y las cinco áreas del producto: Bases, Recorrido central, Aprendizaje y mapa, Laboratorios, y Progreso y evaluación. Las ocho superficies originales (aprendizaje, mapa, Follow the Click, comparación, Playground, sistemas, desafíos y referencia) conservan sus accesos dentro de esas áreas. Visitar no completa actividades.
2. **AC-2**: el menú distingue áreas, capítulos, prácticas y herramientas, siguiendo la organización de `docs/scope/index.md`. Solo un área se despliega a la vez y la ruta inicial abre su área. Explorar otra área no navega ni ejecuta HTTP de negocio. En móvil y tablet un selector nativo muestra sus destinos en una fila desplazable. Los capítulos disponibles tienen enlaces propios. Sistemas conserva el laboratorio construido en paralelo; desafíos y referencia muestran orientación honesta y enlaces útiles, sin controles ficticios ni contenido anunciado como terminado.
3. **AC-3**: se conservan la clave y los logros existentes de capítulos 0 a 3. Un registro local versionado complementario conserva actividades y razonamiento comprobados de los capítulos siguientes. Completar exige las condiciones ya implementadas por cada laboratorio, nunca solo visitar o responder sin comprobar. Una nueva respuesta incorrecta no borra un logro obtenido.
4. **AC-4**: profundidad y última ubicación válida se recuperan. Solo se almacenan rutas locales conocidas, identificadores de actividades y resultados de evaluación; nunca pedidos, credenciales, capturas o borradores HTTP. Datos inválidos, versiones desconocidas, almacenamiento bloqueado y cambios de otra pestaña no impiden usar el curso ni borran logros existentes.
5. **AC-5**: foco visible, enlaces de salto, landmarks, nombres accesibles, etiquetas de estado además del color, teclado, contraste y reducción de movimiento funcionan. Los destinos nuevos no desbordan a390,701,920 y1440px. Carga, error y ruta desconocida ofrecen salidas comprensibles.
6. **AC-6**: tipos, lint, lógica, navegador y build pasan. Se comprueban conservación del formato antiguo, progreso parcial y completo tras recargar, ausencia de escrituras de negocio durante navegación y reproducción, contexto seguro, teclado y estados pendientes.

## Decision

Ampliar el sistema existente, sin dependencias ni otro motor de reproducción. Diseño procedente de `design.md` y tokens de `src/app/globals.css`. El catálogo del recorrido suministra títulos, rutas y estados; los componentes de evaluación suministran los logros, no el texto del DOM.

## Feature design

`api-universe-learning-v1` sigue siendo la fuente de capítulos 0 a 3. `api-universe-course-v1` contiene version1, actividades y quiz de los capítulos siguientes, profundidad y última ubicación permitida. La vista de progreso combina ambas fuentes sin copiar ni sobrescribir la antigua. Se usa `useSyncExternalStore` con snapshot inicial determinista para hidratar sin leer localStorage en el render del servidor. Cada escritura parte del snapshot actual para no perder logros por una hidratación tardía.

Actividades y respuestas correctas proceden de los laboratorios existentes: red(quic,udp), HTTP(json,text,conditional), comparación(read,confirm), eventos(sseCommand,webhookDedupe,pubsubLag), seguridad(real401,real403,hiddenEffect,csrfReject), contratos(businessMismatch,consumerBroken,offsetDuplicate,retrySafe). La integración de seguridad solo cambia almacenamiento de logros y presentación del estado, sin modificar sus modelos ni contenido educativo. Sistemas integra las actividades partial,late,stale,compensated y su razonamiento comprobado, incorporados por el trabajo paralelo del capítulo 10.

`/course` presenta cabecera con continuar y empezar, progreso disponible, accesos a las cinco áreas compartidas con el menú y programa secuencial de trece capítulos. Los números de capítulo se conservan y no representan posiciones del menú. Las páginas pendientes reúnen estado, alcance futuro y alternativas disponibles. Progreso y evaluación contiene el enlace al recorrido con su resumen de progreso. La navegación entre áreas conserva el comportamiento de Atrás y Adelante; los cambios dentro de la misma página conservan borradores y capturas. Un aviso común explica el modo de sesión cuando falla almacenamiento. La profundidad compartida se aplica en el inspector, manteniendo sus props y contratos existentes.

## Build plan

1. Catálogo, validación, almacenamiento complementario y compatibilidad con progreso anterior (AC-3,AC-4).
2. Integración de logros y profundidad en los recorridos existentes, sin efectos de negocio adicionales (AC-3,AC-4).
3. Recorrido, menú, orientación pendiente y estados de carga/error, siguiendo el sistema visual (AC-1,AC-2,AC-5).
4. Verificación de accesibilidad, navegador, lógica, documentación y alcance (AC-6).

## Consequences

Esta spec amplía la persistencia de logros que las specs 0006 a 0011 acotaban a la sesión de cada página. El registro complementario es la fuente actual para esos logros.

El progreso es local, editable por el usuario y no certifica conocimientos. Las áreas orientativas no cierran los bloques 18 o 19. Con almacenamiento bloqueado los logros permanecen en memoria durante la sesión; no se promete recuperarlos después de cerrar o recargar.
