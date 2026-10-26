# Scope: The API Universe

Un laboratorio gratuito en español para descubrir por qué existen las APIs, observar sus mecanismos y razonar sobre sus límites. El recorrido empieza sin conocimientos previos y llega al diseño de contratos y a los fallos de sistemas distribuidos.

**Build approach:** Journey (terminar un recorrido completo, con sus errores y su evaluación, antes de abrir el siguiente).
**Workflow:** Beta (comprobar la aplicación con `/check verify` y después ejecutar `/test`).

Estas recomendaciones te ayudan a retomar el trabajo. Puedes ajustar el proceso cuando ya tengas una decisión clara. Las épicas agrupan entregables y las fases indican el orden de construcción; los capítulos conservan su secuencia del 0 al 12.

## At a glance

| # | Feature | Phase | Status |
|---|---|---|---|
| 1 | [Arquitectura y proyecto ejecutable](plataforma.md) | Base | done |
| 2 | [Convenciones y herramientas](plataforma.md) | Base | done |
| 3 | [Modelo conceptual, datos y causalidad](plataforma.md) | 1 | done |
| 4 | [Sistema visual, navegación y progreso](plataforma.md) | 2 | done |
| 5 | [Primera operación de pedidos real](recorrido-central.md) | Skeleton | done |
| 6 | [Follow the Click completo](recorrido-central.md) | 3 | done |
| 7 | [X Ray Mode transversal](plataforma.md) | 3 | done |
| 8 | [Primeros principios y API Anatomy](fundamentos.md) | 4 | done |
| 9 | [API Taxonomy Explorer](mapa-referencia.md) | 5 | done |
| 10 | [Una necesidad, varias interfaces](mapa-referencia.md) | 5 | done |
| 11 | [Red, HTTP y laboratorio de requests](laboratorios.md) | 5 | done |
| 12 | [Comunicación continua y entregas de eventos](laboratorios.md) | 5 | done |
| 13 | [Seguridad y decisiones de acceso](laboratorios.md) | 5 | done |
| 14 | [Diseño y evolución de contratos](laboratorios.md) | 6 | done |
| 15 | [Systems Lab y fallos parciales](laboratorios.md) | 6 | done |
| 16 | [Proyecto final de pedidos](recorrido-central.md) | 6 | done |
| 17 | [Fronteras avanzadas](mapa-referencia.md) | 6 | done |
| 18 | [Referencia y búsqueda conceptual](mapa-referencia.md) | 6 | done |
| 19 | [Desafíos y evaluación razonada](evaluacion.md) | 6 | done |
| 20 | [Verificación integral y entrega](calidad.md) | 7 | in-progress |

## Épicas

[Plataforma](plataforma.md): arquitectura, herramientas, modelo causal, diseño, progreso y X Ray completos, incluida la integración avanzada.

[Recorrido central](recorrido-central.md): primera operación real, Follow the Click y proyecto final de pedidos completos.

[Fundamentos](fundamentos.md): capítulos 0 a 3, API Anatomy y laboratorios A y B completos.

[Mapa y referencia](mapa-referencia.md): taxonomía, comparador, fronteras avanzadas y referencia completos.

[Laboratorios](laboratorios.md): capítulos 4, 5 y 7 a 10 y laboratorios C a J completos.

[Evaluación](evaluacion.md): siete desafíos completos con resultado, explicación causal, reintentos y progreso independiente de capítulos.

[Calidad y entrega](calidad.md): conserva la verificación histórica y el resultado humano acotado del lector, junto a la [matriz completa y nueva regresión técnica](../scope2/fase5-verificacion.md). El cierre integral sigue pendiente de comprensión con participantes, según [scope2](../scope2/index.md).

La navegación vigente agrupa las ocho superficies originales en cinco áreas, según la [spec 0012](../specs/0012-navegacion-progreso/index.md). Las épicas de este plan permiten seguir el trabajo sin redefinir ese menú.

## Continuación y dependencias

Las bases técnicas permiten ejecutar la primera operación y observarla. Después se completa cada recorrido educativo con experimento y feedback, reutilizando contratos, eventos e inspector. Las pruebas acompañan cada bloque; la fase 7 comprueba la integración del producto.

La referencia del bloque18 y los desafíos del19 están construidos y comprobados: [evidencia de la spec0016](../specs/0016-referencia-conceptual/verify.md) y [spec0017](../specs/0017-desafios/verify.md). La [verificación del22 de octubre del20](../specs/0018-verificacion-entrega/verify.md) conserva instalación, producción,712 pruebas de lógica y206 casos de navegador distintos, con accesibilidad y mediciones identificadas de esa pasada.

X Ray, bloque7, incluye todos los recorridos, las operaciones avanzadas y Challenges. El usuario confirmó el flujo esencial del [lector de pantalla](../specs/0018-verificacion-entrega/reader.md). El contraste posterior con el prompt completo encontró incoherencias en trazas, etiquetas y cierre; la [revisión de precisión](../specs/0018-verificacion-entrega/precision.md) registra sus correcciones. Los bloques1 a19 conservan su construcción y evidencia; el20 está en curso. [Scope2](../scope2/index.md) registra las correcciones, la matriz y regresión técnica de fase5 completadas y la validación humana pendiente de fase4. El detalle está en [Calidad](calidad.md).

La navegación y el progreso son servicios comunes del bloque 4. Las evaluaciones de cada capítulo aportan logros comprobados; el bloque 19 añade el catálogo general. El proyecto final reutiliza POST, GET y PATCH existentes, sin otra implementación del negocio.

## Límites del producto

La experiencia principal funciona sin registro, pago, credenciales externas ni servicios de terceros. El progreso se guarda localmente. Todo el contenido educativo está en español y conserva los términos técnicos que ayudan a comprender el mecanismo.

Los trece capítulos, los diez laboratorios y los escenarios de error están construidos. Su disponibilidad no acredita todos los resultados de aprendizaje exigidos: la validación pedagógica sigue pendiente. La matriz de fase5 distingue comprobaciones, adaptaciones y límites, incluido el orden histórico no acreditado. Una animación conceptual, una operación ejecutada y una medición real llevan etiquetas diferentes. El código pedagógico y las simplificaciones deben poder inspeccionarse.

El primer resultado útil es una compra contra un endpoint local real, contrastada con un cambio de estado local sin petición de red. La plataforma permite explicar ese recorrido; los fundamentos permiten comprenderlo desde cero.

No se incluyen cuentas de estudiantes, sincronización del progreso entre dispositivos, cobros reales, administración editorial, analítica de terceros, infraestructura remota real para cada protocolo ni publicación en un proveedor. Estos límites no sustituyen requisitos obligatorios del laboratorio. Git y publicación siguen bajo control del usuario.

## Leyenda

`planned` significa pendiente. `in-progress` significa iniciado. `done` significa construido, comprobado y probado bajo el flujo elegido. `existing` identifica algo anterior a este proceso. `dropped` conserva una decisión de retirada sin borrar su historia.

Cada bloque conserva su número y tiene una única ficha, con intención, una línea `Done when`, casillas y enlaces a su spec, código y evidencia cuando existen. El estado aparece en la tabla y junto al título. Dentro de cada épica, las fichas se agrupan por fase.

El siguiente paso es la primera casilla pendiente, considerando sus dependencias. `needs a decision` recomienda `/architect`; una función sin diseño aceptado conserva una sola casilla de entrada. La casilla de decisión termina en `(spec)`. Con diseño aceptado, la ficha añade construcción con dos a cinco hitos, verificación y pruebas. Las tareas técnicas detalladas pertenecen a `docs/specs/`. Sin etiqueta propia, un bloque hereda Journey y Beta; otro nivel de rigor se indica junto al título.

La evidencia de cada entrega permanece junto a su spec, no se convierte en una prueba del producto completo. [Calidad](calidad.md) distingue las comprobaciones históricas de las condiciones todavía pendientes. Esta reorganización conserva los compromisos y no marca nuevas funcionalidades como terminadas.
