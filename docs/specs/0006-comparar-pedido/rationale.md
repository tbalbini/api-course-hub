# Decisión del comparador

## Context

El mapa ya clasifica tecnologías y el simulador ya ejecuta compras HTTP. Falta mostrar qué cambia si la misma operación utiliza otro contrato. Usar pedidos diferentes o cambiar el negocio entre alternativas confundiría la comparación.

## Options considered

Una instalación de diez servidores demostraría herramientas reales, pero introduciría infraestructura y dependencias ajenas al problema pedagógico. Modelar todo impediría contrastar el contrato con HTTP observable. Se recomienda JavaScript y HTTP reales junto a mecanismos remotos explícitamente modelados.

## Rationale

La opción recomendada se conserva al no recibirse un override. Separar una consola real de las copias del comparador mantiene igualdad de condiciones sin esconder escrituras. Un único cambio de estado basta para explicar idempotencia y pérdida parcial. El motor y los controles existentes evitan duplicar animaciones.

No se incorpora un servicio de pagos ni nuevas credenciales. Las referencias técnicas se comprobaron para precisión del contenido; la decisión mantiene el formato de documentación sin referencias externas elegido previamente.
