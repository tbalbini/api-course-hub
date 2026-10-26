# Precisión técnica: fuente recuperada y revisión

## Procedencia

Se recuperó la sección15, «Estándares de precisión técnica», del documento «MASTER PROMPT — THE API UNIVERSE» mostrado en la conversación «Prompt para web interactiva de APIs» del navegador del usuario. Consulta directa mediante la interfaz de Chrome,22 de octubre de2026. Conversación de origen: `chatgpt.com/c/6ad93e0a-57ac-83e9-842f-018fd0f92ee7`.

El original contiene quince viñetas y una regla final sobre simplificaciones. Se conservan como P01aP16 para poder contrastarlas con el alcance. La numeración se añade aquí; no se atribuye al original una lista numerada que no tenía. No se reconstruyeron principios desde AGENTS ni se sustituyó el contrato.

## Texto recuperado

1. No confundir API con endpoint.
2. No confundir API con protocolo.
3. No confundir REST con HTTP.
4. No confundir JSON con API.
5. No confundir SDK con la API remota que puede encapsular.
6. No confundir autenticación con autorización.
7. No confundir JWT con OAuth.
8. No confundir WebSocket con webhook.
9. No confundir una función local con una llamada remota.
10. No tratar todos los sistemas distribuidos como si fueran síncronos.
11. No afirmar que todo click genera una petición de red.
12. No afirmar que todo backend necesariamente contiene una REST API.
13. No afirmar que todo sistema tiene un API Gateway, proxy o microservicios.
14. No presentar OpenAPI o AsyncAPI como si fueran protocolos de transporte.
15. No explicar fallos de red como si fueran idénticos a excepciones locales.
16. Toda simplificación debe ser correcta en su contexto. Si introduces una simplificación para principiantes, indica qué detalles has omitido y cuándo importa conocerlos.

## Contraste inicial del22 de octubre

Resultado registrado en esa revisión:16/16 criterios con contenido explícito y evidencia concordante. La revisión posterior encontró explicaciones contradictorias que esa pasada no detectó, por lo que este resultado histórico no acredita precisión de todas las capturas ni cumplimiento íntegro del prompt.

La evidencia de ejecución procede de la entrega con712 pruebas de lógica/servidor y206 casos distintos de navegador en [results.json](evidence/results.json). Antes de esta continuación se comprobó que los167 archivos del [manifiesto](evidence/manifest.json) seguían idénticos. Esta revisión no cambia código ni cuenta como una nueva ejecución de esas suites.

| Principio | Contenido comprobado | Evidencia operativa y límite |
|---|---|---|
| P01 API/endpoint | `foundations.ts`, capítulo0, presenta una capacidad local y rechaza que API signifique endpoint HTTP; `reference.ts`, ficha API | `foundations.spec.ts` ejecuta la suma sin red y exige resultado más razonamiento para acreditar el capítulo |
| P02 API/protocolo | `taxonomy.ts` separa superficie de programación, arquitectura, protocolo, representación y descripción; capítulo3 explica qué interpreta un protocolo | `taxonomy.test.ts` y `taxonomy.spec.ts` comprueban categorías, capas y comparaciones; no se deduce una capa solo por el nombre |
| P03 REST/HTTP | La ficha REST describe restricciones e hipermedia; aclara que GET con JSON no prueba REST y que HTTP no es su definición | Taxonomía y `comparison.spec.ts` contrastan las interfaces del mismo pedido; la consola HTTP local no se anuncia como prueba de todas las restricciones REST |
| P04 JSON/API | La ficha JSON trata representación de datos; OpenAPI, contratos y funciones aparecen en capas distintas | `playground.spec.ts` negocia JSON/texto sobre el mismo endpoint y observa304 sin body; una API no depende de un único formato |
| P05 SDK/API remota | `foundations.ts`, ejemplo SDK y wrapper, distingue método local e interfaz remota; `taxonomy.ts`, ficha SDK y relación con HTTP, explicita la envoltura | `reference.test.ts` comprueba adaptación del catálogo y relaciones; no se afirma que todo SDK sea remoto ni se ejecuta un proveedor externo |
| P06 autenticación/autorización | `security.ts` y referencia separan identidad de permiso; lector puede consultar y comprador confirmar | `security.spec.ts`, `orders.test.ts` y el recorrido HTTP de entrega observan401 frente a403 y detienen el efecto cuando falta permiso |
| P07 JWT/OAuth | JWT se define como formato de claims y OAuth como autorización delegada; access token puede ser opaco o JWT | `security.spec.ts` recorre credenciales y distingue ID token de access token; validación criptográfica y proveedor OAuth siguen etiquetados como modelos |
| P08 WebSocket/webhook | Taxonomía y eventos distinguen canal bidireccional de callback remoto; webhook modela entregas, intentos y receptor | `events.spec.ts` observa dirección de comunicación, ACK perdido y duplicados. El modelo no representa sockets o brokers reales |
| P09 local/remoto | Fundamentos compara transferencia de control y memoria local con serialización, transporte e incertidumbre entre procesos | `foundations.spec.ts`, `comparison.spec.ts` y `network.spec.ts` conservan fronteras y ramas. Apariencia de función no elimina red oculta por un SDK |
| P10 distribución/sincronía | Eventos ofrece queue, pub/sub y event stream; Systems separa espera del cliente, finalización tardía y recuperación | `events.spec.ts` comprueba ramas, log e intentos; `systems.spec.ts` conserva finalización posterior al timeout y recuperación de saga |
| P11 click/red | La tienda separa Comprar de Guardar en favoritos; capítulo2 modifica un nodo DOM sin fetch | `click-lab.spec.ts`, `delivery.spec.ts` y `foundations.spec.ts` comprueban operación real frente a favoritos/DOM y replay sin solicitudes nuevas |
| P12 backend/REST | `systems.ts` permite módulos internos, servicios y funciones; inventario puede invocarse localmente. Taxonomía ofrece RPC y mensajes sin equipararlos con REST | `systems.spec.ts` cambia Inventario de mismo proceso a red remota; `comparison.spec.ts` usa varias interfaces sobre el mismo negocio. Un backend puede ofrecer otros contratos |
| P13 infraestructura opcional | `systems.ts` define proxy, balanceador y gateway como roles que pueden compartir componente o estar ausentes; monolito puede tener APIs internas | `network.spec.ts` y `systems.spec.ts` cambian ingreso, gateway, réplicas y fronteras; una captura real no añade infraestructura no instrumentada |
| P14 descripción/transporte | Las fichas OpenAPI/AsyncAPI explican documentos, operaciones, mensajes y bindings sin convertirlos en transporte o broker | `taxonomy.test.ts`, `reference.test.ts` y `contracts.spec.ts` comprueban categorías y exportaciones locales; descargar un contrato no envía HTTP |
| P15 excepción/fallo remoto | Fundamentos, proyecto y Systems separan error local de falta de respuesta después de una escritura; timeout no acredita cancelación | `project.spec.ts` conserva clave/datos ante POST incierto e id ante PATCH incierto; `click-lab.spec.ts` recupera sin duplicar; Systems conserva completaciones tardías |
| P16 simplificaciones | Cada capítulo tiene límites; trazas separan procedencia, orden lógico, tiempo simulado y duración observada. Map200, tokens públicos, pila reconstruida, ABI/FFI, wire, OAuth y2PC tienen límites explícitos | README, specs y `interaction.test.ts`, `order-receipt.test.ts`, `advanced.spec.ts` y `xray.spec.ts` impiden atribuir paquetes, SQL, criptografía, durabilidad o reejecución real a modelos. El efecto observado no se infiere de una animación |

## Correcciones posteriores del23 de octubre

Se reprodujeron referencias compartidas que cambiaban explicaciones anteriores, textos de creación heredados por GET, referencias al servidor en favoritos y una afirmación de renderizado observado sin instrumentar commit o paint. Esto invalida la conclusión inicial de ausencia de contradicciones para esos textos; las pruebas anteriores no cubrían esas regresiones.

La [fase1](../../scope2/fase1-verificacion.md) corrigió la construcción de eventos, las tres profundidades de GET, POST y favoritos, los avisos de error y la descripción de solicitudes a setters. Su verificación identifica728 pruebas de lógica y210 de navegador. La [fase2](../0019-ejemplo-sql-capturado/verify.md) añadió el INSERT conceptual asociado al evento de escritura y conservó la diferencia frente al Map; registra758 y213. Esas comprobaciones son posteriores y no se atribuyen a la pasada de712/206.

Los textos corregidos y sus tres profundidades se vuelven a contrastar con P09 (mecanismo local frente a remoto), P11 (click sin red) y P16 (simplificaciones y procedencia). GET consulta por id; POST crea o recupera según el resultado; favoritos calcula un booleano y solicita estado local; los rechazos actualizan un aviso; ningún setter se presenta como medición de commit o paint. El panel SQL distingue código del Map y alternativa conceptual, con parámetros tomados solo del paso capturado. Las regresiones de trazas, ClickLab, X Ray y almacenamiento comprueban esos límites.

## Alcance actual de la conclusión

La lista recuperada y la matriz inicial se conservan con su fecha. Las correcciones posteriores tienen evidencia propia; no se afirma que16/16 equivalga al Master Prompt completo ni que todas las combinaciones estén certificadas. La [matriz de fase5](../../scope2/fase5-matriz.md) ya contrasta las secciones1 a19 e identifica la precisión actual en15.P01 a15.P16. Su [verificación](../../scope2/fase5-verificacion.md) registra758 pruebas de lógica y215 de navegador sobre fuentes coincidentes. La comprensión con participantes sigue pendiente en fase4 de [scope2](../../scope2/index.md). Cambiar contenido, modelo o contrato exige volver a revisar los puntos afectados.
