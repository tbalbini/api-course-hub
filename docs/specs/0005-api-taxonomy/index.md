# 0005. API Taxonomy Explorer

**Date**: 2026-10-21
**Status**: Accepted

## Summary

Un mapa de seis ejes permite seleccionar una tecnología y distinguir su responsabilidad de las decisiones de una API que la utilice. Un catálogo filtrable, relaciones navegables y comparación semántica conectan las dimensiones. La elección de mapa y tabla procede del usuario.

## Requirements

AC-1. `/api-universe` ofrece los seis ejes completos del alcance original. Cada entrada de ubicación, superficie, interacción, tecnología remota, acceso y contrato tiene explicación seleccionable. Los filtros y la búsqueda producen resultados reales, con estado vacío y acción para limpiar.

AC-2. El mapa distingue rasgos definidos de combinaciones posibles. Una ausencia de asociación editorial se describe como no especificada por esta ficha, nunca como incompatibilidad. Ubicación, audiencia y permisos no se deducen de REST, GraphQL, JSON u OpenAPI. Público y restringido por credenciales pueden coexistir. Se muestra un perfil de ejemplo REST sobre HTTP con JSON, audiencia, permisos y OpenAPI como coordenadas simultáneas, no como categorías excluyentes.

AC-3. Cada tecnología muestra problema, definición, mecanismo, beneficios y compromisos, límites, alternativas navegables y ejemplo concreto identificado como ilustrativo. Se cubren todas las familias del eje D, formatos JSON/XML, Protocol Buffers, GraphQL SDL, OpenAPI, AsyncAPI, y superficies locales y de sistema. HTTP y TCP se incluyen para comparar capas. Los enlaces a experimentos existentes son válidos.

AC-4. Puedes comparar dos fichas y cambiar cualquiera. La tabla compara responsabilidad, categoría, capa, seis ejes, mecanismo y límites. Las relaciones documentadas se explican en ambas direcciones. Categorías o capas diferentes producen una advertencia pedagógica; no se inventa un ganador ni se trata una combinación como alternativa excluyente. Casos críticos: REST/HTTP, GraphQL/TCP, WebSocket/webhook y JSON/OpenAPI. Elegir dos veces la misma ficha da feedback claro.

AC-5. Una actividad pide clasificar REST, HTTP, JSON, OpenAPI y API privada según responsabilidad. Cada respuesta recibe feedback causal y se admite reintento. No se declara aprendizaje por visitar ni se modifica el progreso de capítulos. Cambios de ficha, filtro o comparación no envían solicitudes a APIs externas ni ejecutan fragmentos.

AC-6. Se integra la navegación existente, conserva las rutas anteriores y funciona por teclado y a 390 px sin desbordamiento de página. El mapa tiene equivalente textual completo y controles nativos; no depende del color. TypeScript, lint, pruebas, regresiones de navegador y build pasan.

## Decision

Usar el sistema visual y Next.js actuales, SVG para mapa y HTML semántico para selección, inspector y tabla. Sin dependencias nuevas. Los datos editoriales viven en `src/content/`; búsqueda, filtros, comparación y evaluación son funciones puras en `src/lib/`. No se cambia el motor de trazas ni la persistencia de capítulos.

## Feature design

### Datos y semántica

Axis contiene id, letra, título, pregunta y Facet[] con id global único, etiqueta y explicación. Los seis ejes conservan todas las entradas del prompt; JSON y XML pueden tener facetas separadas. RPC se comparte como concepto referenciado, sin duplicar su identidad como si fuera otra tecnología.

Technology contiene id, nombre, categoría, capa de responsabilidad, problema, definición, mecanismo, compromisos, límites, código ilustrativo, rasgos definidos, usos posibles, alternativas y enlace opcional a un experimento existente. Las facetas de rasgos y usos referencian el catálogo único. Las relaciones entre fichas contienen dos ids y una explicación de combinación o diferencia, independiente del orden de comparación.

Las fichas cubren APIs de función, biblioteca, navegador, sistema, archivos, dispositivo, cliente de base de datos y SDK; REST, RPC, JSON RPC, XML RPC, gRPC, GraphQL, SOAP, WebSocket, SSE, webhook, broker y streams; HTTP, TCP; JSON, XML, Protocol Buffers, GraphQL SDL, OpenAPI y AsyncAPI. Son perfiles explicativos de tecnologías, no inventario de APIs desplegadas. Una ficha puede tener varios rasgos en un eje.

La asociación posible significa un uso documentado, no garantía ni compatibilidad universal. Los formatos no reciben ubicación ni visibilidad propias. Los estándares de descripción no transmiten mensajes por sí solos. Las versiones de ejemplos se identifican como ejemplos, sin afirmar que sean la última versión.

### Inventario obligatorio de facetas

A, ubicación y límites (5): In-process APIs; Inter-process APIs (IPC); Operating System APIs; Network / Remote APIs; Embedded and Device APIs.

B, superficie de programación (9): funciones y métodos; bibliotecas y paquetes; clases, objetos e interfaces; system calls; Browser APIs; Database interfaces; SDKs; interfaces de dispositivos y drivers; interfaces basadas en mensajes.

C, interacción (10): llamada síncrona; solicitud respuesta; invocación asíncrona; fire-and-forget; polling; long polling; streaming; publish / subscribe; event-driven communication; bidirectional communication.

D, estilos y tecnologías remotas (12): REST; RPC; JSON-RPC; XML-RPC; gRPC; GraphQL; SOAP; WebSocket-based APIs; Server-Sent Events; webhooks; Messaging APIs basadas en brokers; APIs basadas en eventos y streams.

E, visibilidad y acceso (4): Public / Open APIs; Private / Internal APIs; Partner APIs; APIs restringidas por permisos o credenciales. Son rasgos que pueden coexistir, no cuatro niveles excluyentes.

F, contrato y representación (9): firmas de funciones; interfaces y sistemas de tipos; JSON; XML; Protocol Buffers; GraphQL Schema Definition Language; OpenAPI; AsyncAPI; versionado y compatibilidad. JSON y XML se separan para seleccionar y comparar formatos, conservando ambos elementos del requisito original.

Este inventario de 49 facetas es la fuente local de cobertura de AC-1. Las pruebas verifican sus ids y pertenencia a cada eje, además de las referencias desde fichas.

### Fuentes de valores

| Valor | Fuente |
|---|---|
| Ejes y facetas | Las seis listas del prompt y su explicación editorial española |
| Rasgos definidos y posibles | Ficha editorial tipada, revisada con las fuentes primarias pertinentes |
| Categoría y capa | Responsabilidad de la ficha, separando arquitectura, programación, integración, aplicación, transporte, representación y descripción |
| Relaciones y alternativas | Referencias explícitas por id y explicación editorial, sin inferir compatibilidad de ids ausentes |
| Resultados de búsqueda | Nombre, categoría, problema, definición y etiquetas de facetas de cada ficha, normalizados sin distinguir acentos ni mayúsculas |
| Filtros | Una faceta seleccionada por eje, AND entre ejes; se buscan rasgos definidos o usos posibles declarados |
| Conteos y estado vacío | La misma función de filtrado que produce los resultados |
| Mapa e inspector | Ficha seleccionada, sin cambiarla silenciosamente al filtrar |
| Advertencia comparativa | Categoría o capa diferentes, relación explícita y casos de igualdad |
| Perfil de ejemplo | Fixture de una API de pedidos HTTP: ubicación de red, mensajes, solicitud respuesta, REST, audiencia privada, credenciales, JSON y OpenAPI |
| Feedback de actividad | Cinco preguntas con categoría correcta y explicación de por qué las otras categorías no aplican |

### Interacciones y superficies

Sidebar compartida con API Universe activa, encabezado, explicación de dimensiones independientes, búsqueda y filtros, catálogo, mapa de seis ejes, inspector y comparación. Seleccionar un eje del mapa abre su filtro equivalente. El SVG visualiza asociaciones y no representa cables de red ni métricas.

El inspector ofrece las seis dimensiones y el mecanismo con código y causas. Los filtros presentan la definición de la faceta seleccionada y pueden limpiarse individualmente o en conjunto. La selección permanece inspeccionable aunque no esté entre los resultados, con aviso explícito. Catálogo vacío no elimina la selección ni rompe comparación.

La comparación recibe ids A/B válidos del catálogo. Al abrir una alternativa o relación se carga esa ficha. Se explica el cruce de capas incluso si ambas se llaman protocolos, como HTTP y TCP. No hay puntuaciones de rendimiento inventadas.

El perfil de ejemplo ilustra una combinación concreta y no clasifica automáticamente el endpoint de la aplicación como REST conforme. La actividad tiene evaluación explícita por fila y resumen, sin almacenamiento ni certificación adicional.

### Exactitud y límites

REST es un estilo con restricciones, incluida interfaz uniforme e hipermedia, no cualquier GET JSON. GraphQL tiene ejecución y schema sin imponer transporte en su núcleo. gRPC suele combinar HTTP/2 y Protocol Buffers, con modalidades de streaming. JSON RPC es agnóstico de transporte; XML RPC tiene su vínculo HTTP/XML. SOAP usa mensajes XML y bindings. SSE entrega eventos del servidor sobre HTTP, WebSocket ofrece canal bidireccional y webhook es un callback remoto mediante solicitudes independientes. TCP ofrece un flujo de bytes, no framing de mensajes de negocio. Protobuf no es transporte y un SDK no es la API remota encapsulada.

## Build plan

1. Definir ejes, fichas y relaciones, validar integridad y precisión, AC-1 a AC-4.
2. Implementar búsqueda, filtros, comparación y evaluación puras con pruebas, AC-1, AC-4 y AC-5.
3. Construir mapa, inspector, catálogo y comparación con navegación, AC-1 a AC-4 y AC-6.
4. Integrar perfil y actividad, verificar casos críticos, teclado, móvil, ausencia de solicitudes y regresiones, AC-2, AC-5 y AC-6.

## Consequences

Puedes razonar sobre dimensiones sin levantar cada protocolo. Los fragmentos son ejemplos que se explican, no un nuevo playground de ejecución. Las asociaciones son una selección editorial no exhaustiva; los resultados vacíos no prueban imposibilidad técnica. La comparación no sustituye el capítulo comparativo completo ni Systems Lab.

## Rationale

Ver [rationale.md](rationale.md).
