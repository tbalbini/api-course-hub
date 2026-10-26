# Scope2: correcciones y fidelidad al Master Prompt

Fecha: 23 de octubre de 2026.

Plan complementario para resolver los siete hallazgos del contraste con el Master Prompt completo y volver a comprobar la entrega. Este archivo registra el estado del trabajo; cada cierre enlaza las correcciones y comprobaciones realizadas.

**Build approach:** Journey. Completar el recorrido corregido, incluidos sus errores y su verificación, antes de cerrar la siguiente fase.
**Workflow:** Beta. Cada cambio de comportamiento requiere comprobación en la aplicación y pruebas de regresión apropiadas. Los cambios triviales de texto o enlaces se comprueban por lectura y navegación, sin crear pruebas que solo repitan su implementación.

El [alcance original](../scope/index.md) y las especificaciones conservan las decisiones y la historia de construcción. Este plan sigue las correcciones posteriores. La afirmación de cumplimiento íntegro del prompt queda pendiente hasta cerrar este trabajo, incluida la evidencia humana que corresponda.

## Alcance y límites

La referencia de aceptación es el Master Prompt completo, secciones 1 a 19, aportado por el usuario en esta conversación. Revisar sus dieciséis principios de precisión no sustituye contrastar el resto de sus requisitos.

Se reutilizan capítulos, laboratorios, taxonomía, comparador, inspector, progreso y endpoints existentes. Las correcciones alcanzan sus productores compartidos y consumidores cuando corresponda. Se mantienen las decisiones permitidas por el prompt: diagramas SVG, reproducción mediante reducer, almacenamiento temporal y protocolos simulados con identificación explícita.

La limpieza consiste en retirar referencias mutables compartidas, explicaciones heredadas que describen otra operación, rótulos incorrectos y afirmaciones de cierre sin evidencia suficiente. Los resultados históricos se conservan con fecha y contexto. El ejemplo SQL será conceptual; el almacenamiento real continúa siendo el Map. Las experiencias esenciales siguen funcionando sin cuentas, pagos ni credenciales externas.

Git y publicación permanecen bajo control del usuario. La validación con participantes requiere personas disponibles; preparar su protocolo no equivale a haber realizado las sesiones.

## Resumen

Los números identifican el orden recomendado de ejecución. La columna Hallazgo corresponde a la numeración de la revisión anterior.

| # | Corrección | Hallazgo | Fase | Estado |
|---|---|---|---|---|
| 1 | Aislamiento de explicaciones entre eventos y capturas | 1 | 1. Trazas fiables | done |
| 2 | Coherencia de GET, POST, errores y favoritos en las tres profundidades | 2 | 1. Trazas fiables | done |
| 3 | Precisión sobre actualización de estado y renderizado observado | 4 | 1. Trazas fiables | done |
| 4 | Ejemplo SQL conceptual en Follow the Click | 3 | 2. Almacenamiento explicado | done |
| 5 | Laboratorio B correctamente identificado y enlazado | 5 | 3. Navegación y estado | done |
| 6 | Estado público y documentación coherentes con la evidencia | 6 | 3. Navegación y estado | done |
| 7 | Validación de los resultados pedagógicos con participantes | 7 | 4. Comprensión observada | in-progress |
| 8 | Regresión integral y contraste final del prompt completo | Cierre de los siete | 5. Entrega comprobada | in-progress |

## Fase 1. Trazas fiables

Completada el 23 de octubre de 2026. [Correcciones y evidencia](fase1-verificacion.md): 728 pruebas de lógica y 210 de navegador aprobadas, además de tipos, lint y compilación. Este cierre corresponde únicamente a los bloques 1 a 3.

### 1. Aislamiento de explicaciones entre eventos y capturas · done

Evitar que una nueva simulación o la acción de favoritos cambie las explicaciones de eventos ya capturados. Es la primera corrección porque afecta al contrato compartido del inspector y de la reproducción.

**Done when:** cada evento tiene explicaciones independientes; generar GET, POST y favoritos en distinto orden conserva sin cambios las capturas previas y las definiciones canónicas, incluidos sus tres niveles de profundidad.

Reproducciones originales: `simulate("201")` seguido de `simulate("200")` modificaba la explicación Engineering de la primera solicitud; `localCapture(true)` alteraba la explicación de un evento `render` creado antes. Las regresiones de aislamiento ya forman parte de la suite del repositorio y pasan con la corrección.

La corrección se concentra en la construcción compartida del evento y revisa los lugares que personalizan explicaciones. Las regresiones deben comprobar conservación de valores anteriores y aislamiento entre ejecuciones; congelar o comparar una copia después de que ya fue alterada no demostraría el arreglo.

- [x] Corregir y fijar las regresiones: `/debug aislamiento de explicaciones entre capturas`.

Código: [trace.ts](../../src/lib/trace.ts), [scenarios.ts](../../src/lib/scenarios.ts). Pruebas existentes relacionadas: [trace.test.ts](../../tests/trace.test.ts) e [interaction.test.ts](../../tests/interaction.test.ts). Contrato: [spec0002](../specs/0002-recorrido-central/index.md) y [spec0014](../specs/0014-xray-transversal/index.md).

### 2. Coherencia de operaciones y profundidades · done

Corregir el significado de los eventos además de su aislamiento. Depende del bloque 1: copiar una explicación equivocada conserva el error conceptual.

**Done when:** GET consulta, POST crea o recupera según su resultado, los rechazos explican la etapa que falló y favoritos describe únicamente estado local; acción, contrato, datos, código, tecnología y explicación concuerdan en Intuition, Engineering e Internals, sin perder captura, cursor o panel al cambiar profundidad.

Se retiran los textos de creación heredados por GET y las referencias a resultados del servidor en favoritos. Se revisan también handler, validación, respuesta y actualización local de esos recorridos, incluidos 200, 201, 400, 401, 403 y 404. Los demás productores compartidos se revisan cuando usan estas definiciones, sin ampliar el catálogo de escenarios.

La comprobación recorre GET seguido de POST, POST seguido de GET y favoritos entre compras, con inspección de las tres profundidades. Las pruebas verifican significado y ausencia de solicitudes durante favoritos, inspección y replay.

- [x] Corregir y verificar la coherencia de los eventos: `/debug explicaciones de GET POST errores y favoritos`.

Código: [scenarios.ts](../../src/lib/scenarios.ts), [trace.ts](../../src/lib/trace.ts), [click-lab.tsx](../../src/components/click-lab.tsx) y [order-console.tsx](../../src/components/order-console.tsx). Pruebas: [network.test.ts](../../tests/network.test.ts), [click-lab.spec.ts](../../tests/e2e/click-lab.spec.ts) y [xray.spec.ts](../../tests/e2e/xray.spec.ts).

### 3. Estado solicitado frente a renderizado observado · done

Describir exactamente lo que instrumenta la aplicación. Depende de los bloques 1 y 2 y reutiliza la distinción ya presente en el proyecto final.

**Done when:** el evento observado identifica la solicitud de actualización de estado y sus datos; los textos distinguen esa llamada del commit de React y del paint del navegador, tanto en compra como en favoritos y las consolas que reutilizan el evento.

Se sustituye la afirmación de render completado por una descripción de la llamada al setter. El evento corresponde a esa llamada, con su entrada y su orden lógico correctos. El cambio visual sigue ocurriendo normalmente y replay conserva el efecto ya realizado. No se añade instrumentación de React o del navegador para justificar una etiqueta demasiado amplia.

- [x] Ajustar la observación y sus consumidores: `/debug precision del evento de actualizacion de estado`.

Código: [trace.ts](../../src/lib/trace.ts), [click-lab.tsx](../../src/components/click-lab.tsx), [scenarios.ts](../../src/lib/scenarios.ts) y [order-console.tsx](../../src/components/order-console.tsx). Patrón y límite existentes: [spec0013](../specs/0013-proyecto-pedidos/index.md).

## Fase 2. Almacenamiento explicado

### 4. Ejemplo SQL conceptual en Follow the Click · done

Completar el ejemplo solicitado en la sección 6, vista G, del prompt. Depende del cierre de la fase 1 para mantener clara la procedencia de cada explicación.

**Done when:** el alumno puede inspeccionar un ejemplo `INSERT INTO orders (...) VALUES (...)`, relacionarlo con los datos del pedido y distinguir las tareas de API, lógica de negocio y base de datos; la pantalla identifica la alternativa SQL como conceptual y el Map como el almacenamiento realmente ejecutado.

El diseño debe decidir la ubicación del ejemplo dentro del inspector o de la explicación de almacenamiento y cómo vincularlo con la captura seleccionada. Se recomienda un ejemplo parametrizado y acotado, asociado a los datos de esa captura, no a un borrador posterior. Su consulta no ejecuta SQL, no envía HTTP ni agrega eventos de base de datos a una captura real sin instrumentación.

La verificación debe comprobar que el ejemplo permanece coherente al cambiar cantidad, ejecutar otra operación y volver a una captura anterior. El proyecto mantiene sus límites de persistencia y deduplicación.

- [x] Diseñar la incorporación conceptual (spec): `/architect ejemplo SQL conceptual en Follow the Click`.
- [x] Construir el panel y la inspección de la captura anterior según [spec0019](../specs/0019-ejemplo-sql-capturado/index.md).
- [x] Verificar sus criterios, regresiones y comportamiento en navegador.

Completada el 23 de octubre de 2026. El panel lee únicamente la salida del paso de escritura seleccionado, distingue Map y SQL conceptual y permite volver a la captura anterior. [Verificación](../specs/0019-ejemplo-sql-capturado/verify.md): 758 pruebas de lógica y213 de navegador aprobadas, tipos, lint, compilación y revisión visual de escritorio y móvil.

Superficies actuales: [trace-views.tsx](../../src/components/trace-views.tsx), [trace-player.tsx](../../src/components/trace-player.tsx) y [click-lab.tsx](../../src/components/click-lab.tsx). Contratos actuales: [spec0002](../specs/0002-recorrido-central/index.md), [spec0003](../specs/0003-red-infraestructura/index.md), [spec0013](../specs/0013-proyecto-pedidos/index.md) y [spec0019](../specs/0019-ejemplo-sql-capturado/index.md).

## Fase 3. Navegación y estado

Completada el23 de octubre de2026. [Correcciones y verificación](fase3-verificacion.md): B lleva a la Browser API, Anatomy tiene destino propio, la disponibilidad coincide con las rutas construidas y el cierre global conserva los pendientes reales. Pasan758 pruebas de lógica y215 de navegador, tipos, lint y compilación.

### 5. Laboratorio B identificado como Browser API · done

Restablecer la correspondencia de las letras A a J con la sección 8 del prompt. El experimento DOM ya existe y API Anatomy conserva su función transversal.

**Done when:** B identifica Browser API y modificación DOM y lleva al experimento del capítulo 2; API Anatomy conserva nombre y acceso propios, sin ocupar la letra B ni perder sus siete mecanismos.

Se revisan los rótulos y vínculos actuales en navegación, contenido, documentación y expectativas de pruebas afectadas. La comprobación de teclado y móvil confirma que el destino y su ancla existen y que abrirlos no ejecuta el experimento ni inicia peticiones de negocio.

- [x] Corregir identificación y acceso: `/develop correspondencia del laboratorio B con Browser API`.

Código: [sidebar.tsx](../../src/components/sidebar.tsx), [foundations-lab.tsx](../../src/components/foundations-lab.tsx) y [api-anatomy.tsx](../../src/components/api-anatomy.tsx). Contrato existente: [spec0004](../specs/0004-primeros-principios/index.md).

### 6. Estado público y documentación fieles a la evidencia · done

Eliminar las contradicciones de disponibilidad y las afirmaciones de cierre que exceden lo comprobado. Esta reconciliación sigue a los cambios técnicos y se actualiza de nuevo al cerrar los bloques 7 y 8.

**Done when:** interfaz, README, alcance y verificación coinciden sobre qué está construido, corregido, comprobado y pendiente; los registros anteriores conservan su fecha y límites y no se presentan como evidencia nueva ni como cumplimiento integral del prompt.

Se sustituye el mensaje de Follow the Click que anuncia el capítulo 12 como pendiente, se actualizan las referencias antiguas a desafíos y glosario, y se revisan los textos de cierre de calidad y precisión. Los estados del alcance y las especificaciones afectadas deben reflejar las regresiones descubiertas y la validación humana pendiente hasta su cierre real.

La revisión de precisión vuelve a contrastar los textos corregidos y sus tres profundidades. Las nuevas conclusiones se separan del resultado histórico de 712 pruebas y 206 casos de navegador, que no cubría las regresiones recién detectadas.

- [x] Reconciliar disponibilidad, documentación y cierre con el trabajo aplicado: `/develop estado y documentacion coherentes con la evidencia`.

Superficies: [click-lab.tsx](../../src/components/click-lab.tsx), [README](../../README.md), [Plataforma](../scope/plataforma.md), [Calidad](../scope/calidad.md), [índice original](../scope/index.md), [spec0018](../specs/0018-verificacion-entrega/index.md), [verificación](../specs/0018-verificacion-entrega/verify.md) y [precisión](../specs/0018-verificacion-entrega/precision.md). Los cambios de contrato en specs se registran mediante `/architect`; la sincronización final del contexto corresponde a `/sync`.

## Fase 4. Comprensión observada

### 7. Validación pedagógica con participantes · in-progress

Acreditar los resultados de comprensión de las primeras cinco pruebas de la sección 16. La preparación del protocolo puede avanzar antes; las sesiones usan la versión técnicamente corregida.

**Done when:** hay observaciones reales y resultados identificados para principiante, junior, backend, arquitecto y aprendizaje visual; las dificultades detectadas se corrigen y vuelven a comprobar, y cualquier condición sin evidencia permanece explícitamente pendiente.

El protocolo debe fijar tareas, criterios de éxito y condiciones de ayuda antes de observar participantes. Como mínimo exploratorio se propone una persona por perfil de experiencia, sin atribuir representatividad estadística a esa muestra. La prueba visual puede realizarse con esos participantes, registrando si distinguen llamada local y remota mediante la interacción, antes de explicarles la respuesta.

Las tareas comprueban que el principiante razona sobre APIs sin internet; el junior interpreta método, headers, body y errores; el backend compara contratos, permisos, fallos y versiones; y el arquitecto distingue procesos, red y eventos. Se registra versión de la app, perfil, tarea, resultado, explicación en palabras del participante, ayudas e incidencias, con identificación anónima suficiente para separar observaciones.

Los recorridos automatizados siguen verificando funcionamiento. Una respuesta generada por el agente, un quiz marcado como correcto o la preparación del protocolo no sustituyen la observación de una persona. La confirmación previa de VoiceOver conserva su cobertura original y no se convierte en una prueba pedagógica.

- [x] Definir protocolo y registro de resultados (spec): [0020, validación pedagógica](../specs/0020-validacion-pedagogica/index.md).
- [x] Preparar guiones, rúbrica y ficha anónima y comprobar los recorridos técnicos antes de observar.
- [ ] Observar cuatro participantes y registrar comprensión de los perfiles y de la prueba visual.
- [ ] Corregir las dificultades observadas y comprobarlas de nuevo, conservando intentos y versiones.
- [ ] Verificar los cinco resultados humanos con evidencia revisable antes de cerrar el bloque.

Preparación realizada el23 de octubre: [protocolo del moderador](../specs/0020-validacion-pedagogica/protocolo.md), [guion para participantes](../specs/0020-validacion-pedagogica/guion.md), [ficha](../specs/0020-validacion-pedagogica/ficha.md) y [registro de resultados](../specs/0020-validacion-pedagogica/verify.md). Cero sesiones observadas, cero de cinco pruebas humanas acreditadas. Preparar y ensayar los materiales no cierra esta fase.

Punto de partida: [matriz de calidad existente](../specs/0018-verificacion-entrega/verify.md) y [registro de VoiceOver](../specs/0018-verificacion-entrega/reader.md). Dependencia externa para ejecutar las sesiones: disponibilidad de participantes. Mientras falten resultados no se declara acreditado el criterio correspondiente.

## Fase 5. Entrega comprobada

Verificación técnica completada el23 de octubre de2026: [matriz de las secciones1 a19](fase5-matriz.md), con151 puntos identificados, y [regresión y evidencia](fase5-verificacion.md), con758 pruebas de lógica y215 de navegador, tipos, lint y compilación aprobados. El cierre integral conserva la dependencia de las observaciones humanas de la fase4.

### 8. Regresión integral y contraste del prompt completo · in-progress

Cerrar las correcciones sobre una compilación identificada y distinguir entrega técnica de evidencia pedagógica. Depende de los bloques 1 a 6 para el cierre técnico y del 7 para afirmar cumplimiento completo de los resultados pedagógicos.

**Done when:** las nuevas regresiones y las comprobaciones existentes pasan sobre fuentes coincidentes; cada requisito verificable de las secciones 1 a 19 tiene implementación o adaptación permitida, evidencia y resultado; los siete hallazgos están resueltos y no quedan requisitos obligatorios sin acreditar bajo una afirmación de cierre total.

El contraste final conserva una matriz de requisito, superficie, comprobación, resultado y límite. Incluye la precisión de los tres niveles, el aislamiento de capturas, el ejemplo SQL conceptual, los nombres y destinos de laboratorios y la honestidad de los estados. Las ocho pruebas de calidad se registran por separado: resultados humanos para comprensión y aprendizaje visual, evidencia técnica para causalidad, implementación y precisión.

La verificación reutiliza los comandos del proyecto y producción aislada. Primero se comprueban los recorridos afectados y, una vez terminados los cambios, se realiza una pasada integral. Si aparece un fallo, se corrige su causa y se repiten las comprobaciones afectadas; el informe conserva qué se ejecutó y qué quedó pendiente.

- [x] Contrastar los requisitos de las secciones1 a19, incluidos currículo, laboratorios, precisión y los resultados humanos pendientes.
- [x] Ejecutar la regresión técnica y observación directa sobre fuentes coincidentes y reconciliar documentación, disponibilidad y evidencias.
- [ ] Integrar los resultados humanos de fase4, resolver las dificultades y comprobar la versión resultante antes de declarar el cierre integral.

No se encontraron nuevas superficies obligatorias anunciadas como construidas que fueran placeholders. Se actualizó el texto público de disponibilidad. La matriz distingue adaptaciones permitidas, cobertura comprobada y límites; el orden histórico literal de construcción no queda acreditado. Los seis hallazgos técnicos originales están corregidos, mientras el séptimo conserva cero sesiones observadas y cero de cinco resultados humanos acreditados.

Configuración existente: [playwright.delivery.config.ts](../../playwright.delivery.config.ts) y [package.json](../../package.json). El resultado final se registra con las specs y evidencias de los cambios; este índice solo resume estado y enlaces.

## Comprobaciones de cierre

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:delivery
```

La suite de entrega necesita los navegadores indicados en README y el puerto 3100 libre. Las comprobaciones usan datos ficticios. Se identifica la versión de fuentes, entorno, comandos, resultados y fecha, sin exigir que el número de pruebas nuevas coincida con los recuentos históricos.

El cierre técnico permite afirmar que las correcciones de software están comprobadas. El cumplimiento íntegro de los criterios pedagógicos exige además completar el bloque 7. Si falta una sesión, se conserva como pendiente y se continúa el trabajo independiente que sí pueda realizarse. La revisión de accesibilidad de las superficies modificadas respeta el alcance real de cada prueba y no se presenta como auditoría WCAG completa.

## Seguimiento

`planned` indica trabajo sin ejecutar. `in-progress` indica trabajo iniciado con evidencia parcial. `done` exige cumplir la condición de cierre del bloque y registrar sus comprobaciones. Una casilla solo se marca por una acción realmente completada.

Las fases1 a3 están cerradas. La fase4 está en curso: protocolo y materiales preparados, observaciones reales pendientes. La fase5 tiene matriz y verificación técnica completadas; su aceptación global depende de la fase4. El siguiente paso es coordinar participantes y usar las fichas del bloque7. Las dificultades que surjan se corrigen y comprueban sobre la versión correspondiente antes de actualizar el cierre. El bloque20 original permanece en curso hasta acreditar esos pendientes. Las casillas de entrada se amplían con los hitos de construcción y verificación cuando se capture una spec nueva o comience la ejecución. Al terminar, `/sync` reconcilia el contexto y el alcance original con este plan, conservando su historia.
