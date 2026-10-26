# 0001. Arquitectura del laboratorio

**Date**: 2026-10-21
**Status**: Accepted

## Summary

El laboratorio será una aplicación única que ejecutas localmente. El navegador alojará los experimentos y un servidor local atenderá las operaciones HTTP reales. El contenido educativo y las trazas estarán separados de los componentes visuales para reutilizarlos.

## Decision

Elegir un monolito modular con Next.js App Router, React y TypeScript estricto. Mantener las operaciones reales en Route Handlers y las simulaciones como funciones puras que producen eventos. Las decisiones de diagramas SVG, reducer de React y almacenamiento temporal fueron elegidas por el usuario durante esta conversación.

## Proposed stack

| Capa | Elección | Motivo |
|---|---|---|
| Ejecución | Node.js y npm | Ya disponibles en el entorno, sin servicios adicionales |
| Framework | Next.js App Router y React | Responde a la preferencia del proyecto y permite interfaz y endpoint HTTP local en una sola aplicación |
| Lenguaje | TypeScript estricto | Comprueba los contratos de eventos y datos durante la compilación |
| Estilos | Tailwind CSS y variables CSS | Responde a la preferencia del proyecto y permite un lenguaje visual consistente |
| Diagramas | SVG con controles HTML accesibles | Selección del usuario, sin añadir un editor de grafos para recorridos causales |
| Movimiento | CSS y reproducción gobernada por eventos | La animación representa el estado inspeccionable, respeta reducción de movimiento |
| Estado interactivo | Reducer y hooks de React | Selección del usuario, permite probar transiciones sin biblioteca global |
| Pedidos | Memoria temporal del proceso servidor | Selección del usuario, demostración explícita sin configuración de base de datos |
| Progreso | localStorage validado | Recupera progreso por dispositivo y admite ausencia o corrupción de almacenamiento |
| Pruebas de lógica | Vitest | Comprueba eventos, validación y transiciones sin navegador |
| Pruebas de recorridos | Playwright | Comprueba interacción y peticiones reales en un navegador |
| Comprobación estática | ESLint y TypeScript | Detecta errores de estructura, tipos y uso de React |
| Observación | trace ID y eventos devueltos por el endpoint | Conecta petición, ejecución y resultado sin inventar mediciones de infraestructura |
| Ejecución de entrega | Servidor local de Next.js | La publicación y elección de hosting no forman parte de esta entrega |

## Límites de módulos

`src/app/` contiene páginas, layouts y Route Handlers. `src/components/` contiene componentes visuales. `src/lib/` contiene contratos, simuladores y lógica comprobable. `src/content/` alojará contenido educativo estructurado cuando se implemente ese recorrido.

Las páginas solo anuncian experiencias ya operables. Las futuras áreas permanecen documentadas como pendientes, sin botones decorativos ni rutas vacías que parezcan terminadas.

El servidor valida datos externos antes de ejecutar negocio. Los editores pedagógicos muestran datos y código representativo; no ejecutan código arbitrario del usuario en el servidor.

## Contrato entre ejecución y reproducción

Una operación real genera una traza capturada una sola vez. El reproductor inspecciona esa captura y no repite escrituras al retroceder ni al pulsar replay. Los eventos distinguen ejecución observada de ilustración conceptual. Un tiempo lógico del reproductor nunca se presenta como latencia medida.

## Consequences

La aplicación y la API comparten un proceso servidor durante el desarrollo. El navegador y ese servidor siguen siendo procesos distintos, comunicados mediante HTTP real. Esta arquitectura evita operar infraestructura que no aporta al primer recorrido.

La memoria temporal se pierde al reiniciar y no se comparte entre procesos o instancias. No es almacenamiento apto para pedidos de producción. Los permisos y credenciales demostrativos tampoco constituyen autenticación de producción.

SVG requiere construir los diagramas concretos, pero evita incorporar edición libre de grafos antes de necesitarla. El reducer debe mantener eventos serializables y separar efectos de transiciones puras.

## Rationale

El contexto, las alternativas y sus compromisos están en [rationale.md](rationale.md).

## Follow-up

El modelo causal y de datos, el sistema visual y la operación de pedidos se detallan en sus bloques de alcance antes de construir esos recorridos. La búsqueda de skills y MCP adicionales fue rechazada para este stack, no corresponde volver a ofrecerla.
