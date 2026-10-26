# 0003. Red e infraestructura del recorrido

**Date**: 2026-10-21
**Status**: Accepted

## Summary

Puedes explorar qué preparación necesita una petición antes de llegar a la aplicación y qué componentes podrían recibirla. Red e Infraestructura son vistas de la misma traza, con el mismo cursor e inspector. Sus pasos adicionales pertenecen a una simulación explícita y no se agregan a capturas reales.

## Requirements

**AC-1:** las vistas Aplicación, Red e Infraestructura conservan captura, cursor, profundidad y resultado real. Seleccionar un paso presente en otra vista dirige el inspector al mismo evento. Las omisiones explican su causa.

**AC-2:** la simulación permite IP local HTTP, nombre remoto HTTP y nombre remoto HTTPS. En una conexión nueva, una IP no requiere DNS; un nombre con caché DNS válida omite la consulta; la conexión nueva usa TCP y HTTPS añade TLS. Una conexión ya abierta omite DNS y nuevos handshakes. El modelo acotado es HTTP/1.1 sobre TCP y describe explícitamente sus límites frente a HTTP/2 y HTTP/3.

**AC-3:** se distinguen preparación, transmisión de solicitud, procesamiento y transmisión de respuesta. Un fallo anterior a entrega no llega al proveedor. Un timeout después de guardar puede perder la respuesta y dejar un resultado incierto en el cliente. Duplicar una petición conserva payload y clave, muestra otra invocación y una sola escritura.

**AC-4:** elegir acceso directo, proxy o proxy con balanceador modifica eventos y vista de infraestructura. Router, funciones de middleware y handler se distinguen del transporte y del almacenamiento. Los roles de proxy y balanceador pueden compartir componente; no se afirma que siempre sean procesos distintos. En HTTPS con proxy, el modelo termina TLS en la entrada y declara fuera de detalle la conexión de entrada a aplicación.

**AC-5:** las capturas reales explican qué no se instrumentó. No se infieren DNS, TLS, protocolo negociado ni presencia o ausencia de proxies de una llamada fetch. Favoritos no muestra red ni infraestructura remota. Cambiar condiciones solo afecta la siguiente simulación, nunca envía peticiones a los destinos ficticios ni altera una captura anterior.

**AC-6:** controles, vistas y pasos funcionan por teclado y en móvil, con etiquetas además de color. Se conservan compra, permisos, reintento incierto y controles anteriores, con pruebas de lógica y navegador y compilación correcta.

## Decision

Ampliar el generador y las vistas actuales. El usuario eligió el mismo panel y un modelo TCP acotado. No se añaden dependencias ni servicios externos. Los eventos usan el reproductor y el inspector existentes.

## Feature design

### Datos y transiciones

`NetworkSettings` contiene target (`local`, `http`, `https`), dnsCached booleano, reuseConnection booleano e ingress (`direct`, `proxy`, `balanced`). Su copia pertenece a la captura simulada. El formulario mantiene las condiciones de la próxima ejecución separadas de esa copia.

`TraceEvent.stage` identifica el mecanismo sin comparar textos traducidos. Los actores adicionales identifican resolver, transporte, proxy y balanceador. Las fronteras distinguen consulta DNS, transporte y entrada entre componentes del servidor. Los eventos originales siguen siendo serializables y se indexan al terminar la captura.

Los orígenes son fixtures: `http://127.0.0.1:3000`, `http://tienda.example` y `https://tienda.example`. Se combinan con el método y la ruta del escenario, POST `/api/orders` o GET `/api/orders/{id}`. Cambiar el origen conserva el identificador y el significado de las consultas 200 y 404. La IP remota ilustrativa es `203.0.113.10`. No se consultan ni se miden. Un campo cacheado se interpreta como resolución válida para este escenario, sin simular expiración de TTL.

El orden es invocación fetch, preparación de conexión necesaria, transmisión, ingreso opcional, recepción del servidor, router, middleware conceptual, permisos, validación, handler, negocio, almacenamiento, construcción de respuesta, transmisión de respuesta y actualización cliente. Son etapas causales simplificadas, no un diagrama de cada paquete ni un cálculo de RTT.

La segunda invocación del escenario duplicado reutiliza la conexión abierta de la primera y conserva la clave. El timeout simulado diferencia respuesta construida de respuesta recibida. No se repiten efectos reales al navegar.

### Superficies

La consola actual recibe tres botones de vista junto al diagrama. Los controles de condiciones aparecen solo en modo simulado. Red muestra etapas y omisiones con motivos. Infraestructura agrupa roles de entrada opcionales y etapas internas de la aplicación, e identifica almacenamiento en memoria. Ambas vistas comparten selección con timeline e inspector y muestran la configuración capturada.

En una captura real, la vista de red muestra la invocación y recepción observadas y declara sin instrumentar DNS, TCP y TLS. La infraestructura presenta las funciones realmente instrumentadas dentro del Route Handler, sin inventar middleware de Next.js ni roles externos. Un evento no alcanzado no se representa como una omisión tecnológica.

| Valor producido o mostrado | Fuente |
|---|---|
| Destino, hostname, esquema y puerto | Origen fixture elegido en NetworkSettings, combinado con método y ruta del escenario |
| Etapas DNS, TCP y TLS, o motivo de omisión | Combinación de target, dnsCached y reuseConnection |
| Configuración visible en una captura | Copia de settings guardada al ejecutar, no el formulario actual |
| Roles de entrada y destino app-1 | ingress y fixture de balanceo, sin métricas de carga inventadas |
| Mensajes y errores | Contrato del escenario y pedido simulado existente |
| Selección y estado de reproducción | Cursor y stage de los eventos de la captura actual |
| Evidencia en capturas reales | Eventos recibidos del endpoint y de la instrumentación cliente |

### Invariantes y seguridad

Las funciones del modelo son puras. Ninguna usa fetch, temporizadores de red, almacenamiento ni credenciales externas. Los endpoints reales siguen fijos en `/api/orders`. No se cambia el contrato de autorización ni el estado de reintento. Los destinos `.example` y direcciones de documentación solo aparecen como texto y datos de simulación.

### Escenarios críticos

Comprobar la matriz de destinos, caché y reutilización, AC-2. Comparar acceso directo y proxy con balanceador, AC-4. Probar fallo antes de entrega, timeout tras escritura y duplicado, AC-3. Cambiar ajustes después de capturar y comprobar inmutabilidad y cero solicitudes remotas, AC-1 y AC-5. Comprobar la compra real y selección entre vistas, AC-5 y AC-6.

## Build plan

1. Extender tipos y catálogo causal e implementar generación de red e ingreso, AC-2 a AC-5.
2. Conectar escenarios, ida y vuelta y recuperación del pedido duplicado, AC-3 y AC-5.
3. Construir controles y vistas integradas accesibles, AC-1, AC-4 y AC-6.
4. Comprobar matriz de condiciones, regresiones y recorridos de navegador, AC-1 a AC-6.

## Consequences

Se puede observar cómo cambia el recorrido sin levantar infraestructura. El modelo no negocia conexiones reales, no modela todos los mensajes de TLS ni representa HTTP/3 con un handshake TCP. La conexión entre proxy y aplicación, TTL, reanudación de TLS, 0 RTT, retransmisiones de paquetes y métricas de latencia quedan señalados como fuera de detalle.

## Rationale

Las razones y alternativas están en [rationale.md](rationale.md).
