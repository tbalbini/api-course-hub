# Decisión del laboratorio HTTP

## Context

El pedido ya ejecuta HTTP y el comparador tiene GraphQL y gRPC modelados. Faltan mensajes editables y el recorrido de red que distinga semántica HTTP de transporte.

## Options considered

Limitar el editor a pedidos reutiliza todo, pero reduce negociación y métodos a contratos que no implementan esas experiencias. Un proxy externo amplía destinos e introduce riesgos y dependencias sin necesidad educativa. El receptor diagnóstico local permite editar mensajes sin crear recursos.

## Rationale

El usuario eligió diagnóstico y pedidos. Mantener GraphQL y RPC sobre el constructor existente evita duplicar lógica. Separar red conceptual del fetch real permite enseñar HTTP/3 sin atribuir un protocolo negociado que el cliente no instrumenta. Se conserva el formato documental sin referencias externas elegido en el proyecto.
