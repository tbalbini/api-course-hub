# 0018. Verificación integral y entrega

**Date**: 2026-10-22
**Status**: In Progress

## Summary

Comprobar la aplicación completa sobre una instalación y compilación nuevas. Conservar comandos, resultados y límites de cada comprobación para distinguir una entrega técnica reproducible de la acreditación completa del producto.

## Requirements

- **AC-1**: Node24 y `npm ci` desde el lockfile permiten generar fuentes, comprobar tipos, lint, lógica, build y arrancar producción. Se identifica el entorno, los avisos y las versiones usadas.
- **AC-2**: La suite completa verifica eventos, reproducción sin efectos, fallos, contratos, validación, autorización, duplicados, incertidumbre y progreso. Chromium ejecuta todos los recorridos; Firefox y WebKit ejecutan comprobaciones esenciales identificadas. El servidor de entrega es exclusivo y nunca reutiliza desarrollo.
- **AC-3**: Comprobar teclado, foco visible, nombres accesibles, estructura expuesta a tecnologías de asistencia, contraste, reducción de movimiento y pantallas390/701/1440. La inspección del árbol accesible no sustituye una sesión con lector de pantalla, que conserva su resultado separado.
- **AC-4**: Las quince rutas públicas tienen contenido y destinos de anclas; no producen errores de JavaScript/hidratación ni operaciones de negocio al abrir. Los controles y feedback se ejercitan con las suites de cada recorrido, incluidos referencia y desafíos.
- **AC-5**: Una compra emite POST real y permite GET/PATCH, mantiene permisos y deduplicación; reproducción y favoritos no emiten otra operación. Se revisan las ocho comprobaciones de calidad con evidencia concreta. Los dieciséis principios originales se acreditan solo si se dispone de su lista, nunca sustituyéndolos por reglas inventadas.

Las cinco primeras comprobaciones de calidad del Master Prompt requieren evidencia de comprensión con participantes. La matriz técnica demuestra mecanismos disponibles, pero no acredita esos resultados humanos. El contraste de la sección15 tampoco sustituye los requisitos de las secciones1 a19.
- **AC-6**: Registrar mediciones locales identificadas de navegación, TTFB, bytes JS y duración observada de operaciones, con motor, muestra, caché y limitaciones. No presentar estos datos como rendimiento de producción ni como tiempos de los modelos.
- **AC-7**: Entregar configuración y pruebas repetibles, instrucciones, arquitectura, persistencia y simplificaciones, evidencia por criterio y pendientes explícitos. El bloque no se marca completo si queda un criterio obligatorio sin acreditar. Git y publicación quedan bajo control del usuario.

## Decision

Reutilizar Vitest y Playwright, con una configuración de entrega en puerto3100 que arranca `npm start` después de un build explícito. Una copia temporal limpia permite comprobar instalación sin alterar el servidor del usuario. No se agregan dependencias, servicios ni endpoints (basis: AGENTS.md, package.json y guía local de Next.js para Playwright).

**Implementation skills**: `ponytail:ponytail`, `architect`, `check verify`, `test`, `sync`.

## Feature design

`playwright.delivery.config.ts` extiende la configuración existente. Chromium usa toda la suite; Firefox y WebKit usan `delivery.spec.ts`. Las evidencias efímeras viven en `test-results/`; los resultados seleccionados y el informe permanecen junto a esta spec.

| Dato | Fuente |
|---|---|
| Resultados y versiones | Salida real de npm, Node y Playwright |
| Navegación y tamaños | Quince rutas públicas, viewports1440/701/390 de Playwright |
| Nombres y estructura accesible | Roles/nombres calculados por navegador y ariaSnapshot |
| Contraste | Tokens CSS actuales y fórmula de luminancia relativa, pares documentados |
| TTFB/DCL/bytes JS | PerformanceNavigationTiming y PerformanceResourceTiming; encodedBodySize suma tamaños codificados, no tráfico transferido ni latencia de modelos |
| Resultado HTTP | Request/Response observados al operar el servidor local |
| Precisión y pedagogía | Contenido, límites y comportamiento de las ocho comprobaciones de calidad |

No cambia contratos, almacenamiento, credenciales ni progreso. Las pruebas usan datos ficticios y procesos aislados. No hay nuevos parámetros de entorno.

Cada ruta empieza con un contexto de navegador nuevo:1440 es su primera navegación,701 y390 reutilizan su caché. El servidor ya puede estar caliente. Cada combinación aporta una muestra, sin throttling ni pretensión estadística. El recorrido HTTP añade tiempos de solicitud de Playwright. El informe distingue esas medidas de fetch+parsing mostrado por la aplicación.

La matriz editorial contiene principiante, junior, backend, arquitecto, visual, causalidad, implementación y precisión. Cada fila requiere un comportamiento observado, una prueba o captura concreta, resultado y límite. Nombres accesibles se comprueban para botones y campos visibles; ariaSnapshot de main390 es evidencia de estructura inicial, complementada por navegación y evaluaciones de las suites existentes. Contraste comprueba pares de tokens declarados; no certifica todos los posibles píxeles o estados.

## Build plan

1. Instalar y completar el recorrido real con regresiones sobre producción nueva (AC-1, AC-2, AC-5).
2. Contrastar las superficies y mecanismos en los tres motores, sus tamaños y semántica accesible; conservar pruebas estables (AC-3, AC-4).
3. Medir navegación y operación, revisar las ocho comprobaciones y registrar precisión y límites pendientes (AC-5, AC-6).
4. Entregar comandos, resultados y estado de alcance coherente (AC-7).

## Consequences

La entrega puede repetirse sin confundir una instancia anterior con el build comprobado. Los tres motores requieren instalar sus binarios. Las mediciones dependen del equipo y la caché. La revisión editorial y el árbol accesible aportan evidencia, pero no acreditan comprensión con estudiantes ni uso real de un lector.

## Follow-up

La sección15 del prompt original está recuperada; [precision.md](precision.md) distingue la revisión inicial de sus correcciones posteriores. El resultado humano del lector está confirmado y atribuido en [reader.md](reader.md), con su cobertura original. El23 de octubre se reabre el cierre del bloque20 al contrastar el Master Prompt completo. La [fase5](../../scope2/fase5-verificacion.md) ya aporta matriz de las secciones1 a19 y regresión técnica de758/215 sobre fuentes coincidentes; la validación con participantes sigue pendiente en la fase4 de [scope2](../../scope2/index.md). Esta spec conserva In Progress hasta integrar esos resultados y comprobar las correcciones que pudieran requerir. Los resultados anteriores permanecen como evidencia histórica.

## Rationale

Opciones y fuentes en [rationale.md](rationale.md).
