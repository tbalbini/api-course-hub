# Consola de compra y trazas

## Summary

La consola muestra una compra pequeña junto a un diagrama y un inspector. Puedes mantener el contexto mientras cambias de profundidad y recorres eventos.

## Feature design

La fuente de diseño es la dirección descrita en el master prompt y la elección de consola integrada del usuario. No se necesitan imágenes externas. El lenguaje visual es oscuro, técnico y legible, con límites de proceso identificados y diagramas SVG. Los tokens concretos se definen en CSS; `design.md` explica composición y uso.

La cabecera identifica el laboratorio y permite activar X Ray. El contenido empieza por pregunta causal y aviso de captura frente a reproducción. Una columna contiene producto, cantidad, credencial y botones de compra y acción local. Otra contiene diagrama y estado del paso. Debajo aparecen controles, timeline seleccionable e inspector de explicación, código y request o response. La captura anterior puede compararse con la actual.

El modo real crea el pedido mediante fetch. El modo simulado permite elegir escenario e inyectarlo sin enviar peticiones. Se muestra el resultado real de la compra separado del estado representado por el cursor. El replay y el retroceso no deshacen el pedido ni lo vuelven a crear.

Cada nueva compra genera un UUID como Idempotency-Key y captura su payload. Si fetch falla o recibe 5xx, el intento queda incierto y el botón reintenta con la misma clave y los mismos datos; la cantidad permanece bloqueada. Un éxito o un rechazo definitivo 4xx cierra ese intento. La siguiente compra genera otra clave. Este estado pertenece a la página abierta y no promete conservarse tras cerrar o recargar el navegador.

En el diagrama remoto hay fronteras de navegador, HTTP y servidor, con almacenamiento en memoria dentro del servidor. Una vista conceptual adicional explica proxy, balanceador y negociación de red como componentes opcionales no observados. La acción local no cruza la frontera de red.

Los eventos se seleccionan mediante botones y slider nativos además del SVG. Los controles tienen nombres accesibles y foco visible. En móvil las columnas se apilan y el código puede desplazarse horizontalmente. La preferencia de movimiento reducido mantiene capturas pausadas y elimina movimiento decorativo. Las novedades reales se anuncian en una región de estado, sin leer cada avance automático.

La navegación solo ofrece rutas construidas, inicio y recorrido central. Un texto de estado aclara que currículo y laboratorios adicionales están pendientes. No se crean rutas vacías para completar una barra lateral.

Intuition explica el problema en lenguaje simple. Engineering muestra contrato, datos y frontera. Internals explica implementación, estados ambiguos y límites. Los tres niveles pertenecen al mismo evento; cambiar de nivel no reinicia la operación.
