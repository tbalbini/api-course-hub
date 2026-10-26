# Verificación de API Taxonomy Explorer, spec 0005

Comprobado el 21 de octubre de 2026 en `http://127.0.0.1:3000/api-universe` contra una compilación nueva de producción local. El proceso anterior se detuvo antes de construir y arrancar el nuevo servidor.

## Criterios y fuentes de valores

- [x] AC-1. Se seleccionaron las 49 facetas de los seis ejes en navegador; todas presentaron explicación y asociaciones. La prueba de inventario contrasta los ids de cada eje con su lista completa: 5, 9, 10, 12, 4 y 9. Búsqueda sin acentos o mayúsculas, filtros AND, cero resultados, limpieza y selección conservada funcionaron. Fuentes: `tests/taxonomy.test.ts` y primeras dos pruebas en `tests/e2e/taxonomy.spec.ts`.
- [x] AC-2. El mapa y su equivalente textual distinguen definido y posible. REST no fija audiencia, GraphQL admite uso local y remoto, JSON no recibe ubicación propia y OpenAPI se identifica como descripción. El perfil de pedidos conserva ocho etiquetas simultáneas, incluidas audiencia privada y credenciales; el texto explica que público también puede exigirlas. Fuentes: pruebas de dimensiones, tercera prueba de navegador y `test-results/taxonomy-map-final.png`.
- [x] AC-3. Se inspeccionaron las 29 fichas en el navegador, comprobando nombre, mapa y código. Integridad comprueba problemas, definiciones, mecanismos, compromisos, límites, alternativas y referencias de cada ficha. Se probaron enlaces de relación y alternativa que actualizan selección y comparación. Los ejemplos no se ejecutan. Fuentes: pruebas por ficha y recorrido adicional registrado con 29 inspecciones, cero errores JavaScript y cero solicitudes durante la exploración.
- [x] AC-4. REST/HTTP, GraphQL/TCP, WebSocket/webhook, JSON/OpenAPI y HTTP/TCP muestran cruce de categorías o capas y conservan explicación al invertir A/B. Igualdad ofrece feedback específico. La tabla presenta categoría, capa, seis ejes, mecanismo y límites, sin puntuaciones inventadas. Fuentes: pruebas comparativas, cuarta prueba de navegador y `test-results/taxonomy-comparison-final.png`.
- [x] AC-5. Clasificar REST como formato da explicación de su responsabilidad arquitectónica. Resolver cinco filas obtiene 5/5 y permite reintento. No cambia localStorage del progreso de capítulos. Durante búsqueda, selección de fichas, relaciones, alternativas y perfil no hubo solicitudes. Fuentes: quinta prueba de navegador, pruebas de evaluación y recorrido adicional.
- [x] AC-6. El mapa recibe foco por teclado y activa el selector nativo del eje. En 390 × 844, mapa y tabla mantienen desplazamiento interno sin desbordar página. Se navegó a primeros principios y pasaron todas las pruebas previas de compra, red y aprendizaje. Fuentes: sexta prueba nueva, suite completa y comprobación adicional de cuatro selecciones móviles.

## Evidencia adicional

La comprobación interactiva recorrió las 29 opciones del selector A, verificó el mapa correspondiente y código no vacío, abrió REST → HTTP como relación y HTTP → WebSocket como alternativa de diseño, y aplicó JSON desde el perfil. Resultado registrado: 29 fichas, ningún error de página y ninguna solicitud durante la exploración. Se comprobaron REST, OpenAPI, WebSocket y GraphQL a 390 px, sin desbordamiento horizontal.

Se inspeccionaron visualmente `test-results/taxonomy-map-final.png`, `test-results/taxonomy-comparison-final.png` y `test-results/taxonomy-viewport-final.png`. Las capturas no forman parte del código versionado y se limpian al ejecutar otra suite de Playwright.

La primera prueba comparativa detectó que una etiqueta envolvía las opciones del select y no tenía el nombre accesible exacto esperado. Se separaron label y select con htmlFor/id, tanto en comparación como en filtros. La prueba mantuvo coincidencia exacta y pasó después de reconstruir la aplicación.

## Comandos

- [x] `npm test`: 173 pruebas de lógica y servidor, cinco archivos, correctas.
- [x] `npm run test:e2e`: 21 pruebas Chromium correctas, seis nuevas y las quince anteriores.
- [x] `npm run typecheck`: correcto; el build final también ejecutó TypeScript correctamente.
- [x] `npm run lint`: correcto.
- [x] `npm run build`: correcto; `/api-universe` generado y rutas anteriores conservadas.
- [x] `git diff --check`: sin problemas de espacios.

## Límites

Las asociaciones son editoriales y no exhaustivas; no se infiere incompatibilidad de una ausencia. Las fichas y sus fragmentos explican mecanismos, no ejecutan cada tecnología. Solo se comprobó Chromium, escritorio, móvil y teclado. No se verificaron otros motores, lectores de pantalla ni aprendizaje con estudiantes.

El Comparative Engine con el mismo pedido y los capítulos 4 a 12 siguen pendientes. El mapa no se anuncia como esos laboratorios ni como una certificación de conformidad REST del endpoint de la aplicación.
