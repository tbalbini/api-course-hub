# 0020. Comprensión observada con participantes

**Date**: 2026-10-23
**Status**: In Progress

## Summary

Observar si personas de cuatro perfiles pueden razonar con el laboratorio, explicar sus decisiones y aplicar lo aprendido a otro caso. El protocolo fija tareas, ayudas y criterios antes de recoger respuestas. Prepararlo y comprobar sus recorridos no acredita resultados humanos.

## Requirements

Como responsable del laboratorio, quiero distinguir funcionamiento técnico, comprensión observada y conocimientos previos para decidir qué corregir.

- **AC-1**: El protocolo v1 identifica las pruebas1 a5 de la sección16 del Master Prompt, cuatro perfiles distintos, orden, tareas, criterios y preguntas de transferencia. La prueba visual precede a las explicaciones técnicas.
- **AC-2**: Cada sesión registra código anónimo, perfil declarado, exposición previa, versión de protocolo y aplicación, entorno, predicción, acciones, explicación, ayudas e incidencias. La ficha vacía no representa una sesión.
- **AC-3**: La rúbrica separa evidencia suficiente, parcial, insuficiente y no evaluable. Ningún promedio, quiz, respuesta del agente o resultado con respuesta dictada acredita un criterio pendiente.
- **AC-4**: Los destinos y controles del guion se comprueban sobre una compilación identificada antes de las sesiones. El ensayo técnico se registra separado de las observaciones humanas.
- **AC-5**: Las dificultades conservan evidencia, corrección y nueva comprobación. Una repetición enseñada se distingue de una transferencia nueva y no borra el intento inicial.
- **AC-6**: El informe conserva cinco resultados humanos pendientes hasta recibir fichas válidas. Solo permite cerrar el bloque7 con cobertura de los cuatro perfiles, la prueba visual y las dificultades resueltas; el bloque20 requiere además la fase5.

## Decision

Usar sesiones moderadas y fichas Markdown, sin cambiar la aplicación ni añadir servicios. El mínimo exploratorio es una persona distinta por perfil. La actividad visual se realiza primero con esas mismas personas. El usuario coordina las sesiones; no se envían invitaciones automáticamente.

Estas son recomendaciones operativas por defecto del plan, sujetas a cambios antes de la primera sesión. No se ha recibido confirmación de disponibilidad de participantes.

## Feature design

Los materiales son [protocolo del moderador](protocolo.md), [guion del participante](guion.md), [ficha para copiar](ficha.md) e [informe y registro de resultados](verify.md). El participante recibe solo su bloque del guion. La rúbrica y las respuestas esperadas permanecen con el moderador hasta registrar la respuesta.

| Registro | Campos y origen |
|---|---|
| Versión | Protocolo v1; huella de fuentes, BUILD_ID y comando del servidor comprobados por el moderador |
| Participante | Código P01 a P04 asignado localmente; perfil, experiencia y exposición declarados por la persona |
| Intento | Id de tarea del protocolo, estado inicial, predicción literal, acciones observadas, resultado, palabras del participante, ayuda y criterio evaluado |
| Incidencia | Id I01 y siguientes, intento de origen, síntoma, interpretación provisional, corrección y repetición vinculada |
| Cierre | Estado de cada criterio derivado de la rúbrica y enlaces a fichas reales, nunca de casillas de progreso de la app |

No hay base de datos, endpoint, credencial nueva ni automatización de entrevistas. El moderador conserva únicamente notas anónimas autorizadas por el participante. No añade nombres, contactos o grabaciones al repositorio. Las adaptaciones de acceso se registran por su efecto en la prueba, sin datos personales innecesarios.

Una sesión pasa de pendiente a observada al registrar acciones y explicaciones reales; después se evalúa o queda no evaluable. Una corrección abre un intento nuevo y conserva el anterior. Cambiar tareas o rúbrica incrementa la versión antes de observar; no se recalifican resultados antiguos con un umbral cambiado silenciosamente.

Escenarios críticos: ficha sin respuesta permanece pendiente (AC-2,3,6); ayuda que proporciona la causa impide acreditar ese intento (AC-3); servidor caído produce no evaluable y una nueva sesión, no fallo atribuido al aprendizaje (AC-4,5); cambio de versión obliga a identificar qué resultados necesitan repetirse (AC-2,5,6).

## Build plan

1. Preparar protocolo, guion y ficha con cobertura y rúbrica fijadas (AC-1,2,3,5).
2. Ensayar los recorridos técnicos sobre fuentes identificadas y abrir el registro sin observaciones ficticias (AC-4,6).
3. Observar primero el recorrido visual y después el propio de cada perfil; recoger cuatro fichas y evaluar cada criterio (AC-1,2,3,6).
4. Corregir dificultades atribuibles al producto, repetir con transferencia nueva y reconciliar resultados y alcance (AC-5,6).

## Consequences

Las notas permiten revisar por qué se acredita un resultado y qué dificultad motivó una corrección. Coordinar personas requiere disponibilidad externa. Cuatro sesiones solo aportan evidencia exploratoria; no prueban eficacia general, accesibilidad completa, retención a largo plazo ni aprendizaje causado únicamente por la plataforma.

## Follow-up

- [ ] Recibir cuatro sesiones válidas y evaluar las cinco pruebas humanas.
- [ ] Resolver y volver a comprobar las dificultades que impidan el cierre.
- [x] Contrastar el prompt completo y la entrega técnica en la [fase5](../../scope2/fase5-verificacion.md), conservando los cinco resultados humanos pendientes. La aceptación integral sigue condicionada a las sesiones y a resolver sus dificultades.

## Rationale

Decisión y alternativas en [rationale.md](rationale.md).
