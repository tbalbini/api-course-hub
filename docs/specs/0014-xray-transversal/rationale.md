# Decisión de X Ray transversal

## Context

El inspector ya comparte profundidad, entrada, salida, contrato, frontera y código. Actor no identifica ambos extremos. Los productores reutilizan etapas cambiando mecanismo o frontera, por lo que un dato deducido del texto puede resultar falso. El usuario eligió cubrir recorridos actuales, metadatos explícitos y tipo obligatorio.

## Options considered

1. Metadatos explícitos y migración completa. El compilador descubre omisiones, pero exige revisar todos los productores y el receipt HTTP.
2. Derivar al inspeccionar según Stage o texto. Reduce cambios, pero confunde direcciones y arrastra semántica de pedidos hacia otros mecanismos.
3. Campo opcional y migración gradual. Permite avance por área, pero mantiene una cobertura incompleta sin detección estática.

## Rationale

El contrato obligatorio permite completar la observación sin otra infraestructura. Los defaults canónicos son declaraciones de las etapas originales; los modelos declaran sus propias interacciones. Reutilizar el reproductor conserva separación entre efectos y reproducción y evita otra superficie de estado.

## References

Fuentes locales: AGENTS.md, design.md, docs/scope/plataforma.md, spec0002, spec0013, src/lib/trace.ts, communication.ts, anatomy.ts, comparison.ts, systems.ts, order-receipt.ts y src/components/trace-player.tsx. No se consultaron fuentes web.

La revisión independiente señaló tres huecos. El usuario aceptó precisar extremos como roles o componentes, autorizar el catálogo con errores/límites del código existente y arrays vacíos para pasos sin fallos modelados, y conservar la entrega SSE con validación como un único evento explícito.
