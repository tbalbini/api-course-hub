# 0009. Seguridad y decisiones de acceso

**Date**: 2026-10-22
**Status**: Accepted

## Summary

El capítulo 8 permite distinguir quién solicita una capacidad, qué permiso necesita y qué políticas aplica cada componente. El laboratorio combina modelos inspeccionables con la consola HTTP real existente. No añade cuentas de estudiantes ni autenticación de producción.

## Requirements

- **AC-1**: `/security` ofrece pestañas Acceso, CORS y CSRF, Credenciales, HTTP real y Capítulo 8. Conserva ajustes y capturas al cambiar pestaña, pausa reproducción oculta y no inicia HTTP automáticamente. Navegación, teclado con flechas/Home/End, foco visible, móvil390 y reducción de movimiento funcionan.
- **AC-2**: Acceso permite credencial ausente, inválida, lector o comprador; operación consultar o confirmar; concesión de scope activa o retirada; cuota disponible o agotada; payload válido o inválido. Cada ejecución parte de PED-1042 created en memoria del modelo. El orden elegido es autenticación, autorización, cuota, validación y negocio. Ausente/inválida produce401, permiso insuficiente403, cuota agotada429, payload de confirmación inválido400 y éxito200. GET no modifica estado. Roles reader/buyer permiten read/read+confirm respectivamente y el scope puede retirar, nunca ampliar, esa capacidad. La traza se detiene en el control que rechaza y no inventa persistencia tras error.
- **AC-3**: CORS compara navegador con cliente servidor para POST entre orígenes. Request form safelisted o JSON con preflight; política de respuesta sin ACAO, origen confiable exacto o wildcard; origen confiable/ajeno; credentials, ACAC y permiso de método/headers editables. Preflight no autorizado impide POST. POST simple puede ejecutar aunque el navegador no exponga Response. Cliente servidor no aplica CORS. UI distingue POST enviado, efecto, status conocido por el modelo, lectura JS y requests lógicos. No presenta CORS como autorización general ni como prevención universal de CSRF.
- **AC-4**: En el mismo modelo, cookie de sesión válida depende de credentials y sesión disponible. Se supone cookie SameSite=None;Secure y envío permitido por política de cookies, sin simular bloqueo de terceros. Sin cookie produce401. Defensa CSRF activa exige token válido del formulario/body; falta produce403 antes del efecto, incluso con CORS permisivo. Token se representa en body, sin añadir header no safelisted al formulario. Preflight OPTIONS no lleva cookie. Modelo no hace llamadas reales ni configura CORS/cookies del servidor de la app.
- **AC-5**: Credenciales permite explorar API key, sesión, OAuth2, OIDC y JWT mediante pipelines de validación y fallos específicos. API key identifica aplicación del fixture; sesión usa lookup; OAuth modela autorización, state, canje con PKCE y access token; OIDC añade scope openid e ID token validado para el cliente; JWT modela formato frente a verificación. Fallos invalid, expired, state, PKCE, nonce, audience, signature, id-token y scope solo aparecen donde aplican. Scope insuficiente produce403 al llegar a API; credencial/token inválido401; state/PKCE/nonce/cancelación detienen antes de API y no inventan Response de ella. Decodificar no prueba firma ni autorización; un ID token destinado al cliente no reemplaza al access token de API. Todo criptográfico, proveedor e intercambio aquí es conceptual, sin tokens reales, redirects ni secretos.
- **AC-6**: HTTP real reutiliza OrderConsole y endpoints de pedidos conservando permisos y bodies. Ninguna credencial obtiene401, lector puede consultar y obtiene403 al confirmar, comprador confirma. Respuestas401 de POST/GET/PATCH incluyen WWW-Authenticate: Bearer realm="api-universe-demo". Solo botones ejecutan fetch; replay no repite efectos. Ocultar pausa el reproductor de la consola y conserva resultado/reintento. Credenciales públicas, Map temporal y ausencia de privacidad se identifican. Fallo de creación conserva clave y payload como antes.
- **AC-7**: Capítulo contiene pregunta fundamental, intuición, experimentos, explicación técnica, código, alternativas, compromisos, límites, error conceptual, quiz razonado y desafío. Cubre authentication/authorization, API keys, sesiones/cookies, bearer, OAuth2, OIDC, JWT, scopes/roles, TLS, CORS, CSRF, rate limiting, validación y secretos. No equipara formato, protocolo, transporte y política. Desafío de sesión requiere 401 y403 reales, POST simple con efecto pero sin lectura CORS, defensa CSRF rechazando y una explicación correcta. No altera progreso persistente0a3.
- **AC-8**: Modelos producen Capture/TraceEvent con snapshots estables, procedencia conceptual, fronteras correctas y tiempos lógicos. TracePlayer ofrece controles, timeline, código, datos, X Ray y tres profundidades. Cada configuración prepara otra ejecución. Matrices de pruebas comprueban controles, fallos, CORS con credenciales, CSRF, ausencia de efectos tras rechazo, reproducción y regresiones existentes.

## Decision

El usuario eligió HTTP local real y modelos. Reutilizar stack, TracePlayer, estilos y OrderConsole. Sin proveedor de auth, dependencias, variables de entorno ni segunda procedencia local. El diseño visual sigue `design.md`.

**Implementation skills**: `architect`, `develop`, `test`, `check`, `sync`, `ponytail:ponytail`.

## Feature design

**Datos y fuentes**:

| Valor | Fuente y regla |
|---|---|
| Credencial de Acceso | selector none/invalid/reader/buyer, fixtures públicos del modelo |
| Acción | read/confirm; scope requerido orders:read/orders:confirm |
| Capacidad | reader solo read, buyer ambas; scopeGranted false retira permiso |
| Cuota/payload | booleanos quotaAvailable/payloadValid, no contador global ni bytes reales |
| Estado y status | fixture created por ejecución, solo confirmar autorizado con todos controles cambia a confirmed |
| BrowserPolicySettings | client browser/server, shape form/json, origin trusted/foreign, policy none/trusted/wildcard; credentials, allowCredentials, allowPreflight, session, csrfGuard, csrfToken boolean |
| Orígenes | trusted https://shop.example, foreign https://evil.test, destino https://api.example; todos ficticios HTTPS |
| Match CORS | ACAO coincide con origen o wildcard sin credentials; credentials exige ACAO exacto y ACAC true |
| Preflight | solo navegador+JSON; sin caché preflight. OPTIONS204 conceptual permite POST y Content-Type solo si allowPreflight; además debe superar match CORS |
| Estado servidor | sin sesión enviada401, defensa sin token403, de otro modo200 y efecto aplicado; solo si POST llegó |
| Lectura navegador | tras POST, CORS debe superar misma regla; cliente servidor ignora esa regla. status en UI del servidor es conocimiento del modelo, no observación JS bloqueado |
| Flujo de credenciales | kind api-key/session/oauth/oidc/jwt y fault del catálogo permitido para kind, por ejecución desde fixture vacío |
| Fixtures de identidad | app-demo para key, user-demo para sesión/token; emisor auth.example, cliente shop-client, audiencia API orders-api; permiso orders:read |
| Fallos de credenciales | input fault activa un único gate. API key invalid/scope; sesión invalid/expired/scope; OAuth consent/state/pkce/expired/scope; OIDC consent/state/pkce/nonce/audience/expired/id-token/scope; JWT signature/audience/expired/id-token/scope |
| Validación conceptual | JWT firmado de muestra, issuer fijo correcto, aud API para access token y cliente para ID token, exp vigente salvo expired; ID token enviado como bearer a API se rechaza por propósito/audiencia. No se firman ni verifican bytes |
| Captura real | events y traceId del endpoint en POST, observación fetch en GET/PATCH, exactamente como OrderConsole existente |
| Logros | callback de consola tras Response interpretada401/403, resultados de política CORS/CSRF, quiz correcto; solo memoria de sesión |

Sin entidades persistentes nuevas, migraciones ni relaciones de usuarios reales. Todos los inputs de modelos se limitan a selectores y booleanos tipados; no se aceptan secretos, URLs arbitrarias ni JWT pegados.

**Transiciones**: borrador → ejecutar → captura congelada → inspeccionar/reproducir. Modelos síncronos sin efectos HTTP. Consola real conserva sus estados busy, resultado, creación incierta y reintento con la misma identidad. Cambiar pestaña no cancela una escritura en curso ni afirma que haya sido revertida.

**Superficies**:

| Superficie | Entrada | Salida y errores |
|---|---|---|
| /security | controles y navegación | cinco laboratorios/capítulo con metadata española |
| accessRun | ajustes de acceso | status, estado final, scope requerido, Capture |
| browserPolicyRun | ajustes de política | preflight, POST enviado, status servidor nullable, efecto, lectura, Capture |
| credentialRun | kind y fallo permitido | pasos, identidad conceptual, API invocada, status API nullable, Capture |
| OrderConsole existente | credencial y POST/GET/PATCH | contrato de spec0006 intacto; active opcional pausa, onOutcome opcional comunica method/status a evaluación |

No nuevos endpoints. No se cambian permisos, headers CORS ni cookies de endpoints existentes. La consola HTTP no implementa OAuth; sus bearer públicos no son JWT.

**Composición**: cabecera con pregunta y cinco pestañas accesibles. Acceso muestra controles, cadena seleccionable de decisiones y estado final. CORS muestra cliente, servidor y política, resultado dividido entre envío/efecto/lectura y traza. Credenciales muestra categoría, contrato y pipeline seleccionable. HTTP real monta OrderConsole. Capítulo contiene explicación, tabla de responsabilidades, código, quiz y cuatro actividades. Paneles ocultos siguen montados, salvo transporte no existe en modelos; reproducción se pausa. Cada evento causal es seleccionable por timeline/controles.

**Seguridad y límites**: no datos personales, cobros, secretos o sesión real. Credenciales ya públicas. HTTPS en el modelo permite explicar TLS; la app en localhost HTTP no negocia TLS. CSRF modela una defensa concreta de token validado en servidor; producción necesita políticas de origen/cookies y controles adicionales según arquitectura. El rate limiter es una condición de escenario, no protección del servidor. No se atribuye seguridad real al modelo.

**Escenarios críticos**: gates401/403/429/400 y lectura sin escritura (AC-2); preflight fallido frente a efecto oculto y cliente servidor (AC-3/4); wildcard con credentials, tokenCSRF y ausencia cookie (AC-3/4); fallos por etapa y propósito ID token frente a access token (AC-5); permisos HTTP reales, replay y reintento incierto conservado (AC-6); evaluación, móvil y cambios de pestaña (AC-1/7/8).

## Build plan

1. Completar recorrido de Acceso, modelo, visualización y pruebas de gates (AC-1/2/8).
2. Completar CORS/CSRF con contraste de envío/lectura, matrices y feedback (AC-3/4/8).
3. Completar pipelines de credenciales y contenido técnico del capítulo (AC-5/7/8).
4. Integrar consola real, evaluación y navegación; comprobar los cinco recorridos y regresiones (AC-1/6/7/8).

## Consequences

El usuario observa controles reales de permisos y puede romper modelos sin configurar infraestructura. Los modelos no acreditan una implementación de auth ni CORS real. Solo el Map de pedidos persiste temporalmente; los ajustes y logros duran la página. No se simulan todas las políticas de cookies, proveedores OAuth o formatos JWT.

## Follow-up

Diseño de contratos, Systems Lab y proyecto final conservan bloques14a16. Autenticación de estudiantes y publicación siguen fuera del alcance.

## Rationale

Decisiones en [rationale.md](rationale.md).
