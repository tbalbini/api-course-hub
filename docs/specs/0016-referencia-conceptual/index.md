# 0016. Referencia y búsqueda conceptual

**Date**: 2026-10-22
**Status**: Accepted

## Summary

Unificar términos, mecanismos y límites del curso en `/reference`, con búsqueda local y enlaces a experimentos. El inspector permite consultar el concepto en otra pestaña para conservar la captura activa. La referencia documenta ejecución, contratos y simplificaciones sin acreditar aprendizaje por una visita.

## Requirements

- **AC-1**: `/reference` sustituye su orientación pendiente por Glosario y Guía del laboratorio. Reutiliza Sidebar y design.md, metadata, Suspense, skip link, teclado, foco y disposición390..1440px. Menú y documentación indican la disponibilidad real. Desafíos sigue pendiente.
- **AC-2**: Catálogo editorial tipado en `src/content/reference.ts`, con al menos80 conceptos entre los trece capítulos y las familias de taxonomía. Cada ficha contiene id estable, término, alias, tema, definición, mecanismo, límites, código representativo, conceptos relacionados y un experimento existente. Reutiliza las29 fichas de taxonomía mediante adaptación, sin copiar sus explicaciones ni tratarlas como clases excluyentes. Relacionar conceptos no declara equivalencia.
- **AC-3**: Buscar por palabras normalizadas sin distinguir mayúsculas o tildes, con todas las palabras de la consulta presentes en el texto indexado, y filtro de tema combinado. Incluye término, alias, definición, mecanismo y límites. Prioriza nombre/alias exacto, prefijo de nombre/alias y después demás coincidencias; desempata alfabéticamente en español. Sin consultas devuelve orden alfabético. Sin resultados informa cero y permite limpiar. No inventa respuestas, sinónimos ni resultados de servicios externos.
- **AC-4**: URL local admite `q` hasta160 caracteres, `topic` del catálogo, `term` existente y `view=glossary|guide`; valores desconocidos se ignoran y término inválido usa API con aviso. Filtros no cambian la ficha seleccionada. Si queda fuera de resultados se informa y se permite limpiar sin perderla. Elegir ficha o relación agrega historial; escritura/filtros reemplazan la entrada actual. Atrás/Adelante y recarga restauran URL, no datos operativos. No se guardan búsquedas ni cambia la ubicación/progreso del curso al consultar.
- **AC-5**: Una ficha muestra definición, mecanismo, límite, código representativo y relaciones seleccionables, además del experimento con etiqueta de nueva pestaña. Los vínculos de taxonomía conservan su origen editorial y pueden abrir su mapa. El inspector compartido ofrece referencia contextual en otra pestaña basada exclusivamente en stage mediante mapa pequeño, con API como fallback. Solo envía el id editorial en la URL, nunca capture/input/output/credenciales. Consultar no cambia captura/cursor ni repite HTTP/Wasm. No se importa el catálogo completo dentro del reproductor.
- **AC-6**: Guía reúne comandos npm vigentes, contrato POST/GET/PATCH de pedidos, autenticación demostrativa, validación, idempotencia, Map200 temporal, incertidumbre y replay, procedencia/tiempo y diferencias entre operaciones reales y modelos. Incluye módulos de arquitectura y enlaces a código ejecutado y experimentos. No ejecuta comandos ni requests al consultar; no promete seguridad productiva o persistencia durable.
- **AC-7**: Tests comprueban catálogo/ids/relaciones/temas, rutas permitidas y anclas existentes cuando las haya, cobertura por capítulo, adaptación sin divergencias, búsqueda/orden/filtros/URL y ausencia de almacenamiento o efectos. Navegador comprueba búsqueda, cero resultados, selección fuera del filtro, relaciones/historial/recarga, guía, consulta desde inspector sin perder captura, teclado y móvil. Tipos, lint, lógica, build y regresiones pasan. Alcance distingue referencia completa de desafíos y verificación integral pendientes.

## Decision

Reutilizar React, TypeScript, búsqueda síncrona en arrays y paneles actuales. No dependencia, backend, CMS, cuenta ni endpoint nuevo. El usuario eligió buscador/filtros, diseño actual y fichas conectadas sin persistencia ni progreso por consulta. La preferencia de referencias externas de specs sigue siendo ninguna.

**Implementation skills**: `develop`, `test`, `check`, `sync`, `ponytail:ponytail`, `vercel:react-best-practices`.

## Feature design

### Modelo y fuentes

| Entidad/valor | Fuente y restricciones |
|---|---|
| ReferenceEntry | id único slug; title, aliases:string[], topic del enum, chapter0..12, definition, mechanism, boundary, code, related:ids[], experiment:{label,href}. Todo requerido, alias/related pueden ser arrays vacíos solo cuando no haya equivalentes útiles |
| Entradas de taxonomía | id/name/why/what/how/tradeoffs/boundaries/code/alternatives y experiment de `technologies`; topic interfaces, chapter6. Si falta experiment se abre /api-universe. No duplicar textos; mapeo de alias explícito cuando nombre técnico lo necesite |
| Conceptos complementarios | Filas editoriales para fundamentos, HTTP/red, seguridad, contratos, sistemas y fronteras avanzadas. API tiene id api y es fallback inicial |
| Temas | basics/network/http/interfaces/events/security/contracts/systems/advanced con etiquetas españolas. Cada ficha tiene un tema principal, sin pretender una taxonomía excluyente de APIs |
| Estado de navegación | useSearchParams y funciones puras parseReferenceState/referenceURL. q recortada a160 caracteres y normalizada solo al buscar; topic/id validados; vista por defecto glossary; selección por defecto api. No localStorage ni CourseSession nuevo |
| Resultados/contador | filterReference(query,topic), puntuación estable y orden español derivado del catálogo actual. Consulta AND por tokens separados por espacios. Literal, sin regex construida desde input ni HTML insertado |
| Selección | term de URL. Se conserva aunque filtro no la incluya. Aviso de selección fuera del filtro y fallback de id inválido. Limpiar cambia q/topic sin borrar term |
| Contexto del inspector | Partial Record<Stage,string> en módulo diminuto `reference-target.ts`. invokeLocal→invocation, authenticate→authentication, authorize→authorization, validate→validation, persist→persistence, deduplicate→idempotency, request→serialization, checkContract→contract; demás→api. Solo ids probados existentes |
| Guía | Datos editoriales y comandos del package.json, contrato vigente en handlers y README. Ejemplos representativos, no editor ejecutable. SKU de PRODUCT si se usa; sin importar orders.ts en cliente |

### Superficie y seguridad

Página pública `/reference`, sin endpoints de datos. Glosario/Guía se eligen con enlaces nativos a URL local. Formulario de búsqueda con label, selector de tema, botón limpiar, contador role=status, lista de resultados como enlaces aria-current. Selección agrega historial, filtros reemplazan. Detalle y guía tienen encabezados estables; código desplaza dentro del panel y móvil apila catálogo y detalle. Las fichas de resultado desplazan dentro de un catálogo acotado; no se virtualiza ni pagina un endpoint inexistente. Resultados completos disponibles en el DOM.

`ReferenceLookup` se limita a un enlace target=_blank rel=noopener noreferrer con texto explícito; el navegador conserva el laboratorio anterior. No recopila datos, abre ventanas automáticamente ni cambia el estado del reproductor. La pantalla Reference no ejecuta una simulación y no necesita X Ray propio. La orientación pendiente de referencia se elimina, junto con cualquier rama sin llamadas; la eliminación completa de PendingArea se conserva cuando desafíos ya no lo utiliza. Llamadas y pruebas existentes se actualizan.

### Escenarios críticos

API frente a HTTP/REST/JSON; autenticación frente a autorización; JWT frente a OAuth; WebSocket frente a webhook; ABI frente a API; lookup no contiene datos de captura. Búsqueda con tildes/alias/espacios y cero resultados. Filtrar un tema mientras la ficha está fuera. Selección relacionada, Atrás/Adelante y recarga. URL con ids/query desconocidos y texto con apariencia HTML no ejecutado. No actividad nueva ni cambio de última ubicación de aprendizaje. Todos los experimentos apuntan a rutas disponibles.

## Build plan

1. Construir catálogo adaptado, relaciones y motor de búsqueda/URL con sus pruebas (AC-2 a4, AC-7).
2. Completar búsqueda→ficha→relación/experimento, teclado, móvil e historial (AC-1, AC-3 a5).
3. Integrar guía, contexto de inspector y disponibilidad en navegación, quitando orientación vieja (AC-1, AC-5, AC-6).
4. Verificar aplicación real, regresiones, documentación y alcance (AC-7).

## Consequences

Los textos canónicos de taxonomía siguen siendo una sola fuente. La referencia agrega definiciones breves complementarias y exige mantener relaciones al editar el catálogo. La búsqueda es literal normalizada, sin corrección difusa ni inferencia. Abrir otra pestaña conserva el experimento, aunque no crea persistencia de su estado. No se introduce migración de progreso.

## Follow-up

El catálogo general de desafíos y la verificación integral conservan sus bloques19 y20.

## Rationale

Opciones y límites en [rationale.md](rationale.md).
