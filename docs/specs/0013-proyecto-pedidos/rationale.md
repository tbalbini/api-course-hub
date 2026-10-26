# Decisión del proyecto final

## Context

Ya existen POST real y consola GET/PATCH, pero falta integrar la explicación con el código real y observar el servidor en las tres operaciones. Otra miniaplicación duplicaría reglas y podría enseñar algo distinto de lo que ejecuta.

## Options considered

Un ejemplo separado facilita copiar una carpeta, pero obliga a mantener dos implementaciones. El proyecto existente ofrece una frontera y pruebas reales; mostrar archivos exactos limita la edición interactiva a cambio de una correspondencia verificable. Un editor libre añade ejecución y aislamiento fuera del objetivo del capítulo.

## Rationale

El usuario eligió archivos reales. Se preservan Map, permisos e idempotencia y se amplía instrumentación. Snapshot JSON importado al bundle, generado antes de compilar desde allowlist, evita lectura de archivos durante runtime y permite comprobar la versión compilada. El progreso común registra resultados y no datos de pedidos. Se conserva la preferencia de no añadir sección de referencias.
