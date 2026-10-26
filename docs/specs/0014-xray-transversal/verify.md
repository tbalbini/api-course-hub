# Verificación de X Ray transversal

Fecha: 2026-10-22. Spec0014. Cobertura: operaciones disponibles, capítulos0 a11 y laboratorios actuales. La comprobación inicial de los capítulos0 a11 se amplía al final con el cierre del bloque17.

## Pasos y evidencia

- [x] En24 superficies seleccionar un evento, abrir sus datos, cambiar las tres profundidades y los paneles de código/intercambio. Captura, evento, datos y panel permanecen; ocultar y recuperar X Ray conserva su selección (AC-1, AC-3, AC-4).
- [x] Contar peticiones de negocio antes y después de inspección/replay: no aparecen operaciones adicionales. SSE recibe sus tres fixtures y termina antes de inspeccionar; replay no abre otro canal (AC-1, AC-5).
- [x] Inspeccionar todos los productores y sus variantes: interaction tiene extremos, tecnología y array de fallos; eventos conceptuales mantienen procedencia y las ramas conservan dependencias (AC-2, AC-4, AC-5).
- [x] Contrastar solicitud/retorno, notificación de chat, ACK perdido y aceptación del broker. Los extremos cambian de dirección sin buscar palabras de la explicación (AC-2, AC-4).
- [x] Contrastar función local, DOM, IPC, módulo de inventario, servicio separado y Map: frontera y tecnología identifican el mecanismo y el lugar correspondientes (AC-4).
- [x] Contrastar UDP y HTTP/3: UDP directo no hereda HTTP o recuperación de QUIC, y QUIC no añade handshake TCP (AC-4, AC-5).
- [x] Recibir receipts sin interaction o con campos vacíos/tipos inválidos: se rechazan y las regresiones del proyecto conservan Response e incertidumbre. Cada event() tiene metadatos aislados (AC-6).
- [x] Renderizar una captura vacía: informa que no hay eventos sin afirmar éxito ni acceder a un paso inexistente (AC-7).
- [x] Inspeccionar a390px, activar Internals con teclado y comprobar ancho de página. Los controles exponen selección; los fallos posibles se identifican como declaraciones (AC-3, AC-7).
- [x] Cambiar profundidad con reproducción en marcha mantiene el evento y el estado de reproducción (AC-1).

Pruebas duraderas en `tests/interaction.test.ts`, ampliación de `tests/order-receipt.test.ts` y `tests/e2e/xray.spec.ts`. Las pruebas HTTP, proyecto, SSE, red y sistemas existentes comprueban permisos, respuestas parciales, idempotencia y ausencia de efectos al reproducir.

## Comandos ejecutados

- [x] `npm test`:610 pruebas,16 archivos.
- [x] `npm run typecheck`: correcto.
- [x] `npm run lint`: correcto.
- [x] `npm run build`: compilación y generación de21 superficies correctas.
- [x] Instancia nueva con `npm start -- --hostname 127.0.0.1 --port 3127` y suite completa de Playwright:124 pruebas aprobadas.
- [x] X Ray:26 casos comprobados,25 en la pasada específica y el caso de reproducción en marcha por separado tras corregir su selector de prueba. Comando final: `npx playwright test -c /tmp/api-course-xray-playwright.config.mts tests/e2e/xray.spec.ts --grep 'reproducción en marcha' --workers=1 --reporter=dot`.

La ejecución de navegador usó una configuración temporal que importa `playwright.config.ts` y cambia únicamente baseURL a `http://127.0.0.1:3127`, con webServer desactivado porque la compilación ya estaba arrancada. Comando: `npx playwright test -c /tmp/api-course-xray-playwright.config.mts --workers=2 --reporter=dot`. El repositorio conserva su configuración. Para repetir con los comandos habituales, servir la compilación actual en el puerto3000 y ejecutar `npm run test:e2e`; evitar reutilizar un servidor anterior.

La primera pasada contra desarrollo compartido obtuvo119/124. Sus cinco fallos de progreso/controles desaparecieron al ejecutar los25 casos de curso, eventos y seguridad en producción nueva, antes de la pasada completa124/124. No se modificaron esas pruebas ni su lógica para obtener el resultado.

## Fuentes de valores comprobadas

| Fuente de la spec | Evidencia |
|---|---|
| Etapas canónicas y almacenamiento real | Tabla completa de Stage y aislamiento de metadatos; receipts de POST/GET/PATCH y recorridos del proyecto |
| Funciones y DOM | Productores locales, favoritos y capítulos0 a3; replay sin repetir DOM/fetch |
| Anatomy | Siete mecanismos, IPC y dirección broker/retorno, incluida concurrencia |
| Comparador | Diez interfaces y dirección de notificaciones; GraphQL/RPC en sus laboratorios |
| Comunicación y entrega | Cuatro perfiles por modelo, ACK perdido, ramas pub/sub y SSE real |
| Red | UDP/HTTP1/HTTP2/HTTP3, pérdidas, configuración capturada y omisiones instrumentales |
| Seguridad y contratos | Perfiles de credenciales y fallos, políticas, diseñador, colecciones e idempotencia |
| Sistemas | Inventario local/remoto, caché, estados de protección y transacciones |
| SSE real | Callbacks de apertura/update/error/cierre, payload validado y fixtures etiquetados |
| Resultado, datos, código y tiempo | Las24 superficies conservan selección y contenido; etiquetas de procedencia y tiempo existentes |
| Profundidad y contexto | Matriz del inspector y progreso compartido, sin persistir capturas ni credenciales |

La inspección visual del panel se hizo sobre `test-results/xray-inspector-desktop.png`. La prueba móvil guardó `test-results/xray-mobile.png` y verificó ancho390px sin desbordamiento. El árbol accesible de Chrome expuso controles, selección y una lista de definiciones con los nuevos campos. Se revisaron hooks, limpieza de efectos y controles de los tres componentes modificados, sin nuevas dependencias.

## Corrección del control transversal

La revisión del usuario detectó que el acceso a X Ray era inconsistente. Los inspectores estaban compartidos, pero cada laboratorio guardaba su propio booleano; protocolos y SSE lo fijaban activo. El botón de cabecera solo estaba presente en algunos recorridos. Una prueba nueva reprodujo la ausencia del control antes de corregirlo. La matriz anterior permitía omitir la comprobación del interruptor cuando no existía; ahora exige exactamente uno.

`XRayProvider` en el layout comparte el modo durante la navegación. `XRayToggle` presenta el mismo control en las diez cabeceras de laboratorios y `TracePlayer` consulta el contexto. Se eliminaron props, booleanos e interruptores locales. La nueva pantalla `/advanced`, incorporada en paralelo, también usa ese control para sus tres laboratorios. Recargar inicia otra sesión con X Ray activo; no se añade almacenamiento persistente.

- [x] Cabeceras de compra, Fundamentos, comparador, Playground, Eventos, Seguridad, Contratos, Sistemas, proyecto y Fronteras avanzadas: exactamente un control visible a1280 y390px, sin desbordamiento.
- [x] Desactivar en Fundamentos y navegar mediante enlaces a Red, GraphQL, RPC y SSE: modo desactivado conservado, incluidos los protocolos que antes lo fijaban activo.
- [x] Activar sobre SSE completo vuelve a mostrar metadatos sin abrir otra conexión.
- [x] En el comparador un solo control oculta y recupera ambas capturas, conserva sus eventos y no repite POST.
- [x] Todas las capturas de la matriz exigen el control, ocultan metadatos al apagar y recuperan sus datos al activar.
- [x] Suite completa de navegador:131 casos aprobados en producción nueva, incluidos32 específicos de X Ray.
- [x] Lógica:610 casos aprobados. Tipos, lint y build correctos. La fixture de ids desconocidos del progreso usa99 porque el catálogo ampliado ya admite12; la lógica del progreso se conserva.

Evidencia visual de cabeceras: `test-results/xray-header-1280.png` y `test-results/xray-header-390.png`. Los nuevos experimentos comparten el modo; su construcción y evaluación pedagógica completa siguen perteneciendo al bloque17.

## Límites

Solo Chromium. La revisión visual y del árbol accesible no sustituye la auditoría completa con lectores de pantalla ni la validación con estudiantes. No se verifica una operación futura inexistente. El catálogo de fallos es pedagógico y no exhaustivo; los metadatos declarados no añaden observaciones de infraestructura.

## Cierre con fronteras avanzadas

La [verificación de la spec0015](../0015-fronteras-avanzadas/verify.md) completa el bloque17 y la cobertura pendiente de este bloque. La matriz de `tests/interaction.test.ts` incluye ABI compatible/invertida/liberada, Wasm normal/trap real, framing completo/truncado/inválido y herramientas con roles y adaptación. Los tres experimentos usan ContractPlayer y el control global, sin booleanos locales.

- [x] En `/advanced?tab=binary`, `wire` y `tools`, cambiar las tres profundidades, abrir datos, alternar paneles, apagar/encender X Ray y reproducir conserva captura/evento/datos y no envía `/api/`.
- [x] El contador de WebAssembly.instantiate no aumenta durante replay; herramientas no vuelve a ejecutar y el buffer wire conserva snapshots.
- [x] Suite completa actual:142 pruebas de navegador, incluidos32 casos de X Ray y ocho recorridos avanzados;669 pruebas de lógica, tipos, lint y build correctos.
- [x] Cuatro pestañas avanzadas a390/701/920/1440px, sin desbordamiento ni errores JavaScript. Evidencia temporal y límites en la spec0015.

Con esta evidencia se cierra la construcción transversal y sus pruebas. Referencia, catálogo general de desafíos y verificación integral siguen pendientes; las comprobaciones históricas anteriores se conservan con su alcance original.
