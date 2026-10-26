# Evaluación de The API Universe

Reúne el acceso a Tu recorrido y la evaluación general. La continuidad y el almacenamiento compartidos pertenecen al [bloque 4 de Plataforma](plataforma.md); este archivo contiene el catálogo de desafíos y los criterios para demostrar comprensión.

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

## Fase 6

### 19. Desafíos y evaluación razonada · done

Comprobar comprensión desde nivel básico hasta avanzado mediante decisiones sobre operaciones, datos y fallos. Guardar el progreso local con criterios transparentes.

**Done when:** funcionan diagnóstico de arquitectura, predicción de ejecución, Debug the Request, Choose the Interface, Design the Contract, Failure Injection y Spot the Misconception; cada intento recibe explicación de la causa y de alternativas razonables, admite reintento y actualiza progreso sin marcar aprendizaje solo por visitar una página; los ejercicios abarcan ausencia de internet, llamadas locales frente a remotas, HTTP frente a REST, idempotencia, éxito HTTP frente a éxito de negocio, permisos, pérdida de respuesta después de escritura, trazabilidad y relación entre diseño de API y arquitectura.

- [x] Diseñar ejercicios y evaluación (spec): [0017](../specs/0017-desafios/index.md).
- [x] Construir: `/develop desafíos y evaluación razonada`.
  - [x] Catálogo y evaluación sobre siete modelos con resultado y causa (AC-1/3/4).
  - [x] Progreso validado, continuidad y resumen independiente (AC-2/4/5).
  - [x] Pantalla, reintentos, inspector, X Ray y navegación (AC-1/2/5).
- [x] Verificar: `/check verify desafíos y evaluación razonada`; [evidencia](../specs/0017-desafios/verify.md).
- [x] Probar: `/test desafíos y evaluación razonada`; 24 pruebas específicas de lógica, seis recorridos de navegador y cobertura común de X Ray y navegación. Regresión final: 712 pruebas de lógica y155 de navegador correctas.

El catálogo unificado funciona en `/challenges` con tres niveles, siete formatos, feedback por operación y causa, alternativas y reintentos. Reutiliza los modelos existentes, captura y X Ray comunes. `CourseProgress.challenges` persiste únicamente ids conocidos, con unión de logros, recuperación de snapshots anteriores y sesión sin almacenamiento. La continuidad permite solo destinos del catálogo. Tu recorrido muestra el contador separado de capítulos; visitar o reproducir no acredita. Código: `src/content/challenges.ts`, `src/lib/challenges.ts`, `src/components/challenges-lab.tsx` y `src/lib/course-progress.ts`. Los modelos de red y negocio siguen siendo conceptuales; el catálogo no certifica todos los casos posibles de una API.
