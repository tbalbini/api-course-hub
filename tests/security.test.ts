import { describe, expect, test } from "vitest";
import { credentialProfiles, type CredentialFault, type CredentialKind } from "@/content/security";
import { accessRun, browserPolicyRun, credentialRun, defaultAccess, defaultBrowserPolicy, type AccessSettings, type BrowserPolicySettings } from "@/lib/security";
import { playback, type Capture } from "@/lib/trace";

function checkTrace(capture: Capture) {
  const ids = new Set<string>();
  for (const entry of capture.events) {
    expect(entry.provenance).toBe("conceptual");
    expect(ids.has(entry.id)).toBe(false);
    for (const dependency of entry.dependencies) expect(ids.has(dependency)).toBe(true);
    ids.add(entry.id);
  }
}
const accessCases = (["none", "invalid", "reader", "buyer"] as const).flatMap(credential => (["read", "confirm"] as const).flatMap(operation => [true, false].map(scopeGranted => ({ credential, operation, scopeGranted }))));
describe("AC-2/8: acceso por identidad y capacidad", () => {
  test.each(accessCases)("$credential solicita $operation con scope=$scopeGranted", settings => {
    const result = accessRun({ ...defaultAccess, ...settings });
    const expected = settings.credential === "none" || settings.credential === "invalid" ? 401 : !settings.scopeGranted || settings.credential === "reader" && settings.operation === "confirm" ? 403 : 200;
    expect(result.status).toBe(expected);
    expect(result.order.status).toBe(expected === 200 && settings.operation === "confirm" ? "confirmed" : "created");
    expect(result.capture.events.some(entry => entry.stage === "business")).toBe(expected === 200);
    checkTrace(result.capture);
  });
  test.each([
    [{ credential: "none", quotaAvailable: false, payloadValid: false }, 401],
    [{ credential: "reader", quotaAvailable: false, payloadValid: false }, 403],
    [{ quotaAvailable: false, payloadValid: false }, 429],
    [{ payloadValid: false }, 400],
  ] as const)("el primer control que rechaza impide efectos: %j", (settings, status) => {
    const result = accessRun({ ...defaultAccess, ...settings } as AccessSettings);
    expect(result.status).toBe(status); expect(result.order.status).toBe("created");
    expect(result.capture.events.some(entry => entry.stage === "business")).toBe(false);
  });
  test("consultar no valida un body inexistente ni confirma", () => {
    const result = accessRun({ ...defaultAccess, operation: "read", payloadValid: false });
    expect(result.status).toBe(200); expect(result.order.status).toBe("created");
    expect(result.capture.request?.body).toBeUndefined();
    expect(result.capture.events.some(entry => entry.stage === "validate")).toBe(false);
  });
});

const policyCases: { name: string; options: Partial<BrowserPolicySettings>; sent: boolean; effect: boolean; readable: boolean; status: number | null; requests: number }[] = [
  { name: "formulario cambia servidor aunque CORS oculte retorno", options: {}, sent: true, effect: true, readable: false, status: 200, requests: 1 },
  { name: "JSON no llega si preflight falla", options: { shape: "json" }, sent: false, effect: false, readable: false, status: null, requests: 1 },
  { name: "cliente servidor ignora CORS incluso con JSON", options: { client: "server", shape: "json" }, sent: true, effect: true, readable: true, status: 200, requests: 1 },
  { name: "CSRF rechaza antes del efecto sin token", options: { csrfGuard: true }, sent: true, effect: false, readable: false, status: 403, requests: 1 },
  { name: "token válido permite efecto pero CORS aún oculta", options: { csrfGuard: true, csrfToken: true }, sent: true, effect: true, readable: false, status: 200, requests: 1 },
  { name: "sin credentials no hay sesión enviada", options: { credentials: false }, sent: true, effect: false, readable: false, status: 401, requests: 1 },
  { name: "cookie desconocida no autentica", options: { session: false }, sent: true, effect: false, readable: false, status: 401, requests: 1 },
  { name: "wildcard no permite lectura con credentials", options: { policy: "wildcard", allowCredentials: true }, sent: true, effect: true, readable: false, status: 200, requests: 1 },
  { name: "wildcard sin credentials permite leer401", options: { policy: "wildcard", credentials: false }, sent: true, effect: false, readable: true, status: 401, requests: 1 },
  { name: "origen exacto y ACAC permiten lectura", options: { policy: "trusted", origin: "trusted", allowCredentials: true }, sent: true, effect: true, readable: true, status: 200, requests: 1 },
  { name: "otro origen no coincide", options: { policy: "trusted", allowCredentials: true }, sent: true, effect: true, readable: false, status: 200, requests: 1 },
  { name: "falta ACAC en respuesta credentialed", options: { policy: "trusted", origin: "trusted" }, sent: true, effect: true, readable: false, status: 200, requests: 1 },
  { name: "JSON permitido envía OPTIONS y POST", options: { policy: "trusted", origin: "trusted", allowCredentials: true, shape: "json" }, sent: true, effect: true, readable: true, status: 200, requests: 2 },
  { name: "ACAO no basta si faltan método y headers", options: { policy: "trusted", origin: "trusted", allowCredentials: true, shape: "json", allowPreflight: false }, sent: false, effect: false, readable: false, status: null, requests: 1 },
  { name: "CORS permitido expone rechazoCSRF", options: { policy: "trusted", origin: "trusted", allowCredentials: true, shape: "json", csrfGuard: true }, sent: true, effect: false, readable: true, status: 403, requests: 2 },
  { name: "servidor sigue necesitando autenticación", options: { client: "server", credentials: false }, sent: true, effect: false, readable: true, status: 401, requests: 1 },
  { name: "servidor no evita defensa CSRF del receptor", options: { client: "server", csrfGuard: true }, sent: true, effect: false, readable: true, status: 403, requests: 1 },
];
describe("AC-3/4/8: envío, efecto y lectura", () => {
  test.each(policyCases)("$name", row => {
    const run = browserPolicyRun({ ...defaultBrowserPolicy, ...row.options });
    expect({ sent: run.sent, effect: run.effect, readable: run.readable, status: run.serverStatus, requests: run.requests }).toEqual({ sent: row.sent, effect: row.effect, readable: row.readable, status: row.status, requests: row.requests });
    expect(Boolean(run.capture.response)).toBe(row.readable);
    expect(run.capture.events.some(entry => entry.stage === "business")).toBe(row.effect);
    checkTrace(run.capture);
  });
  test("preflight no envía cookie y tokenCSRF en body no añade un header al formulario", () => {
    const blocked = browserPolicyRun({ ...defaultBrowserPolicy, shape: "json" });
    expect(blocked.capture.request?.method).toBe("OPTIONS");
    expect(JSON.stringify(blocked.capture.request)).not.toContain("Cookie");
    const form = browserPolicyRun({ ...defaultBrowserPolicy, csrfToken: true });
    expect(form.preflight).toBe(false);
    expect(form.capture.request?.headers["X-CSRF-Token"]).toBeUndefined();
    expect(new URLSearchParams(String(form.capture.request?.body)).get("csrf")).toBe("fixture-valid-for-session");
    expect(form.capture.request?.headers.Cookie).toBe("sid=fixture-public-session");
  });
});

const credentialCases = (Object.keys(credentialProfiles) as CredentialKind[]).flatMap(kind => credentialProfiles[kind].faults.map(fault => ({ kind, fault })));
describe("AC-5/8: categorías de credenciales", () => {
  test.each(credentialCases)("$kind con $fault", ({ kind, fault }) => {
    const run = credentialRun(kind, fault);
    const beforeAPI = ["consent", "state", "pkce", "nonce"].includes(fault) || kind === "oidc" && ["audience", "expired"].includes(fault);
    expect(run.apiCalled).toBe(!beforeAPI);
    expect(run.apiStatus).toBe(beforeAPI ? null : fault === "none" ? 200 : fault === "scope" ? 403 : 401);
    expect(Boolean(run.capture.request)).toBe(run.apiCalled);
    expect(run.capture.events.some(entry => entry.state === "error")).toBe(fault !== "none");
    checkTrace(run.capture);
  });
  test("ID token válido para cliente no reemplaza access token en API", () => {
    const run = credentialRun("oidc", "id-token");
    expect(run.apiCalled).toBe(true); expect(run.apiStatus).toBe(401);
    expect(run.capture.events.find(entry => entry.action === "El cliente valida el ID token")?.state).toBe("ok");
    expect(run.capture.events.find(entry => entry.error)?.error?.code).toBe("INVALID_ACCESS_TOKEN");
  });
  test("leer claims no demuestra firma válida", () => {
    const run = credentialRun("jwt", "signature");
    expect(run.capture.events.find(entry => entry.action === "Decodificar no verifica el JWT")?.output).toEqual({ claimsReadable: true, trusted: false });
    expect(run.apiStatus).toBe(401);
    expect(() => credentialRun("api-key", "pkce" as CredentialFault)).toThrow("Fuera".toLowerCase());
  });
  test("cambios de ajustes y replay no mutan snapshots", () => {
    const settings = { ...defaultAccess }; const run = accessRun(settings);
    const before = JSON.stringify(run.capture);
    settings.credential = "none"; run.order.status = "created";
    let state = { capture: run.capture, cursor: 0, running: false, speed: 1 };
    for (const action of [{ type: "replay" }, { type: "next" }, { type: "previous" }, { type: "speed", speed: 4 }] as const) state = playback(state, action);
    expect(JSON.stringify(run.capture)).toBe(before);
    expect(run.settings.credential).toBe("buyer");
  });
});
