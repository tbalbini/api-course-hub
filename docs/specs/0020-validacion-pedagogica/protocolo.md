# Protocolo v1 para el moderador

Fijado el23 de octubre de2026, antes de recoger observaciones. Cubre pruebas1 a5 de la sección16 del Master Prompt. Duración orientativa:30 a60 minutos por persona, con pausas libres; el tiempo no determina aprobación.

## Preparación

Reunir cuatro personas distintas: P01 principiante sin experiencia programando; P02 junior que ha consumido HTTP; P03 backend que ha implementado APIs; P04 arquitecto con experiencia en límites entre procesos y sistemas distribuidos. Registrar la experiencia declarada y cualquier participación previa en este proyecto. Quien construyó el laboratorio no sustituye un perfil externo; si conoce las respuestas, registrarlo y buscar otra persona para ese perfil.

El usuario coordina la disponibilidad. El agente puede revisar fichas y organizar hallazgos, pero no sustituye participantes ni envía invitaciones.

Comprobar Node24 y puerto3100 libre. Generar `npm run build` y arrancar `npm start -- --hostname 127.0.0.1 --port 3100`. Para sesiones en este equipo la base es `http://127.0.0.1:3100`; esa URL no sirve desde otra computadora. En una sesión remota el moderador comparte y opera su pantalla siguiendo las indicaciones de la persona, y registra esa modalidad. No hace falta publicar ni cambiar la escucha del servidor.

Registrar BUILD_ID de `.next/BUILD_ID`, huella de fuentes, huella de materiales y versión del protocolo según [verify.md](verify.md). Si el código difiere del ensayo técnico, volver a compilar y comprobar los recorridos afectados antes de observar. Nunca modificar fuentes durante una sesión.

Abrir un perfil de navegador nuevo para cada persona, sin progreso ni capturas previas. No borrar el almacenamiento del perfil habitual. Anotar navegador, tamaño, método de interacción y ajustes de accesibilidad utilizados. Los pedidos son ficticios y temporales; no hay compra ni cobro. Si el Map llega al límite, reiniciar únicamente el servidor exclusivo entre sesiones y anotarlo. No reiniciar durante un intento incierto.

Copiar [ficha.md](ficha.md) a un archivo local por persona. Explicar: «Estamos evaluando el laboratorio. Puedes detenerte o decir que no sabes. ¿Permites conservar notas anónimas de esta sesión?». Si no autoriza, no conservar respuestas ni contar una sesión sin evidencia revisable. No se pide grabación.

## Orden y ayudas

1. Sin abrir la app, registrar experiencia y una respuesta inicial: «¿Cómo puede un botón cambiar algo en otra computadora? ¿Qué podría cambiar sin comunicarse con ella?». No corregir.
2. Hacer V1 primero, antes de enseñar capítulos, código o respuestas. La pantalla puede contener rótulos explicativos; registrar cuáles consultó. Se evalúa uso principal del diagrama y de las interacciones, no una comprensión visual pura sin palabras.
3. Hacer las tareas del perfil. Puede explorar el contenido del laboratorio. Registrar qué paneles consulta y separar explicación propia de lectura literal.
4. Hacer la transferencia indicada sin mostrar respuestas, feedback de quiz ni rúbrica. Pedir «¿Por qué?» o «¿Qué observaste que te lleva a eso?». No dar pistas causales.
5. Evaluar al terminar, explicar después si desea y registrar dificultades. No convertir la explicación final del moderador en un éxito de la tarea.

Ayudas: **H0**, repetir la consigna sin añadir pistas; **H1**, indicar dónde está un control o asistir con el dispositivo sin explicar el concepto; **H2**, enseñar una causa, respuesta o interpretación. Registrar texto y momento de cada ayuda. H1 puede permitir evidencia de comprensión si la causa y la transferencia son propias, pero genera una incidencia de navegación. H2 deja ese intento como parcial o insuficiente; exige otro caso sin esa ayuda. Una adaptación de acceso no equivale por sí sola a ayuda conceptual.

Pausar ante cansancio o bloqueo técnico. Una interrupción deja la tarea no evaluable, con motivo. Se conserva el registro incompleto y se agenda un intento nuevo; no se rellena de memoria.

## V1. Aprendizaje visual, prueba5

Aplicar a los cuatro perfiles. Abrir `/follow-the-click`. Antes de operar, pedir predicción sobre Guardar en favoritos y Comprar ahora. Pedir que use los dos botones y recorra sus pasos, primero sin abrir código, Request / Response ni explicaciones largas del inspector. Puede pausar y avanzar. Mantener HTTP real y credencial Comprador para la compra; el cambio de favoritos permanece local.

Registrar los pasos y fronteras que la persona señala. No ocultar etiquetas de la app ni sugerir «este es local». Si consulta texto explicativo largo antes de responder, conservarlo como evidencia adicional y dejar el intento visual inicial no evaluable para el criterio visual.

Una V1 contaminada no puede convertirse después en evidencia de primera exposición visual con esa misma persona. Su comprensión posterior se registra por separado. Si falta una V1 suficiente, aplicar V1 a otra persona sin exposición a las explicaciones causales; no sustituye los cuatro perfiles requeridos ni permite ocultar el intento inicial.

Preguntas: «¿Quién hace cada cambio? ¿En cuál tuvo que participar otro proceso? Muéstrame dónde lo ves. ¿Qué haría replay?». Transferencia, sin ejecutarla: «Una galería tiene un botón que oculta una foto en la pantalla y otro que la elimina de una cuenta compartida. ¿Qué necesitarías averiguar para decidir si cada uno cruza una red?». No exigir que todo borrado remoto ocurra instantáneamente ni que todo botón llame a una API remota.

**V1a** distingue el efecto local del recorrido con servidor y señala su frontera en el diagrama. **V1b** explica que replay inspecciona y no compra otra vez. **V1c** justifica la transferencia por la implementación y el lugar del estado, sin deducir red solo del nombre del botón. Los tres son necesarios. Para acreditar la prueba5 se requiere al menos una V1 suficiente obtenida principalmente con la interacción visual; se informan también las otras tres, sin escoger solo los éxitos.

## N1. Principiante, prueba1

Abrir `/first-principles?chapter=0`. Pedir cambiar argumentos, ejecutar la función y señalar argumentos, proveedor y resultado. Después abrir capítulo2, introducir texto y Aplicar cambio DOM. Puede explorar Intuition y explicar qué se conserva entre estos dos ejemplos.

Preguntar: «¿Para qué sirve acordar cómo pedir una capacidad? Si esta computadora pierde acceso a internet, ¿qué ejemplos podrían seguir funcionando y por qué?». Transferencia: «Un editor sin conexión llama a una biblioteca para calcular el ancho de un texto. ¿Hay una API? ¿Qué necesita conocer el editor y qué puede ignorar?». Se pregunta sobre acceso a internet, no sobre cargar por primera vez esta app o mantener disponible su servidor local.

**N1a** explica la necesidad de exponer capacidades entre componentes mediante un acuerdo. **N1b** usa función o DOM para justificar APIs sin internet, sin equiparar API y URL. **N1c** identifica consumidor, operación y contrato en el editor, separándolos del algoritmo de la biblioteca. Los tres son necesarios; no se exige vocabulario exacto.

## J1. Junior, prueba2

Abrir `/playground`, pestaña HTTP real. Elegir Cargar creación, revisar método, URL, headers y body y pulsar Enviar petición. Inspeccionar Respuesta HTTP observada y Request / Response. Cambiar `quantity` a0 conservando el resto, enviar y comparar201 y400. Antes de repetir, preguntar qué cambia y por qué. No hacer esta tarea con otro preset ni confundir un fallo de edición con un400 del servidor.

Preguntar para qué sirven Content-Type, Authorization e Idempotency-Key en ese mensaje, quién valida y qué datos constituyen el body. Transferencia: «Si llega HTTP200 con un cuerpo que dice que el pago fue rechazado, ¿qué puedes afirmar sobre HTTP y sobre el negocio? ¿Un POST repetido es seguro solo por usar POST?». No pedir que esta app produzca ese caso hipotético.

**J1a** identifica método, destino, headers, body y status en la captura real. **J1b** explica400 por el contrato de cantidad y predice una corrección, distinguiéndolo de autenticación o red. **J1c** separa éxito HTTP y de negocio y razona sobre deduplicación, misma clave y mismo payload, sin atribuir idempotencia automática a POST. Los tres son necesarios.

## B1. Backend, prueba3

En `/compare`, comparar REST y GraphQL sobre la misma consulta de pedido. Cambiar campos y condición de respuesta perdida, ejecutar e inspeccionar contratos y trazas. En `/security`, modelo de Acceso, comparar Sin credencial, Lector y Comprador al confirmar. En `/contracts`, renombrar quantity a units y comparar compatibilidad con el consumidor anterior; después mantener v1 completa y ofrecer v2, y comparar ambas direcciones. Anotar ajustes concretos elegidos.

Transferencia: «Un cliente antiguo exige quantity y un cliente nuevo usa units. El proveedor quiere retirar v1; además una confirmación terminó pero su respuesta se perdió. Propón una migración y recuperación, explica quién puede confirmar y qué no sabes todavía». No se exige elegir una tecnología favorita.

**B1a** compara contratos e interacción sobre igual objetivo, con al menos un compromiso de cada alternativa y sin equiparar GraphQL con transporte. **B1b** distingue401 y403, identidad y permiso. **B1c** razona sobre efecto posible tras perder respuesta y recuperación sin duplicar negocio. **B1d** explica compatibilidad en ambas direcciones y coexistencia real de v1, sin considerar deprecated una migración automática. Los cuatro son necesarios; las simulaciones se identifican como tales.

## A1. Arquitecto, prueba4

Abrir `/first-principles?chapter=3#api-anatomy`. Comparar función en proceso, IPC, HTTP y mensaje asíncrono, señalando memoria, procesos y fronteras. En `/events`, Entregas, explorar webhook con confirmación perdida y deduplicación; comparar con Comunicación y sus conexiones SSE/WebSocket. Usar el diagrama y el inspector cuando sean útiles.

Transferencia: «Un módulo llama a una biblioteca; un servicio recibe un comando; otro publica un evento para dos consumidores. Uno procesa y el otro se retrasa. Dibuja los componentes, señala qué límites necesitarías conocer y qué podría confirmar cada emisor. ¿Necesita todo eso un Gateway o microservicios?». Admitir un dibujo en papel descrito en la ficha; no hace falta herramienta nueva.

**A1a** distingue llamada local, IPC y remota sin dibujar red obligatoria en el mismo proceso. **A1b** distingue solicitud y respuesta de publicación y consumo independiente, con conocimiento parcial del emisor y retrasos. **A1c** distingue webhook de WebSocket y razona sobre duplicados y deduplicación sin prometer exactamente una vez universal. **A1d** justifica qué componentes de infraestructura son opcionales, y reconoce qué diagramas son modelos. Los cuatro son necesarios.

## Evaluación y cierre

Para cada subcriterio anotar evidencia y resultado: **suficiente**, explicación causal propia y transferencia coherente con H0 o H1; **parcial**, identifica una parte pero necesita H2 o no justifica la transferencia; **insuficiente**, sostiene la confusión tras explorar; **no evaluable**, falta observación, contaminación previa de la respuesta, interrupción o fallo técnico. La ausencia de participante se registra como **pendiente**, nunca insuficiente.

Una tarea solo es suficiente si todos sus subcriterios lo son. No sumar puntos para compensar una confusión obligatoria. Identificar respuestas ya correctas en la línea inicial como conocimiento previo, sin afirmar que se aprendieron aquí. Las palabras y acciones de la persona deben apoyar el juicio del moderador.

Una dificultad abre I01, I02, etc. Separar hecho observado de hipótesis: navegación, contenido, funcionamiento o consigna. Si requiere cambio, registrar archivos y comprobación técnica apropiada antes de repetir. Mantener intento y versión originales. Para una transferencia nueva, cambiar el contexto del problema sin mostrar la solución; si el resultado dependía de memorizar la explicación, buscar otra persona del mismo perfil. Una dificultad de navegación con H1 puede coexistir con comprensión suficiente, pero se corrige y comprueba antes del cierre.

Cerrar el bloque7 únicamente con N1, J1, B1 y A1 suficientes en cuatro personas distintas, al menos una V1 suficiente y todas las V1 informadas; sin incidencias que requieran corrección o repetición pendientes. Una N1, J1, B1 o A1 parcial, insuficiente o no evaluable impide el cierre. Las otras V1 pueden conservar esos resultados y se informan como límites de la muestra; sus dificultades también requieren análisis y resolución, aunque una repetición posterior no acredite primera exposición visual. Registrar el tamaño y límites de la muestra. Estos criterios no cierran por sí solos la fase5 ni el bloque20.
