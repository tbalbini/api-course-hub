# Registro de validación pedagógica

Fecha de preparación:23 de octubre de2026. Protocolo v1. No se ha observado a ningún participante.

## Resultados humanos

| Prueba del Master Prompt, sección16 | Tarea | Perfil requerido | Evidencia humana | Resultado |
|---|---|---|---|---|
| 1, principiante | N1 | P01, sin experiencia programando | Sin ficha recibida | Pendiente |
| 2, junior | J1 | P02, consumidor de HTTP | Sin ficha recibida | Pendiente |
| 3, backend | B1 | P03, implementador de APIs | Sin ficha recibida | Pendiente |
| 4, arquitecto | A1 | P04, experiencia en sistemas | Sin ficha recibida | Pendiente |
| 5, aprendizaje visual | V1 antes de la tarea de perfil | Las cuatro personas, mínimo una V1 suficiente | Sin fichas recibidas | Pendiente |

Sesiones observadas:0. Perfiles cubiertos:0 de4. Pruebas humanas acreditadas:0 de5. No hay hallazgos humanos que corregir todavía; eso no demuestra ausencia de dificultades. La fase4 permanece en curso.

## Preparación y ensayo técnico

Ensayo realizado en Chromium mediante Playwright sobre producción exclusiva en `127.0.0.1:3100`, iniciada con `npm start -- --hostname 127.0.0.1 --port 3100`. Se reutilizó el build comprobado en la fase3 porque no cambió ninguna fuente de aplicación, prueba o configuración. BUILD_ID: `0KTskggKaqS1WmEdwHsh3`. La huella de las172 fuentes coincide con esa fase: `64c29b874ba103e829a8af86d11529d662861a777f1e33ecf37a6ba7bcc5b6a4`.

Cada recorrido abrió un contexto nuevo, con movimiento reducido; N1, J1, B1 y A1 a1440×1000, V1 a1280×720. Son ensayos de controles y resultados observables, sin respuestas humanas ni evaluación de la rúbrica.

Entorno: macOS26.6.2, Node24.14.0, npm11.9.0, Playwright1.64.1, Chromium156.0.8078.4. Huella de los tres materiales v1 al preparar la sesión: `3e2a81ca4f6054ce99daa48e9a49ab67223bca146fb9cd7e4c6a2bf248ec8223`.

| Recorrido ensayado | Resultado técnico |
|---|---|
| V1 | Favoritos cambió sin HTTP; comprar creó un pedido real con un POST; avanzar y replay no enviaron otra operación. |
| N1 | La función con10 y20 devolvió30; la modificación DOM cambió el nodo sin solicitudes de API. |
| J1 | Cargar creación preparó POST y clave; enviar devolvió201; quantity0 con los demás datos conservados devolvió400 INVALID_INPUT. |
| B1 | REST y GraphQL respondieron al mismo objetivo y selección de campos; pérdida de respuesta produjo incertidumbre. Sin credencial, lector y comprador produjeron401,403 y200 en el modelo. El renombre rompió v1, la coexistencia la conservó y la dirección inversa detectó404. Sin solicitudes de API. |
| A1 | Anatomy permitió función, IPC, HTTP y mensaje; webhook mostró confirmación perdida; SSE y WebSocket ejecutaron sus modelos. Sin solicitudes de API. |

Los cinco recorridos terminaron sin errores JavaScript. El primer intento del ensayo V1 falló porque el selector automatizado exigía el texto exacto Guardar en favoritos y omitía el sufijo accesible SOLO LOCAL. Se ajustó únicamente el selector del ensayo y se repitió V1 con éxito; no se modificó la aplicación. El ensayo también permitió corregir en el guion del moderador los nombres Cargar creación y Enviar petición.

La revisión independiente del protocolo detectó tres ambigüedades y el usuario eligió aplicar sus ajustes: cierre de V1, exposición previa a respuestas y procedimiento de huella. La comprobación documental verificó las secciones de la spec, sus seis criterios,63 enlaces locales de estos materiales y scope2, ausencia de espacios finales y ejecución del comando de huellas publicado. No detectó enlaces rotos ni inconsistencias en esos controles. La sincronización del contexto no requiere cambios en AGENTS.md: esta fase solo añade documentación y mantiene los pendientes ya registrados.

El [informe local](../../../test-results/phase4-protocol-smoke.json) conserva resultados y el fallo inicial del selector. Es un artefacto efímero ignorado por Git; esta tabla conserva el resumen duradero. No se repitió la suite integral por estos cambios exclusivamente documentales. Los758 casos de lógica y215 de navegador corresponden a la [fase3](../../scope2/fase3-verificacion.md), no a una nueva ejecución en esta fase.

## Identificar una sesión antes de observar

Desde la raíz del proyecto, después de compilar, este comando usa Node24 y calcula las dos huellas. Las172 fuentes son los167 archivos del manifiesto histórico con su contenido actual y los cinco añadidos por la fase2. No se modifica el manifiesto histórico. Una nueva fuente de código, prueba o configuración exige añadir su ruta a la lista antes de comparar versiones; no se debe inferir cobertura de archivos que no estén incluidos.

```sh
node --input-type=module <<'JS'
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = 'docs/specs/';
const manifest = JSON.parse(readFileSync(root + '0018-verificacion-entrega/evidence/manifest.json', 'utf8'));
const sources = [...manifest.files.map(file => file.path),
  'src/lib/order-storage.ts', 'src/content/order-storage.ts',
  'src/components/order-storage-example.tsx', 'tests/order-storage.test.ts',
  'tests/e2e/storage-example.spec.ts'];
const materials = ['protocolo.md', 'guion.md', 'ficha.md']
  .map(name => root + '0020-validacion-pedagogica/' + name);
const sha = value => createHash('sha256').update(value).digest('hex');
const fingerprint = paths => sha([...new Set(paths)].sort()
  .map(path => path + '\0' + sha(readFileSync(path)) + '\n').join(''));
console.log(JSON.stringify({ sources: sources.length, sourceSHA256: fingerprint(sources),
  protocolSHA256: fingerprint(materials), buildId: readFileSync('.next/BUILD_ID', 'utf8').trim(),
  node: process.version }, null, 2));
JS
```

Copiar la salida a cada ficha, con fecha, origen y entorno. La huella de materiales incluye protocolo, guion y ficha; no incluye este informe, que recibirá resultados. BUILD_ID identifica una compilación, no prueba por sí solo qué fuentes la produjeron: compilar antes de las sesiones y registrar las huellas sin editar entre ambos pasos. El ensayo de esta fase se vincula al build anterior por la igualdad de fuentes con el registro de fase3.

## Cómo actualizar este registro

Cada resultado debe enlazar una ficha real anónima, identificar versión, subcriterios, ayudas y limitaciones. Si las notas no pueden conservarse aquí, identificar un registro local accesible al responsable y mantener el resultado pendiente de revisión mientras no se pueda inspeccionar evidencia suficiente. Conservar resultados parciales e insuficientes junto a las correcciones y repeticiones.

La [plantilla](ficha.md) no es evidencia. Tampoco lo son los agentes, las pruebas automáticas, los logros guardados o la confirmación anterior de VoiceOver. Los requisitos y el cierre están en [protocolo.md](protocolo.md). El contraste integral y la regresión final pertenecen a la fase5 de [scope2](../../scope2/index.md).
