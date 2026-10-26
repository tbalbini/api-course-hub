# Decisión de Systems Lab

## Context

El estudiante ya puede crear una operación, inspeccionar mensajes y cambiar contratos. Falta explicar por qué añadir servicios introduce fallos parciales y por qué recuperar no equivale a deshacer todo.

## Options considered

Un lienzo libre ofrece más combinaciones, pero exige definir comportamiento para topologías arbitrarias. Un constructor guiado hace explícitos los límites de cada ruta y permite pruebas causales. Levantar servicios reales añade infraestructura y ruido temporal sin mejorar este primer experimento determinista.

## Rationale

El usuario eligió constructor guiado. Se reutilizan componentes y modelo de trazas. La concurrencia exige un planificador con dependencias por rama, no indexEvents lineal. Separar consulta de transacciones evita aplicar retries de lectura a cobros. La comparación conserva condiciones de cada captura y no proclama una arquitectura ganadora. Se mantiene la preferencia de no añadir sección de referencias.
