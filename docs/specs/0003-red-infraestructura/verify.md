# Verificación de red e infraestructura, spec 0003

Ejecutada el 21 de octubre de 2026 contra la compilación de producción local en `http://127.0.0.1:3000`. El proceso anterior se detuvo antes de compilar y reiniciar. No se reutilizó una compilación anterior.

## Criterios y fuentes de valores

- [x] AC-1. Seleccionar TLS en Red, cambiar a Infraestructura y cambiar profundidad conserva los metadatos del evento. Los botones de mecanismos seleccionan la misma timeline e inspector. Prueba `vistas comparten cursor, condiciones capturadas y omisiones causales` en `tests/e2e/network.spec.ts`.
- [x] AC-2. La matriz de 36 combinaciones de destino, caché, reutilización e ingreso muestra DNS solo con nombre sin caché y conexión nueva, TCP con conexión nueva y TLS solo para HTTPS nuevo. Los motivos de omisión se comprobaron también en navegador, incluyendo IP literal y reutilización. Fuentes: `tests/network.test.ts` y primera prueba de navegador.
- [x] AC-3. Fallo previo a entrega no alcanza proxy, balanceador, servidor ni almacén. Timeout conserva escritura y respuesta construida, pero no recepción. Duplicado transmite dos solicitudes y recupera una única escritura usando la misma clave y payload, sin repetir la preparación. Fuentes: pruebas de red y trazas, tercera prueba nueva de navegador y prueba anterior de timeout.
- [x] AC-4. En navegador, entrada directa produjo cero proxies y cero balanceadores; proxy produjo uno y cero; balanced produjo uno y uno. El destino app-1 es fixture explícito. La vista distingue recepción, ruta, funciones locales, negocio y Map. Expone límites de TLS y roles compartidos. Evidencia visual adicional en `test-results/infrastructure-final.png`.
- [x] AC-5. Compra real produce respuesta 201 y pedido; Red muestra DNS, TCP y TLS sin instrumentar. Infraestructura presenta funciones observadas y no inventa middleware de Next.js. Favoritos deja ambas vistas sin infraestructura remota. Cambiar la casilla de caché conserva la configuración capturada hasta ejecutar. Las simulaciones no emitieron POST ni solicitudes a tienda.example. Fuentes: primeras dos pruebas nuevas de navegador y prueba original de compra real.
- [x] AC-6. Selección de vista y evento mediante teclado funciona a 390 × 844, sin desbordamiento horizontal. Las cinco pruebas anteriores de compra, permisos, reintento, reproducción y móvil siguen pasando. Se respeta reducción de movimiento. Evidencias: suite de navegador y capturas móvil y escritorio.
- [x] Origen, hostname y puerto proceden del fixture elegido. Cambiar origen conserva GET y ruta con identificador en consultas 200 y 404, sin body. La matriz comprueba las doce condiciones con los tres destinos. Las condiciones capturadas son una copia independiente de los ajustes.
- [x] Procedencia, error, contrato y dependencias pertenecen a cada evento. Los números son lógicos, sin latencia inventada. La respuesta HTTP inspeccionable no existe para un timeout sin recepción, aunque la simulación permita observar el efecto servidor.

## Comandos

- [x] `npm test`: 92 pruebas de lógica y servidor correctas.
- [x] `npm run test:e2e`: 9 pruebas Chromium correctas contra producción local.
- [x] `npm run lint`: correcto.
- [x] `npm run typecheck`: correcto; la compilación final también ejecutó TypeScript correctamente.
- [x] `npm run build`: compilación correcta, páginas y Route Handlers disponibles.
- [x] `git diff --check`: sin problemas de espacios.

Además se recorrieron en Chromium las doce condiciones y los tres ingresos. Sus contadores cambiaron como se esperaba, sin errores JavaScript ni solicitudes al dominio ilustrativo. Las capturas se regeneran al ejecutar Playwright; no forman parte del código versionado.

## Límites comprobados y pendientes

La preparación de conexión es un modelo HTTP/1.1 sobre TCP, no instrumentación de red. HTTP/2, HTTP/3, TTL, retransmisiones, reanudación TLS y transporte entre entrada y aplicación quedan fuera de detalle y se señalan en interfaz. Solo se verificó Chromium, no otros motores ni lectores de pantalla. La autenticación es demostrativa y el Map no es durable.

El currículo, los demás laboratorios y la evaluación pedagógica con estudiantes siguen fuera de esta ampliación y pendientes en el alcance.
