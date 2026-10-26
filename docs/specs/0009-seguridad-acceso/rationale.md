# Decisión del laboratorio de seguridad

## Context

El laboratorio ya usa credenciales públicas para pedidos, pero falta separar autenticación, permisos y políticas del navegador. Una respuesta ilegible no demuestra que el servidor rechazó la operación.

## Options considered

HTTP existente con modelos permite inspeccionar fallos reproducibles sin cuentas. Añadir un segundo origen real demostraría CORS en el navegador, pero introduciría otro servidor y configuración. Integrar un proveedor real de auth desviaría el objetivo hacia configuración y gestión de usuarios.

## Rationale

El usuario eligió HTTP y modelos. Reutilizar OrderConsole conserva la protección existente de reintentos y evita duplicar clientes. Separar recepción, efecto y lectura permite explicar CORS y CSRF con precisión. Los pipelines distinguen categorías de credenciales sin ejecutar criptografía falsa ni tratar un token decodificado como validado. Se conserva la elección del proyecto de no incluir sección de referencias en las specs.
