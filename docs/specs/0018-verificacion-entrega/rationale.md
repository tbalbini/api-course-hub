# Decisión de verificación y entrega

## Context

Los bloques1a19 tienen evidencia por recorrido, pero esa historia no comprueba una instalación nueva ni la integración final. Desarrollo ya puede estar abierto en el equipo. El alcance exige accesibilidad, precisión, rendimiento identificado y límites explícitos además de pruebas verdes.

## Options considered

1. Usar solo el servidor abierto. Es rápido y permite inspección, pero puede ejecutar fuentes o caché distintos de la entrega (basis: configuración Playwright existente).
2. Instalar y compilar una copia limpia, con servidor exclusivo y suites existentes. Permite comprobar el lockfile y producción sin alterar la sesión; requiere espacio temporal y binarios de tres motores (basis: AGENTS.md y guía Next.js instalada).
3. Introducir una plataforma de auditoría y CI remoto. Automatiza ejecuciones externas, pero agrega dependencias y publicación fuera del alcance autorizado (basis: límites y Git en AGENTS.md).

## Rationale

Se elige la segunda opción. El usuario eligió ampliar comprobaciones esenciales a Chromium, Firefox y WebKit y usar fuentes locales. Reutilizar pruebas de cada mecanismo preserva su cobertura y añade la comprobación común que falta. No se interpreta el silencio como aprobación de una certificación incompleta.

El alcance menciona dieciséis principios que no enumera. El usuario preguntó cuáles eran; no hay lista recuperable en los archivos revisados. Se revisan reglas documentadas sin atribuirles un origen que no consta. Una sesión real de lector y la validación con estudiantes conservan su estado independiente.

En la continuación se localizó en Chrome la conversación «Prompt para web interactiva de APIs», que muestra el master prompt del proyecto. Su sección15 contiene quince viñetas y una regla de simplificación. La fuente se conservó y contrastó como P01aP16 en `precision.md`, cerrando esa ausencia documental sin sustituir el contrato. El intento con VoiceOver10 quedó registrado en `reader.md`; activar el proceso sin observar su salida no se considera un resultado satisfactorio. Después el usuario confirmó la lectura de campos, anuncios400/201/403 y corrección con teclado. Ese resultado humano, separado de la automatización, completa el flujo esencial de lector y permite cerrar el bloque20.

## References

Fuentes del proyecto: `AGENTS.md`, `docs/scope/calidad.md`, `package.json`, `playwright.config.ts`, `design.md`, specs0001a0017 y sus verificaciones.

Guías instaladas: `node_modules/next/dist/docs/01-app/02-guides/testing/playwright.md` y `node_modules/next/dist/docs/03-architecture/accessibility.md`.
