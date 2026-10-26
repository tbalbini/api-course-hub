# Verificación del primer recorrido

Fecha: 2026-10-21. Alcance: spec 0002, no el producto completo.

## Comprobaciones ejecutadas

- [x] `npm run typecheck`, salida 0, contratos y rutas tipados.
- [x] `npm run lint`, salida 0. Se excluyen artefactos de pruebas del recorrido del linter.
- [x] `npm test`, 38 pruebas de lógica y servidor aprobadas.
- [x] `npm run test:e2e`, 5 recorridos Chromium aprobados, servidor iniciado por Playwright.
- [x] `npm run build`, compilación de producción aprobada, páginas `/` y `/follow-the-click`, endpoints dinámicos de pedidos.
- [x] `npm start -- --hostname 127.0.0.1`, versión de producción iniciada y ejercitada con Chromium y peticiones HTTP.

## Acceptance criteria coverage

| Criterio | Resultado observado | Evidencia |
|---|---|---|
| AC-1 | POST real devuelve 201, tres unidades producen totalMinor 26700; GET del mismo pedido devuelve 200; favoritos no aumenta las solicitudes API | Recorrido Chromium de producción en `/follow-the-click` y prueba de compra en `tests/e2e/click-lab.spec.ts` |
| AC-2 | Sin credencial devuelve 401 y lector devuelve 403; no aparece persistencia en sus trazas; JSON, tamaño, tipos y campos adicionales se rechazan antes de escribir | Prueba de acceso del navegador y `tests/orders.test.ts` |
| AC-3 | Tras procesar la primera petición se aborta su respuesta en el navegador; reintentar usa clave y payload idénticos, devuelve 200 y el mismo id; dos solicitudes concurrentes también producen un solo registro | Prueba de respuesta perdida del navegador y prueba concurrente del endpoint |
| AC-4 | Play avanza realmente el cursor; pausa, paso siguiente, anterior, replay, velocidad 4 y selección directa funcionan sin nuevos POST; comparar muestra dos listas y cerrar las oculta | Recorrido Chromium de producción, pruebas de reproducción y captura local, prueba pura del reducer |
| AC-5 | Se ejecutaron los doce escenarios en el navegador, con 14, 12, 12, 10, 11, 12, 13, 13, 13, 11, 5 y 21 eventos respectivamente; timeout y fallo de red no tienen respuesta HTTP; todas las simulaciones juntas hicieron cero llamadas API | Recorrido de producción y `tests/trace.test.ts`; los recuentos indican pasos, no rendimiento |
| AC-6 | La traza real registra instrumentación observada y duración de fetch y parsing; la simulación declara procedencia conceptual, no medición; la acción local no cruza red | Inspección de tipos, paneles y diagrama durante los recorridos, pruebas de procedencia y fronteras |
| AC-7 | Apagar X Ray oculta metadatos; activarlo los recupera; cambiar a Internals mantiene el evento; los paneles de código, intercambio e input y output muestran datos | Inspección Chromium de producción y prueba de cambio de profundidad en el navegador |
| AC-8 | Escritorio y móvil de 390 píxeles no desbordan la página; el diagrama desplaza su contenido internamente; skip link mueve foco al main; las capturas permanecen pausadas con reducción de movimiento | `test-results/mobile.png`, prueba móvil, comprobación de foco y capturas visuales revisadas |

La última ejecución de `npm run test:e2e` reutilizó el servidor de producción local y aprobó los cinco recorridos. `test-results/desktop.png` muestra la consola inicial y `test-results/mobile.png` su disposición móvil. Los artefactos en `test-results/` son temporales y están excluidos de Git. La suite permite volver a generar capturas de escritorio y móvil. Durante la comprobación de producción no se observaron errores JavaScript de página.

## Fuentes de valores comprobadas

El total se obtuvo de la respuesta del servidor y se contrastó con cantidad tres por precio 8900. Estado, headers y body se leyeron del Response real. El identificador devuelto permitió consultar el mismo pedido. El header X-Trace-Id coincidió con el cuerpo en las pruebas de endpoint. Las fechas proceden del reloj servidor y solo se inspeccionaron como campos de la respuesta, no como mediciones de transporte. La duración observada se mostró separada del orden lógico. El error de conectividad se probó abortando una respuesta ya procesada.

## Límites y pendientes

No se verificaron otros navegadores, lectores de pantalla reales, aprendizaje con estudiantes, despliegue remoto, coordinación entre instancias ni durabilidad. La memoria temporal y las credenciales públicas son límites deliberados de esta demostración. Los avisos de dependencias de desarrollo se describen en README.

Los bloques de modelo educativo completo, navegación de las ocho áreas, X Ray transversal, currículo, taxonomía, playground, desafíos y Systems Lab siguen pendientes o en progreso según `docs/scope/index.md`. Este resultado no los marca como completos.
