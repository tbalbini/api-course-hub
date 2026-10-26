# Verificación de red y HTTP, spec 0007

Comprobado el 22 de octubre de 2026 en `http://127.0.0.1:3000/playground`, contra compilación nueva de producción local. El proceso anterior se detuvo antes de reconstruir y arrancar esta versión.

## Criterios y evidencia

- [x] AC-1. Cuatro pestañas conservan borradores, campos, capturas y creación incierta. Cambiar de pestaña pausa la reproducción oculta y no ejecuta requests. Teclado admite flechas, Home y End. Fuentes: `tests/e2e/playground.spec.ts` y componentes del playground.
- [x] AC-2. Whitelist de origen, pathname y headers; rechazo de URL externa, otro puerto, credenciales URL, rutas no admitidas, Cookie/Host, headers duplicados, caracteres inválidos y límites. Query repetida se conserva y el fragmento no se envía. Body se mantiene como texto exacto; GET lo omite. Fuentes: `tests/http.test.ts` y pruebas de edición y móvil.
- [x] AC-3. Navegador conserva 304 y 405 con body vacío, representación de texto y JSON inválido recibido. Un stream de body interrumpido después de recibir headers mantiene status, ETag y evidencia de error de lectura. Pérdida de respuesta de creación después de procesar POST conserva solicitud y clave al cambiar de pestaña y recupera el mismo id con 200. X-Trace-Id recibido identifica los eventos; si no existe Response, se usa id cliente. Replay no envía peticiones.
- [x] AC-4. Los cinco métodos reales funcionan en el diagnóstico sin persistencia. Pruebas de handler verifican body opcional, JSON anidado, UTF-8, límites y 400/406/413/415. Negociación respeta q y especificidad sobre comodines. GET genera ETag SHA-256 estable; una condición débil o lista válida devuelve 304 sin body. Cambiar Accept a texto obtiene 200 con otro ETag. En el servidor real, Vary incluye Accept además de campos añadidos por Next.js.
- [x] AC-5. Presets solo preparan mensajes. Se creó y confirmó un pedido, se rechazó lector con 403 y se conservó 405 al usar PUT fuera del contrato de pedidos. Reutilizar ETag solo modifica el borrador, y enviar después produce 304. Los requests reales usan no-store; no se atribuye el comportamiento a una caché automática.
- [x] AC-6. Recorrido adicional de navegador ejecutó los cuatro perfiles con pérdida activada y desactivada, ocho combinaciones sin fetch. HTTP/3 no añade TCP; UDP no añade conexión ni TLS ni Response HTTP. Pruebas de matrices comprueban IP literal, caché y reutilización sin cambiar capturas anteriores.
- [x] AC-7. QUIC y TCP recuperan contenido; UDP conserva [1,3] con entrega incompleta. La ruta tiene dos routers de documentación y se etiqueta como conceptual. Un retry agrega un segundo GET y reutiliza preparación; recuperación de transporte no agrega otra invocación. El cálculo 2×ida+procesamiento aparece como simulado y excluye preparación, pérdida y colas. Tiempo lógico y duración observada permanecen separados.
- [x] AC-8. Capítulos 4 y 5 incluyen explicación, mecanismo, código, alternativas y límites, conceptos erróneos, evaluación y desafío. En navegador se completó JSON/texto/304 más razonamiento HTTP, y recuperación QUIC/entrega incompleta UDP más razonamiento de red. Los logros duran la sesión y no modifican progreso de capítulos 0 a 3. Tabla explica los cinco métodos, safety e idempotencia sin equivalencia automática con CRUD.
- [x] AC-9. GraphQL cambia proyección y mutation; último campo no puede eliminarse. RPC y gRPC usan el constructor existente; los cuatro modos siguen cubiertos en pruebas del comparador y client/bidi se inspeccionaron en el playground. Móvil a 390×844 no desborda la página; código, tabla y ruta desplazan dentro de su panel. Reducción de movimiento y navegación por teclado verificadas.

## Comprobaciones

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e` y `git diff --check`.

Resultado: 288 pruebas de lógica y servidor y 36 de navegador. La primera pasada detectó un selector de prueba ambiguo porque ambas pestañas conservan sus campos montados; se acotó la aserción al panel GraphQL visible. La suite completa pasó después.

El recorrido adicional registró ocho casos de red, cinco métodos HTTP, 304 manual, query sin fragmento, cero requests durante modelos o replay, cero errores JavaScript y móvil sin desbordamiento. Evidencia temporal regenerable en `test-results/manual-http/`: desktop.png, conditional.png, network.png, mobile.png y evidence.json.

## Límites

Solo Chromium automatizado. No se declara auditoría completa de lectores de pantalla ni validación pedagógica con estudiantes. Las pruebas inyectan fallos de red, JSON de respuesta y lectura de stream para verificar las ramas del cliente. GraphQL y gRPC son modelos sin servidor real. El diagrama de red no captura paquetes, rutas, TLS o versión negociada por fetch; sus tres unidades representan contenido. La negociación del diagnóstico cubre q y comodines comunes, no parámetros de medios arbitrarios. Los pedidos y credenciales siguen siendo demostrativos; el eco no persiste recursos ni acredita semántica CRUD completa.
