import { expect, test, type Page } from "@playwright/test";

test.use({ reducedMotion: "reduce" });
const panel = (page: Page) => page.getByRole("region", { name: "Del Map a una fila SQL", exact: true });
const storedStep = (page: Page) => page.getByRole("button", { name: /^Paso \d+: Se guarda el pedido temporal$/ });
const parameter = (page: Page, name: string) => panel(page).getByText(name, { exact: true }).locator("..").locator("dd");

async function create(page: Page, quantity: string) {
  await page.getByLabel("Cantidad", { exact: true }).selectOption(quantity);
  const response = page.waitForResponse(r => r.request().method() === "POST" && new URL(r.url()).pathname === "/api/orders");
  await page.getByRole("button", { name: "Comprar ahora", exact: true }).click();
  const body = await (await response).json();
  await expect(page.getByRole("status")).toContainText(body.order.id);
  return body;
}

test("AC-1/2/3/4/6: SQL sigue la escritura capturada al editar, reproducir y volver a la anterior", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(r.method()); });
  await page.goto("/follow-the-click");
  const first = await create(page, "1");
  await storedStep(page).click();
  const selected = await panel(page).getAttribute("data-event-id");
  await expect(panel(page)).toHaveAttribute("data-capture-id", first.traceId);
  await expect(panel(page).getByRole("heading", { name: "Map · escritura observada", exact: true })).toBeVisible();
  await expect(panel(page).getByRole("heading", { name: "Alternativa SQL · conceptual · no ejecutada", exact: true })).toBeVisible();
  await expect(panel(page).locator("pre").last()).toContainText("INSERT INTO orders");
  await expect(panel(page).locator("pre").last()).toContainText("VALUES ($1, $2, $3, $4, $5, $6)");
  await expect(parameter(page, "$1 · id")).toHaveText(JSON.stringify(first.order.id));
  for (const [name, value] of [["$2 · sku", '"kit-api"'], ["$3 · quantity", "1"], ["$4 · total_minor", "8900"], ["$5 · currency", '"PEN"'], ["$6 · status", '"created"']]) await expect(parameter(page, name)).toHaveText(value);
  await page.getByLabel("Cantidad", { exact: true }).selectOption("5");
  await page.getByLabel("Credencial demostrativa").selectOption("demo-reader");
  for (const level of ["1Intuition", "2Engineering", "3Internals"]) {
    await page.getByRole("button", { name: level, exact: true }).click();
    await expect(panel(page)).toHaveAttribute("data-event-id", selected!);
    await expect(parameter(page, "$3 · quantity")).toHaveText("1");
  }
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(panel(page)).toHaveCount(0);
  await storedStep(page).click();
  await expect(parameter(page, "$3 · quantity")).toHaveText("1");
  expect(calls).toEqual(["POST"]);

  await page.getByLabel("Credencial demostrativa").selectOption("demo-buyer");
  const second = await create(page, "3");
  await storedStep(page).click();
  await expect(parameter(page, "$1 · id")).toHaveText(JSON.stringify(second.order.id));
  await expect(parameter(page, "$3 · quantity")).toHaveText("3");
  await expect(parameter(page, "$4 · total_minor")).toHaveText("26700");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Comparar con la captura anterior", exact: true }).click();
  const previous = page.getByRole("button", { name: "Inspeccionar captura anterior", exact: true });
  await previous.focus(); await page.keyboard.press("Enter");
  await expect(previous).toBeFocused();
  await expect(page.getByRole("button", { name: "Reproducir", exact: true })).toBeVisible();
  await expect(panel(page)).toHaveCount(0);
  await storedStep(page).focus(); await page.keyboard.press("Enter");
  await expect(panel(page)).toHaveAttribute("data-capture-id", first.traceId);
  await expect(parameter(page, "$3 · quantity")).toHaveText("1");
  await expect(page.getByLabel("Cantidad", { exact: true })).toHaveValue("3");
  await expect(page.locator(".receipt")).toContainText(second.order.id);
  await expect(page.getByRole("status")).toContainText(second.order.id);
  const sql = panel(page).locator("pre").last();
  await sql.focus(); await expect(sql).toBeFocused();
  await page.keyboard.press("End");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel(page).screenshot({ path: "test-results/storage-mobile.png" });
  await previous.click(); await storedStep(page).click();
  await expect(panel(page)).toHaveAttribute("data-capture-id", second.traceId);
  await expect(parameter(page, "$3 · quantity")).toHaveText("3");
  expect(calls).toEqual(["POST", "POST"]);
});

test("AC-1/2/5: consultas, errores, deduplicación y favoritos no se presentan como INSERT", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(r.url()); });
  await page.goto("/follow-the-click");
  await page.getByLabel("Simulación", { exact: true }).check();
  for (const scenario of ["200", "400", "401", "403", "404", "409", "429", "500", "network", "timeout", "duplicate"]) {
    await page.getByLabel("Inyectar condición").selectOption(scenario);
    await page.getByRole("button", { name: "Ejecutar escenario", exact: true }).click();
    await expect(panel(page)).toHaveCount(0);
    if (scenario === "timeout" || scenario === "duplicate") {
      await storedStep(page).click();
      await expect(panel(page).getByRole("heading", { name: "Map · escritura conceptual del escenario", exact: true })).toBeVisible();
      await expect(parameter(page, "$3 · quantity")).toHaveText("1");
      await page.getByLabel("Cantidad", { exact: true }).selectOption("4");
      await expect(parameter(page, "$3 · quantity")).toHaveText("1");
      await page.getByLabel("Cantidad", { exact: true }).selectOption("1");
      if (scenario === "duplicate") await page.getByRole("button", { name: /^Paso \d+: La clave recupera el pedido previo$/ }).click();
      else await page.locator(".timeline").getByRole("button").last().click();
      await expect(panel(page)).toHaveCount(0);
    } else await expect(storedStep(page)).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Guardar en favoritos" }).click();
  await page.locator(".timeline").getByRole("button").last().click();
  await expect(panel(page)).toHaveCount(0);
  expect(calls).toEqual([]);
});

test("AC-4: inspeccionar una escritura anterior conserva el intento incierto y su reintento", async ({ page }) => {
  const attempts: { key: string; body: string; credential: string }[] = [];
  await page.route("**/api/orders", async route => {
    const request = route.request();
    attempts.push({ key: request.headers()["idempotency-key"], body: request.postData()!, credential: request.headers().authorization });
    const response = await route.fetch();
    if (attempts.length === 2) await route.abort("failed");
    else await route.fulfill({ response });
  });
  await page.goto("/follow-the-click");
  const first = await create(page, "2");
  await page.getByLabel("Cantidad", { exact: true }).selectOption("3");
  await page.getByRole("button", { name: "Comprar ahora", exact: true }).click();
  const retry = page.getByRole("button", { name: "Reintentar misma operación", exact: true });
  await expect(retry).toBeVisible();
  await page.getByRole("button", { name: "Comparar con la captura anterior", exact: true }).click();
  await page.getByRole("button", { name: "Inspeccionar captura anterior", exact: true }).click();
  await storedStep(page).click();
  await expect(panel(page)).toHaveAttribute("data-capture-id", first.traceId);
  await expect(parameter(page, "$3 · quantity")).toHaveText("2");
  await expect(page.getByLabel("Cantidad", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Cantidad", { exact: true })).toHaveValue("3");
  await expect(page.getByLabel("Credencial demostrativa")).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Reintentar conservará la clave y los datos");
  await retry.click();
  await expect(page.getByRole("status")).toContainText("Pedido recuperado, sin duplicar");
  await expect(storedStep(page)).toHaveCount(0);
  expect(attempts).toHaveLength(3);
  expect(attempts[2]).toEqual(attempts[1]);
  expect(attempts[0].key).not.toBe(attempts[1].key);
});
