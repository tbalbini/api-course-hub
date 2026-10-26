# Guion para participantes, versión1

El moderador entrega solo el bloque que corresponda, de uno en uno. Las preguntas finales se presentan después de explorar. No entregar el protocolo de evaluación ni sus respuestas esperadas antes de la sesión.

Estamos evaluando el laboratorio. Puedes explorar, explicar lo que piensas, pedir ayuda o detenerte. No hay compras ni pagos reales. No necesitas recordar definiciones exactas.

## Inicio, todos los perfiles

Sin abrir la app: ¿qué experiencia tienes con programación y APIs? ¿Habías visto este laboratorio? ¿Cómo puede un botón cambiar algo en otra computadora? ¿Qué podría cambiar sin comunicarse con ella?

## V1, todos los perfiles

Abre Follow the Click. Predice qué harán Guardar en favoritos y Comprar ahora. Prueba ambos y explora el diagrama paso a paso, primero sin abrir código, Request / Response o explicaciones largas.

¿Quién hace cada cambio? ¿En cuál participa otro proceso? Señala dónde lo ves. ¿Qué crees que hará replay?

Después: una galería permite ocultar una foto en pantalla y eliminarla de una cuenta compartida. ¿Qué necesitas averiguar para decidir si cada botón cruza una red?

## N1, principiante

En el capítulo0 cambia los argumentos y ejecuta la función. Señala quién pide, quién ejecuta y qué se devuelve. En el capítulo2 modifica el texto del nodo y aplica el cambio DOM. Explora las explicaciones que necesites.

¿Qué tienen en común? ¿Para qué sirve acordar cómo pedir una capacidad? Si no hay acceso a internet, ¿cuáles podrían funcionar y por qué?

Después: un editor sin conexión llama a una biblioteca para calcular el ancho de un texto. ¿Hay una API? ¿Qué necesita conocer el editor y qué puede ignorar?

## J1, junior

En Playground, HTTP, prepara un POST de pedido. Revisa el mensaje antes de enviarlo. Inspecciona su respuesta. Cambia quantity a0 y vuelve a enviar. Explica método, URL, headers, body, status y la diferencia entre los resultados. Predice cómo corregirías el problema.

Después: si llega HTTP200 y el cuerpo indica que se rechazó el pago, ¿qué puedes afirmar sobre HTTP y sobre el negocio? ¿Repetir POST es seguro solo por usar ese método?

## B1, backend

Compara REST y GraphQL para consultar el mismo pedido. Cambia campos y explora una respuesta perdida. En Seguridad compara las credenciales al confirmar. En Contratos cambia quantity por units y explora compatibilidad y coexistencia de versiones en ambas direcciones. Explica qué decisiones tomarías y qué compromisos aceptas.

Después: un cliente antiguo exige quantity y otro usa units. El proveedor quiere retirar v1 y una confirmación terminó pero se perdió su respuesta. Propón migración y recuperación, explica quién puede confirmar y qué falta por saber.

## A1, arquitecto

En API Anatomy compara función local, IPC, HTTP y mensaje asíncrono. Señala memoria, procesos y fronteras. En Eventos explora entregas de webhook con confirmación perdida y deduplicación; compara con las conexiones de SSE y WebSocket.

Después: un módulo llama a una biblioteca, un servicio recibe un comando y otro publica un evento para dos consumidores. Uno procesa y el otro se retrasa. Dibuja componentes y fronteras, explica qué confirma cada emisor y qué datos faltan. ¿Necesita todo eso un Gateway o microservicios?
