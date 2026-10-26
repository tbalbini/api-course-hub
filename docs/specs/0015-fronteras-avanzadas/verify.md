# Verificación de fronteras avanzadas

Fecha: 2026-10-22. Spec0015. Resultado: PASS, diez criterios comprobados. Recorrido completo del capítulo12 en `/advanced`, con WebAssembly real y modelos identificados de ABI/FFI, transporte y herramientas. Referencia, catálogo general de desafíos y entrega integral no pertenecen a este cierre.

## Criterios y evidencia

| Criterio | Comprobación observada |
|---|---|
| AC-1 | Cuatro pestañas por URL, teclado con flechas/Home/End, skip link, pausa al ocultar y conservación de captura/borrador. Dieciséis combinaciones de pestaña y tamaño,390/701/920/1440px, sin desbordamiento. Abrir no instancia Wasm ni envía `/api/` |
| AC-2 | Los mismos ocho bytes representan10−3 o3−10 según offsets; invertir devuelve−7. Liberar antes de llamar produce LIFETIME sin evento de proveedor. Modelo etiquetado, sin acceso nativo |
| AC-3 | Módulo fijo válido en Node y Chromium.10/3 devuelve3;10/0 captura RuntimeError como WASM_TRAP. Contador de instantiate permanece en2 después de replay. Una entrada fraccionaria se rechaza sin otra instancia; indisponibilidad del runtime comprobada en lógica |
| AC-4 | Todos los prefijos de ambas sentencias y fragmentos1/4/8/64. Se inspeccionan bytes y snapshots al seleccionar inicio/final. Truncado acaba INCOMPLETE_FRAME; longitud inválida, NUL interior/faltante, UTF-8 inválido, tag y bytes extra se rechazan. No se ejecuta SQL |
| AC-5 | Texto con apariencia de JavaScript no se evalúa. JSON, tamaño, estructura, nombre, argumentos, identidad, permiso y pedido tienen errores propios. Confirmar con reader da FORBIDDEN sin invocación. Registro fijo y pedido nuevo aislado por ejecución |
| AC-6 | Confirmar v2 sin adaptador conserva efecto confirmed y da INCOMPATIBLE_RESULT al consumidor. Con adaptación consume confirmed y conserva callId. Una nueva lectura vuelve a la fixture created |
| AC-7 | Doce temas editoriales con seis preguntas causales, código, límites, misconception, actividad y feedback. Se responden las doce comprobaciones en navegador; una respuesta incorrecta no obtiene logro |
| AC-8 | Seis actividades ejecutadas y doce respuestas comprobadas completan el capítulo y sobreviven a recarga y resumen del curso. El almacenamiento no incluye pedido, argumentos ni JSON operativo. Sesión sin Storage sigue funcionando. Flags, versión y destinos se validan en lógica |
| AC-9 | Tres experimentos comparten TraceEvent, reducer, profundidad y X Ray global. Conservan evento/datos/panel al inspeccionar y no repiten efectos. Matriz de productores incluye variantes ABI/FFI, Wasm normal/trap, framing completo/fallido y herramientas con permisos/adaptación. Eventos Wasm observados; demás modelos conceptuales |
| AC-10 | Tipos, lint,669 pruebas de lógica y compilación correctos. La suite completa final aprueba142 casos; la primera detectó una discrepancia de CSS compartido en la copia anterior |

Pruebas duraderas: `tests/advanced.test.ts`, ampliación de `tests/interaction.test.ts`, `tests/e2e/advanced.spec.ts` y las tres superficies avanzadas de `tests/e2e/xray.spec.ts`. Se conservaron las regresiones de capítulos anteriores.

## Comandos

- [x] `npm run typecheck`: correcto, incluidos tipos de rutas y código nuevo.
- [x] `npm run lint`: correcto, sin avisos nuevos.
- [x] `npm test`:669 pruebas aprobadas en17 archivos. El capítulo añade57; la matriz X Ray existente incorpora los productores nuevos.
- [x] `npx vitest run tests/interaction.test.ts tests/advanced.test.ts`:64 pruebas aprobadas después de ampliar la matriz.
- [x] `npm run build`: compilación y generación correctas,22 superficies, incluida `/advanced`.
- [x] Instancia dedicada: `npm start -- --hostname 127.0.0.1 --port 3003`.
- [x] `npx playwright test --config=/tmp/api-universe-advanced.config.cjs tests/e2e/advanced.spec.ts --workers=1 --timeout=60000 --reporter=line`: ocho recorridos aprobados.
- [x] `npx playwright test --config=/tmp/api-universe-advanced.config.cjs --workers=1 --timeout=60000 --reporter=line`:142 pruebas aprobadas en la compilación actual, incluidos ocho recorridos avanzados y32 de X Ray. Log temporal: `/tmp/api-universe-advanced-final-e2e.log`.

La configuración temporal usa el `testDir` real y Chromium de escritorio con baseURL3003, sin webServer porque la producción se arranca expresamente. No modifica `playwright.config.ts`. La compilación vive en una copia temporal del árbol actual para no interferir con desarrollo ni con otras instancias. La comparación SHA256 de119 archivos de fuente y configuración coincide con el repositorio; manifest temporal en `/tmp/api-universe-advanced-evidence/source-sha256.json`.

La primera pasada completa obtuvo141/142: la copia anterior conservaba estilos del resumen de curso previos a un ajuste concurrente. La comprobación del primer capítulo a390px dio y960, frente al umbral900 de la prueba de aquel momento. Se incorporaron los estilos actuales, se recompiló y se reinició producción. La comprobación independiente actual da y888, sin desbordamiento. La prueba de curso también cambió en paralelo y ya no exige esa posición absoluta; ese cambio no sustituye la observación independiente. Los selectores nuevos se hicieron exactos para no confundir el selector de propuesta con un botón de timeline ni el aviso de validación con el anunciador de Next.

## Inspección de la aplicación

Se ejecutó `/tmp/api-universe-advanced-manual.cjs` contra la compilación nueva. Conserva19 entradas: dieciséis combinaciones de las cuatro pestañas a390/701/920/1440px, división Wasm y dos resultados de evolución. Sin errores JavaScript y sin peticiones a rutas `/api/`. Las capturas y el ledger están en `/tmp/api-universe-advanced-evidence/` y son regenerables.

Se inspeccionaron visualmente `390-binary.png`, `1440-tools.png`, `701-wire.png` y `course-mobile-current.png`. `wasm-trap.png` y `tool-incompatible.png` registran errores con resultado/efecto separados. El ledger conserva URL, tamaño, archivo y resultado; una captura de página completa no se presenta como medida de rendimiento. Teclado, reducción de movimiento y almacenamiento bloqueado se ejercitan además en las pruebas duraderas.

La revisión React comprobó hooks, ejecución en handlers, bloqueo de doble instancia, estado derivado, pausa al ocultar, labels, ids y paneles montados. No se añadieron dependencias, servicios, persistencia operativa ni permisos externos.

## Límites

Solo Chromium automatizado y runtime local Node para Wasm. No se acredita auditoría completa con lectores de pantalla, otros motores ni comprensión con estudiantes. ABI/FFI y la IA son modelos; no hay ejecución C, native addon, inferencia, agente remoto ni servidor PostgreSQL. El parser y el validador de herramientas implementan contratos acotados, no protocolos o estándares completos. No se inventan latencia, rendimiento, paquetes o trazas internas del runtime.
