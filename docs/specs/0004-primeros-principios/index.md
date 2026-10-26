# 0004. Primeros principios y API Anatomy

**Date**: 2026-10-21
**Status**: Accepted

## Summary

Una consola por capítulo conecta los capítulos 0 a 3 con experimentos, API Anatomy y evaluación razonada. Puedes ejecutar funciones y DOM locales, cambiar una implementación y explorar otras fronteras mediante modelos explícitos. El progreso exige resolver una comprobación y realizar un desafío.

## Requirements

AC-1. `/first-principles` ofrece cuatro capítulos seleccionables. Cada uno incluye pregunta, intuición, explicación de mecanismo, compromisos, alternativas, límites, código, error conceptual, comprobación con feedback y desafío evaluado. La navegación existente enlaza al recorrido y conserva Follow the Click.

AC-2. El capítulo 0 ejecuta sumar con argumentos enteros modificables de -1000 a 1000, incluidos 2 y 3, y 10 y 20. Muestra firma, argumentos, transferencia de control, ejecución y retorno con pila y memoria conceptuales reconstruidas al retroceder. Ningún paso del reproductor vuelve a invocar la función. Programa, instrucción, proceso, memoria, función, input, output y abstracción tienen explicación técnica.

AC-3. El capítulo 1 permite elegir suma directa, reducción equivalente o retorno de string incompatible. Ejecuta la implementación elegida y comprueba explícitamente tipo y significado frente al contrato. Distingue chequeo del laboratorio de garantías automáticas de TypeScript. Enseña encapsulación, acoplamiento, implementación intercambiable, responsabilidades, compatibilidad y evolución. El código observado corresponde a la opción elegida.

AC-4. El capítulo 2 ejecuta querySelector y textContent sobre un nodo aislado del ejemplo sin fetch. Texto libre se inserta como texto, nunca HTML. Un explorador de ejemplos distingue Math.max, lenguaje y biblioteca estándar, DOM, archivos, system calls, dispositivos, cliente de base de datos y SDK. Cada ejemplo identifica superficie, frontera y qué depende de la implementación, sin afirmar que todo SDK o acceso a archivos cruza una red.

AC-5. API Anatomy ofrece Consumer, Contract, Provider, Execution y Result seleccionables en los siete mecanismos: función, IPC local, system call, HTTP, RPC remoto, mensaje asíncrono y suscripción. Cambia agrupación y etiquetas de frontera. Función no tiene flecha de red, IPC local no implica internet y syscall cruza privilegio, no un proceso servidor obligatorio. Mensajes distinguen aceptación de finalización y suscripción distingue registro de entrega de eventos.

AC-6. El capítulo 3 compara memoria compartida local con espacios separados y serialización. Explica pipes, Unix domain sockets, TCP, RPC, timeouts, fallos parciales y concurrencia. En los modelos remotos, éxito, fallo previo a entrega y respuesta perdida cambian eventos. Respuesta perdida permite ejecución del proveedor y resultado desconocido del cliente. Dos invocaciones concurrentes tienen cadenas de dependencia separadas y tiempo lógico compartido, sin métricas inventadas.

AC-7. Cada capítulo registra progreso solo cuando pasan su pregunta y desafío. Se recuperan capítulo y profundidad desde localStorage versionado y validado. JSON inválido, versión desconocida y almacenamiento bloqueado no rompen la consola. Visitar un capítulo no lo completa. Funciona por teclado, a 390 px y con reducción de movimiento. Las pruebas anteriores siguen pasando.

## Decision

Consola por capítulo, elegida por el usuario, dentro del diseño existente. Sin nuevas dependencias, servicios ni ejecución arbitraria de código. La home actual sigue funcionando. El reducer, controles y panel de inspección se comparten con Follow the Click mediante extracción de su JSX, conservando nombres accesibles y comportamiento.

## Feature design

### Contenido y fuentes

`Chapter` contiene id 0..3, título, pregunta, intuición, explicación técnica, compromisos, alternativa, límites, código, error frecuente, conceptos con explicación, quiz con tres opciones y feedback por opción, y desafío con criterios explícitos. Son contenido editorial español de los requisitos originales, separado de componentes. El explorador de ejemplos es otro conjunto estructurado de contenido, no llamadas fingidas.

| Valor | Fuente |
|---|---|
| Argumentos y texto DOM | Campos del usuario, validados antes de ejecutar |
| Resultado local | Implementación elegida ejecutada realmente una vez |
| Firma esperada | sumar(a: number, b: number): number, resultado a + b |
| Implementaciones y código | Tres funciones cerradas del laboratorio y su fuente representativa correspondiente |
| Memoria y pila visuales | Snapshots conceptuales por evento, no una captura del motor JavaScript |
| Topología y contrato de Anatomy | Ficha estructurada del mecanismo seleccionado |
| Resultado remoto simulado | Fixture de sumar(2, 3), condición de fallo y cadena causal del mecanismo |
| Eventos concurrentes | Dos invocaciones A y B intercaladas por etapa, dependencias solo dentro de cada invocación |
| Progreso | Respuestas correctas y flags de desafíos obtenidos al ejecutar acciones verificadas |
| Capítulo y profundidad restaurados | localStorage, clave api-universe-learning-v1, versión 1 y valores validados |

### Ejecución y trazas

Se extiende `TraceEvent.stage` con mecanismos locales y entrega. Snapshot opcional contiene pila, memoria y control, siempre conceptual. Eventos de llamada y resultado locales se observan alrededor de funciones conocidas; la representación interna no pretende revelar registros, direcciones ni decisiones del JIT. El flujo conserva el contrato de Capture y Playback.

La función valida enteros acotados y comprueba que el resultado es number e igual a a+b. Una infracción produce CONTRACT_VIOLATION después del retorno y antes del uso del consumidor. No cambia silenciosamente el resultado defectuoso.

El DOM se busca en un contenedor aislado y se registra antes y después de modificar textContent, limitado a 60 caracteres no vacíos. React no controla el texto interior de ese nodo durante la demostración. La reproducción solo inspecciona, no vuelve a mutar el DOM.

En Anatomy, todos los mecanismos se etiquetan como modelos. Cambiar de mecanismo no ejecuta IPC, syscalls ni tráfico remoto. Los contratos usan parámetros numéricos para llamada, bytes o mensaje para IPC, read para syscall, JSON de suma para HTTP/RPC y mensajes con identidad para entrega asíncrona. No se pretende que una syscall exponga sumar. La aceptación por broker no significa trabajo terminado. Suscripción primero registra interés y después el proveedor entrega un evento al consumidor.

Los fallos y concurrencia del capítulo 3 se aplican a IPC/HTTP/RPC de solicitud y respuesta. Mensajería y suscripciones conservan sus secuencias propias, sin imponerles una respuesta síncrona. Cada rama A/B conserva dependencias propias y tiempo lógico, aunque la timeline permita inspeccionarlas en un orden lineal.

### Progreso y evaluación

Se guarda `{version:1,lastChapter,depth,chapters:{0..3:{quizPassed,flags:[]}}}`. Solo se aceptan ids, profundidades, booleanos y flags conocidos. La lectura devuelve una referencia estable para useSyncExternalStore y un snapshot inicial fijo durante SSR. Ante fallo de escritura se mantiene el progreso de sesión y se informa que no pudo persistir.

Desafíos: capítulo 0 obtiene 42 con ambos argumentos no cero y contrato correcto; capítulo 1 ejecuta reducción compatible y string incompatible; capítulo 2 realiza dos cambios reales de texto distintos; capítulo 3 ejecuta dos invocaciones HTTP concurrentes con respuesta perdida y reconoce la incertidumbre mediante su pregunta. Quiz y desafío son condiciones independientes, con reintentos y feedback explicativo. Inputs y capturas no se persisten; sí capítulo, profundidad y progreso.

### Superficies

Navegación compartida, cabecera, selector de cuatro capítulos con progreso, pregunta causal, experimento junto a Anatomy, modelo de pila y memoria cuando aplica, reproductor e inspector compartidos, contenido técnico desplegable, ejemplos según capítulo, quiz y desafío. Cada selector tiene etiqueta visible y el estado usa texto además de color. El X Ray mantiene profundidad y cursor al alternar nivel. No se añaden enlaces a áreas no construidas.

Las letras conservan la correspondencia del Master Prompt: A identifica la función local del capítulo0 y B la Browser API DOM del capítulo2, con destino `?chapter=2#local-lab-title`. API Anatomy mantiene acceso propio en el capítulo3, `?chapter=3#api-anatomy`, y sus siete mecanismos; no ocupa la letra B. Abrir esos accesos solo navega, sin ejecutar el experimento ni enviar peticiones de negocio.

## Build plan

1. Modelar contenido, evaluación, progreso y mecanismos con funciones puras y pruebas.
2. Ejecutar suma e incompatibilidad, reconstrucción de pila y DOM real, AC-2 a AC-4.
3. Integrar Anatomy, fallos y concurrencia, AC-5 y AC-6.
4. Compartir navegación e inspector, añadir consola por capítulo y persistencia, AC-1 y AC-7.
5. Verificar recorridos reales, evaluación, almacenamiento inválido, móvil y regresiones, AC-1 a AC-7.

## Consequences

Los cuatro capítulos forman un recorrido operable sin infraestructura adicional. Los modelos de IPC, kernel, mensajes y eventos no son ejecuciones de esas tecnologías. La pila conceptual omite optimizaciones y memoria física. El chequeo de contrato es una demostración acotada, no una prueba general de compatibilidad. El progreso local puede editarse y no certifica conocimientos ni se sincroniza entre equipos.

## Follow-up

Taxonomía completa, laboratorios de red y otros capítulos siguen en sus bloques del alcance. No se anuncian aquí como implementados.

## Rationale

Ver [rationale.md](rationale.md).
