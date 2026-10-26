# Plataforma compartida de The API Universe

Arquitectura, herramientas, modelos, sistema visual y observación común. Estos bloques sostienen los recorridos del producto.

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

## Base

### 1. Arquitectura y proyecto ejecutable · done

Definir una estructura que puedas ejecutar localmente y ampliar sin servicios externos. Registrar las decisiones técnicas antes de crear el proyecto.

**Done when:** la arquitectura justifica las herramientas frente a tus preferencias; el proyecto arranca y compila; contenido, visualización, simulación y ejecución real tienen responsabilidades claras; existe una estrategia para la petición HTTP local real.

- [x] Decidir la arquitectura (spec): `/architect arquitectura y proyecto ejecutable`
- [x] Crear el proyecto desde la decisión: `/develop arquitectura y proyecto ejecutable`
  - [x] Separar contenido, visualización, simulación y ejecución real.
  - [x] Preparar un proyecto ejecutable y comprobable localmente.
- [x] Comprobar ejecución: `/check verify arquitectura y proyecto ejecutable`
- [x] Probar la base: `/test arquitectura y proyecto ejecutable`

Spec [0001](../specs/0001-arquitectura-proyecto/index.md), código en `package.json` y `src/app/`.

### 2. Convenciones y herramientas · done

Capturar convenciones desde el proyecto ya creado y preparar las comprobaciones que usarás durante la construcción.

**Done when:** el contexto del proyecto refleja la estructura real; están definidos y funcionan los comandos de tipos estrictos, comprobación de código y pruebas esenciales; las instrucciones permiten repetirlos sin credenciales.

- [x] Capturar convenciones y herramientas: `/audit`
- [x] Preparar herramientas locales: `/develop tooling`
- [x] Comprobar tipos, lint, pruebas y build: `/test tooling`

Contexto en `AGENTS.md`, comandos y límites en `README.md`. Git manual y sin CI remoto, por elección del usuario. Los avisos de dependencias se documentan con fecha, distinguiendo su registro inicial del resultado actual de npm audit.

## Fase 1

### 3. Modelo conceptual, datos y causalidad · done

Definir las entidades pedagógicas, las fronteras de ejecución y los contratos que conectan operaciones, eventos, explicaciones y progreso. Separar una API de su implementación, transporte y representación.

**Done when:** hay modelos estructurados para capítulos, tecnologías, ejercicios, pedidos, progreso y trazas; cada evento conserva identidad, tiempo lógico, actor, acción, entrada, salida, estado, dependencias, explicación por profundidad, código y errores; se distinguen tiempos medidos y simulados; el modelo permite ramas, concurrencia, comparación, reproducción y reconstrucción al retroceder.

- [x] Diseñar el modelo conceptual y de datos (spec): `/architect modelo conceptual datos y causalidad`
- [x] Construir el modelo compartido: `/develop modelo conceptual datos y causalidad`
  - [x] Modelar pedidos, eventos y reproducción causal.
  - [x] Modelar capítulos, evaluación y progreso versionado.
  - [x] Modelar tecnologías, facetas, ejes y relaciones.
- [x] Verificar los modelos en sus recorridos: `/check verify modelo conceptual datos y causalidad`
- [x] Probar contratos y transiciones: `/test modelo conceptual datos y causalidad`

Specs [0002](../specs/0002-recorrido-central/index.md), [0004](../specs/0004-primeros-principios/index.md) y [0005](../specs/0005-api-taxonomy/index.md), código en `src/lib/trace.ts`, `src/lib/learning.ts`, `src/lib/progress.ts` y `src/lib/taxonomy.ts`. Las verificaciones de [pedidos](../specs/0002-recorrido-central/verify.md), [primeros principios](../specs/0004-primeros-principios/verify.md) y [taxonomía](../specs/0005-api-taxonomy/verify.md) conservan la evidencia de estos modelos. Los siguientes recorridos pueden ampliarlos; que exista su modelo no completa un laboratorio pendiente.

## Fase 2

### 4. Sistema visual, navegación y progreso · done

Crear un instrumento de ingeniería legible y consistente. Puedes entrar desde Primeros principios y moverte entre aprendizaje, universo, simulador, playground, sistemas, desafíos y referencia.

**Done when:** la home enseña una interacción en menos de treinta segundos; las cinco áreas dan acceso a las ocho superficies originales, con navegación funcional y estados vacíos o de error honestos; hay tema oscuro cuidado, diagramas vectoriales, inspector, código y controles compartidos; consumidor, contrato, proveedor, datos, errores y persistencia tienen etiquetas además de color; el diseño responde a pantallas pequeñas, teclado, lectores de pantalla y reducción de movimiento; nivel, contexto y progreso local se recuperan sin fallar ante datos inválidos o almacenamiento no disponible.

- [x] Diseñar continuidad y navegación (spec): `/architect sistema visual navegación y progreso`
- [x] Construir continuidad y navegación: `/develop sistema visual navegación y progreso`
  - [x] Integrar catálogo, resumen, menú y estados de carga y error.
  - [x] Integrar progreso evaluado, profundidad y contexto conservando el formato anterior.
- [x] Verificar formato, teclado, contraste y móvil: `/check verify sistema visual navegación y progreso`
- [x] Probar logros, almacenamiento, contexto y regresiones: `/test sistema visual navegación y progreso`

Spec [0012](../specs/0012-navegacion-progreso/index.md), código en `src/content/course.ts`, `src/lib/course-progress.ts`, `src/components/course-overview.tsx`, `src/components/sidebar.tsx` y `src/app/globals.css`. `/course` reúne los trece capítulos y las cinco áreas del producto. Desafíos y referencia están construidos en `/challenges` y `/reference`, según los bloques18 y19 y sus specs0016 y0017. B identifica la Browser API DOM del capítulo2; API Anatomy conserva acceso propio sin letra de laboratorio.

El progreso conserva el formato de capítulos 0 a 3 y añade logros comprobados de los capítulos siguientes, profundidad y última ubicación permitida. No guarda credenciales, pedidos ni borradores HTTP. Sin almacenamiento disponible permite una sesión; visitar una ruta no completa actividades. Las futuras experiencias se incorporan al catálogo con estado explícito.

[Evidencia inicial de cierre](../specs/0012-navegacion-progreso/verify.md): 545 pruebas de lógica, 89 de navegador, tipos, lint y build. Árbol accesible, foco, contraste, reducción de movimiento y tamaños de 390 a 1440px comprobados en Chromium. El bloque20 registra después una confirmación humana acotada del lector. La comprensión con participantes sigue pendiente en la fase4 de scope2; no se acredita una auditoría completa de lectores.

La [revisión de jerarquía, legibilidad y continuidad](../specs/0012-navegacion-progreso/verify.md) del mismo informe registra las correcciones posteriores: programa antes de las áreas, progreso accesible desde todo el menú, texto de navegación legible, acciones alineadas en móvil y conservación de logros entre pestañas. La evidencia histórica por sí sola no cubría estos fallos.

## Fase 3

### 7. X Ray Mode transversal · done

Permitir observar cualquier operación del laboratorio a tres profundidades sin reiniciar el experimento. Hacer visibles contratos y fronteras con el mismo lenguaje en todos los recorridos.

**Done when:** Intuition, Engineering e Internals conservan el evento, los datos y el estado seleccionados; cada operación identifica iniciador, receptor, contrato, datos, tecnología, frontera, código, resultado y fallos posibles; distingue mismo proceso, procesos separados, red, servicios y almacenamiento; funciona sobre operaciones reales y simuladas con etiquetas explícitas y no depende exclusivamente de una animación prefabricada.

- [x] Diseñar X Ray Mode (spec): `/architect x ray mode transversal`
- [x] Completar X Ray en todos los recorridos: `/develop x ray mode transversal`
  - [x] Construir contrato obligatorio y validación de capturas reales.
  - [x] Integrar productores de los recorridos actuales e inspector compartido.
  - [x] Incorporar las operaciones de fronteras avanzadas, después del bloque 17.
- [x] Verificar contexto, procedencia y ausencia de efectos en recorridos actuales: `/check verify x ray mode transversal`
- [x] Probar productores actuales, validación y regresiones: `/test x ray mode transversal`
- [x] Verificar el cierre transversal con fronteras avanzadas: `/check verify x ray mode transversal`
- [x] Probar el cierre transversal y sus regresiones: `/test x ray mode transversal`

Spec [0014](../specs/0014-xray-transversal/index.md), código en `src/lib/interaction.ts`, `src/lib/order-receipt.ts`, `src/components/trace-player.tsx` y `src/components/contract-player.tsx`. La [evidencia de los recorridos actuales](../specs/0014-xray-transversal/verify.md) conserva 26 casos de X Ray, 610 pruebas de lógica y 124 de navegador, además de tipos, lint y build. Cambiar profundidad conserva captura y cursor; reproducir no reenvía operaciones. Las capturas reales solo incorporan eventos internos instrumentados. El [proyecto final](../specs/0013-proyecto-pedidos/verify.md) también integra el inspector. La integración avanzada se completa y verifica con el bloque17, según el cierre registrado en la misma evidencia.

La corrección del control transversal usa `src/components/xray-mode.tsx` en el layout y en las diez cabeceras de laboratorios. Todos los reproductores comparten modo, incluidos protocolos, SSE y los experimentos avanzados disponibles; navegar y cambiar pestaña lo conserva. La evidencia actual incorpora32 casos de X Ray,610 pruebas de lógica y131 de navegador. La verificación completa posterior del bloque17 aprueba669 pruebas de lógica y142 de navegador, incluidos32 casos de X Ray y los ocho recorridos avanzados. Los productores ABI/FFI, Wasm, wire y herramientas declaran interaction y conservan procedencia; inspeccionar y reproducir no repite ejecución.
