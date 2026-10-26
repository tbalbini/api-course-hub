# Fase 1: trazas fiables

Fecha: 23 de octubre de 2026. Estado: completada para los bloques 1 a 3 del [plan](index.md).

## Causa y corrección

El constructor `event` copiaba superficialmente cada definición y conservaba una referencia compartida a `explanation`. Una consulta o favorito podía modificar las explicaciones de otra captura y las definiciones usadas por operaciones futuras. Ahora cada evento copia sus tres explicaciones, además de los metadatos de interacción que ya se copiaban.

Copiar los textos no bastaba: GET heredaba creación y validación de JSON en otras profundidades, y favoritos heredaba un resultado del servidor. Se corrigieron los tres niveles y los datos correspondientes al identificador, la solicitud, la resolución de parámetros y la consulta del fixture. Los rechazos simulados entregan el error al aviso local y conservan su causa y etapa.

El evento `render` conserva su identificador de mecanismo para los consumidores existentes, pero ahora describe la solicitud de actualización de estado. Las compras y consolas registran los setters ejecutados y sus datos. En Follow the Click, un rechazo registra `setNotice`, sin afirmar una llamada a `setActualOrder`. Favoritos distingue el cálculo del siguiente booleano de la solicitud a `setFavorite`. Ninguno de estos eventos afirma instrumentar el commit de React o el paint del navegador.

La reproducción sigue recorriendo eventos guardados. La corrección no añade efectos al reducer ni ejecuta setters de negocio al cambiar profundidad, inspeccionar o reproducir.

## Archivos y regresiones

Producción: [trace.ts](../../src/lib/trace.ts), [scenarios.ts](../../src/lib/scenarios.ts), [click-lab.tsx](../../src/components/click-lab.tsx) y [order-console.tsx](../../src/components/order-console.tsx).

Regresiones: [trace.test.ts](../../tests/trace.test.ts) y [click-lab.spec.ts](../../tests/e2e/click-lab.spec.ts). Se añadieron 16 casos de lógica y 4 casos de navegador, utilizando las suites existentes.

| Condición | Evidencia y resultado |
|---|---|
| Capturas y definiciones independientes | Se comparan copias tomadas antes de ejecutar otra operación, con POST seguido de GET, GET seguido de POST y favoritos. Personalizar cada profundidad de un evento no modifica otro evento o su definición. Aprobado. |
| GET y POST describen su operación | Se comprueban datos, método, contrato, código y explicaciones. El navegador recorre consultas 200 y404, creación201 y rechazos400,401,403. Aprobado. |
| Rechazos conservan la causa | Los casos400,401,403,404,409,429 y500 comprueban el aviso, datos y las tres explicaciones; las pruebas existentes comprueban que el flujo se detiene sin almacenar. Aprobado. |
| Favoritos permanece local | Se comprueban ambos booleanos, código de su handler y setter, ausencia de mensajes y fronteras remotas. El navegador mantiene el favorito durante replay y no envía solicitudes de API. Aprobado. |
| Observación de estado precisa | Compra y rechazo reales verifican los setters y el límite de observación. Las consolas de `/compare` y `/build-api` comprueban GET, PATCH y `setOrder`, sin atribuirles un paint observado. Aprobado. |
| Profundidad e inspección conservan contexto | Las regresiones nuevas mantienen captura, evento y panel; la suite X Ray existente comprueba también datos y reproducción en marcha. Aprobado. |
| Productores compartidos | La suite completa recorre los laboratorios, HTTP real, SSE, progresos, permisos y resultados inciertos. Aprobado con la cobertura indicada abajo. |

La reproducción inicial de los fallos produjo 14 casos fallidos y 25 aprobados en `tests/trace.test.ts`. Tras la corrección, los casos de regresión y las comprobaciones anteriores pasan. Esa ejecución fallida ocurrió antes de completar las regresiones de navegador y el caso de POST posterior a GET.

## Ejecución final

Entorno: macOS26.6.2 arm64, Node24.14.0, npm11.9.0. Se usaron las dependencias instaladas del proyecto. Las fuentes públicas se regeneraron antes de los comandos correspondientes y sus 14 archivos coinciden con los archivos actuales.

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Aprobado. |
| `npm run lint` | Aprobado. |
| `npm test -- --reporter=dot` | 19 archivos, 728 casos aprobados. |
| `npm run build` | Aprobado, 22 rutas generadas o registradas. |
| `npm run test:delivery` | 210 casos aprobados: 176 en Chromium, 17 en Firefox y 17 en WebKit. |

La entrega arrancó producción exclusiva en `127.0.0.1:3100` sobre la compilación corregida. Chromium ejecutó la suite completa, incluidas las cuatro regresiones nuevas; Firefox y WebKit ejecutaron la suite de entrega existente. El proceso de pruebas cerró su servidor al terminar.

El informe local de esta ejecución está en [delivery-report.json](../../test-results/delivery-report.json). Las capturas adicionales [GET en escritorio](../../test-results/phase1-get-inspector.png) y [favorito en móvil](../../test-results/phase1-favorite-mobile.png) se inspeccionaron visualmente: sus textos y metadatos concuerdan y permanecen legibles. `test-results/` está ignorado por Git y sus archivos pueden reemplazarse en otra ejecución.

Identificación de fuentes: los mismos 167 archivos enumerados en el [manifiesto histórico](../specs/0018-verificacion-entrega/evidence/manifest.json), con sus contenidos actuales, producen SHA256 `e35433c26b3824acda39e6797cbfe006b347a799e6f17bf7b665611da5561204`. Se usa su algoritmo: ordenar rutas y concatenar `ruta`, NUL, SHA256 del archivo y salto de línea antes del hash final. Los seis archivos de producción y pruebas enlazados arriba son las diferencias respecto a ese manifiesto. El manifiesto histórico permanece intacto.

## Límites del cierre

Este resultado acredita la fase 1. Las fases 2 a 5 continúan pendientes, incluido el ejemplo SQL conceptual, las correcciones de navegación y documentación y la validación pedagógica con personas. La pasada completa de pruebas protege el cambio compartido y no sustituye el contraste final del Master Prompt.

No se repitió la comprobación humana de VoiceOver ni se realizó una auditoría WCAG completa. Las comprobaciones automatizadas de teclado, tamaños de pantalla y reducción de movimiento conservan la cobertura de la suite, sin atribuirles observaciones de un lector de pantalla.
