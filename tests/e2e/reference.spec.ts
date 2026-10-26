import { expect, test } from "@playwright/test";
const title = "#reference-term-title";
test.use({ reducedMotion: "reduce" });

test("AC-2/3: alias y tildes encuentran fichas, AND y tema filtran sin resultados inventados", async ({ page }) => {
  await page.goto("/reference");
  await page.getByLabel("Término, alias o mecanismo").fill("AUTORIZACION");
  const results = page.locator(".reference-catalog");
  await results.getByRole("link", { name: /^Autorización/ }).click(); await expect(page.locator(title)).toHaveText("Autorización");
  await expect(page.getByRole("heading", { name: "Compromisos y límites", exact: true })).toBeVisible();
  await page.getByLabel("Tema de consulta").selectOption("network");
  await expect(page.getByRole("status").filter({ hasText: "fuera de estos resultados" })).toBeVisible();
  await page.getByLabel("Término, alias o mecanismo").fill("zqx-no-existe"); await expect(page.getByRole("heading", { name: "Sin coincidencias" })).toBeVisible();
  await expect(results.getByRole("status")).toContainText(/^0 de/); await expect(page.locator(title)).toHaveText("Autorización");
  await page.getByRole("button", { name: "Mostrar todos los conceptos", exact: true }).click(); await expect(page.locator(title)).toHaveText("Autorización");
  await expect(page.getByLabel("Tema de consulta")).toHaveValue("");
  await expect(page.getByLabel("Término, alias o mecanismo")).toHaveValue("");
  await page.getByLabel("Término, alias o mecanismo").fill("pila de llamadas"); await results.getByRole("link", { name: /^Call stack/ }).click(); await expect(page.locator(title)).toHaveText("Call stack");
});

test("AC-4/5: relaciones, historial y recarga conservan URL y selección fuera del filtro", async ({ page }) => {
  await page.goto("/reference?term=api&q=jwt&topic=security");
  await expect(page.locator(title)).toHaveText("API");
  await page.locator(".reference-catalog").getByRole("link", { name: /^JWT/ }).click(); await expect(page.locator(title)).toHaveText("JWT");
  await page.locator(".reference-related").getByRole("link", { name: "OAuth 2.0", exact: true }).click(); await expect(page.locator(title)).toHaveText("OAuth 2.0");
  await expect(page.getByLabel("Término, alias o mecanismo")).toHaveValue("jwt"); await page.goBack(); await expect(page.locator(title)).toHaveText("JWT");
  await page.goForward(); await expect(page.locator(title)).toHaveText("OAuth 2.0");
  await page.reload(); await expect(page.locator(title)).toHaveText("OAuth 2.0"); await expect(page.getByLabel("Tema de consulta")).toHaveValue("security");
});

test("AC-4: URL inválida se recupera y el texto de búsqueda no se interpreta como HTML", async ({ page }) => {
  const calls: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(r.url()); });
  await page.goto("/reference?term=__proto__&topic=javascript:alert(1)&view=otra");
  await expect(page.locator(title)).toHaveText("API"); await expect(page.getByRole("status").filter({ hasText: "término de la URL no existe" })).toBeVisible();
  await page.getByLabel("Término, alias o mecanismo").fill('<img src=x onerror="window.compromised=true">');
  await expect(page.getByRole("heading", { name: "Sin coincidencias" })).toBeVisible(); expect(await page.evaluate(() => Object.hasOwn(window, "compromised"))).toBe(false);
  await expect(page.locator(".reference-workspace img")).toHaveCount(0); expect(calls).toEqual([]);
});

test("AC-5: consulta desde captura HTTP real abre otra pestaña sin perder datos ni repetir operación", async ({ page, context }) => {
  let posts = 0; page.on("request", r => { if (r.method() === "POST" && new URL(r.url()).pathname === "/api/orders") posts++; });
  await page.goto("/build-api"); await page.getByRole("button", { name: "Crear pedido real", exact: true }).click();
  const inspector = page.locator(".inspector:visible"); await expect(inspector).toHaveAttribute("data-capture-id", /.+/);
  await page.locator(".timeline:visible button").last().click();
  const capture = await inspector.getAttribute("data-capture-id"), event = await inspector.getAttribute("data-event-id");
  await inspector.getByRole("button", { name: /Inspeccionar datos de este paso/ }).click(); const data = await inspector.locator(".data-disclosure").innerText();
  const lookup = inspector.getByRole("link", { name: "Consultar concepto en Referencia (otra pestaña)", exact: true });
  await expect(lookup).toHaveAttribute("href", /^\/reference\?term=[a-z-]+$/); await expect(lookup).toHaveAttribute("rel", "noopener noreferrer");
  const [other] = await Promise.all([context.waitForEvent("page"), lookup.click()]); await other.waitForLoadState(); await expect(other.locator(title)).toBeVisible();
  await other.getByLabel("Término, alias o mecanismo").fill("JWT"); await other.close();
  await expect(inspector).toHaveAttribute("data-capture-id", capture!); await expect(inspector).toHaveAttribute("data-event-id", event!); expect(await inspector.locator(".data-disclosure").innerText()).toBe(data); expect(posts).toBe(1);
});

test("AC-6: guía tiene comandos, contrato, límites y enlaces reales sin modificar progreso", async ({ page }) => {
  const saved = JSON.stringify({ version: 1, chapters: { 6: { flags: ["read"], quizPassed: false } }, depth: "engineering", location: "/systems?tab=system" });
  await page.addInitScript(saved => localStorage.setItem("api-universe-course-v1", saved), saved);
  const calls: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(r.url()); });
  await page.goto("/reference?term=jwt"); await page.getByRole("link", { name: "Guía del laboratorio", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Contrato HTTP del pedido", exact: true })).toBeVisible();
  await expect(page.locator("#guide-run pre")).toContainText("npm ci"); await expect(page.locator("#guide-uncertainty")).toContainText("200 pedidos");
  await expect(page.getByRole("link", { name: "Operar contra HTTP local real (otra pestaña)", exact: true })).toHaveAttribute("href", "/build-api?tab=app");
  await page.getByRole("link", { name: "Glosario", exact: true }).click(); await expect(page.locator(title)).toHaveText("JWT");
  expect(await page.evaluate(() => localStorage.getItem("api-universe-course-v1"))).toBe(saved); expect(calls).toEqual([]);
});

test("AC-1/7: teclado y móvil permiten buscar, saltar al detalle y consultar la guía", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 }); await page.goto("/reference");
  const skip = page.getByRole("link", { name: "Saltar a la referencia", exact: true }); await expect(skip).toBeVisible(); await page.keyboard.press("Tab"); await expect(skip).toBeFocused(); await page.keyboard.press("Enter"); await expect(page.getByRole("main")).toBeFocused();
  await page.getByLabel("Término, alias o mecanismo").fill("WebAssembly");
  const result = page.locator(".reference-catalog").getByRole("link", { name: /^WebAssembly/ }); await result.focus(); await page.keyboard.press("Enter"); await expect(page.locator(title)).toHaveText("WebAssembly");
  const detail = page.getByRole("link", { name: "Saltar a la ficha seleccionada", exact: true }); await detail.focus(); await page.keyboard.press("Enter"); await expect(page.locator("#reference-detail")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Guía del laboratorio", exact: true }).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
