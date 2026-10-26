# Razones del ejemplo SQL capturado

## Context

La fase2 de [scope2](../../scope2/index.md) completa la vista de almacenamiento de la sección6 del Master Prompt. La app observa escrituras en un Map y compara dos capturas; faltaban el ejemplo SQL y el regreso a la anterior. Se mantienen el stack, el diseño de `design.md`, Journey y Workflow Beta. El almacenamiento y el modelo de pedidos siguen definidos por las specs0002 y0013.

## Options considered

1. Panel junto al inspector, con datos del evento seleccionado. Separa el mecanismo de la captura y la alternativa pedagógica. El usuario eligió esta opción.
2. Ejemplo dentro de Código. Mezcla dos implementaciones en el mismo panel y requiere ampliar el reproductor compartido.
3. Texto estático de arquitectura. No vincula parámetros con una ejecución ni satisface la exploración del pedido capturado.

## Rationale

La proyección pura de `TraceEvent.output` conserva la asociación con la escritura, incluso cuando el modelo pierde la respuesta. Tomar datos del formulario o del resultado final cambiaría el ejemplo al editar o confundiría un reintento con una nueva escritura. Intercambiar las dos capturas existentes resuelve el regreso sin historial persistente, migración, rutas, permisos o dependencias nuevas.

El usuario pidió conservar los pasos de verificación junto a la spec. Por eso esta decisión pasó de archivo único a un directorio con contrato, razones y comprobación.

## Revisión independiente

Una revisión de solo lectura con otro modelo no encontró huecos de decisión bloqueantes. Se precisó el aviso para un `persist` fallido con salida completa y se aclaró que los ids de simulación pueden repetirse. Ambas precisiones forman parte del contrato antes de su implementación. La revisión de diseño no sustituyó las pruebas de funcionamiento.
