# Mapa y referencia de The API Universe

Reúne API Universe, el comparador del capítulo 6, las fronteras avanzadas del capítulo 12 y la referencia. Puedes explorar relaciones o comparar alternativas sin confundir un protocolo con una capa o un estilo.

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

Los capítulos conservan el [formato pedagógico común](fundamentos.md).

## Fase 5

### 9. API Taxonomy Explorer · done

Navegar un mapa con dimensiones independientes. Puedes entender cómo una misma API ocupa varias clasificaciones sin convertirlas en categorías excluyentes.

**Done when:** el mapa incluye ubicación y fronteras, superficie de programación, estilo de interacción, tecnologías remotas, visibilidad y contrato o representación; cubre todas las entradas de los seis ejes de tu petición; cada selección presenta problema, dimensiones, combinaciones válidas, mecanismo, ventajas, límites y alternativas; puedes comparar dos selecciones; la interfaz distingue estilo arquitectónico, protocolo, entrega, integración, formato y descripción; explica expresamente relaciones como REST sobre HTTP y OpenAPI como descripción, sin equiparar GraphQL con TCP ni WebSocket con webhook.

- [x] Diseñar el mapa (spec): `/architect api taxonomy explorer`
- [x] Construir el explorador: `/develop api taxonomy explorer`
  - [x] Integrar catálogo, relaciones, búsqueda y filtros de los seis ejes.
  - [x] Integrar mapa, comparación y evaluación con navegación.
- [x] Verificar casos críticos, teclado y móvil: `/check verify api taxonomy explorer`
- [x] Probar cobertura, relaciones y regresiones: `/test api taxonomy explorer`

Spec [0005](../specs/0005-api-taxonomy/index.md), código en `src/content/taxonomy.ts`, `src/lib/taxonomy.ts` y `src/components/taxonomy-explorer.tsx`. [Evidencia](../specs/0005-api-taxonomy/verify.md): 49 facetas, 29 fichas, 173 pruebas de lógica y servidor y 21 de navegador. Las asociaciones son editoriales; el mapa no ejecuta protocolos ni sustituye el Comparative Engine del pedido.

### 10. Una necesidad, varias interfaces · done

Completar el capítulo 6 y el Comparative Engine usando siempre el mismo pedido y las mismas operaciones de consultar estado y actualizarlo. Puedes comparar mecanismos sin que un cambio de negocio distorsione el resultado.

**Done when:** función local, REST, GraphQL, RPC, gRPC, SOAP, polling y suscripción muestran arquitectura, contrato, datos, código, frontera, errores y compromisos comparables; REST explica sus restricciones y no se reduce a JSON sobre HTTP; GraphQL incluye schema, queries, mutations, resolvers y subscriptions; gRPC incluye contratos tipados, Protocol Buffers y modalidades de streaming; SOAP incluye XML, WSDL y contexto de integración; JSON RPC y XML RPC quedan ubicados correctamente; las comparaciones entre capas diferentes lo declaran; cualquier cifra ilustrativa se identifica como simulada.

- [x] Diseñar la comparación del pedido (spec): `/architect una necesidad varias interfaces`
- [x] Construir la comparación: `/develop una necesidad varias interfaces`
  - [x] Integrar contrato de confirmación y endpoint real.
  - [x] Integrar catálogo, trazas comparables y capítulo 6.
  - [x] Integrar página, consola y evaluación.
- [x] Verificar recorrido, teclado y móvil: `/check verify una necesidad varias interfaces`
- [x] Probar lógica, contrato HTTP y regresiones de navegador: `/test una necesidad varias interfaces`

Spec [0006](../specs/0006-comparar-pedido/index.md), código en `src/content/comparison.ts`, `src/lib/comparison.ts`, `src/lib/order-status.ts`, `src/components/comparison-lab.tsx`, `src/components/order-console.tsx` y `src/app/api/orders/[id]/route.ts`. [Evidencia](../specs/0006-comparar-pedido/verify.md): diez alternativas, veinte combinaciones recorridas, cuatro modalidades gRPC y HTTP local real; 222 pruebas de lógica y servidor y 27 de navegador. Los protocolos remotos del comparador son modelos etiquetados; la consola HTTP ejecuta creación, lectura y confirmación real.

## Fase 6

### 17. Fronteras avanzadas · done

Completar el capítulo 12 conectando mecanismos nuevos con las fronteras y contratos que ya conoces. Mantener un tratamiento breve, pero técnicamente correcto, de cada tema avanzado.

**Done when:** puedes explorar API frente a ABI, FFI, interfaces WebAssembly, native bindings, protocolos de bases de datos, tiempo real, streaming, APIs de modelos de IA, tool calling, comunicación entre agentes y herramientas, schemas estructurados, APIs como productos y evolución de contratos a gran escala; cada tema muestra su mecanismo, frontera y límites con ejemplo y actividad evaluada; los modelos de IA esenciales no requieren proveedores ni credenciales externas y sus respuestas simuladas llevan etiqueta.

- [x] Diseñar el recorrido avanzado: [spec0015](../specs/0015-fronteras-avanzadas/index.md).
- [x] Construir binario/Wasm, framing y herramientas (AC-2 a6,AC-9).
- [x] Integrar capítulo, evaluación, progreso y navegación (AC-1,AC-7,AC-8).
- [x] Verificar recorridos reales/modelados, teclado y móvil.
- [x] Probar lógica, runtime y regresiones.

Spec [0015](../specs/0015-fronteras-avanzadas/index.md), código en `src/lib/binary-boundary.ts`, `src/lib/database-wire.ts`, `src/lib/tool-boundary.ts`, `src/content/advanced.ts` y los experimentos de `/advanced`. La [evidencia](../specs/0015-fronteras-avanzadas/verify.md) registra669 pruebas de lógica y142 de navegador, tipos, lint y compilación. Wasm ejecuta un módulo fijo real; ABI/FFI, transporte y herramientas son modelos etiquetados. Seis actividades y doce comprobaciones completan el progreso. Sus productores y recorridos también cierran la integración del bloque7.

### 18. Referencia y búsqueda conceptual · done

Consultar términos, contratos, código y simplificaciones sin perder el experimento. Unificar vocabulario entre capítulos, comparador e inspectores.

**Done when:** puedes buscar y navegar el glosario en español con términos técnicos originales; las entradas enlazan a experimentos relevantes y explican diferencias que suelen confundirse; la referencia reúne instrucciones de ejecución, contratos y límites pedagógicos; no hay enlaces internos rotos ni resultados de búsqueda ficticios.

- [x] Diseñar la referencia navegable (spec): [0016](../specs/0016-referencia-conceptual/index.md).
- [x] Construir referencia: `/develop referencia y búsqueda conceptual`
  - [x] Integrar catálogo, relaciones y búsqueda/URL (AC-2 a4).
  - [x] Integrar pantalla, guía y consulta contextual (AC-1, AC-5, AC-6).
- [x] Verificar búsqueda, historial, contexto, teclado y móvil.
- [x] Probar catálogo, URLs y regresiones (AC-7).

Spec [0016](../specs/0016-referencia-conceptual/index.md), código en `src/content/reference.ts`, `src/lib/reference.ts`, `src/lib/reference-target.ts` y `src/components/reference-explorer.tsx`. La [evidencia](../specs/0016-referencia-conceptual/verify.md) registra94 fichas,19 pruebas nuevas y seis recorridos específicos;712 pruebas de lógica y155 de navegador en la suite completa, tipos, lint y build. La consulta contextual conserva el laboratorio en otra pestaña. Búsquedas e historial usan URL, sin guardarse en el progreso; no se acredita aprendizaje por consultar.
