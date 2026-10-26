import { credentialFaults, credentialProfiles, type CredentialFault, type CredentialKind } from "@/content/security";
import { interaction } from "./interaction";
import { modelStep } from "./communication";
import { confirmOrder } from "./order-status";
import { indexEvents, type Actor, type Capture, type Stage, type TraceEvent } from "./trace";

function add(entries: TraceEvent[], stage: Stage, action: string, input: unknown, output: unknown, cause: string, actor: Actor = "server", code = "// Modelo de política, sin infraestructura real") {
  const entry = modelStep(stage, action, input, output, cause, actor, "Política explícita del laboratorio de seguridad", code, `${cause} Los valores son fixtures del modelo. No ejecutamos criptografía ni inferimos mecanismos de una captura real.`, interaction(stage === "response" ? "Proveedor de API" : actor === "transport" ? "Cliente del modelo" : actor === "browser" ? "JavaScript cliente" : "Proveedor del modelo", stage === "response" ? "Política de lectura del cliente" : actor === "transport" ? "Proveedor de API o identidad" : actor === "browser" ? "Política del navegador" : "Comprobación del proveedor", actor === "transport" ? "HTTP conceptual" : "Política de seguridad conceptual", "Credencial inválida o permiso insuficiente.", "Las políticas del navegador pueden impedir envío o lectura según el paso."));
  entries.push(entry); return entry;
}
function reject(entry: TraceEvent, code: string, message: string) { entry.state = "error"; entry.error = { code, message }; }
function capture(id: string, events: TraceEvent[], extra: Partial<Capture> = {}): Capture { return { id, mode: "simulation", events: indexEvents(id, events), ...structuredClone(extra) }; }

export interface AccessSettings { credential: "none" | "invalid" | "reader" | "buyer"; operation: "read" | "confirm"; scopeGranted: boolean; quotaAvailable: boolean; payloadValid: boolean }
export const defaultAccess: AccessSettings = { credential: "buyer", operation: "confirm", scopeGranted: true, quotaAvailable: true, payloadValid: true };
export function accessRun(options: AccessSettings) {
  const settings = { ...options }, events: TraceEvent[] = [];
  let order = { id: "PED-1042", status: "created" as "created" | "confirmed" };
  const requiredScope = `orders:${settings.operation}`;
  const request: NonNullable<Capture["request"]> = { method: settings.operation === "read" ? "GET" : "PATCH", url: "https://api.example/orders/PED-1042", headers: settings.credential === "none" ? {} : { Authorization: `Bearer fixture-${settings.credential}` }, ...(settings.operation === "confirm" ? { body: settings.payloadValid ? { status: "confirmed" } : { status: "inventado" } } : {}) };
  add(events, "request", "El consumidor solicita una capacidad", request, null, "Enviar una credencial no obliga al proveedor a aceptar la operación.", "transport");
  const finish = (status: number) => {
    add(events, "response", `El servidor devuelve HTTP ${status}`, null, { status, order }, "Este retorno es conceptual; solo HTTP real ejecuta fetch.", "transport");
    return { settings, status, order, requiredScope, capture: capture("security:access", events, { request, response: { status, body: { order, requiredScope } } }) };
  };
  const auth = add(events, "authenticate", "Autenticar la credencial", { credential: settings.credential }, { principal: settings.credential === "buyer" || settings.credential === "reader" ? "user-demo" : null }, "La identidad se establece desde una credencial válida del fixture, no desde un nombre declarado.", "server", "const principal = authenticate(credential);");
  if (settings.credential === "none" || settings.credential === "invalid") { reject(auth, "UNAUTHENTICATED", "No hay credencial válida. El negocio no se ejecuta."); return finish(401); }
  const allowed = settings.scopeGranted && (settings.operation === "read" || settings.credential === "buyer");
  const permission = add(events, "authorize", "Autorizar acción y scope", { role: settings.credential, requiredScope, scopeGranted: settings.scopeGranted }, { allowed }, "El rol limita capacidades; retirar la concesión puede reducirlas. Estar autenticado no basta.", "server", "requireRoleAndScope(principal, action, resource);");
  if (!allowed) { reject(permission, "FORBIDDEN", "Identidad reconocida, permiso insuficiente."); return finish(403); }
  const quota = add(events, "providerModel", "Comprobar presupuesto de uso", null, { available: settings.quotaAvailable }, "Esta cuota es una condición del escenario. Un rate limiter real necesita clave, contador y ventana.");
  if (!settings.quotaAvailable) { reject(quota, "RATE_LIMITED", "Presupuesto del escenario agotado."); return finish(429); }
  if (settings.operation === "confirm") {
    const validation = add(events, "validate", "Validar el contrato del body", request.body, { valid: settings.payloadValid }, "Autenticar y autorizar no validan el payload.", "server", 'requireExactBody({ status: "confirmed" });');
    if (!settings.payloadValid) { reject(validation, "INVALID_INPUT", "El contrato solo admite status confirmed."); return finish(400); }
    order = confirmOrder(order);
    add(events, "business", "Confirmar el pedido del modelo", { id: order.id }, order, "Solo se cambia estado después de superar todos los controles. No hay cobro ni pedido real.", "server", "order = confirmOrder(order);");
  } else add(events, "business", "Consultar sin modificar el pedido", { id: order.id }, order, "La lectura autorizada devuelve estado; no ejecuta la transición de confirmación.");
  return finish(200);
}

export interface BrowserPolicySettings { client: "browser" | "server"; shape: "form" | "json"; origin: "trusted" | "foreign"; policy: "none" | "trusted" | "wildcard"; credentials: boolean; allowCredentials: boolean; allowPreflight: boolean; session: boolean; csrfGuard: boolean; csrfToken: boolean }
export const defaultBrowserPolicy: BrowserPolicySettings = { client: "browser", shape: "form", origin: "foreign", policy: "none", credentials: true, allowCredentials: false, allowPreflight: true, session: true, csrfGuard: false, csrfToken: false };
export function browserPolicyRun(options: BrowserPolicySettings) {
  const settings = { ...options }, events: TraceEvent[] = [];
  const origin = settings.origin === "trusted" ? "https://shop.example" : "https://evil.test";
  const acao = settings.policy === "trusted" ? "https://shop.example" : settings.policy === "wildcard" ? "*" : null;
  const corsAllowed = (acao === origin || acao === "*" && !settings.credentials) && (!settings.credentials || settings.allowCredentials);
  const preflight = settings.client === "browser" && settings.shape === "json";
  const body: Record<string, string> = { orderId: "PED-1042", ...(settings.csrfToken ? { csrf: "fixture-valid-for-session" } : {}) };
  const request = { method: "POST", url: "https://api.example/confirm", headers: { "Content-Type": settings.shape === "form" ? "application/x-www-form-urlencoded" : "application/json", ...(settings.client === "browser" ? { Origin: origin } : {}), ...(settings.credentials && settings.session ? { Cookie: "sid=fixture-public-session" } : {}) }, body: settings.shape === "form" ? new URLSearchParams(body).toString() : JSON.stringify(body) };
  const responseHeaders = { ...(acao ? { "Access-Control-Allow-Origin": acao } : {}), ...(settings.allowCredentials ? { "Access-Control-Allow-Credentials": "true" } : {}) };
  add(events, "invokeModel", "Preparar una escritura entre orígenes", settings, { origin, target: "https://api.example", preflight }, "El escenario fija cookies SameSite=None;Secure permitidas. El token CSRF viaja en body. No se hacen solicitudes reales.", settings.client === "browser" ? "browser" : "server");
  if (preflight) {
    add(events, "crossBoundary", "OPTIONS consulta el permiso de envío", { method: "OPTIONS", origin, requestedMethod: "POST", requestedHeaders: ["content-type"], cookie: false }, { status: 204, headers: responseHeaders, methodAndHeadersAllowed: settings.allowPreflight }, "El preflight no adjunta la cookie. JSON no es Content-Type safelisted; el servidor debe permitir método, headers y política de credenciales.", "transport");
    if (!corsAllowed || !settings.allowPreflight) {
      const failure = add(events, "failure", "El navegador impide enviar el POST", null, { sent: false, effect: false }, "El preflight no supera el contrato CORS. La operación de negocio no llegó al servidor.", "browser");
      reject(failure, "CORS_PREFLIGHT", "Permiso de envío rechazado antes de POST.");
      return { settings, preflight, sent: false, effect: false, serverStatus: null, readable: false, requests: 1, capture: capture("security:browser", events, { request: { method: "OPTIONS", url: request.url, headers: { Origin: origin, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type" } } }) };
    }
  }
  add(events, "crossBoundary", "El POST llega al servidor conceptual", request, { cookieSent: settings.credentials && settings.session }, settings.client === "server" ? "Este cliente adjunta la cookie de muestra explícitamente. No aplica la política CORS del navegador." : preflight ? "El preflight permitió enviar el POST JSON. La respuesta de la operación también debe superar CORS." : "Un POST de formulario safelisted no necesita preflight en este escenario. Enviar no garantiza poder leer el retorno.", "transport");
  const hasSession = settings.credentials && settings.session;
  const auth = add(events, "authenticate", "El servidor busca la sesión", { hasSession }, { principal: hasSession ? "user-demo" : null }, "Cookie es el transporte del identificador. La sesión debe existir y ser válida en el servidor.", "server", "const session = lookupSession(cookie.sid);");
  let serverStatus = hasSession ? 200 : 401;
  if (!hasSession) reject(auth, "UNAUTHENTICATED", "No se recibió una sesión válida.");
  if (hasSession) {
    const csrf = add(events, "authorize", "El servidor evalúa defensa CSRF", { enabled: settings.csrfGuard, tokenValid: settings.csrfToken }, { accepted: !settings.csrfGuard || settings.csrfToken }, "Esta defensa comprueba un token ligado a la sesión. CORS permisivo no la desactiva y CORS restrictivo no la sustituye.", "server", "if (csrfGuard) verifySessionBoundToken(body.csrf, session);");
    if (settings.csrfGuard && !settings.csrfToken) { serverStatus = 403; reject(csrf, "CSRF_REJECTED", "Falta un token válido para esta sesión."); }
  }
  const effect = serverStatus === 200;
  if (effect) add(events, "business", "El servidor aplica la confirmación del modelo", { status: "created" }, { status: "confirmed" }, "El efecto existe antes de decidir si el navegador expone la respuesta. CORS no hace rollback.");
  add(events, "response", `El servidor produce HTTP ${serverStatus}`, null, { status: serverStatus, headers: responseHeaders }, "Conocemos este status porque controlamos el modelo. JavaScript no puede leerlo si su política bloquea el retorno.", "transport");
  const readable = settings.client === "server" || corsAllowed;
  const read = add(events, "useResult", readable ? "El cliente puede leer la respuesta" : "El navegador oculta la respuesta a JavaScript", { corsAllowed, client: settings.client }, { readable }, readable ? "Poder leer la respuesta no implica éxito de negocio: también puede exponer un401 o403." : "El código cliente recibe un fallo sin poder leer status ni body. CORS no revierte efectos remotos.", settings.client === "browser" ? "browser" : "server");
  if (!readable) reject(read, "CORS_READ_BLOCKED", "Se bloquea lectura, sin revertir el efecto remoto.");
  return { settings, preflight, sent: true, effect, serverStatus, readable, requests: preflight ? 2 : 1, capture: capture("security:browser", events, { request, ...(readable ? { response: { status: serverStatus, headers: responseHeaders, body: { effect } } } : {}) }) };
}

export function credentialRun(kind: CredentialKind, fault: CredentialFault) {
  const profile = credentialProfiles[kind];
  if (!(profile.faults as readonly string[]).includes(fault)) throw new Error("Fallo fuera del contrato de esta credencial.");
  const events: TraceEvent[] = [];
  let apiCalled = false;
  const step = (action: string, input: unknown, output: unknown, cause: string, actor: Actor = "provider", stage: Stage = "authenticate") => {
    const entry = add(events, stage, action, input, output, cause, actor, profile.code); entry.contract = profile.contract; entry.interaction.technology = profile.name; entry.interaction.possibleFailures = profile.faults.filter(fault => fault !== "none").map(fault => credentialFaults[fault]); return entry;
  };
  const finish = (apiStatus: number | null, reason: string) => ({ kind, fault, apiCalled, apiStatus, reason, capture: capture(`security:credential:${kind}`, events, apiCalled ? { request: { method: "GET", url: "https://api.example/orders/PED-1042", headers: kind === "api-key" ? { "X-API-Key": "fixture-public-key" } : kind === "session" ? { Cookie: "sid=fixture-public-session" } : { Authorization: `Bearer fixture-${fault === "id-token" ? "id-token" : "access-token"}` } }, response: { status: apiStatus!, body: { reason } } } : {}) });
  const fail = (entry: TraceEvent, code: string, message: string, status: number | null) => { reject(entry, code, message); return finish(status, message); };
  step("Elegir la responsabilidad de la credencial", { kind }, { category: profile.category }, profile.why, "browser", "invokeModel");
  if (kind === "oauth" || kind === "oidc") {
    step("El cliente inicia autorización con PKCE S256", { clientId: "shop-client", scope: kind === "oidc" ? "openid orders:read" : "orders:read", state: "fixture-state", challenge: "fixture-S256" }, null, "redirect_uri está registrada; challenge representa hash del verifier. Aquí no calculamos hashes, códigos ni redirects reales.", "transport", "crossBoundary");
    const consent = step("El proveedor autentica y obtiene autorización", null, { granted: fault !== "consent" }, "Authorization Server identifica al usuario y decide qué acceso concede; la aplicación no recibe su contraseña.");
    if (fault === "consent") return fail(consent, "ACCESS_DENIED", "Autorización rechazada antes de obtener access token.", null);
    const state = step("El cliente compara state del callback", { expected: "fixture-state", received: fault === "state" ? "otro-state" : "fixture-state" }, { matches: fault !== "state" }, "La respuesta debe corresponder a la solicitud iniciada. Este control no es una firma de JWT.", "browser");
    if (fault === "state") return fail(state, "STATE_MISMATCH", "Callback no aceptado; no se llama a la API.", null);
    const pkce = step("El proveedor comprueba el verificador PKCE", { challenge: "fixture-S256", verifierMatches: fault !== "pkce" }, { accessToken: fault === "pkce" ? null : "fixture-access-token" }, "El canje enlaza el código al cliente que conoce el verifier. Se omite criptografía real del S256 en este modelo.");
    if (fault === "pkce") return fail(pkce, "INVALID_GRANT", "El canje del código se rechaza antes de API.", null);
    if (kind === "oidc") {
      const id = step("El cliente valida el ID token", { issuer: "https://auth.example", aud: fault === "audience" ? "otro-cliente" : "shop-client", signatureValid: true, nonceMatches: fault !== "nonce", expired: fault === "expired" }, { identityAccepted: !["audience", "nonce", "expired"].includes(fault) }, "ID token afirma identidad para shop-client. Firma, issuer, audience, exp y nonce deben validarse con reglas confiables; el fixture fija firma e issuer correctos.", "browser");
      if (["audience", "nonce", "expired"].includes(fault)) return fail(id, "INVALID_ID_TOKEN", "ID token no aceptado por el cliente; no se llama a la API.", null);
    }
  }
  apiCalled = true;
  step("El cliente invoca la API de pedidos", { credential: kind }, null, "Esta invocación es conceptual. La API aplica sus propias reglas aunque el cliente haya aceptado identidad.", "transport", "crossBoundary");
  if (kind === "api-key" || kind === "session") {
    const lookup = step(kind === "api-key" ? "Buscar API key y aplicación" : "Buscar y validar sesión", { fixture: kind, known: fault !== "invalid", active: fault !== "expired" }, { principal: fault === "invalid" || fault === "expired" ? null : kind === "api-key" ? "app-demo" : "user-demo" }, profile.how, "server");
    if (fault === "invalid" || fault === "expired") return fail(lookup, "INVALID_CREDENTIAL", "La API no acepta la credencial de muestra.", 401);
  } else {
    if (kind === "jwt") step("Decodificar no verifica el JWT", { representation: "header.payload.signature" }, { claimsReadable: true, trusted: false }, "Base64URL permite leer el payload del JWS sin conocer su clave. Leer claims no demuestra integridad.", "server");
    const token = step("La API valida el access token", { signatureValid: fault !== "signature", issuer: "https://auth.example", aud: fault === "audience" ? "otro-servicio" : fault === "id-token" ? "shop-client" : "orders-api", expired: fault === "expired", purpose: fault === "id-token" ? "identity" : "access" }, { accepted: !["signature", "audience", "expired", "id-token"].includes(fault) }, "La API valida protección criptográfica o introspección según contrato, issuer, audience, vigencia y propósito. OAuth no obliga a usar JWT; este fixture representa el resultado de esa validación.", "server");
    if (["signature", "audience", "expired", "id-token"].includes(fault)) return fail(token, "INVALID_ACCESS_TOKEN", "La API requiere un access token válido destinado a orders-api.", 401);
  }
  const scope = step("La API autoriza orders:read", { required: "orders:read", granted: fault !== "scope" }, { allowed: fault !== "scope" }, "Una identidad reconocida no basta si falta la capacidad solicitada.", "server", "authorize");
  if (fault === "scope") return fail(scope, "INSUFFICIENT_SCOPE", "Credencial reconocida, scope insuficiente.", 403);
  step("La API devuelve el pedido autorizado", null, { id: "PED-1042", status: "created" }, "No se guarda ni modifica un pedido real. La lectura termina con autorización comprobada.", "transport", "response");
  return finish(200, "Lectura permitida por el contrato del modelo.");
}
