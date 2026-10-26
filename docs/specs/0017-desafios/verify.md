# Verificación de desafíos y evaluación razonada

Fecha: 22 de octubre de 2026. Contrato: [spec0017](index.md), bloque19, Journey y Beta.

La pantalla `/challenges` funciona con siete formatos y tres niveles. Cada logro requiere resultado operativo y explicación causal correctos en el mismo intento. Se verificó sobre compilación de producción local en `http://127.0.0.1:3127`, sin reutilizar servidores de otros trabajos.

## Evidencia por criterio

| Criterio | Comprobación observada | Evidencia |
|---|---|---|
| AC-1 | Se resolvieron los siete formatos, desde catálogo hasta resultado y captura, en escritorio y móvil | `tests/e2e/challenges.spec.ts`, primer y último caso; [escritorio](evidence/challenges-desktop.png), [móvil](evidence/challenges-mobile.png) |
| AC-2/4 | Causa incorrecta con operación correcta no acredita los siete casos; causa correcta con operación incorrecta tampoco. Corregir y reintentar completa. Editar elimina el feedback actual y conserva el logro histórico | Primer y segundo caso de navegador; `tests/challenges.test.ts` |
| AC-3 | Función local funciona sin red; IPC funciona pero incumple mismo proceso; HTTP remoto falla en este fixture. Predicción retorna string, permisos separan401/403/400/200, interfaces confirman con distinta representación, contrato prueba0/1/5/6, reintento conserva un efecto y201 no garantiza total correcto | Evaluación pura y resultados inspeccionados en los siete formatos; eventos e ids/dependencias visibles |
| AC-4/5 | Recarga conserva los siete ids y restablece formularios, respuestas e intentos; logros no completan capítulos. Tu recorrido muestra7 desafíos y0 de13 capítulos. JSON guardado contiene solo version, chapters, challenges, depth y location | Primer caso de navegador y validación del snapshot local |
| AC-4/5 | Atrás conserva borrador e intento de la pantalla; una navegación completa los descarta. JSON inválido y límites invertidos muestran error recuperable sin captura ni premio. Almacenamiento bloqueado conserva logros durante la sesión | Casos tercero, cuarto y quinto de navegador |
| AC-5 | Catálogo, controles y envío funcionan por teclado; foco visible y salto al contenido. Pantalla375px no desborda en los siete resultados. Suite común añade390/701/920/1440px. X Ray conserva captura y evento seleccionado sin peticiones | Último caso de navegador; `course.spec.ts` y `xray.spec.ts` |

La primera prueba escucha todas las peticiones `/api/` y errores de página: ninguno durante la resolución de los siete desafíos. Cada captura queda separada del snapshot final. En el contrato, la tabla muestra los cuatro fixtures y el inspector identifica que reproduce cantidad5.

## Comprobaciones

- `npm run typecheck`: correcto.
- `npm run lint`: correcto, sin avisos.
- `npm run build`: correcto; `/challenges` prerenderizado con frontera cliente y Suspense.
- `npm test -- --reporter=dot`: 712 pruebas correctas en19 archivos.
- Pruebas específicas de navegador: seis correctas; además el caso común de X Ray cubre Challenges.
- Regresión final: `npx playwright test -c /tmp/api-course-xray-playwright.config.mts --workers=2 --reporter=dot`, 155 pruebas correctas en1,3 minutos. La configuración temporal reutiliza la del repositorio y cambia únicamente baseURL al servidor propio3127 y desactiva webServer.

Se corrigió durante construcción un uso incorrecto de Anatomy: su condición `network` representa fallo de entrega y también afecta IPC. Este fixture ahora la aplica solo a HTTP; IPC conserva entrega local satisfactoria y falla exclusivamente el requisito de mismo proceso. El test reprodujo la diferencia antes de corregirla.

En la primera regresión global pasaron154 de155 pruebas. La prueba nueva de Referencia iniciaba otra búsqueda antes de observar que se hubiera limpiado el filtro; se añadieron aserciones sobre los controles vacíos. Sus seis pruebas pasaron después y la regresión global final pasó las155.

## Límites y mantenimiento

Se automatizó Chromium. No se acredita auditoría de lectores de pantalla, otros navegadores ni validación pedagógica con alumnos. Las capturas muestran modelos conceptuales salvo la suma JavaScript local; no prueban infraestructura remota ni atomicidad de una DB. Debug the Request conserva el body escrito como resultado, mientras la traza de acceso usa su fixture de body inválido, indicado en la pantalla.

Los logros son locales y no resisten manipulación deliberada de localStorage. El catálogo finito evalúa estos fixtures, sin afirmar certificación universal. No hay publicación ni cambios en la administración de Git. Referencia y la verificación integral conservan su seguimiento independiente en los bloques18 y20.

La revisión independiente del diseño no encontró cambios de enfoque necesarios. Se precisaron productores de captura, checkbox booleano de deduplicación y recuperación ante entradas inválidas. La revisión de React confirmó hooks incondicionales, estados de intento separados de efectos, pausa al ocultar, claves estables, HTML semántico y ausencia de dependencias nuevas. README, design.md, AGENTS.md y alcance documentan el contrato vigente.
