# Razones de la arquitectura

## Context

El proyecto parte de una carpeta con alcance y sin código. Tiene que enseñar mecanismos reales y simulados, sin registro, pagos, secretos de terceros ni infraestructura externa. La preferencia expresada es Next.js con TypeScript y una interfaz técnica accesible.

El enfoque Journey pide completar primero el recorrido de compra. La arquitectura debe soportar una operación HTTP real y permitir inspeccionar su traza sin volver a ejecutarla al reproducirla.

No se ha establecido volumen de usuarios, despliegue público ni operación con varias instancias. No se diseña para una escala hipotética. El alcance conserva todos los recorridos futuros, pero no se incorporan sus dependencias antes de necesitarlas.

## Options considered

### Aplicación única con Next.js

Permite páginas y HTTP real en un solo proyecto, con tipos compartidos. Su límite principal es que el estado en memoria solo pertenece al proceso que atiende la petición y se pierde al reiniciar.

### Frontend separado y servidor API independiente

Permite desplegar y escalar ambos por separado y enseñar CORS entre orígenes con una infraestructura real. Añade dos arranques, configuración y más puntos de fallo al recorrido inicial. Es una alternativa válida si el objetivo pasa a ser operar servicios separados.

## Rationale

Una aplicación única satisface el objetivo educativo sin exigir al estudiante configurar dos proyectos. Las fronteras que importa enseñar siguen siendo reales: navegador, petición HTTP y servidor. Las fronteras adicionales se modelan y etiquetan como simulación.

El usuario eligió SVG, reducer de React y memoria temporal. React Flow, Zustand y una base local persistente aportarían capacidades adicionales, pero no son necesarias para el primer recorrido. No se añaden servicios de autenticación, pagos, brokers ni SDKs externos.

No se incluyen referencias adicionales, respetando la elección del usuario. La comprobación puntual de documentación de implementación no cambia esa preferencia editorial.
