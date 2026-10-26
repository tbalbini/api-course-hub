# Decisión del diseñador de contratos

## Context

Ya existen consumidores y proveedores reales y modelos de varios mecanismos. Falta poder cambiar una interfaz y demostrar qué consumidor se rompe y por qué.

## Options considered

Un editor general de OpenAPI requiere un validador extenso y distrae de las consecuencias del diseño. Un diseñador guiado limita las dimensiones, permite mensajes libres y produce ejemplos coherentes. Un panel solo de recomendaciones no prueba comportamiento.

## Rationale

El usuario eligió diseñador guiado. Comparar el mismo negocio evita atribuir diferencias a fixtures distintos. Separar schema de reglas de negocio demuestra el alcance real de contract testing. Colecciones y reintentos usan modelos aislados para hacer reproducibles la concurrencia y la pérdida de respuesta sin alterar pedidos reales. Se conserva la preferencia del proyecto de no añadir sección de referencias.
