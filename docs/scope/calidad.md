# Calidad y entrega de The API Universe

Comprueba la integración de todas las áreas después de verificar cada recorrido. Es trabajo de entrega, no un área de navegación para el alumno.

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

## Fase 7

### 20. Verificación integral y entrega · in-progress

Comprobar que puedes aprender y experimentar en la aplicación completa, desde el primer click hasta un fallo distribuido. Entregar el código y una descripción honesta de lo verificado y de cualquier límite pendiente.

**Done when:** instalación, arranque y compilación son reproducibles; hay pruebas automatizadas de eventos, reproducción, ramas de fallo, contratos, validación, autorización, duplicados y progreso, además de recorridos de navegador esenciales; se comprueban teclado, foco, nombres accesibles, contraste, lectores de pantalla, reducción de movimiento y tamaños de pantalla; los controles tienen efecto y no quedan rutas vacías, ejercicios sin feedback ni experiencias anunciadas como completas que sean imágenes; una petición real es visible en la red y la acción local no produce otra; el contenido supera las ocho pruebas de calidad y los dieciséis principios de precisión de tu petición; el rendimiento se evalúa con mediciones identificadas; se entregan código, instrucciones, arquitectura, límites de persistencia y simplificaciones pedagógicas, y cualquier requisito pendiente se documenta como incompleto.

- [x] Diseñar la verificación y sus evidencias (spec): [spec0018](../specs/0018-verificacion-entrega/index.md).
- [x] Preparar instalación limpia, compilación y servidor de producción exclusivo.
- [x] Añadir comprobaciones de entrega para los tres motores y mediciones identificadas.
- [x] Registrar la revisión técnica inicial de dieciséis principios y la confirmación humana acotada del lector, conservando sus fuentes y límites.
- [x] Conservar la pasada histórica del22 de octubre:712 pruebas de lógica y206 casos de navegador distintos correctos.
- [x] Entregar instrucciones y resultados de esa pasada con sus límites.
- [ ] Acreditar comprensión con participantes para las cinco primeras pruebas de calidad, fase4 de [scope2](../scope2/index.md).
- [x] Completar la [matriz del Master Prompt entero](../scope2/fase5-matriz.md), la [regresión técnica y su evidencia](../scope2/fase5-verificacion.md), fase5 de scope2.
- [ ] Integrar resultados humanos, resolver las dificultades observadas y reconciliar el cierre integral sobre la versión correspondiente.

El bloque se reabre el23 de octubre tras contrastar el Master Prompt completo. La [revisión de precisión](../specs/0018-verificacion-entrega/precision.md) conserva el contraste inicial de las quince distinciones y la regla de simplificaciones, así como las incoherencias descubiertas y corregidas después. Revisar esos dieciséis puntos no cubre las secciones1 a19 del prompt.

El usuario confirmó la lectura de campos, resultados400/201/403 y corrección por teclado: [registro de VoiceOver](../specs/0018-verificacion-entrega/reader.md). Ese resultado humano se conserva y no se amplía a otros estados o lectores. La [verificación0018](../specs/0018-verificacion-entrega/verify.md) conserva resultados históricos y límites. Las [trazas de la fase1](../scope2/fase1-verificacion.md) y el [ejemplo SQL de la fase2](../specs/0019-ejemplo-sql-capturado/verify.md) registran las comprobaciones posteriores de sus cambios, sin cerrar los pendientes humanos y finales.

## Evidencia histórica

Comprobación histórica previa a sistemas y continuidad de progreso: pasan `npm run lint`, `npm test` (487 pruebas de lógica y servidor) y `npm run build`, incluida su comprobación TypeScript. La compilación arranca con `npm start` y pasan las 74 pruebas de Playwright en Chromium contra esa producción local, con servidor dedicado para evitar reutilizar una versión anterior. Las pruebas cubren recorridos reales, errores, permisos, idempotencia, reproducción sin efectos, evaluaciones, progreso de primeros principios y navegación por teclado y móvil. No se reinstalaron dependencias ni se acreditaron otros navegadores, lectores de pantalla, comprensión con estudiantes o rendimiento del producto completo. Esta evidencia valida los recorridos construidos, sin cerrar la entrega integral.

La comprobación adicional recorrió diez destinos a 390, 701 y 1440px, treinta casos en total. No hubo desbordamiento de página, anclas del menú sin destino, errores JavaScript, avisos de hidratación ni solicitudes automáticas a `/api/` al cargar. La comprobación de enlaces se repite al reorganizar el alcance, por separado de las pruebas de la aplicación.

## Resultados pedagógicos pendientes

La comprobación del principiante explica por qué una API puede existir sin internet. La del desarrollador junior interpreta requests y errores. La del backend compara contratos, permisos, fallos y versiones. La del arquitecto distingue fronteras y modelos de interacción.

La comprobación visual requiere observar que una persona distingue llamada local y remota mediante el experimento. Es la quinta condición humana pendiente. Causalidad, implementación y precisión tienen comprobaciones técnicas identificadas en las verificaciones, con sus límites y regresiones posteriores.

Las cinco condiciones humanas anteriores siguen sin acreditar. Una compilación o un quiz correcto no demuestra por sí solo comprensión. La fase4 tiene [protocolo, guiones y fichas](../specs/0020-validacion-pedagogica/index.md) preparados y cero sesiones observadas. La fase5 ya aporta el contraste de las secciones1 a19 y una nueva pasada de758/215 con fuentes coincidentes; su cierre integral depende de esos resultados humanos. No se acredita el orden histórico literal de las fases originales ni se convierten las adaptaciones y límites documentados en una certificación universal.

## Otros registros históricos

Las [verificaciones de sistemas](../specs/0011-sistemas-fallos/verify.md) y de [navegación y progreso](../specs/0012-navegacion-progreso/verify.md) registran 545 pruebas de lógica y 89 de navegador. Son evidencia de esas entregas, no una ejecución nueva tras esta reorganización ni la verificación final del proyecto de pedidos. La evidencia de cada bloque permanece junto a su spec.

La [verificación del proyecto de pedidos](../specs/0013-proyecto-pedidos/verify.md) registra una pasada completa posterior de597 pruebas de lógica y99 de navegador, más siete operaciones HTTP y doce disposiciones responsive. Es evidencia del capítulo11 y sus regresiones, sin cerrar el bloque20 ni el trabajo concurrente de X Ray.
