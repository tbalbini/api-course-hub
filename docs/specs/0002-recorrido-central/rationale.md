# Razones del primer recorrido

## Context

Una persona tiene que distinguir una operación local de una petición a otro proceso. La interfaz debe permitir observar causas y datos, sin confundir una animación con una medición de red.

## Options considered

Capturar una operación y después inspeccionarla evita repetir efectos al navegar por los pasos. Su límite es que la compra ya terminó cuando el estudiante empieza a reproducir la captura.

Ejecutar cada efecto al avanzar permitiría intervenir durante una operación real. Haría que retroceder y repetir fuese ambiguo y podría duplicar escrituras. No se necesita para enseñar el primer recorrido.

## Rationale

Separar captura y reproducción mantiene el ejemplo real comprobable en las herramientas de red. Las condiciones de fallo se exploran en simulación explícita. El producto único y los permisos públicos siguen las elecciones del usuario y dejan el foco en contratos, fronteras y efectos.
