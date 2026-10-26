# Razones de la ampliación

## Context

La traza actual agrupa la red en un único paso conceptual y el diagrama no distingue ingreso y funciones internas. Eso impide experimentar con conexión reutilizada, caché o componentes opcionales. Las capturas reales existentes no observan esos mecanismos de red y no deben interpretarse como si los midieran.

## Options considered

Ampliar el generador actual conserva controles, inspectores y pruebas. Requiere diferenciar fases e incluir configuración en la captura para que el formulario no cambie lo ya ocurrido.

Crear otro simulador permitiría una superficie independiente, pero duplicaría reproducción y selección. Sustituir el reproductor completo no resuelve un fallo existente y ampliaría las regresiones.

## Rationale

El usuario eligió vistas en el mismo panel y un modelo de red acotado. La ampliación mantiene el recorrido completo y hace visible por qué un paso aparece o se omite. No se eligen herramientas ni servicios nuevos. Se conserva la preferencia de no añadir referencias a los documentos de decisión.
