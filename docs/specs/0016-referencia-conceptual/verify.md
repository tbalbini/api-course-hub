# Verificación de referencia conceptual

Fecha: 2026-10-22. Resultado: PASS, siete criterios comprobados sobre producción local nueva en el puerto3004. Se cierra el bloque18, sin acreditar por ello la verificación integral del bloque20.

## Criterios y evidencia

| Criterio | Resultado observado |
|---|---|
| AC-1 | `/reference` ofrece Glosario y Guía, metadata y navegación real. Skip link espera a que exista el contenido antes de probar Tab/Enter; main y ficha reciben foco por sus anclas.16 combinaciones a390/701/920/1440px sin desbordamiento. Menú describe glosario y guía |
| AC-2 |94 fichas con ids únicos, relaciones resueltas, temas y cobertura de capítulos0 a12.29 adaptan los textos canónicos de taxonomía, sin otra definición. Prueba de rutas y parámetros y recorrido de las94 fichas en Chromium sin errores |
| AC-3 | API, OIDC, JWT, AUTORIZACION, pila de llamadas, fs.readFile y rate limiting encuentran su término o alias. Consultas de varias palabras usan AND; filtro combinado, orden español, exactos antes de prefijos, límites indexados y cero resultados. No hay coincidencias inventadas ni regex derivada de entrada |
| AC-4 | Selección de JWT y relación OAuth conservan consulta y filtro, con Atrás/Adelante y recarga. La selección fuera del filtro continúa visible con aviso. Limpiar conserva ficha. URL inválida recupera API y descarta tema/vista desconocidos; query se acota a160. Texto con apariencia HTML no se interpreta. Consultar y cambiar vista conserva el snapshot de progreso y la última ubicación de aprendizaje |
| AC-5 | Desde una captura HTTP real se abre referencia en otra pestaña. Capture id, event id y datos del inspector permanecen; solo hay un POST, el ejecutado antes de consultar. El vínculo incluye únicamente un id editorial derivado de stage. No importa el catálogo en el reproductor y todos sus destinos contextuales existen |
| AC-6 | Guía con comandos npm actuales, POST/GET/PATCH, credenciales públicas, validación, Map200 temporal, resultado incierto, replay, procedencia, tiempo, arquitectura y progreso. Enlaces a experimentos en otra pestaña. Consultar no inicia `/api/` ni ejecuta fragmentos o comandos |
| AC-7 |19 pruebas de referencia, seis recorridos nuevos, tipos, lint, suite completa de lógica, build y suite completa de navegador pasan. Documentación, alcance y convenciones distinguen esta consulta del aprendizaje evaluado y del cierre integral |

## Comandos y runtime

- [x] `npm run typecheck`: correcto.
- [x] `npm run lint`: correcto.
- [x] `npx vitest run tests/reference.test.ts`:19 pruebas aprobadas.
- [x] `npm test`:712 pruebas aprobadas en19 archivos, incluidos cambios paralelos de desafíos. La referencia añade19 casos.
- [x] `npm run build`: correcto, con `/reference` y el resto de superficies.
- [x] `npm start -- --hostname 127.0.0.1 --port 3004`: instancia dedicada de la compilación nueva.
- [x] `npx playwright test --config=/tmp/api-universe-reference.config.cjs tests/e2e/reference.spec.ts --workers=1 --timeout=60000 --reporter=line`: seis recorridos aprobados.
- [x] `npx playwright test --config=/tmp/api-universe-reference.config.cjs --workers=1 --timeout=60000 --reporter=line`:155 pruebas aprobadas en la suite completa. Log temporal `/tmp/api-universe-reference-full-e2e.log`.
- [x] `git diff --check`: sin problemas.

La producción se compiló en `/var/folders/b9/fj8v8lss4qz6qdz480m0kzv80000gn/T/api-universe-reference-2r5j40zw`, copia aislada del árbol con dependencias instaladas, para no interferir con desarrollo u otras verificaciones. Las fuentes coinciden con el repositorio comprobado; manifest SHA256 temporal en `/tmp/api-universe-reference-evidence/source-sha256.json`. La configuración temporal apunta al testDir real, usa Chromium y baseURL3004 y desactiva webServer porque se arranca producción explícitamente. No se cambió la configuración del proyecto.

La primera pasada específica obtuvo5/6: la prueba enviaba Tab antes de que Suspense mostrase el contenido cliente. Se añadió la espera del skip link visible antes de probar el orden de foco. No se alteró la implementación para aprobar esa prueba. La repetición específica y la pasada completa pasan.

La compilación y regresiones incluyen los cambios paralelos de desafíos. Se conserva la retirada de PendingArea cuando ninguna pantalla lo necesita. Este informe cierra referencia y sus integraciones; no reemplaza la evidencia y el estado propios del bloque19.

## Inspección visual y catálogo

`/tmp/api-universe-reference-manual.cjs` recorre API, JWT filtrado, cero resultados con selección conservada y guía a390/701/920/1440px. El ledger conserva URL, tamaño, archivo y resultado.16 combinaciones, sin errores JavaScript ni solicitudes a `/api/`.

Se inspeccionaron `390-api.png`, `1440-jwt.png` y `701-guide.png` dentro de `/tmp/api-universe-reference-evidence/`. Texto, catálogo, detalle y guía se mantienen dentro de sus paneles; código desplaza internamente. El script de catálogo seleccionó las94 fichas por URL y comprobó el título renderizado, sin errores; evidencia en `catalog-render.json`. Estas capturas y logs son regenerables y no se sirven como contenido del laboratorio.

La revisión React comprobó estado derivado de URL, ausencia de efectos/fetch en búsqueda, indexación local, imports pequeños del inspector, labels, enlaces reales, lista semántica, estado de selección, anclas y foco. Se reutilizan tokens y reglas de movimiento existentes; no se añadieron dependencias, endpoints, secretos, persistencia ni otro motor de reproducción.

## Límites

Solo Chromium automatizado. No se acredita auditoría completa con lectores de pantalla, comprensión con estudiantes, otros motores ni rendimiento del producto completo. El catálogo es editorial y la búsqueda literal, sin corrección de errores de escritura ni inferencia. Los fragmentos de fichas y guía son representativos, no una consola ejecutable. La consulta permanece en URL e historial del navegador, sin almacenarse en el registro de progreso ni enviarse a un servicio de búsqueda. Abrir otra pestaña conserva el experimento mientras esa pestaña siga abierta, sin prometer persistencia de sus capturas al recargar.
