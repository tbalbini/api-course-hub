# Decisión de comunicación continua

## Context

El comparador y el playground ya distinguen solicitudes y transporte. Falta observar que un mensaje aceptado puede no estar procesado y que una respuesta perdida no revierte su efecto.

## Options considered

Implementar brokers y servidores WebSocket reales añade dependencias e infraestructura innecesarias para fallos reproducibles. Modelar todo impediría observar streaming HTTP. Se elige un laboratorio de políticas puras junto a una sesión SSE local real.

## Rationale

El usuario eligió modelos y SSE real. Fixtures de snapshots permiten demostrar orden e idempotencia sin simular cobros. Reutilizar trazas mantiene una correspondencia entre mecanismos y eventos inspeccionables. La duración finita del stream y la cancelación evitan conexiones olvidadas. Se conserva el formato documental sin referencias externas elegido en el proyecto.
