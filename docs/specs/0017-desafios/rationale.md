# Decisión de evaluación

## Context

El bloque19 exige siete formatos y aprendizaje demostrado, más allá de visitar páginas. El usuario eligió resolverlos en `/challenges`, exigir resultado y causa juntos y ofrecer siete ejercicios de tres niveles. Se continúa con los valores recomendados para las preguntas sin respuesta: logros únicamente, diseño existente y fuentes del repositorio.

## Options considered

1. Enlazar cuestionarios de capítulos: poco código, pero no completa el catálogo ni demuestra operaciones dentro de Challenges.
2. Reutilizar modelos puros y trazas con evaluación por ejercicio: mantiene comportamiento coherente y permite errores y reintentos seguros; necesita fixtures y rúbricas explícitas. Elegido.
3. Ejecutar todas las operaciones contra endpoints reales: aporta observación HTTP pero no cubre interfaces conceptuales y añade efectos y recuperación innecesarios para este catálogo.

## Rationale

Los motores ya separan schema, negocio, permisos y entrega. Una evaluación pequeña que los invoca evita duplicar lógica. La suma local se etiqueta como ejecutada; los demás fixtures conservan su procedencia conceptual. El progreso añade ids al almacén común y mantiene capítulos independientes. No se necesitan dependencias ni infraestructura.

## References

Fuentes del proyecto: `docs/scope/evaluacion.md`, specs0004,0006,0009,0010,0012,0014, `design.md`; modelos `learning.ts`, `anatomy.ts`, `comparison.ts`, `security.ts`, `contracts.ts`, `idempotency.ts`; progreso `course-progress.ts` y `use-course-progress.ts`.
