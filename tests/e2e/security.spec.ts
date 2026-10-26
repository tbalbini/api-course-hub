import { expect, test } from "@playwright/test";

test("AC-2/8: cada control de acceso detiene el negocio y consultar conserva estado", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); });
  await page.goto("/security");
  const result = page.getByRole("region", { name: "Resultado del acceso" });
  await page.getByLabel("Credencial del modelo").selectOption("none");
  await page.getByRole("button", { name: "Evaluar acceso", exact: true }).click();
  await expect(result).toContainText("HTTP 401"); await expect(result).toContainText("created");
  await expect(page.getByRole("button", { name: /Paso \d+: Confirmar el pedido/ })).toHaveCount(0);
  await page.getByLabel("Credencial del modelo").selectOption("reader"); await page.getByRole("button", { name: "Evaluar acceso", exact: true }).click();
  await expect(result).toContainText("HTTP 403");
  await page.getByRole("button", { name: /Inspeccionar decisión \d+: Autorizar/ }).click();
  await expect(page.getByText("FORBIDDEN", { exact: true })).toHaveCount(2);
  await page.getByLabel("Credencial del modelo").selectOption("buyer"); await page.getByRole("checkbox", { name: "Cuota de uso disponible", exact: true }).uncheck();
  await page.getByRole("button", { name: "Evaluar acceso", exact: true }).click(); await expect(result).toContainText("HTTP 429");
  await page.getByRole("checkbox", { name: "Cuota de uso disponible", exact: true }).check(); await page.getByRole("checkbox", { name: "Payload de confirmación válido", exact: true }).uncheck();
  await page.getByRole("button", { name: "Evaluar acceso", exact: true }).click(); await expect(result).toContainText("HTTP 400");
  await page.getByLabel("Capacidad solicitada").selectOption("read"); await page.getByRole("button", { name: "Evaluar acceso", exact: true }).click();
  await expect(result).toContainText("HTTP 200"); await expect(result).toContainText("created");
  await page.getByRole("checkbox", { name: "Concesión del scope activa", exact: true }).uncheck(); await page.getByRole("button", { name: "Evaluar acceso", exact: true }).click();
  await expect(result).toContainText("HTTP 403");
  expect(calls).toEqual([]);
});

test("AC-3/4: formulario puede aplicar efecto oculto y preflight fallido impide JSON", async ({ page }) => {
  await page.goto("/security"); await page.getByRole("tab", { name: /CORS y CSRF/ }).click();
  const result = page.getByRole("region", { name: "Envío, efecto y lectura" });
  await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await expect(result).toContainText("POST enviadoSí"); await expect(result).toContainText("Efecto aplicadoSí"); await expect(result).toContainText("Respuesta legibleNo");
  await page.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(page.getByText("No existe una respuesta HTTP en esta captura.", { exact: true })).toBeVisible();
  await page.getByLabel("Forma del POST").selectOption("json"); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await expect(result).toContainText("POST enviadoNo"); await expect(result).toContainText("Efecto aplicadoNo"); await expect(result).toContainText("Sin POST");
  await page.getByLabel("Tipo de cliente").selectOption("server"); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await expect(result).toContainText("Efecto aplicadoSí"); await expect(result).toContainText("Respuesta legibleSí");
  await expect(page.getByRole("button", { name: /Paso \d+: OPTIONS/ })).toHaveCount(0);
});

test("AC-3/4: wildcard con credentials no basta y CSRF puede rechazar con CORS permitido", async ({ page }) => {
  await page.goto("/security"); await page.getByRole("tab", { name: /CORS y CSRF/ }).click();
  const result = page.getByRole("region", { name: "Envío, efecto y lectura" });
  await page.getByLabel("Access-Control-Allow-Origin", { exact: true }).selectOption("wildcard"); await page.getByRole("checkbox", { name: "Access-Control-Allow-Credentials: true", exact: true }).check();
  await page.getByRole("button", { name: "Ejecutar política", exact: true }).click(); await expect(result).toContainText("Respuesta legibleNo");
  await page.getByLabel("Access-Control-Allow-Origin", { exact: true }).selectOption("trusted"); await page.getByLabel("Origen del cliente").selectOption("trusted");
  await page.getByRole("checkbox", { name: "Verificar token CSRF en servidor", exact: true }).check(); await page.getByLabel("Forma del POST").selectOption("json");
  await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await expect(result).toContainText("Respuesta legibleSí"); await expect(result).toContainText("HTTP 403"); await expect(result).toContainText("Efecto aplicadoNo");
  await page.getByRole("checkbox", { name: "Token CSRF válido en el body", exact: true }).check(); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await expect(result).toContainText("HTTP 200"); await expect(result).toContainText("Efecto aplicadoSí");
  await page.getByRole("checkbox", { name: "Enviar credenciales", exact: true }).uncheck(); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click(); await expect(result).toContainText("HTTP 401");
});

test("AC-5: cada credencial tiene un mecanismo y sus propios fallos", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); });
  await page.goto("/security"); await page.getByRole("tab", { name: /Credenciales Claves/ }).click();
  const result = page.getByRole("region", { name: "Resultado de credenciales" });
  for (const kind of ["api-key", "session", "oauth", "oidc", "jwt"]) {
    await page.getByLabel("Mecanismo de credenciales").selectOption(kind); await page.getByRole("button", { name: "Recorrer credencial", exact: true }).click();
    await expect(result).toContainText("HTTP 200");
    await page.getByLabel("Fallo de credenciales").selectOption("scope"); await page.getByRole("button", { name: "Recorrer credencial", exact: true }).click(); await expect(result).toContainText("HTTP 403");
  }
  await page.getByLabel("Fallo de credenciales").selectOption("signature"); await page.getByRole("button", { name: "Recorrer credencial", exact: true }).click(); await expect(result).toContainText("HTTP 401");
  await page.getByRole("button", { name: /Paso \d+: Decodificar no verifica/ }).click(); await page.getByRole("button", { name: "Inspeccionar datos de este paso +", exact: true }).click();
  await expect(page.locator("#security-panel-credentials .data-disclosure")).toContainText('"trusted": false');
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click(); await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(calls).toEqual([]);
});

test("AC-5: OIDC valida identidad para cliente y falla si se envía ID token a API", async ({ page }) => {
  await page.goto("/security"); await page.getByRole("tab", { name: /Credenciales Claves/ }).click();
  const result = page.getByRole("region", { name: "Resultado de credenciales" });
  await page.getByLabel("Mecanismo de credenciales").selectOption("oidc"); await page.getByLabel("Fallo de credenciales").selectOption("nonce");
  await page.getByRole("button", { name: "Recorrer credencial", exact: true }).click(); await expect(result).toContainText("Sin invocación");
  await page.getByLabel("Fallo de credenciales").selectOption("id-token"); await page.getByRole("button", { name: "Recorrer credencial", exact: true }).click(); await expect(result).toContainText("HTTP 401");
  await page.getByRole("button", { name: /Paso \d+: La API valida el access token/ }).click();
  await expect(page.getByText("INVALID_ACCESS_TOKEN", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "3Internals", exact: true }).click();
  await expect(page.locator("#security-panel-credentials .xray-metadata")).toContainText("security:credential:oidc");
});

test("AC-6: HTTP real conserva permisos, challenge y replay sin solicitudes", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/orders")) calls.push(`${request.method()} ${request.url()}`); });
  await page.goto("/security"); await page.getByRole("tab", { name: /HTTP real Permisos/ }).click(); expect(calls).toEqual([]);
  await page.getByRole("button", { name: "Crear pedido real", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "HTTP 201" })).toBeVisible();
  await page.getByLabel("Credencial real de demostración").selectOption("none");
  const rejected = page.waitForResponse(response => response.url().includes("/api/orders/") && response.status() === 401);
  await page.getByRole("button", { name: "Consultar real", exact: true }).click();
  expect((await rejected).headers()["www-authenticate"]).toBe('Bearer realm="api-universe-demo"');
  await page.getByLabel("Credencial real de demostración").selectOption("reader"); await page.getByRole("button", { name: "Confirmar real", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "HTTP 403" })).toBeVisible();
  await page.getByRole("button", { name: "Consultar real", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "HTTP 200" })).toBeVisible();
  await page.getByLabel("Credencial real de demostración").selectOption("buyer"); await page.getByRole("button", { name: "Confirmar real", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: /HTTP 200.*confirmed/ })).toBeVisible();
  const count = calls.length;
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click(); await page.getByRole("tab", { name: /Acceso Identidad/ }).click(); await page.getByRole("tab", { name: /HTTP real Permisos/ }).click();
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0); expect(calls).toHaveLength(count);
});

test("AC-6: perder respuesta de creación mantiene identidad al cambiar pestaña", async ({ page }) => {
  let lost = false; const keys: string[] = [];
  await page.route("**/api/orders", async route => {
    if (route.request().method() !== "POST") return route.continue();
    keys.push(route.request().headers()["idempotency-key"]);
    if (!lost) { lost = true; await route.fetch(); return route.abort("failed"); }
    return route.continue();
  });
  await page.goto("/security"); await page.getByRole("tab", { name: /HTTP real Permisos/ }).click();
  await page.getByRole("button", { name: "Crear pedido real", exact: true }).click(); await expect(page.getByRole("button", { name: "Reintentar creación", exact: true })).toBeEnabled();
  await page.getByRole("tab", { name: /CORS y CSRF/ }).click(); await page.getByRole("tab", { name: /HTTP real Permisos/ }).click();
  await expect(page.getByLabel("Credencial real de demostración")).toBeDisabled();
  await page.getByRole("button", { name: "Reintentar creación", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "Creación recuperada con la misma clave" })).toBeVisible();
  expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
});

test("AC-7: actividades reales y modelos alimentan evaluación con feedback", async ({ page }) => {
  await page.goto("/security"); await page.getByRole("tab", { name: /CORS y CSRF/ }).click(); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await page.getByRole("checkbox", { name: "Verificar token CSRF en servidor", exact: true }).check(); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await page.getByRole("tab", { name: /HTTP real Permisos/ }).click(); await page.getByLabel("Credencial real de demostración").selectOption("none"); await page.getByRole("button", { name: "Crear pedido real", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "HTTP 401" })).toBeVisible();
  await page.getByLabel("Credencial real de demostración").selectOption("reader"); await page.getByRole("button", { name: "Crear pedido real", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "HTTP 403" })).toBeVisible();
  await page.getByRole("tab", { name: /Capítulo 8/ }).click(); await page.getByRole("radio", { name: "El navegador deshizo el cambio al bloquear la respuesta.", exact: true }).check(); await page.getByRole("button", { name: "Comprobar seguridad", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "Bloquear lectura no revierte" })).toBeVisible();
  await page.getByRole("radio", { name: "El efecto puede existir; CORS no sustituye la autorización ni la defensa CSRF.", exact: true }).check(); await page.getByRole("button", { name: "Comprobar seguridad", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-course-v1")!).chapters[8].quizPassed)).toBe(true);
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
});

test("AC-1/8: móvil y teclado mantienen contexto y navegación", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/security");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused(); await page.keyboard.press("Enter"); await expect(page.locator("#experiment")).toBeFocused();
  await page.getByRole("tab", { name: /Acceso Identidad/ }).focus(); await page.keyboard.press("ArrowRight"); await expect(page.getByRole("tab", { name: /CORS y CSRF/ })).toHaveAttribute("aria-selected", "true");
  await page.getByLabel("Forma del POST").selectOption("json"); await page.getByRole("button", { name: "Ejecutar política", exact: true }).click();
  await page.getByRole("button", { name: "Reproducir", exact: true }).click(); await page.getByRole("tab", { name: /Credenciales Claves/ }).click(); await page.getByRole("tab", { name: /CORS y CSRF/ }).click();
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0); await expect(page.getByLabel("Forma del POST")).toHaveValue("json");
  for (const name of [/Acceso Identidad/, /CORS y CSRF/, /Credenciales Claves/, /HTTP real Permisos/, /Capítulo 8/]) { await page.getByRole("tab", { name }).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.getByRole("tab", { name: /Capítulo 8/ }).focus(); await page.keyboard.press("Home"); await expect(page.getByRole("tab", { name: /Acceso Identidad/ })).toBeFocused(); await page.keyboard.press("End"); await expect(page.getByRole("tab", { name: /Capítulo 8/ })).toBeFocused();
  await page.getByRole("link", { name: "Comunicación y eventos", exact: true }).click(); await expect(page).toHaveURL(/events$/); await page.getByRole("link", { name: "Seguridad y acceso", exact: true }).click(); await expect(page).toHaveURL(/security$/);
});
