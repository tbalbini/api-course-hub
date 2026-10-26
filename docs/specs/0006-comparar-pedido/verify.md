# Verificación del comparador, spec 0006

Comprobado el 22 de octubre de 2026 en `http://127.0.0.1:3000/compare`, con una compilación nueva de producción local. El servidor anterior se detuvo antes de construir y arrancar esta versión.

## Criterios observados

- [x] AC-1. Se recorrieron en navegador las diez alternativas con consultar y confirmar, veinte combinaciones. Cada consulta conserva created y cada confirmación termina en confirmed. Las copias no comparten efectos. Pruebas en `tests/comparison.test.ts` y recorrido adicional de navegador.
- [x] AC-2. Se inspeccionaron contratos, invocaciones, resultados y código; tabla común con mecanismos, compromisos, errores, límites y alternativas. Las categorías distintas llevan advertencia. El estado final del proveedor está etiquetado y la selección de evento destaca el rol activo. No se usan métricas de rendimiento simuladas.
- [x] AC-3. Reproductor, selección de traza A/B, tres profundidades, X Ray, código y datos operables. Capturas conservan ajustes y reproducción no muta sus eventos. Replay de la consola no emitió peticiones adicionales. Funciones locales ejecutan readOrder y confirmOrder; mensajes remotos conceptuales conservan su procedencia.
- [x] AC-4. Pedido inexistente detiene antes de escribir. Pérdida después de confirmación conserva el efecto remoto y deja incertidumbre en solicitudes sin observación posterior. Polling y suscripción recuperan conocimiento mediante snapshot o evento. Consultar nunca introduce un comando de confirmación. La función local no recibe un fallo ficticio de red.
- [x] AC-5. GraphQL cambia documento y proyección al seleccionar campos; el último campo no se puede eliminar. Su error de aplicación puede llegar en HTTP 200. Se comprobaron las cuatro modalidades gRPC, con cardinalidad y cierre visibles y confirmaciones repetidas idempotentes. Envelope, Fault, XML RPC y WSDL se analizaron mediante DOMParser sin errores XML. Los nombres de entrada y salida WSDL coinciden con ConfirmOrder. El capítulo explica restricciones REST, incluida hipermedia ausente del ejemplo.
- [x] AC-6. Navegador ejecutó POST, PATCH y GET contra rutas locales. Lectura posterior confirmó el estado actualizado; lector recibió 403 al confirmar y 200 al consultar, ausencia recibió 401. Pérdida real de respuesta de creación, inyectada después de que el servidor procesara el POST, conservó clave y recuperó el mismo pedido con 200. Contrato servidor comprueba 400, 404, 413, 415 y ausencia de modificación en rechazos. Actualizaciones concurrentes conservan un pedido y el snapshot original de creación.
- [x] AC-7. Capítulo y evaluación razonada disponibles. Un intento incorrecto explica separación entre efecto y recepción; el correcto explica consulta e idempotencia. El desafío registra ambos objetivos explorados sin modificar el progreso de capítulos 0 a 3.
- [x] AC-8. Teclado activa enlace para saltar, selectores nativos, navegación y reproducción. A 390 × 844 no hay desbordamiento de página; código y tabla conservan desplazamiento interno. Reducción de movimiento y capturas pausadas verificadas. Las pruebas previas de compra, red, primeros principios y taxonomía siguen pasando.

## Comprobaciones

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` y `git diff --check`.

Resultado: 222 pruebas de lógica y servidor y 27 de navegador. Una aserción anterior detectó el cambio de texto del estado sin respuesta del inspector; se conservó su texto y la suite completa pasó en la compilación final.

Evidencia temporal en `test-results/manual-comparison/`: desktop.png, mobile.png, trace.png, http-real.png y evidence.json. El recorrido adicional registró veinte combinaciones, cuatro modalidades gRPC, cero errores JavaScript, cero peticiones durante modelos y cero escrituras durante replay. Los archivos temporales se regeneran y no forman parte del código fuente.

## Límites

Solo Chromium automatizado, sin auditoría completa con lectores de pantalla ni evaluación con estudiantes. No se levantaron servidores GraphQL, gRPC o SOAP ni se validó despliegue de stubs o bindings WSDL; sus contratos y mensajes son ejemplos pedagógicos etiquetados. HTTP local y funciones de dominio sí se ejecutan. El Map y las credenciales públicas siguen siendo demostrativos, sin durabilidad ni propiedad por usuario. GET/PATCH solo tienen observación de cliente; no se atribuyen eventos internos del servidor a esas capturas.
