import { expect, test, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce" });
const key = "api-universe-course-v1";
const cases = [
  { id: "architecture", title: "Diagnóstico de arquitectura", cause: 1 },
  { id: "prediction", title: "Predicción de ejecución", cause: 2 },
  { id: "debug", title: "Debug the Request", cause: 0 },
  { id: "interface", title: "Choose the Interface", cause: 1 },
  { id: "contract", title: "Design the Contract", cause: 2 },
  { id: "failure", title: "Failure Injection", cause: 0 },
  { id: "misconception", title: "Spot the Misconception", cause: 1 },
] as const;
async function choose(page: Page, title: string) { await page.getByRole("navigation", { name: "Catálogo de desafíos" }).getByRole("button", { name: new RegExp(title) }).click(); }
async function solveOperation(page: Page, id: string) {
  switch (id) {
    case "architecture": await page.getByLabel("Frontera elegida").selectOption("function"); break;
    case "prediction": await page.getByLabel("Retorno previsto").selectOption("string"); break;
    case "debug": await page.getByLabel("Credencial del fixture").selectOption("buyer"); await page.getByLabel("Body JSON de PATCH").fill('{"status":"confirmed"}'); break;
    case "interface": await page.getByLabel("Interfaz para confirmar").selectOption("rest"); break;
    case "contract": await page.getByLabel("Cantidad máxima").fill("5"); await page.getByRole("combobox", { name: /Forma del error/ }).selectOption("structured"); break;
    case "failure": await page.getByLabel("Estrategia de reintento").selectOption("same"); break;
    case "misconception": await page.getByLabel("Clasificación del resultado").selectOption("business"); break;
  }
}
async function saved(page: Page) { return page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!), key); }

test("AC-1/2/3/4: siete desafíos exigen resultado y causa juntos, sin peticiones de negocio", async ({ page }, testInfo) => {
  const requests: string[] = [], errors: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) requests.push(request.url()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/challenges");
  await expect(page.getByRole("heading", { name: "0 de 7 desafíos completados" })).toBeVisible();
  for (const [index, exercise] of cases.entries()) {
    await choose(page, exercise.title); await solveOperation(page, exercise.id);
    await page.getByRole("radio").nth((exercise.cause + 1) % 3).check();
    await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
    const feedback = page.locator(".challenge-feedback:visible");
    await expect(feedback).toContainText("Resultado operativo: correcto"); await expect(feedback).toContainText("Explicación causal: por corregir");
    expect((await saved(page)).challenges).toHaveLength(index);
    await page.getByRole("radio").nth(exercise.cause).check();
    await expect(feedback).toHaveCount(0);
    await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
    await expect(feedback).toContainText("Desafío completado"); await expect(feedback).toContainText("Otra opción razonable");
    await expect(page.getByRole("heading", { name: `${index + 1} de 7 desafíos completados` })).toBeVisible();
    await expect(page.locator(".inspector:visible .xray-metadata")).toContainText("Evento / dependencia");
  }
  const progress = await saved(page);
  expect(progress.challenges).toEqual(cases.map(item => item.id)); expect(progress.chapters).toEqual({});
  expect(Object.keys(progress).sort()).toEqual(["challenges", "chapters", "depth", "location", "version"]);
  expect(requests).toEqual([]); expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("challenges-desktop.png"), fullPage: true });
  await page.reload(); await expect(page.getByRole("heading", { name: "7 de 7 desafíos completados" })).toBeVisible();
  await expect(page.locator(".challenge-feedback:visible")).toHaveCount(0);
  await expect(page.getByLabel("Clasificación del resultado")).toHaveValue("success");
  await page.getByRole("link", { name: "Ver mi recorrido", exact: true }).click();
  await expect(page.getByRole("heading", { name: "0 de 13 capítulos completados" })).toBeVisible();
  await expect(page.getByRole("link", { name: "7 de 7 desafíos completados", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Continuar mi recorrido", exact: true }).click();
  await expect(page).toHaveURL(/challenges\?challenge=misconception$/);
});

test("AC-2/4/5: una causa correcta no basta; reintentar y reproducir conservan el logro", async ({ page }) => {
  await page.goto("/challenges?challenge=failure");
  await page.getByRole("radio").nth(0).check(); await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  const feedback = page.locator(".challenge-feedback:visible");
  await expect(feedback).toContainText("Resultado operativo: por corregir"); await expect(feedback).toContainText("Explicación causal: correcta");
  await expect(feedback).toContainText("2 pedido(s)"); expect((await saved(page)).challenges).toEqual([]);
  await solveOperation(page, "failure"); await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  await expect(feedback).toContainText("Desafío completado");
  const inspector = page.locator(".inspector:visible"), event = await inspector.getAttribute("data-event-id");
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).click();
  await expect(inspector).not.toHaveAttribute("data-event-id", event!);
  const current = await inspector.getAttribute("data-event-id");
  await page.getByRole("button", { name: "X Ray Mode", exact: true }).click(); await expect(inspector.locator(".xray-metadata")).toHaveCount(0);
  await expect(inspector).toHaveAttribute("data-event-id", current!);
  await page.getByRole("button", { name: "X Ray Mode", exact: true }).click();
  expect((await saved(page)).challenges).toEqual(["failure"]);
  await page.getByLabel("Estrategia de reintento").selectOption("changed-body");
  await expect(feedback).toHaveCount(0); await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  await expect(feedback).toContainText("HTTP409"); expect((await saved(page)).challenges).toEqual(["failure"]);
});

test("AC-2/5: JSON inválido es recuperable y permisos y body se comprueban por separado", async ({ page }) => {
  await page.goto("/challenges?challenge=debug");
  await page.getByRole("radio").nth(0).check(); await page.getByLabel("Body JSON de PATCH").fill("{");
  await page.getByRole("button", { name: "Comprobar intento", exact: true }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("JSON válido");
  await expect(page.locator(".inspector:visible")).toHaveCount(0); expect((await saved(page)).challenges).toEqual([]);
  await page.getByLabel("Body JSON de PATCH").fill('{"status":"confirmed"}');
  await page.getByRole("button", { name: "Comprobar intento", exact: true }).click(); await expect(page.locator(".challenge-feedback:visible")).toContainText("HTTP403");
  await page.getByLabel("Credencial del fixture").selectOption("none"); await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  await expect(page.locator(".challenge-feedback:visible")).toContainText("HTTP401");
  await page.getByLabel("Credencial del fixture").selectOption("buyer"); await page.getByLabel("Body JSON de PATCH").fill('{"status":"created"}');
  await page.getByRole("button", { name: "Comprobar intento", exact: true }).click(); await expect(page.locator(".challenge-feedback:visible")).toContainText("HTTP400");
  await solveOperation(page, "debug"); await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  await expect(page.locator(".challenge-feedback:visible")).toContainText("Desafío completado");
});

test("AC-4/5: historial conserva borrador y captura, recarga solo logros y los otros almacenes", async ({ page }) => {
  const legacy = { version: 1, lastChapter: 0, depth: "engineering", chapters: {} };
  await page.addInitScript(value => { if (!localStorage.getItem("api-universe-learning-v1")) localStorage.setItem("api-universe-learning-v1", JSON.stringify(value)); }, legacy);
  await page.goto("/challenges?challenge=debug"); await page.getByLabel("Body JSON de PATCH").fill('{"status":"confirmed","draft":"solo sesión"}');
  await choose(page, "Design the Contract"); await page.getByLabel("Cantidad mínima").fill("6"); await page.getByLabel("Cantidad máxima").fill("2");
  await page.getByRole("button", { name: "Comprobar intento", exact: true }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("enteros");
  await page.goBack(); await expect(page.getByLabel("Body JSON de PATCH")).toHaveValue('{"status":"confirmed","draft":"solo sesión"}');
  await choose(page, "Diagnóstico de arquitectura"); await solveOperation(page, "architecture"); await page.getByRole("radio").nth(1).check();
  await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  await choose(page, "Predicción de ejecución"); await page.goBack(); await expect(page.locator(".challenge-feedback:visible")).toContainText("Desafío completado");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1")!))).toEqual(legacy);
  expect(JSON.stringify(await saved(page))).not.toContain("solo sesión");
  await page.goto("/challenges?challenge=debug"); await expect(page.getByLabel("Body JSON de PATCH")).toHaveValue('{"status":"created"}');
  await expect(page.getByRole("heading", { name: "1 de 7 desafíos completados" })).toBeVisible();
});

test("AC-4/5: almacenamiento bloqueado permite resolver en sesión y query desconocida es segura", async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(Storage.prototype, "getItem", { value() { throw new Error("blocked"); } }); Object.defineProperty(Storage.prototype, "setItem", { value() { throw new Error("blocked"); } }); });
  await page.goto("/challenges?challenge=unknown&body=private"); await expect(page.getByRole("heading", { name: "Una API sin internet" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Almacenamiento no disponible" })).toBeVisible();
  await solveOperation(page, "architecture"); await page.getByRole("radio").nth(1).check(); await page.getByRole("button", { name: "Comprobar intento", exact: true }).click();
  await expect(page.getByRole("heading", { name: "1 de 7 desafíos completados" })).toBeVisible();
  await page.getByRole("link", { name: "Ver mi recorrido", exact: true }).click();
  await expect(page.getByRole("link", { name: "1 de 7 desafíos completados", exact: true })).toBeVisible();
});

test("AC-5: teclado, foco y controles conservan espacio en móvil", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 900 }); await page.goto("/challenges");
  const skip = page.getByRole("link", { name: "Saltar a los desafíos", exact: true });
  await expect(skip).toBeVisible(); await skip.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab"); await expect(skip).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.getByRole("main")).toBeFocused();
  for (const exercise of cases) {
    const button = page.getByRole("navigation", { name: "Catálogo de desafíos" }).getByRole("button", { name: new RegExp(exercise.title) });
    await button.focus(); await page.keyboard.press("Enter"); await expect(button).toHaveAttribute("aria-pressed", "true");
    await solveOperation(page, exercise.id); await page.getByRole("radio").nth(exercise.cause).check();
    const check = page.getByRole("button", { name: "Comprobar intento", exact: true }); await check.focus(); await page.keyboard.press("Enter");
    await expect(page.locator(".challenge-feedback:visible")).toContainText("Desafío completado");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("challenges-mobile.png"), fullPage: true });
});
