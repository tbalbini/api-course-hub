# Comprobación de lector de pantalla

## Intento observado

22 de octubre de2026, macOS26.6.2, VoiceOver10, build993, Chrome nativo y producción local del build verificado en `http://127.0.0.1:3200/build-api`.

La automatización pudo leer la interfaz accesible de Chrome y los ajustes del sistema. VoiceOver estaba desactivado al comenzar. Se activó mediante Accesibilidad→VoiceOver y se confirmó el proceso real `/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOver launchd -s`. Se comprobó también que «Mostrar el panel de subtítulos» ya estaba activado; no se cambió esa preferencia.

La herramienta no ofrece captura de audio del sistema. Intentar seleccionar la aplicación VoiceOver para consultar los subtítulos terminó en `timeoutReached`. La captura de Chrome durante el intento no expuso una salida legible del lector. No se pudo demostrar qué se pronunció ni cuándo se anunciaron los cambios. La inspección del árbol de Chrome y que exista el proceso VoiceOver no satisfacen ese requisito.

Se restauró VoiceOver a desactivado, su estado inicial, y se comprobó el switch en `off`. No se habilitó control mediante AppleScript ni se ampliaron permisos de automatización.

Este intento automatizado quedó sin acreditación de la salida. La comprobación se completa después con la confirmación humana registrada abajo; no se atribuye a la herramienta una escucha que no realizó.

## Recorrido de comprobación

La salida se puede comprobar con voz o con el panel de subtítulos del propio lector. Conviene registrar las palabras efectivamente anunciadas, además de lo que se ve en pantalla. Estas tareas se realizan en la producción aislada, con datos ficticios y credenciales públicas.

| Tarea | Resultado que debe comprobarse con el lector |
|---|---|
| Abrir `/build-api`, recorrer el título y activar «Saltar al experimento» | Se identifica la página, el enlace y el contenido principal. La navegación no exige interpretar el diagrama o los colores |
| Recorrer «Credencial real de demostración», cantidad e id | Se anuncian nombre, tipo, valor y disponibilidad de los campos. La cantidad admite editar0 para la prueba siguiente |
| Con comprador y cantidad0, activar «Crear pedido real» | El lector comunica el resultado400 y su explicación. El foco se conserva en una posición operable y el error no depende solo de color |
| Con comprador y cantidad1, activar «Crear pedido real» y después «Confirmar real» | Se comunican201 y después200/confirmed. Se puede consultar el pedido y distinguir resultado conocido de evento seleccionado |
| Seleccionar lector e intentar «Confirmar real» | Se comunica403 y su motivo. Puede corregirse la credencial y continuar sin una recarga obligatoria |
| Recorrer las pestañas con flechas y abrir el inspector; cambiar profundidad y reproducir | Se identifican pestaña y selección. Los controles tienen nombres claros; la reproducción no anuncia cada evento de forma invasiva ni vuelve a ejecutar la escritura |
| Abrir `/reference` y buscar un término inexistente; después resolver una respuesta incorrecta en `/challenges` | Se comunican cero resultados y feedback explicativo. Las acciones de recuperación son localizables con el lector |

La prueba puede hacerse con otra combinación de lector/navegador, dejando constancia de cuál se utilizó. No permite generalizar a todos los lectores ni constituye una auditoría WCAG completa.

## Resultado confirmado por el usuario

El usuario seleccionó «Probé y funcionó» al aclarar el resultado de la prueba. La opción describía expresamente haber escuchado los campos y resultados400,201 y403, y haber podido corregir los errores con teclado. Esa confirmación completa la evidencia humana del flujo esencial de pedidos de AC-3.

- Entorno disponible e identificado en el equipo: VoiceOver10, build993, macOS26.6.2 y Chrome155.0.8059.85. La confirmación no indicó otro entorno ni versiones adicionales.
- Tareas confirmadas: recorrer campos, crear con cantidad0, crear con cantidad1, intentar confirmar como lector y corregir errores con teclado.
- Anuncios confirmados: campos y resultados400/201/403. No se aportó una transcripción literal; no se inventan palabras pronunciadas.
- Foco y recuperación: el usuario confirmó que pudo corregir los errores con teclado.
- Problemas comunicados en esas tareas: ninguno.
- Cobertura adicional: no se recibió una comprobación humana específica de las demás filas del recorrido, otros lectores o todos los estados del curso. Sus regresiones automatizadas conservan su evidencia separada.

**Resultado: flujo esencial con lector confirmado por el usuario.** El bloque se cierra combinando ese resultado con las comprobaciones automáticas de teclado, foco, semántica, contraste y movimiento. No constituye una auditoría WCAG completa ni una certificación de todos los lectores. Ante un nuevo fallo se conserva el caso exacto antes de corregirlo y repetirlo.
