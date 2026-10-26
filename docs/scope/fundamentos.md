# Fundamentos de The API Universe

El punto de entrada para quien empieza. Reúne los capítulos 0 a 3, A (función local, capítulo0), B (Browser API DOM, capítulo2) y API Anatomy con acceso propio en el capítulo3 de `/first-principles`.

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

Cada capítulo parte de un problema y explica por qué existe el mecanismo, cómo funciona, qué compromisos introduce, qué alternativas tiene y dónde deja de aplicar.

Todos los capítulos incluyen pregunta fundamental, intuición visual, demostración operable, explicación técnica, código, alternativa, error conceptual, comprobación y desafío práctico. La evaluación explica el razonamiento. Un texto o una imagen sin interacción no sustituye una demostración. Este criterio se aplica también a los capítulos de las demás áreas.

## Fase 4

### 8. Primeros principios y API Anatomy · done

Completar los capítulos 0 a 3 y los laboratorios A y B. Puedes deducir qué es una API antes de conocer las APIs web y comprobar qué cambia cuando los componentes dejan de compartir proceso.

**Done when:** puedes modificar `sumar(2, 3)` y `sumar(10, 20)`, inspeccionar firma, argumentos, memoria y call stack simplificados, transferencia de control, ejecución y retorno; cambiar una implementación conservando o rompiendo su contrato y observar al consumidor; ejecutar una modificación DOM sin tráfico de red; explorar APIs de bibliotecas, lenguaje, sistema operativo, archivos, dispositivos, clientes de bases de datos y SDKs; comparar memoria separada, pipes, sockets locales, TCP, serialización, RPC, concurrencia, timeouts y fallos parciales; API Anatomy permite seleccionar Consumer, Contract, Provider, Execution y Result y cambiar entre función, IPC, system call, HTTP, RPC, mensaje asíncrono y suscripción con fronteras correctas y sin flechas de red ficticias.

- [x] Diseñar el recorrido (spec): `/architect primeros principios y api anatomy`
- [x] Construir los primeros principios: `/develop primeros principios y api anatomy`
  - [x] Integrar capítulos, experimentos locales y contrato intercambiable.
  - [x] Integrar Anatomy, concurrencia y progreso evaluado.
- [x] Verificar recorrido, teclado y almacenamiento: `/check verify primeros principios y api anatomy`
- [x] Probar lógica y regresiones de navegador: `/test primeros principios y api anatomy`

Spec [0004](../specs/0004-primeros-principios/index.md), código en `src/content/foundations.ts`, `src/lib/learning.ts`, `src/lib/anatomy.ts`, `src/lib/progress.ts` y `src/components/foundations-lab.tsx`. [Evidencia](../specs/0004-primeros-principios/verify.md): 125 pruebas de lógica y servidor, 15 de navegador y recorrido completo con progreso 4/4 recuperado. Pila, memoria y mecanismos de infraestructura son modelos explícitos; función y DOM se ejecutan realmente.
