# Verificación integral de entrega · spec0018

Fecha:22 de octubre de2026, hora de Lima. La evidencia identifica la instalación y el build de esta pasada. No convierte resultados históricos en comprobaciones actuales.

**Estado actualizado el23 de octubre: cierre integral en curso.** Esta pasada documentó una entrega técnica y una revisión editorial favorable de dieciséis puntos, más la confirmación humana acotada del lector. El contraste posterior con el Master Prompt completo descubrió incoherencias de explicaciones y una afirmación de cierre demasiado amplia. Las correcciones se siguen en [scope2](../../scope2/index.md). La [fase5](../../scope2/fase5-verificacion.md) ya registra matriz de las secciones1 a19 y una nueva regresión de758/215 sobre fuentes coincidentes; el bloque20 y esta spec conservan `in-progress` por la comprensión con participantes todavía sin acreditar. La evidencia de esta pasada se conserva sin presentarla como validación actual de toda la app.

## Entorno y repetición

macOS26.6.2, arm64, AppleM1. Node24.14.0 y npm11.9.0. Next16.4.2, React19.3.0, Vitest5.0.5 y Playwright1.64.1, fijados por el lockfile. Chromium156.0.8078.4, Firefox157.0 y WebKit27.2.

La copia temporal se creó desde las fuentes de trabajo, excluyendo `.git`, `node_modules`, `.next`, resultados y archivos `.env`. `npm ci` se ejecutó allí con Node24. La primera instalación seleccionó Node20 por la configuración local de shell; no se usó como evidencia de compatibilidad y se repitió fijando el PATH de Node24. Ningún servidor del usuario se detuvo ni se reutilizó.

```sh
npm ci
npm run typecheck
npm run lint
npm test -- --reporter=dot
npx playwright install chromium firefox webkit
npm run build
npm run test:delivery
```

`playwright.delivery.config.ts` arranca `npm start` en3100 con `reuseExistingServer:false`. El puerto debe estar libre. Chromium ejecuta todas las pruebas; Firefox y WebKit solo las17 comprobaciones nuevas de entrega. La suite normal conserva su configuración de desarrollo en3000.

## Comprobaciones y cobertura de la pasada histórica

- [x] Instalación nueva con el lockfile y Node24 (AC-1).
- [x] Generación de14 fuentes, tipos y lint correctos (AC-1).
- [x] Vitest:19 archivos y712 pruebas correctas (AC-1, AC-2).
- [x] Build optimizado correcto y `npm start` respondiendo desde producción nueva (AC-1).
- [x] Registrar el resultado final de206 casos de navegador:172 Chromium,17 Firefox y17 WebKit (AC-2, AC-4).
- [x] Consolidar135 navegaciones,18 solicitudes HTTP,31 pares de contraste por motor y capturas (AC-3, AC-6).
- [x] Revisar las ocho comprobaciones de calidad con evidencia técnica y límites separados (AC-5).
- [x] Flujo esencial de lector confirmado por el usuario: campos, resultados400/201/403 y corrección con teclado (AC-3).
- [x] Recuperar la sección15 del prompt original y contrastar sus quince distinciones y regla de simplificación como P01aP16 (AC-5).
- [x] Completar la verificación de entrega, documentando fuente y límites de cada resultado (AC-7).

La suite de lógica cubre estados, eventos y replay en `trace`, `learning`, `network`, `network-lab`, `comparison`, `events`, `systems` y `advanced`; contratos y validación en `orders`, `http`, `contracts` y `order-receipt`; acceso en `security` y `orders`; progreso en `learning`, `course-progress` y `challenges`; taxonomía, referencia e interacción en sus archivos respectivos. Los casos reales de navegador complementan esas pruebas puras y de handlers.

La pasada completa aprobó176 casos y detectó30 errores en la preparación de las pruebas nuevas: Firefox expone304 al revalidar navegación cacheada y WebKit de macOS usa Option+Tab para incluir enlaces. Se corrigieron esas expectativas y se repitieron solo los30 casos afectados con `npm run test:delivery -- --last-failed`:30/30 correctos en53.4s. El agregado es206 casos distintos comprobados, sin fallos pendientes. No se afirma que la primera pasada estuviera completamente verde. No se cambió código de aplicación para obtener este resultado.

Durante el desarrollo de la suite también se corrigieron la espera de la navegación tras la pantalla de carga, el reinicio del foco entre tamaños y el selector de favoritos, cuyo nombre incluye SOLO LOCAL. Tipos y lint se repitieron sobre la versión final de pruebas y configuración y pasaron.

## Resultado por criterio de la pasada histórica

Esta matriz registra la evaluación del22 de octubre. Su revisión técnica de las ocho comprobaciones no acredita los cinco resultados de comprensión humana del prompt. El cierre actual está pendiente según el estado indicado arriba.

| Criterio | Resultado | Evidencia |
|---|---|---|
| AC-1 | Comprobado | Instalación limpia,14 fuentes generadas, tipos, lint,712 pruebas, build y arranque observados |
| AC-2 | Comprobado |206 casos distintos correctos y712 pruebas de lógica/servidor; lista por motor en results.json |
| AC-3 | Comprobado en las tareas documentadas |135 combinaciones de ruta/tamaño/motor, semántica, foco, contraste y movimiento. El usuario confirmó lectura de campos y anuncios400/201/403, con corrección por teclado |
| AC-4 | Comprobado en los escenarios cubiertos | Quince rutas con contenido, nombres y anclas, sin errores ni `/api/` al abrir; controles/feedback de suites por recorrido |
| AC-5 | Comprobado en la revisión técnica documentada | POST/GET/PATCH, permisos, replay, ocho comprobaciones y contraste16/16 con la sección original recuperada en precision.md |
| AC-6 | Comprobado con límites locales |135 muestras de navegación y18 solicitudes identificadas, sin extrapolación de carga ni SLA |
| AC-7 | Documentación inicial conservada; cierre actual pendiente | README, configuración, pruebas, manifiesto, revisión original y resultado humano del lector. El contraste posterior reabre el estado del alcance y la spec |

## Evidencias conservadas

[results.json](evidence/results.json) conserva resultados por caso, ambas ejecuciones, versiones,135 muestras,18 solicitudes y contrastes. [accessible-content.json](evidence/accessible-content.json) conserva45 snapshots iniciales de main390, quince por motor. [manifest.json](evidence/manifest.json) fija SHA256 de167 archivos de aplicación, scripts, tests, manifiestos y configuración; se comprobó igualdad byte a byte entre workspace y copia probada. Excluye el JSON generado, que se regenera desde sus14 fuentes fijas, y documentación.

Capturas de POST201 real sobre el mismo build: [página1440](evidence/click-desktop.png) e [inspector390](evidence/click-mobile.png). Los resultados brutos de Playwright permanecen en `test-results/` de la copia temporal; el informe JSON normal de una repetición reemplaza el de la ejecución anterior. La evidencia seleccionada aquí permanece aunque desaparezca esa carpeta temporal.

La continuación recupera la [fuente original y el contraste de precisión](precision.md), y registra el [intento de VoiceOver y la confirmación humana posterior](reader.md). Se volvió a comparar el manifiesto antes de la revisión:167/167 archivos seguían idénticos. No se repitieron suites sin cambios de código ni se presentan las ejecuciones anteriores como nuevas.

## Ocho comprobaciones de calidad

Cada resultado de esta matriz significa revisión técnica favorable del mecanismo indicado. No significa que estudiantes de esos perfiles hayan demostrado comprensión.

| Comprobación | Ejercicio y evidencia de esta pasada | Resultado y límite |
|---|---|---|
| Principiante | `/first-principles?chapter=0`: ejecución real20+22→42; respuesta errónea explica por qué URL no es requisito; correcta completa el capítulo. Observado en Chrome nativo y en `foundations.spec.ts` | La capacidad local y el feedback existen. No hubo estudio con principiantes ni prueba de comprensión independiente |
| Desarrollador junior | `click-lab.spec.ts`, `playground.spec.ts` y `project.spec.ts`: POST201,401/403, JSON inválido, Response parcial y recuperación tras respuesta perdida | Requests, errores e incertidumbre son inspeccionables. No acredita aprendizaje de una persona |
| Backend | `contracts.spec.ts` y `security.spec.ts`: schema frente a regla de negocio, compatibilidad en dos direcciones, coexistencia de v1, permisos y challenge | Diferencias operan en fixtures y HTTP local donde se indica; OAuth y criptografía siguen conceptuales |
| Arquitecto | `systems.spec.ts`: módulos y fronteras, inventario opcional, timeout con finalización tardía, circuito, caché y recuperación de saga/2PC | El cambio de arquitectura modifica resultados del modelo. No es infraestructura distribuida real |
| Visual | Compra real en Chrome nativo: inspector muestra POST `/api/orders`,201 y traza real. Favoritos y replay sin requests en `click-lab.spec.ts` y `delivery.spec.ts` | Distingue operación HTTP de local y reproducción. Flechas expresan topología, sin capturar paquetes |
| Causalidad | `interaction.test.ts`, `trace.test.ts`, `xray.spec.ts`: ids, dependencias, mecanismo declarado, selección y profundidad conservadas. `events.spec.ts` y `systems.spec.ts` conservan ramas propias | Los eventos se conectan con causas del productor. Los tiempos lógicos no son latencia ni reloj global |
| Implementación | Recorridos de capítulos0a12, referencia y siete desafíos: controles cambian resultados, feedback corrige errores, descargas y Wasm ejecutan acciones reales donde se anuncia | Suites operativas y rutas con contenido. Cobertura de escenarios identificados, sin afirmar un censo de todas las combinaciones posibles |
| Precisión | Sección15 recuperada y contrastada en esa pasada, límites y contratos de specs0001a0017 | La revisión inicial registró16/16; no detectó las incoherencias de explicaciones encontradas después. [precision.md](precision.md) distingue ese resultado y las correcciones posteriores |

## Observación directa del recorrido

Además de Playwright se abrió la compilación aislada en Chrome nativo en3200. Comprar produjo POST con `sku:kit-api`, cantidad1 y credencial pública de comprador. El inspector mostró201, un pedido correlacionado y59.4ms observados de fetch+parsing. La captura identificó instrumentación real y omisiones de infraestructura sin instrumentar. En primeros principios se comprobó el retorno42 y las dos respuestas con feedback; solo la correcta, junto al resultado, cambió el capítulo a completado.

El árbol de accesibilidad nativo expuso encabezados, botones, campos, pestañas, regiones y mensajes. En la continuación se activó VoiceOver10, build993, y se confirmó su proceso real; la herramienta no pudo observar voz ni panel de subtítulos de forma fiable y restauró el lector a desactivado, su estado inicial. Después el usuario confirmó «Probé y funcionó» para la lectura de campos y resultados400/201/403 y corrección con teclado. El [registro](reader.md) conserva la atribución: esa observación es humana, no una escucha de la herramienta.

## Accesibilidad y límites

La suite de entrega prueba roles y nombres de botones, textbox, combobox, spinbutton, checkbox y radio visibles; primer Tab (Option+Tab en WebKit de macOS), foco visible y salto al main; idioma español y anclas. Las suites de cada recorrido añaden teclado en pestañas, flechas/Home/End, inspector, selección, feedback y móvil. Los snapshots accesibles se capturan en main390, estado inicial. No cubren por sí solos todos los estados de cada lector.

Contraste usa luminancia relativa para31 pares: nueve colores de texto y borde de control contra canvas/surface/raised, más texto de botón contra acento. Exige4.5:1 en texto y3:1 en borde. El mínimo observado fue6.17:1 en texto y3.42:1 en borde. No incluye todos los fondos decorativos, combinaciones de estados ni una acreditación WCAG completa. Reducción de movimiento comprueba transición0s y nueva captura local pausada; las regresiones añaden pausa al ocultar y reproducción explícita.

## Rendimiento

Las mediciones se identifican como navegación local de una muestra por ruta/tamaño/motor. Contexto nuevo por ruta;1440 es la primera navegación y701/390 reutilizan caché. El proceso servidor está caliente por los recorridos anteriores. No hay throttling de CPU/red ni medición remota. Esta tabla resume las quince rutas iniciales a1440; la mediana entre rutas distintas es descriptiva, no una comparación de rendimiento entre motores.

| Motor | TTFB mínimo/mediana/máximo(ms) | DCL mínimo/mediana/máximo(ms) | Tamaño codificado JS mínimo/máximo(bytes) |
|---|---|---|---|
| Chromium |0.9 /1.1 /22.7 |14.4 /20.0 /58.8 |174671 /300855 |
| Firefox |2 /13 /42 |35 /60 /405 |174671 /300855 |
| WebKit |1 /2 /5 |17 /22 /77 |174927 /301274 |

Las seis operaciones HTTP por motor,201/200/200/200/403/401, duraron2.42a6.07ms en Chromium,2.17a7.62ms en Firefox y3.05a36.20ms en WebKit según Playwright. No se comparan directamente con los59.4ms manuales: estos incluyen fetch y parsing en otra ejecución. En las navegaciones cacheadas de WebKit, la API de Performance devolvió0 para TTFB y bytes codificados; esos ceros no significan coste nulo ni ausencia de JavaScript.

TTFB es `responseStart-requestStart`; DCL es el instante relativo de `domContentLoadedEventEnd`, que no garantiza hidratación terminada. Bytes JS suma `encodedBodySize` de recursos `/_next/*.js`, no bytes realmente transferidos, coste de parseo ni tiempo de interacción. El recorrido HTTP registra `request.timing().responseEnd`, separado de los59.4ms de fetch+parsing observados en la inspección manual. Sin carga, percentiles representativos ni presupuestos de producto, no se emite un resultado de capacidad o SLA.

## Dependencias y seguridad de la entrega

La instalación informa cinco avisos altos en dependencias de desarrollo: `braces`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next` y `eslint-config-next`. `npm audit --omit=dev --json` devuelve cero vulnerabilidades. ESLint9.39.5 emite aviso de deprecación. No se aplicó `audit fix --force` ni se cambió Next para ocultarlos.

El Map sigue limitado a200 pedidos por proceso, sin durabilidad ni coordinación entre instancias. Los tokens son públicos. Los ensayos no procesan dinero ni datos personales. Replay no repite efectos; los modelos y las mediciones tienen etiquetas distintas. La arquitectura y los límites completos siguen en README y las specs por capítulo.

## Cierre y límites de la entrega

La lista original se recuperó y revisó en [precision.md](precision.md); su revisión inicial quedó matizada por las correcciones posteriores. La comprobación del lector conserva la confirmación del usuario en el [registro de resultado](reader.md). El [contraste completo y la regresión técnica de fase5](../../scope2/fase5-verificacion.md) están registrados con fuentes y resultados nuevos. El bloque20 mantiene pendiente la comprensión con participantes y la integración de sus resultados, fase4 de [scope2](../../scope2/index.md).

No se ensayó comprensión con estudiantes ni se acreditaron todos los lectores, todos los estados del curso o conformidad WCAG completa. Tampoco se midió carga o infraestructura remota. Las comprobaciones y sus límites están identificados; no se convierte la matriz editorial en un estudio pedagógico ni la observación humana de un flujo en una auditoría universal.

No se publican cambios ni se crean commits. El código y las instrucciones se entregan en el workspace.
