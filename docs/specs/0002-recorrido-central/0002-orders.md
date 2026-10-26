# Operación HTTP de pedidos

## Summary

El endpoint recibe datos, decide permisos, valida y crea un pedido temporal. Devuelve eventos observados en el servidor y un identificador que puede seguirse desde el navegador.

## Feature design

| Superficie | Entrada | Salida | Acceso | Fallos |
|---|---|---|---|---|
| POST `/api/orders` | JSON con sku y quantity; Idempotency-Key | Pedido, eventos y traceId, 201 nuevo o 200 repetido | Bearer `demo-buyer` | 400, 401, 403, 409, 413, 415, 429, 500 |
| GET `/api/orders/[id]` | Identificador de ruta | Pedido y traceId | Bearer `demo-buyer` o `demo-reader` | 401, 404 |

`demo-reader` identifica un lector y recibe 403 al crear. Cualquier valor no reconocido recibe 401. Son valores públicos del laboratorio y no protegen datos de producción.

El servidor valida Content-Type JSON, un cuerpo máximo de 4096 bytes, objeto con sku permitido y quantity entero entre 1 y 5, sin campos inesperados. Calcula total y estado a partir de las constantes y reglas del modelo. Una clave repetida con datos distintos produce 409. Los errores tienen `{error:{code,message},traceId,events}` y las respuestas usan `Cache-Control: no-store` y `X-Trace-Id`.

El servicio síncrono comprueba e inserta el pedido sin await entre ambas operaciones. Esto evita duplicados concurrentes dentro del proceso único. No se promete deduplicación entre instancias ni después de reiniciar. El límite de memoria es demostrativo, no un sistema general de rate limiting.

| Valor mostrado | Fuente |
|---|---|
| Pedido y total | Servicio servidor y constantes de producto |
| HTTP status, headers y body | Response real de fetch |
| Eventos del servidor | Etapas instrumentadas del servicio y Route Handler |
| Fecha | Reloj servidor en ISO, sin presentarlo como timestamp de red |
| traceId | UUID servidor, también en header |
| Duración observada | performance.now antes de fetch y después de recibir y parsear JSON |
| Error de conectividad | Excepción de fetch, separada de respuestas HTTP de error |

El cliente envía únicamente a endpoints locales previstos. El servidor no reenvía URLs arbitrarias ni evalúa código. El botón local solo cambia un booleano de interfaz y produce eventos locales.
