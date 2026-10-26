# Fase3: navegación y estado

Fecha: 23 de octubre de2026. Bloques5 y6 del [plan](index.md) completados.

## Correcciones

B identifica Browser API y DOM en el capítulo2, tanto en navegación como en el experimento. Su enlace es `/first-principles?chapter=2#local-lab-title`. API Anatomy conserva un acceso propio en `/first-principles?chapter=3#api-anatomy`, con los siete mecanismos y sin letra de laboratorio. El experimento DOM y las simulaciones conservan su ejecución anterior; abrir los accesos solo navega.

Follow the Click informa que están construidos capítulos0 a12, laboratorios A aJ, referencia y siete desafíos. Explica el ejemplo SQL conceptual y ofrece enlaces funcionales al programa y a la guía. Conserva explícitamente los resultados humanos y la revisión final pendientes.

README, el alcance original, Plataforma y Calidad distinguen lo construido de la acreditación completa. El bloque20 y la [spec0018](../specs/0018-verificacion-entrega/index.md) vuelven a estar en curso porque faltan comprensión con participantes y contraste y regresión final del prompt. Esta reapertura no elimina las comprobaciones técnicas ni amplía la confirmación original de VoiceOver.

La [verificación0018](../specs/0018-verificacion-entrega/verify.md) y su [revisión de precisión](../specs/0018-verificacion-entrega/precision.md) identifican el corte histórico de712 pruebas y206 casos. También explican qué contradicciones no detectó y enlazan las correcciones posteriores. Revisar dieciséis puntos de la sección15 no acredita todas las secciones1 a19. Las evidencias históricas, sus resultados, manifiestos y registro del lector se conservan.

La comprobación `npm audit --json` devuelve cero vulnerabilidades el23 de octubre. README distingue ese resultado de los cinco avisos registrados al instalar inicialmente. Esta fase no modificó dependencias.

## Verificación

| Condición | Comprobación y resultado |
|---|---|
| B abre el experimento correcto | Dos regresiones nuevas en [foundations.spec.ts](../../tests/e2e/foundations.spec.ts), a1440 y390px, activan el enlace mediante teclado y comprueban URL, destino y rótulo. Aprobado. |
| Navegar no ejecuta | El borrador de texto permanece, el nodo conserva Texto inicial, no cambian los logros y no se envían solicitudes de API. Aprobado en ambos tamaños. |
| Anatomy conserva acceso y mecanismos | Se comprueban su ancla propia, nombre accesible y siete opciones. La suite anterior recorre los siete mecanismos y las ramas concurrentes. Aprobado. |
| Disponibilidad y enlaces públicos | Comprobación adicional en Chromium de los textos de arquitectura y enlaces al programa `/course` y guía `/reference?view=guide`, sin operaciones de API. Aprobado. |
| Precisión tras las correcciones | Se revisaron los textos de GET, POST, errores, favoritos, setters y SQL. La suite conserva las regresiones de sus tres profundidades, aislamiento, contexto, datos y replay sin efectos de las fases1 y2. Aprobado para esos casos. |
| Coherencia documental | Índice y ficha del bloque20, estado de spec0018, README y contexto del agente coinciden en cierre integral pendiente. Se resolvieron enlaces locales y se comprobaron las afirmaciones contradictorias identificadas. Aprobado. |

Se inspeccionaron visualmente [Browser API a390px](../../test-results/phase3-browser-api-mobile.png) y [disponibilidad](../../test-results/phase3-availability.png). Los rótulos y controles permanecen legibles. Las imágenes y el [informe local de navegador](../../test-results/delivery-report.json) viven en `test-results/`, ignorado por Git, y pueden reemplazarse al ejecutar pruebas futuras.

## Ejecución

Entorno: macOS26.6.2 arm64, Node24.14.0, npm11.9.0. Se usaron las dependencias instaladas y la configuración de producción exclusiva en `127.0.0.1:3100`; no se reutilizó el servidor de desarrollo.

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Aprobado. |
| `npm run lint` | Aprobado. |
| `npm test -- --reporter=dot` | 20 archivos,758 casos aprobados. |
| `npm run build` | Aprobado,22 rutas generadas o registradas. |
| `npm run test:delivery` | 215 casos aprobados:181 Chromium,17 Firefox,17 WebKit. |
| `npm audit --json` | Cero vulnerabilidades declaradas para el lockfile. |

Chromium ejecutó la suite completa y las dos regresiones nuevas; Firefox y WebKit ejecutaron las comprobaciones de entrega existentes. No hubo fallos, casos omitidos ni inestables. El servidor exclusivo terminó al cerrar la suite.

La huella SHA256 de las172 fuentes es `64c29b874ba103e829a8af86d11529d662861a777f1e33ecf37a6ba7bcc5b6a4`: los167 archivos del [manifiesto histórico](../specs/0018-verificacion-entrega/evidence/manifest.json), con su contenido actual, y los cinco archivos añadidos en la fase2 (`src/lib/order-storage.ts`, `src/content/order-storage.ts`, `src/components/order-storage-example.tsx`, `tests/order-storage.test.ts`, `tests/e2e/storage-example.spec.ts`). Se ordenan rutas y se concatena ruta, NUL, SHA256 del archivo y salto de línea antes del hash final. Las fuentes públicas del visor se regeneraron antes de los comandos correspondientes.

## Pendientes conservados

Las fases4 y5 siguen pendientes. No se repitieron instalación limpia, sesión humana con lector o validación pedagógica con participantes. Las nuevas comprobaciones técnicas no sustituyen esas observaciones ni una auditoría WCAG completa. La documentación deberá actualizarse otra vez cuando existan los resultados humanos y la matriz final de requisitos.
