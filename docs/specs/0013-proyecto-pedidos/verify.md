# Verificación del proyecto de pedidos, spec0013

Comprobado el 22 de octubre de 2026 en producción local, `http://127.0.0.1:3000/build-api`. Resultado PASS. Se completa el bloque16 y el capítulo11, sin declarar terminado el producto completo.

## Criterios y superficies

- [x] **AC-1.** Aplicación, Código ejecutado y Capítulo11 admiten enlaces `?tab`, teclado con flechas/Home/End, foco, skip link y reducción de movimiento. Los paneles permanecen montados; ocultar la aplicación pausa reproducción y conserva pedido y borradores. `tests/e2e/project.spec.ts` comprueba navegación y ausencia de peticiones al abrir, consultar fuentes o reproducir. La comprobación adicional recorre las tres pestañas a390,701,920 y1440px, sin desbordar el documento.
- [x] **AC-2.** La consola reutiliza POST/GET/PATCH reales, cantidad editable, id codificado y credenciales públicas. El recorrido automatizado observa201,200,400,401,403,404 y409. La comprobación adicional registra POST201, PATCH200confirmed, POST200repeatedcreated, GET200confirmed, PATCH403, GET404 y GET401. No hay cobro ni SQL.
- [x] **AC-3.** Los handlers producen eventos observados con UUID, dependencias y response terminal. `tests/orders.test.ts` comprueba las tres operaciones, snapshot anterior, permisos, validación, lookup inexistente, ausencia de efectos tras rechazo y challenge Bearer. GET observa búsqueda; PATCH observa confirmación en Map. El registro adicional conserva método, ruta, status, trace ID y etapas; header y JSON coinciden. No se fabrican DNS, sockets ni infraestructura.
- [x] **AC-4.** Cliente y servidor forman una captura causal inspeccionable con código y datos originales. El archivo del evento readStore abre el handler del item. `tests/order-receipt.test.ts` rechaza header/trace ID distintos, etapas desconocidas, actor/frontera/procedencia/estado inválidos, ids repetidos, dependencias futuras, explicación/código incompletos, orden lógico y terminal incorrectos, Order inválido y resultados no correlacionados. Las pruebas de navegador alteran traza y pedido tras una escritura real: no se aplica Order ni se obtienen logros y se conserva Response. Replay no envía HTTP ni revierte efectos. Se distingue setter de commit/paint.
- [x] **AC-5.** Creación incierta mantiene clave, payload y credencial; bloquea edición y recupera el mismo pedido. Caso A→B con respuesta perdida→retryB→repetirB comprueba que el original pasa a ser B. PATCH con respuesta perdida o JSON mal formado conserva id y último dato, bloquea creación y permite GET del mismo id para observar confirmed. GET fallido no bloquea creación. POST repetido devuelve created y GET devuelve confirmed; cantidad distinta bajo la clave original devuelve409. Las regresiones existentes conservan identidad ante rechazos posteriores y Response parcial.
- [x] **AC-6.** Se muestran14 archivos de lista fija, ruta, responsabilidad, SHA256 y texto completo, con descarga Blob exacta. El test compara cada fuente con el archivo UTF-8 y su hash. El navegador descarga el handler POST y verifica texto y nombre. Se ejecutó build→modificar temporalmente el archivo POST agregando BUILD_SNAPSHOT_PROBE→start: el visor, hash y descarga conservaron el contenido compilado, sin el marcador. No hay lectura de fuentes en runtime, editor ni rutas arbitrarias. Las instrucciones y prehooks permiten regenerar desde el repo completo.
- [x] **AC-7.** Contrato visible y contenido separado cubren responsabilidades cliente/API/almacén, inputs, permisos, errores, precio, validación, idempotencia, snapshot, incertidumbre, alternativas y límites. El capítulo añade pregunta, recorrido, práctica con código real, error conceptual y quiz con feedback causal. Revisadas vistas de aplicación, código y rechazo403. La descripción identifica Map temporal de proceso y no afirma transacciones durables.
- [x] **AC-8.** Seis resultados validados más quiz comprobado completan el capítulo. Elegir una respuesta sin comprobar no completa. La prueba recarga, conserva logros y verifica Completado en `/course`; visitar o reproducir no acredita resultados. La validación de progreso conserva capítulos anteriores y elimina rutas o campos no permitidos. No se persisten pedidos, credenciales ni payloads.
- [x] **AC-9.** Tipos, lint,597 pruebas de lógica/servidor y99 recorridos de Chromium pasan. La suite final completa incluye las integraciones anteriores de compra, comparador, seguridad y progreso. Se preservan almacenamiento y reglas de negocio y no se añadieron dependencias.

## Comandos y resultados

- `npm run typecheck`: pasa.
- `npm run lint`: pasa, sin errores ni avisos en esta ejecución.
- `npm test -- --reporter=dot`:597 pruebas aprobadas en15 archivos.
- `npm run build`: pasa en copia temporal aislada,21 rutas, `/build-api` estática y handlers de pedidos dinámicos.
- `npm start -- --hostname 127.0.0.1 --port 3000`: arranque de producción correcto.
- `npm run test:e2e -- --workers=1 --timeout=60000 --reporter=line`:99 pruebas aprobadas en la pasada final completa.
- `node /tmp/api-universe-project-verify.cjs`: siete operaciones HTTP reales y doce combinaciones de disposición, sin tráfico de replay, sin desbordamiento y sin errores JavaScript inesperados.
- `git diff --check`: pasa. No se crearon commits ni se publicó.

El capítulo añade46 pruebas de recepción/fuentes/progreso y seis de instrumentación servidor. Añade nueve recorridos de navegador y una regresión de hidratación del comparador. La primera pasada completa detectó pérdida del callback de logros de seguridad y sustitución del texto de autorización POST; ambas se corrigieron antes de la pasada final. GET/PATCH ahora marcan tanto el rechazo servidor como su interpretación cliente, así que las pruebas del comparador esperan ambos eventos.

El comparador también aceptaba selecciones en HTML antes de conectar handlers y las perdía al hidratarse. Se reprodujo retrasando los chunks JavaScript: polling volvía a local. Sus controles esperan ahora la hidratación y una prueba conserva la selección con ese retraso explícito, sin sleeps.

## Evidencia temporal

El directorio `/tmp/api-universe-project-evidence/` contiene `runtime.json` con operaciones y disposiciones, `immutable-build.json` con comprobación de fuente compilada y las capturas `application-desktop.png`, `application-mobile.png`, `compiled-source.png`, `source-mobile.png` y `forbidden-inspector.png`. Se inspeccionaron visualmente las capturas. Son evidencia regenerable, no assets de la aplicación. El marcador de la fuente temporal se retira después de comprobar inmutabilidad; la copia compilada y el código de trabajo se contrastan mediante hashes.

## Compatibilidad con cambios concurrentes

La pasada de597 pruebas y99 recorridos se ejecutó sobre la copia de producción del capítulo11, antes de los cambios concurrentes de navegación por cinco áreas y metadatos X Ray de la spec0014. Se preserva su manifest de103 archivos en `verified-source-hashes.json`. El contraste posterior detectó esas diferencias y no se presenta la compilación anterior como una compilación del árbol nuevo.

Con el árbol actualizado, `npm run typecheck` y `npm run lint` pasan y la suite de lógica vuelve a pasar:609 pruebas en16 archivos, incluidas las nuevas de X Ray. Una primera ejecución detectó un caso UDP en ese trabajo concurrente; tras su corrección en ese trabajo, la ejecución completa pasa. Los nueve recorridos de `tests/e2e/project.spec.ts` vuelven a pasar contra el servidor actual de desarrollo en3001, con la navegación reorganizada y los metadatos nuevos. Configuración temporal: `/tmp/api-course-project-current.config.cjs`, resultados en `/tmp/api-universe-project-current-results/`.

La verificación global de producción de los cambios concurrentes de X Ray y navegación corresponde a sus recorridos. Este cierre acredita el proyecto de pedidos y su compatibilidad comprobada, sin cerrar la spec0014 ni la entrega integral.

## Límites

Solo Chromium automatizado, sin auditoría completa con lectores de pantalla ni evaluación con estudiantes. Map temporal200, credenciales públicas y ausencia de propiedad por usuario se mantienen explícitos. No hay base durable, cobros ni despliegue remoto. La duración observada no es una medición de paquetes o CPU y el snapshot de fuentes no incluye internals de React, Next.js, JIT o sistema operativo. Capítulo12, referencia, desafíos unificados y verificación integral permanecen en su alcance.
