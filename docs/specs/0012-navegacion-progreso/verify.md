# Verificación de navegación y progreso, spec 0012

Comprobado el 22 de octubre de 2026 en producción local, puerto 3002, separado del servidor de desarrollo y de otros trabajos concurrentes. Resultado: PASS, seis criterios comprobados y bloque 4 cerrado.

## Criterios y evidencia

- AC-1. La home conserva compra real y favoritos locales, con entrada directa a una función local. `/course` muestra trece capítulos, once disponibles, estados y ocho áreas. El estado inicial invita a empezar; después ofrece continuar. Las pruebas conservan logros antiguos y comprueban que visitar o elegir una respuesta sin comprobar no completa actividades.
- AC-2. Menú con resumen, bloques temáticos, capítulos numerados, prácticas y herramientas. En móvil los bloques se desplazan en una franja. Sistemas conserva el trabajo paralelo. Desafíos y referencia ofrecen estado pendiente, alcance futuro y enlaces a experiencias disponibles; no se sustituyen sus bloques de contenido por páginas vacías.
- AC-3. `tests/course-progress.test.ts` cubre datos inválidos, versiones, filtrado, progresión parcial, finalización y conservación sin mutación. `tests/e2e/course.spec.ts` comprueba formato anterior intacto, actividades y quiz tras recargar, comparación y resumen combinado. Las pruebas de HTTP, eventos, seguridad y contratos también recargan después de completar y comprueban el logro recuperado. Sistemas usa los mismos objetivos y aparece correctamente en el resumen.
- AC-4. Se recuperan pestaña y profundidad. Se filtran destinos externos, rutas API, query arbitraria y versiones desconocidas. Un evento storage actualiza el resumen sin recargar. Con getItem/setItem bloqueados se anuncia modo de sesión y los logros sobreviven a navegación dentro de la página. No se guarda una captura, un pedido o un borrador HTTP, ni se ejecutan peticiones por continuar o cambiar profundidad.
- AC-5. Comprobados teclado, skip link, foco visible, nombres y descripciones, estados textuales, landmarks y árbol de accesibilidad de Chromium. Contraste mínimo 6,17:1 para texto y 3,42:1 para borde de controles en las superficies revisadas. Nuevas páginas comprobadas a 390, 701, 920 y 1440px, sin desbordamiento. Capturas de escritorio y móvil inspeccionadas visualmente. La pantalla de carga se observó durante navegación;404 ofrece salida al recorrido. Se provocó un fallo controlado del render en un navegador aislado y `Reintentar carga` recuperó el laboratorio. Se comprobó reducción de movimiento.
- AC-6. Tipos, ESLint, Vitest y compilación de producción pasan. La pasada final completa de Playwright también pasa.

## Comprobaciones

`npm run typecheck`, `npm run lint`, `npm test` (545 pruebas) y `npm run build` pasan. La suite final completa pasa 89 casos en producción local; incluye recuperación de logros y un recorrido del comparador. Una carrera de la prueba de Anatomy seleccionaba un control compartido antes de completar el cambio de capítulo; ahora espera su encabezado antes de interactuar, sin sleeps ni cambios al modelo.

La comprobación adicional recorre doce combinaciones de página y tamaño, sin avisos de hidratación, errores JavaScript ni solicitudes automáticas a `/api/`. Evidencia temporal: `/tmp/api-course-phase2-desktop.png`, `api-course-phase2-mobile.png`, `api-course-phase2-reference.png` y `api-course-phase2-final.png`. Las capturas son regenerables y no forman parte del contenido de la aplicación.

## Límites

Pruebas automatizadas y árbol accesible en Chromium. No se acredita una auditoría manual completa con VoiceOver, otros navegadores o comprensión con estudiantes. El progreso es editable y local al origen y dispositivo; no certifica conocimientos ni se sincroniza entre equipos. En la comprobación inicial, los contenidos completos de desafíos y referencia y los capítulos 11 y 12 estaban pendientes. El capítulo 11 se verifica después en la [spec 0013](../0013-proyecto-pedidos/verify.md); los demás contenidos siguen pendientes.

## Revisión de navegación por áreas

La jerarquía aprobada en `docs/scope/index.md` se aplica al menú y a `/course`: Bases, Recorrido central, Aprendizaje y mapa, Laboratorios, y Progreso y evaluación. Solo un área se despliega a la vez. El acceso directo abre el área de la página; explorar otras no abandona el experimento. En móvil y tablet un selector nativo muestra únicamente los destinos del área elegida. El programa del curso conserva los trece capítulos en orden y se presenta por separado.

La prueba de navegación recorre trece destinos a390,701,768,920 y1440px, 65 combinaciones. Comprueba el área abierta, un único enlace actual visible, ausencia de desbordamiento, los cinco accesos y los nombres y números accesibles. También comprueba teclado, plegado, Atrás y Adelante entre áreas. Las prácticas GraphQL/RPC conservan su relación con el capítulo6 y pertenecen a Laboratorios; el comparador permanece en Aprendizaje y mapa.

La suite completa de Chromium pasa99 pruebas contra una compilación de producción local. Las pruebas conservan borradores y logros, recuperan pestaña y profundidad, admiten almacenamiento bloqueado y comprueban que navegar o reproducir no envía HTTP de negocio. Una comprobación adicional de26 combinaciones (trece destinos a390 y1440px) no encontró errores JavaScript, avisos de hidratación, desbordamiento ni solicitudes automáticas a `/api/`. Se inspeccionaron capturas de escritorio, móvil y recorrido, además del árbol accesible del selector.

La última compilación, su comprobación TypeScript, ESLint y609 pruebas de lógica pasan después de incorporar cambios paralelos. Sobre esa última compilación se repiten y aprueban28 pruebas de navegación, progreso y seguridad. La navegación conserva las rutas, contratos y formatos de progreso existentes. Las capturas temporales están en `/tmp/api-course-navigation-desktop.png`, `/tmp/api-course-navigation-mobile.png` y `/tmp/api-course-navigation-course.png`. No se realizó una auditoría manual completa de lectores de pantalla ni se acreditaron otros navegadores.

## Corrección de jerarquía, legibilidad y continuidad

Revisión del 22 de octubre de 2026, solicitada después del cierre inicial del bloque 4. Las verificaciones anteriores no detectaron los problemas siguientes. Sus resultados históricos no acreditan estos aspectos antes de la corrección.

| Problema comprobado | Causa | Corrección |
|---|---|---|
| El programa quedaba detrás de cinco tarjetas de exploración | La composición priorizaba áreas sobre el recorrido de aprendizaje | Título directo, resumen compacto y programa antes de las áreas |
| El acceso al progreso desaparecía al explorar otra área | El resumen estaba dentro del grupo plegable Progreso y evaluación | Un único acceso común antes de los grupos, visible en todas las áreas |
| Los títulos del menú bajaban a 10 px en móvil | Reglas comunes y varias excepciones reducían el texto | Títulos de navegación de 13 px, prácticas y detalles de 12 px, con espacio lateral suficiente |
| Las acciones del resumen tenían anchos y alineación distintos | El botón principal heredaba los márgenes del formulario de compra | Márgenes propios del contexto y dos columnas en móvil |
| Un snapshot de otra pestaña podía borrar logros conocidos | Ambas lecturas de almacenamiento reemplazaban el estado anterior | Unión de actividades y evaluaciones, sin mutar los snapshots ni perder logros ante una lectura inválida |

Las dos primeras pruebas de `tests/e2e/course-regressions.spec.ts` fallaron antes de aplicar la corrección. Una comprobó la prioridad del programa; otra reprodujo que un capítulo completado pasara de 1 a 0 después de escribir progreso parcial desde una segunda pestaña. La suite añade una comprobación equivalente para primeros principios. `tests/course-progress.test.ts` y `tests/learning.test.ts` comprueban la unión, el contexto y la inmutabilidad de ambos formatos.

El resumen también informa cuántos capítulos están en curso. Completar sigue exigiendo actividades y razonamiento comprobados. Las claves, versiones, rutas permitidas y límites de almacenamiento se conservan. No se guardan pedidos, credenciales ni capturas, ni se ejecutan operaciones de negocio al navegar.

La comprobación usa una compilación nueva servida en `http://127.0.0.1:3138`, separada de los servidores existentes. La pasada inicial sobre desarrollo devolvía partes antiguas de la interfaz y no se toma como evidencia final. Una primera pasada general detectó además selectores ambiguos en las nuevas pruebas del capítulo 12; se acotaron al nombre exacto del campo y al mensaje de error, conservando sus expectativas.

Se inspeccionaron capturas de escritorio y móvil generadas por la prueba de jerarquía. Las capturas regenerables `recorrido-desktop.png`, `recorrido-mobile.png` y `recorrido-mobile-viewport.png` quedan en el directorio de resultados de esa prueba. El menú se comprueba a 390, 701, 920 y 1440 px; la regresión general añade 768 px y recorre trece destinos. Las comprobaciones conservan teclado, historial, borradores, profundidad y sesión sin almacenamiento.

La revisión de los componentes comprobó claves estables, encabezados y regiones con nombre, un único enlace actual, selección accesible y snapshots estables para `useSyncExternalStore`. Los contadores proceden del catálogo y de logros evaluados; no se deducen del DOM ni de visitas. No se añadieron dependencias ni otro sistema visual.

Resultado final: `npm test` aprueba 669 pruebas de lógica y servidor. `npm run typecheck`, `npm run lint` y `npm run build` pasan. La suite completa de Chromium aprueba 142 casos sobre la compilación nueva, con dos workers y sin reintentos configurados. Comando de navegador: `npx playwright test -c /tmp/api-course-point4-playwright.config.mts --workers=2 --reporter=dot`. La configuración temporal importa la del repositorio y solo ajusta baseURL, testDir, outputDir y desactiva webServer porque la compilación ya está servida. Para repetir puedes servir la compilación actual y ejecutar las pruebas contra ese mismo origen.

La evidencia visual y automatizada cubre Chromium. No acredita una auditoría completa con VoiceOver ni pruebas de comprensión con estudiantes.
