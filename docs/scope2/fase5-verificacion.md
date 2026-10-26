# Fase5, contraste y regresión de la entrega

23 de octubre de2026. Verificación técnica favorable sobre la versión identificada abajo. El cierre integral sigue pendiente de los cinco resultados humanos de la [fase4](../specs/0020-validacion-pedagogica/verify.md). No se marca completo el bloque20 original ni se afirma fidelidad histórica literal al orden de construcción del Master Prompt.

## Qué se entregó

La [matriz](fase5-matriz.md) contrasta las secciones1 a19 en151 puntos identificados. Incluye los trece capítulos, sus nueve elementos pedagógicos, las49 facetas, los diez laboratorios, las vistas de Follow the Click, X Ray, motor causal, comparación, desafíos, ingeniería, precisión y entregables. Cada punto identifica superficie, comprobación, resultado y límite. No se usan los dieciséis principios de precisión como sustituto del prompt entero.

Se revisaron contenido, modelos, componentes, contratos y pruebas conectadas. No se encontraron nuevas superficies obligatorias anunciadas como construidas que fueran placeholders en este corte. Se corrigió una frase de disponibilidad en [ClickLab](../../src/components/click-lab.tsx): informa que falta validación de comprensión con participantes, sin seguir anunciando pendiente la revisión técnica ya realizada. No cambian operaciones, navegación, progreso ni efectos.

README, alcance y registros de entrega distinguen esta comprobación de las históricas. El orden literal de las siete fases del prompt no queda acreditado: el proyecto se construyó por recorridos y consolidó capacidades después, entre ellas X Ray transversal. La matriz lo registra como límite histórico, no como una función que se pueda reparar retroactivamente.

## Versión y entorno

Producción nueva con BUILD_ID `deOrT0Ey4XwSyYwPxrQ_g`. Huella SHA256 de172 fuentes: `4c052012880a0287f31d0d8b82b239175870207fda53600a50602672d1a264dc`.

El [manifiesto](evidence/fase5/manifest.json) conserva ruta y SHA256 de cada archivo. La huella agrega, en orden de ruta, `ruta + NUL + SHA256(contenido) + LF`. Incluye las167 rutas históricas y las cinco fuentes añadidas en fase2. Se comprobó que no queda ningún archivo TypeScript/JavaScript de src, tests o scripts fuera de la lista. Excluye documentación, resultados, dependencias y JSON generado. Los14 archivos del visor generado coinciden exactamente con sus fuentes y hashes.

macOS26.6.2 arm64, Node24.14.0, npm11.9.0, Next16.4.2, React19.3.0, Vitest5.0.5 y Playwright1.64.1. Navegadores: Chromium156.0.8078.4, Firefox157.0 y WebKit27.2. Se usaron las dependencias instaladas; esta pasada no repite `npm ci`. La instalación limpia anterior permanece identificada en la [spec0018](../specs/0018-verificacion-entrega/verify.md).

## Comandos y resultados actuales

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Aprobado. Fuentes y tipos de rutas regenerados; TypeScript sin errores. |
| `npm run lint` | Aprobado, sin diagnósticos. |
| `npm test -- --reporter=dot` |20 archivos,758 casos aprobados. |
| `npm run build` | Aprobado,22 rutas generadas o registradas. |
| `npm run test:delivery` |215 aprobados:181 Chromium,17 Firefox,17 WebKit. Sin omitidos, inesperados, inestables o errores globales. |
| `npm audit --json` | Cero vulnerabilidades declaradas para el lockfile. Sin cambios de dependencias. |

La ejecución final de navegador comenzó a las17:13:02 UTC y duró197013ms, aproximadamente3.3min. Chromium ejecutó toda la suite; Firefox/WebKit, los17 casos esenciales de entrega cada uno. La configuración arrancó un servidor exclusivo en3100, con reutilización desactivada, después de la compilación; no se usó desarrollo.

Antes del ajuste de texto hubo otra pasada favorable de758/215 sobre la huella anterior `64c29b874ba103e829a8af86d11529d662861a777f1e33ecf37a6ba7bcc5b6a4`. Se recompiló y repitieron las comprobaciones después del cambio para acreditar fuentes coincidentes. Son cortes separados, no430 casos distintos. [results.json](evidence/fase5/results.json) conserva el resumen del corte previo y los casos individuales del final, además de versiones, extractos y huellas de los logs.

No se añadieron pruebas que solo reprodujeran el texto nuevo. Las regresiones existentes y la comprobación directa de la frase cubren este ajuste reversible.

## Observación directa adicional

Se arrancó otra vez la misma producción exclusiva después de la suite y se operó mediante Chromium. El [registro](evidence/fase5/direct.json) identifica la misma huella y BUILD_ID y conserva acciones de API, ids ficticios, resultados y ausencia de errores JavaScript.

| Id | URL y acciones observadas | Resultado |
|---|---|---|
| D1 | `/follow-the-click`: abrir límites, favoritos, compra cantidad2, escritura y tres profundidades, editar sin ejecutar, replay, compra cantidad3 e inspeccionar captura anterior | Dos POST201. Favoritos y replay no añadieron HTTP. El panel volvió a la escritura de cantidad2 y conservó formulario y último pedido real de cantidad3. Texto público actualizado. |
| D2 | `/first-principles?chapter=2`: activar B mediante teclado y cambiar DOM; abrir capítulo3 y seleccionar IPC en Anatomy | B llega al ancla correcta; DOM cambia sin HTTP. Anatomy conserva sus dos procesos locales y aclara que no requiere internet. |
| D3 | `/systems`:200ms de trabajo simulado y timeout50ms, seleccionar finalización tardía y profundidad Internals; abrir capítulo12 sin responder | El proveedor termina después del timeout; el inspector identifica el servicio. El capítulo sigue con0/12 comprobaciones, sin acreditar una visita. Sin solicitudes de API. |

Capturas inspeccionadas: [compra1440](evidence/fase5/click-desktop.png), [SQL390](evidence/fase5/sql-mobile.png) y [Anatomy390](evidence/fase5/anatomy-mobile.png). Texto y etiquetas resultan legibles y no hay desbordamiento de página; SQL desplaza dentro de su panel. Son observaciones de interacción y presentación, no una prueba humana de comprensión.

Un primer ensayo de D3 antes de ajustar el texto usó el nombre incorrecto «Ejecutar lote modelado» en su selector. Se corrigió a «Ejecutar lote», el nombre existente, y se repitió con éxito. No se cambió un control de aplicación para acomodar esa prueba. El registro final corresponde a los recorridos aprobados de la compilación final.

## Cobertura y límites

La suite de entrega comprueba135 combinaciones de15 rutas, tres tamaños y tres motores. Registra18 operaciones reales con201/200/200/200/403/401,31 pares de contraste por motor y45 snapshots iniciales accesibles. [results.json](evidence/fase5/results.json) conserva mediciones, operaciones, ratios y huellas de esos snapshots; el contenido bruto de los snapshots está en el informe local de Playwright, reemplazable en ejecuciones futuras.

El contraste mínimo de los pares comprobados es6.17:1 para texto y3.42:1 para borde de control. Se comprueban idioma español, roles/nombres, foco, salto al contenido, anclas, ausencia de errores y solicitudes de negocio al abrir, reducción de movimiento y controles mediante teclado. Las suites de laboratorio añaden estados y recorridos específicos. Esto no equivale a conformidad WCAG completa, todos los lectores o todos los píxeles/estados.

| Motor, primeras navegaciones1440 | TTFB mínimo/mediana/máximo, ms | DCL mínimo/mediana/máximo, ms | Bytes JS codificados mínimo/máximo |
|---|---|---|---|
| Chromium |1 /1.2 /3 |15.7 /22.4 /33.1 |174677 /303552 |
| Firefox |1 /2 /13 |23 /35 /128 |174677 /303552 |
| WebKit |1 /2 /21 |17 /20 /115 |174933 /303994 |

Cada ruta usa un contexto nuevo:1440 es su primera navegación;701 y390 reutilizan caché. El proceso puede estar caliente. No hay throttling ni carga; las medianas entre rutas distintas son descriptivas. TTFB es `responseStart-requestStart`; DCL es `domContentLoadedEventEnd` y no garantiza hidratación. Bytes suma `encodedBodySize` de scripts Next, no tráfico efectivo, coste de parseo ni rendimiento del modelo. Los ceros que pueda exponer Performance en caché no significan coste nulo.

## Contraste de la spec0018 y cierre

| Criterio | Evidencia actual y límite |
|---|---|
| AC-1 | Tipos, lint, generación, lógica, build y arranque aprobados en Node24. La instalación limpia es evidencia histórica identificada, no repetida aquí. |
| AC-2 |758 pruebas y215 recorridos actuales: permisos, validación, duplicados, incertidumbre, captura, replay y progreso, con fuentes coincidentes. |
| AC-3 | Teclado, foco, nombres, tamaños, contraste y reducción de movimiento comprobados en la cobertura indicada. Confirmación humana de VoiceOver conservada de su sesión anterior, sin ampliar su alcance. |
| AC-4 | Quince rutas públicas con contenido y anclas, sin errores o solicitudes de negocio al abrir; acciones y feedback ejercitados por sus suites. |
| AC-5 | HTTP real, favoritos/replay, causalidad, implementación y precisión comprobados. Las cinco pruebas de comprensión con participantes siguen pendientes. |
| AC-6 |135 mediciones de navegación y18 operaciones identificadas, con límites locales explícitos; sin estimaciones inventadas de producción. |
| AC-7 | Matriz, instrucciones, manifiesto y resultados actuales entregados. Cierre global pendiente porque AC-5 aún requiere evidencia humana. |

De los siete hallazgos originales, los seis de software, contenido, SQL, etiquetas y estado público están corregidos y comprobados. El séptimo requiere las sesiones de fase4: su protocolo está preparado, pero se conservan cero personas observadas y cero de cinco resultados humanos acreditados.

Las dos primeras casillas técnicas del bloque8 quedan completas. La aceptación global del bloque8, el bloque7 y el bloque20 original permanecen en curso. Cuando lleguen resultados humanos, se revisarán las dificultades, se corregirá lo necesario y se repetirá la regresión afectada sobre la versión que realmente se vaya a entregar. Esta pasada no anticipa el resultado de esas sesiones.

La comprobación documental final resolvió251 enlaces locales en once documentos, verificó los151 ids únicos y las19 secciones de la matriz y confirmó la concordancia entre manifiesto, informe, observación directa y fuentes actuales. Las specs0018/0020 y los bloques7/8 conservan su estado en curso. Se corrigió una línea de contexto de AGENTS.md mediante sync, sin cambiar reglas de implementación ni decisiones del proyecto. `git diff --check` pasó.

No se repitió instalación limpia, lector de pantalla humano o prueba con estudiantes. Tampoco se comprobó carga de producción, infraestructura remota o durabilidad del Map. No se publicaron cambios ni se crearon commits. Los servidores exclusivos y navegadores del ensayo se cerraron al terminar.
