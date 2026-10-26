---
name: api-universe-console
source: descripción del usuario y consola integrada elegida
character: "Instrumento de ingeniería oscuro, preciso y editorial. Diagramas e inspectores tienen prioridad sobre decoración. El acento señala operaciones y selección."
tokens: src/app/globals.css
---

## Build mandate

Mostrar el experimento completo, con marca, contexto, estados y explicación. Cada control tiene un efecto verificable. La navegación solo ofrece superficies implementadas.

## Character & direction

La consola combina una tienda mínima con un mapa de procesos y un inspector. El espacio y la jerarquía separan la acción real de su reproducción. Los símbolos de producto son SVG locales y no dependen de imágenes externas.

## Composition patterns

Barra lateral compacta, cabecera de contexto, pregunta inicial, compra junto a diagrama, controles y timeline, inspector, aclaraciones causales y pie. En móvil, la consola se apila y los diagramas conservan espacio para texto legible mediante desplazamiento interno.

La navegación sigue área del producto → capítulo o herramienta → práctica. Las cinco áreas son Bases, Recorrido central, Aprendizaje y mapa, Laboratorios, y Progreso y evaluación. Bases reúne capítulos 0 a 3; Recorrido central contiene Follow the Click y el proyecto final; Aprendizaje y mapa reúne API Universe, comparador, referencia y fronteras avanzadas; Laboratorios contiene red, HTTP, GraphQL/RPC, eventos, seguridad, contratos y sistemas; Progreso y evaluación contiene Tu recorrido y desafíos. Plataforma y Calidad son responsabilidades de construcción y no aparecen en el menú del alumno.

Solo un área se despliega a la vez. Al entrar en una ruta se abre su área; los botones permiten explorar otras sin abandonar el experimento. En móvil y tablet, un selector nativo cambia el área y una fila desplazable muestra únicamente sus destinos. El enlace de la página actual queda visible. El capítulo activo muestra sus prácticas; los números de capítulo y las etiquetas de laboratorio conservan su significado, con descripciones accesibles. GraphQL y RPC son prácticas del capítulo 6 dentro de Laboratorios, mientras el comparador tiene su lugar principal en Aprendizaje y mapa.

Tu recorrido y su resumen permanecen visibles antes de los grupos del menú. En escritorio, ese acceso acompaña el desplazamiento de la barra lateral. En móvil ocupa una fila compacta y conserva su acceso al programa aunque explores otra área. Los títulos de navegación y las prácticas mantienen texto legible; sus tamaños y el ancho lateral viven en CSS.

Primeros principios admite ?chapter=0..3; Playground, Eventos, Seguridad, Contratos, Sistemas y Proyecto admiten ?tab=… y los cambios dentro de una pantalla conservan borradores y capturas. Se conserva la navegación nativa del historial para esos cambios. Un destino pendiente informa su estado; el capítulo12 abre sus experimentos reales y modelados.

La consola ofrece Aplicación, Red e Infraestructura como vistas de una misma captura. Red agrupa mecanismos y mantiene los números de evento para reconocer el orden de la timeline. Las etapas observadas o simuladas son botones; las omisiones son texto con causa. Las condiciones del formulario solo configuran la próxima simulación.

Primeros principios usa una consola por capítulo con cuatro accesos de progreso. El experimento se sitúa junto a Anatomy, seguido por reconstrucción de pila y memoria, controles e inspector compartidos, explicación técnica y evaluación. La concurrencia muestra dos filas con dependencias dentro de cada rama. Los bloques de Anatomy son responsabilidades agrupadas por frontera, no cinco computadoras.

API Universe usa búsqueda y seis filtros, catálogo con desplazamiento propio, mapa SVG de seis ejes, detalle textual equivalente, explicación causal, comparación tabular y actividad de clasificación. Las líneas del mapa representan asociaciones, no red. Se distinguen rasgos definidos, usos posibles y selección fuera del filtro. Mapa y tabla desplazan dentro de sus paneles en móvil; la navegación reutiliza la franja común.

El comparador usa controles compartidos, tarjetas paralelas, tabla de responsabilidades, roles de consumidor, contrato y proveedor con evento activo, y el reproductor compartido. El estado final se etiqueta para no confundirlo con el cursor. La consola HTTP real queda separada de los modelos y conserva su propio resultado. Los bloques de código largos desplazan dentro de la tarjeta; móvil apila alternativas.

API Playground conserva los cuatro laboratorios montados bajo pestañas accesibles. Cada uno mantiene borrador y captura; al ocultarse pausa reproducción. El editor separa URL, headers y texto del body y muestra el mensaje recibido junto al inspector. La ruta de red usa desplazamiento interno y etiqueta las unidades como contenido ilustrativo. Los estados de entrega final y el evento seleccionado se distinguen expresamente.

Comunicación y eventos conserva cuatro pestañas con modelos de chat, modelos de entrega, SSE real y capítulo. El chat contrapone snapshots finales de proveedor y consumidor. Entregas conecta cinco roles seleccionables con proyecciones, log e intentos; pub/sub añade ramas independientes. Los datos finales se distinguen del cursor. SSE conserva su propia captura observada y cierra el transporte al ocultarse. Código, tabla, timeline y ramas desplazan dentro de sus paneles en móvil.

Seguridad usa cinco pestañas para acceso, políticas del navegador, credenciales, HTTP real y capítulo. Las decisiones forman una fila de pasos seleccionables con desplazamiento interno. Los resultados separan identidad/permiso y envío/efecto/lectura. CORS fallido no dibuja un POST enviado si preflight lo impidió. La consola real conserva su resultado al ocultarse y pausa el reproductor. Navegación lateral admite desplazamiento en pantallas de poca altura.

Contratos mantiene cinco pestañas con diseñador, comparación, colecciones, reintentos y capítulo. El formulario agrupa capacidad, entrada y salida. Resultados separan schema de reglas de negocio y snapshots antes/después. Las tablas desplazan dentro del panel; en móvil los campos se apilan. El inspector reutiliza la reproducción compartida, con profundidad y X Ray compartidos. Los documentos se muestran como texto y se descargan mediante Blob local. La evaluación conserva los logros en el progreso común del curso.

Systems Lab conserva tres pestañas. Sistema agrupa constructor, políticas y carga, mapa SVG con frontera de proceso, resultados finales, tabla temporal y reproductor. Cada nodo y evento permite seleccionar inspección. El tiempo simulado aparece separado del orden lógico. Transacciones muestra estado público del cursor y pasos seleccionables, con recuperación explícita. Tablas, mapa y código desplazan dentro de paneles, mientras métricas se apilan en móvil.

Proyecto de pedidos conserva Aplicación, Código ejecutado y Capítulo11 montados. El contrato separa HTTP de la llamada local al Map. La consola mantiene borradores, último pedido conocido e identidad de la operación pendiente; ocultarla pausa reproducción. El evento seleccionado abre el módulo asociado. El visor ofrece lista fija, responsabilidad, SHA256 y texto completo con desplazamiento interno, junto a descarga local e instrucciones. En móvil el esquema se apila y los bloques de código y tablas conservan scroll interno.

Fronteras avanzadas conserva cuatro pestañas: Binario y Wasm, Mensajes y bytes, Herramientas y Capítulo12. Los resultados finales se separan del cursor. El grid de bytes etiqueta tag, longitud y payload; cada byte busca el primer evento que lo recibe. La propuesta editable, el efecto del pedido, la salida del proveedor y el resultado consumido ocupan bloques distintos. El contenido reúne doce temas con feedback y seis actividades observadas. Se reutilizan reproductor, profundidad y X Ray comunes; móvil apila formularios y resultados, y el código desplaza dentro del panel.

Referencia usa dos vistas enlazables por URL: Glosario y Guía del laboratorio. Búsqueda y tema preceden al catálogo con altura acotada y al detalle seleccionado. La selección permanece al filtrar, con aviso cuando queda fuera; relaciones y fichas son enlaces con historial. Móvil apila catálogo y detalle y ofrece salto directo a la ficha. Código desplaza dentro de su panel. Los enlaces a experimentos y desde el inspector indican apertura en otra pestaña para conservar contexto. La guía agrupa ejecución, contrato, incertidumbre, procedencia, arquitectura y progreso. Consultar no concede logros ni persiste búsquedas.

## Component & usage rules

El acento principal identifica selección y acción. Los colores semánticos de consumidor, contrato, proveedor, datos, errores y persistencia siempre llevan texto. Los campos tienen etiquetas visibles. El código se muestra en paneles con desplazamiento interno. Los valores concretos de color, tamaño y movimiento viven en CSS.

## Responsive & accessibility direction

Botones de al menos 44 píxeles de alto, foco visible, controles nativos y regiones de estado para operaciones. La profundidad usa botones con estado expuesto. La reducción de movimiento desactiva reproducción automática de nuevas capturas. No se anuncian todos los cambios del cursor a lectores de pantalla.

## Contrast

Se calcularon contrastes de texto, acento y controles contra sus superficies. La comprobación visual y de teclado acompaña las pruebas del recorrido; no se declara una auditoría completa de lectores de pantalla.

## Continuidad del recorrido

`/course` presenta el título Tu recorrido, un resumen compacto con empezar o continuar, el programa secuencial de trece capítulos y después los accesos por área. El programa es la acción principal; las tarjetas de exploración ofrecen una alternativa secundaria. El resumen distingue capítulos completados y capítulos en curso. Los estados se expresan con texto, además del color. En móvil, las acciones comparten fila cuando caben y cada capítulo conserva título, estado y acceso sin desbordar. El contador independiente de desafíos enlaza al catálogo y no altera capítulos.

Challenges conserva siete ejercicios montados y muestra uno según `?challenge=`. El catálogo ofrece formato, nivel y estado. Cada ejercicio agrupa configuración o predicción y causa; Comprobar intento contrasta ambas en un snapshot nuevo. Editar invalida el feedback visible; el logro histórico permanece. Resultados finales y tabla de fixtures quedan separados del cursor del inspector. Se comparten reproducción, profundidad y X Ray, con pausa al ocultar. En móvil, catálogo y formulario se apilan y tablas y código desplazan dentro del panel. Solo los ids completados se persisten; el resto vive en la pantalla.

Capítulos 0 a 3 conservan su almacenamiento. Capítulos 4 a 12 guardan logros y razonamiento comprobados; la profundidad del inspector se comparte y la última ubicación se limita a rutas y pestañas conocidas. No se restaura una captura ni se repite una petición. El estado vacío invita a empezar; el almacenamiento bloqueado presenta un aviso de sesión. Carga, error recuperable y404 tienen mensaje y salida al recorrido.

X Ray usa un único interruptor de cabecera en cada pantalla con operaciones. Todos los inspectores consultan el mismo estado de sesión, incluidos protocolos y SSE. Navegar o cambiar de pestaña conserva ese modo; recargar inicia una sesión con X Ray activo. Los avisos de procedencia permanecen visibles. La cabecera admite varias filas en móvil para conservar el contexto y el control sin desbordar.
