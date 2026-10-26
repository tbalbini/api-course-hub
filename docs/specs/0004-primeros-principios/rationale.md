# Razones del recorrido de primeros principios

## Context

El simulador HTTP ya funciona, pero el estudiante todavía necesita descubrir que una API no requiere HTTP. El alcance pide capítulos 0 a 3, funciones locales, DOM y siete mecanismos con fronteras distintas.

## Options considered

Consola por capítulo permite reunir explicación, experimento y evaluación sin una página extensa. Un laboratorio continuo facilita comparar muchos ejemplos a la vez, pero exige más desplazamiento. El usuario eligió consola por capítulo.

Reutilizar el reducer y extraer controles e inspector conserva comportamiento y evita dos reproductores divergentes. Un segundo motor independiente duplicaría transiciones y tratamiento de errores. No se requieren librerías ni evaluadores de JavaScript arbitrario.

## Rationale

El aprendizaje avanza por problemas: pedir una capacidad, estabilizar el contrato, utilizar capacidades locales y cruzar procesos. Los desafíos validan acciones concretas y la pregunta exige interpretar su consecuencia. Separar observación de snapshot conceptual evita presentar el call stack dibujado como instrumentación del motor.

## References

Se mantiene la preferencia de no incorporar referencias de diseño externas. Para revisar precisión se consultaron la especificación ECMAScript sobre contextos de ejecución, DOM Standard y los manuales Linux de syscalls y Unix domain sockets. Los snapshots son un modelo docente; una syscall no se presenta como otro proceso ni los sockets locales como tráfico de internet.

Fuentes técnicas comprobadas: https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html, https://dom.spec.whatwg.org/, https://man7.org/linux/man-pages/man2/syscalls.2.html y https://man7.org/linux/man-pages/man7/unix.7.html.
