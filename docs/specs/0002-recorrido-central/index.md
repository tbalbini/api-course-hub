# 0002. Primer recorrido de compra inspeccionable

**Date**: 2026-10-21
**Status**: Accepted

## Summary

Puedes crear un pedido real contra el servidor local y estudiar la traza de esa operación. También puedes comparar un cambio puramente local y simular fallos sin presentarlos como capturas de red reales. El reproductor mueve el punto de observación y nunca repite la compra.

## Structure

| Documento | Decisión |
|---|---|
| [Datos](0002-data.md) | Contratos compartidos de pedido, evento y reproducción |
| [Operación](0002-orders.md) | Validación, permisos demostrativos y deduplicación en servidor |
| [Interfaz](0002-interface.md) | Composición de consola, diagramas e inspectores |

## Requirements

**AC-1:** crear un pedido ejecuta un POST real y muestra estado HTTP, respuesta e identificador del servidor. Cambiar el estado local no ejecuta fetch.

**AC-2:** validación y permisos ocurren en servidor. Los datos inválidos reciben un error estructurado; credencial ausente y permiso insuficiente se distinguen.

**AC-3:** repetir la misma clave y contenido recupera el pedido sin duplicarlo. Cambiar el contenido bajo esa clave produce conflicto.

**AC-4:** reproducción, pausa, avance, retroceso, replay, velocidad y selección de evento funcionan sobre una captura inmutable. El diagrama y los inspectores siguen el evento seleccionado y se conservan al cambiar profundidad.

**AC-5:** la simulación permite 200, 201, 400, 401, 403, 404, 409, 429, 500, timeout, fallo de red y petición duplicada. Las ramas detienen o alteran el flujo, muestran datos y efectos, y no escriben en el servidor.

**AC-6:** los eventos distinguen observación de ilustración. En HTTP local no se inventan DNS ni TLS; las explicaciones de infraestructura opcional se identifican como conceptuales. Tiempo lógico y duración observada tienen etiquetas distintas.

**AC-7:** X Ray muestra actor, contrato, frontera, entrada, salida, código, resultado y errores; Intuition, Engineering e Internals conservan el contexto.

**AC-8:** consola e inspectores funcionan por teclado, en móvil y con reducción de movimiento. Los errores de fetch permiten reintentar. Las áreas futuras no se anuncian como disponibles.

## Decision

Completar primero este recorrido usando la arquitectura 0001. El usuario eligió un producto, consola integrada y roles públicos de comprador y lector. El ejemplo no procesa pagos ni datos personales. Los detalles de demostración no seleccionados explícitamente se recomiendan como valores pequeños y fijos en los documentos de contrato.

## Build plan

1. [x] Definir contratos, transiciones puras y generador de escenarios, AC-3 a AC-7.
2. [x] Implementar almacenamiento temporal acotado y servicio de pedidos con validación y deduplicación, AC-1 a AC-3.
3. [x] Exponer POST y consulta por identificador, capturando eventos reales y errores, AC-1, AC-2, AC-6.
4. [x] Construir la consola, captura y acción local, AC-1, AC-6, AC-8.
5. [x] Conectar reproductor, SVG, timeline, inspector y profundidad, AC-4, AC-7, AC-8.
6. [x] Conectar inyección de fallos y comparar la captura anterior con la actual, AC-3 a AC-6.
7. [x] Comprobar lógica, permisos, límites y recorridos reales de navegador, AC-1 a AC-8.

## Consequences

Este recorrido inicia los bloques 3 a 7, pero no completa el currículo, la navegación de todas las áreas ni X Ray en laboratorios que aún no existen. Las credenciales son valores públicos de demostración, no secretos ni autenticación de producción. Los pedidos se pierden al reiniciar. Replay no deshace la compra real.

## Rationale

Ver [rationale.md](rationale.md).
