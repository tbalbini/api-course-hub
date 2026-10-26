# Recorrido central de The API Universe

Un mismo caso de pedidos conecta la primera operación real, Follow the Click y el proyecto final del capítulo 11. Comparte handlers, contratos y negocio, sin construir tres aplicaciones paralelas.

El [índice](index.md) contiene el estado global, las fases y el orden de trabajo. Los números de bloque son identificadores estables, no números de capítulo.

## Skeleton

### 5. Primera operación de pedidos real · done

Conectar una acción de interfaz con un endpoint HTTP local y un almacenamiento demostrativo explícito. Probar la diferencia entre comunicarte con el servidor y actualizar únicamente la interfaz.

**Done when:** puedes crear un pedido válido y verlo en la interfaz; la petición aparece en las herramientas de red; hay contrato, validación del lado servidor, error estructurado e identificador de traza; persistencia y reinicio tienen comportamiento documentado; el segundo botón cambia estado local sin ejecutar una petición; no se cobran pagos ni se usan secretos reales.

- [x] Diseñar la operación inicial de pedidos (spec): `/architect primera operación de pedidos real`
- [x] Construir compra, validación y almacenamiento temporal: `/develop primera operación de pedidos real`
  - [x] Exponer creación y consulta con validación, permisos y deduplicación.
  - [x] Conectar consola, captura real y acción local sin petición.
- [x] Comprobar el recorrido real: `/check verify primera operación de pedidos real`
- [x] Probar servidor y navegador: `/test primera operación de pedidos real`

Spec [0002](../specs/0002-recorrido-central/index.md), [evidencia](../specs/0002-recorrido-central/verify.md), código en `src/app/api/orders/` y `src/components/click-lab.tsx`.

## Fase 3

### 6. Follow the Click completo · done

Convertir la compra en un recorrido inspeccionable desde el evento del navegador hasta el cambio final de interfaz. Las acciones se explican a partir de eventos, no de secuencias visuales independientes.

**Done when:** puedes reproducir, pausar, avanzar, retroceder, repetir, ajustar velocidad y seleccionar la timeline; cada paso muestra datos, código, request o response y causa; el recorrido cubre evento, handler, estado, serialización, fetch, red conceptual, infraestructura opcional, ruta, autenticación, autorización, validación, negocio, almacenamiento, respuesta, parsing y renderizado; DNS, conexión y TLS solo aparecen cuando corresponden al escenario; puedes comparar dos ejecuciones; 200, 201, 400, 401, 403, 404, 409, 429, 500, timeout, fallo de red y petición duplicada producen ramas y resultados distintos; se distingue respuesta perdida después de una escritura y se observa el efecto de deduplicar; retroceder no vuelve a ejecutar efectos reales ni deshace falsamente una escritura; la vista local demuestra ausencia de tráfico remoto.

- [x] Diseñar la ampliación de red e infraestructura (spec): `/architect follow the click completo`
- [x] Construir el recorrido completo: `/develop follow the click completo`
  - [x] Integrar reproducción, inspector, fallos y comparación del primer recorrido.
  - [x] Ampliar generación causal y condiciones de conexión.
  - [x] Integrar vistas de red e infraestructura con selección compartida.
- [x] Verificar las vistas en navegador: `/check verify follow the click completo`
- [x] Probar condiciones y regresiones: `/test follow the click completo`

Specs [0002](../specs/0002-recorrido-central/index.md) y [0003](../specs/0003-red-infraestructura/index.md), código en `src/components/click-lab.tsx`, `src/components/trace-player.tsx`, `src/components/trace-views.tsx` y `src/lib/network.ts`. [Evidencia de la ampliación](../specs/0003-red-infraestructura/verify.md): 92 pruebas de lógica y servidor, 9 de navegador y comprobación de los doce escenarios. El almacenamiento ejecuta un Map, sin afirmar que ejecutó SQL. Su uso dentro de capítulos, desafíos y otros laboratorios pertenece a sus bloques.

## Fase 6

### 16. Proyecto final de pedidos · done

Completar el capítulo 11 ampliando el recorrido real ya construido. Puedes inspeccionar y ejecutar el código que conecta una acción de usuario con negocio, almacenamiento y actualización visual.

**Done when:** la miniaplicación incluye interfaz, cliente, API HTTP, contrato, validación del servidor, lógica de negocio, almacenamiento demostrativo explícito, errores, autorización básica e instrumentación; puedes consultar y actualizar un pedido además de crearlo y seguir sus datos y trace ID de extremo a extremo; el código explicado coincide con el código ejecutado; los cambios de estado y las solicitudes duplicadas respetan reglas documentadas; las instrucciones permiten reproducir el proyecto sin registro, pagos ni credenciales de terceros.

- [x] Diseñar la ampliación (spec): `/architect proyecto final de pedidos`
- [x] Construir el proyecto integrado: `/develop proyecto final de pedidos`
  - [x] Instrumentar rutas y completar recepción y captura.
  - [x] Integrar fuentes inspeccionables y aplicación real.
  - [x] Integrar capítulo, progreso y navegación.
- [x] Verificar recorrido real, recuperación, código y accesibilidad: `/check verify proyecto final de pedidos`
- [x] Probar contratos y regresiones: `/test proyecto final de pedidos`

Spec [0013](../specs/0013-proyecto-pedidos/index.md), código en `src/components/build-api-lab.tsx`, `src/lib/order-receipt.ts`, `src/app/api/orders/` y `scripts/project-sources.mjs`. El capítulo 11 funciona en `/build-api`, con fuentes compiladas descargables y seis logros más quiz persistido. GET/PATCH amplían instrumentación sin duplicar negocio. La [verificación del proyecto](../specs/0013-proyecto-pedidos/verify.md) conserva pruebas de recuperación, código, accesibilidad y regresiones, incluidas las comprobaciones posteriores de navegación y X Ray. El almacenamiento temporal de 200 pedidos y las credenciales públicas conservan sus límites.
