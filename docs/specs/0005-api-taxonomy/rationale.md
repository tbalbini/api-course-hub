# Razones del mapa de APIs

## Context

El alumno ya puede observar una función local, DOM y compra HTTP. Falta un mapa que evite convertir formatos, protocolos y estilos en clases mutuamente excluyentes de API.

## Options considered

El catálogo con filtros es sencillo de recorrer. El usuario eligió mapa y comparación, que conserva ese catálogo y añade seis coordenadas visibles. Se usan SVG y controles nativos existentes; no hace falta una biblioteca de grafos para seis ejes.

## Rationale

Separar rasgos definidos de usos posibles evita enseñar que GraphQL requiere red, que REST fija audiencia o que JSON transporta datos por sí solo. Las relaciones explícitas permiten explicar combinaciones sin afirmar compatibilidad universal. La comparación contrasta responsabilidades y capas sin puntuaciones ficticias.

## References

Se conserva la elección de no incorporar referencias externas de diseño. Se consultaron fuentes primarias para revisar precisión: Fielding, capítulo 5 de su tesis sobre REST; GraphQL September 2025; conceptos de gRPC; OpenAPI; AsyncAPI; RFC 6455; HTML Standard para SSE; JSON RPC 2.0; XML RPC; SOAP 1.2; documentación de Protocol Buffers. Los ejemplos no se anuncian como especificaciones completas ni como la versión más reciente.

## Revisión independiente

La revisión detectó que el inventario remitía al historial del prompt. Se incorporaron las seis listas y sus 49 facetas a index.md antes de construir, con aceptación del usuario. No se encontraron contradicciones materiales en separación de capas, usos posibles ni acceso público con credenciales. UDP se añadió como comparación de transporte para TCP, evitando presentar HTTP como sustituto de la misma capa; se contrastó con RFC 768.

## Modelo compartido comprobado

El bloque conceptual del alcance queda sustentado por los contratos existentes: Chapter y quiz en `src/content/foundations.ts`; Axis, Facet, Technology, Relation y actividad en `src/content/taxonomy.ts`; Order en `src/lib/orders.ts`; Progress en `src/lib/progress.ts`; TraceEvent, Capture y Playback en `src/lib/trace.ts`. Las specs 0002, 0004 y 0005 documentan sus fuentes y límites. Las pruebas comprueban validación, progreso, referencias, reconstrucción, comparación y dependencias de ramas. Esta base no declara construidos los recorridos que la utilizarán después.
