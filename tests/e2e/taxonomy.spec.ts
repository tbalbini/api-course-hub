import { openCourseArea } from "./helpers/navigation";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("búsqueda, filtros combinados, ausencia de resultados y selección estable", async ({ page }) => {
  const requests: string[] = [];
  await page.goto("/api-universe");
  page.on("request", request => requests.push(request.url()));
  await expect(page.getByRole("heading", { name: "El universo de las APIs." })).toBeVisible();
  await expect(page.locator(".catalog-count")).toHaveText("29 de 29 fichas");
  await page.getByLabel("Buscar capacidad, tecnología o rasgo").fill("GRÁPHQL");
  await page.getByRole("button", { name: "Seleccionar GraphQL", exact: true }).click();
  await expect(page.locator("#selected-technology")).toHaveText("GraphQL");
  await page.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
  await page.locator("#filter-location").selectOption("a-network");
  await page.locator("#filter-contract").selectOption("f-json");
  await page.locator("#filter-access").selectOption("e-private");
  await expect(page.getByRole("button", { name: "Seleccionar REST", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Seleccionar REST", exact: true }).click();
  await page.getByLabel("Buscar capacidad, tecnología o rasgo").fill("sin-coincidencias-xyz");
  await expect(page.locator(".catalog-count")).toHaveText("0 de 29 fichas");
  await expect(page.locator("#selected-technology")).toHaveText("REST");
  await expect(page.locator(".selection-outside-filter")).toContainText("Conservamos tu selección");
  await expect(page.locator(".taxonomy-empty")).toContainText("no demuestra incompatibilidad");
  await page.getByRole("button", { name: "Restablecer búsqueda", exact: true }).click();
  await expect(page.locator(".catalog-count")).toHaveText("29 de 29 fichas");
  expect(requests).toEqual([]);
});

test("las 49 facetas se pueden seleccionar y tienen explicación y asociaciones", async ({ page }) => {
  await page.goto("/api-universe");
  let visited = 0;
  for (const axis of ["location", "surface", "interaction", "remote", "access", "contract"]) {
    const select = page.locator(`#filter-${axis}`);
    const options = await select.locator('option:not([value=""])').evaluateAll(elements => elements.map(element => ({ id: (element as HTMLOptionElement).value, label: element.textContent! })));
    for (const option of options) {
      await select.selectOption(option.id);
      await expect(page.locator(".facet-explanation .overline")).toContainText(option.label);
      await expect(page.locator(".facet-explanation p")).not.toBeEmpty();
      await expect(page.locator(".catalog-count")).not.toHaveText("0 de 29 fichas");
      visited++;
    }
    await select.selectOption("");
  }
  expect(visited).toBe(49);
});

test("el mapa se conecta con filtros y conserva definido frente a posible", async ({ page }) => {
  await page.goto("/api-universe");
  const access = page.getByRole("button", { name: "Explorar eje E: Visibilidad y acceso", exact: true });
  await access.focus(); await page.keyboard.press("Enter");
  await expect(page.locator("#filter-access")).toBeFocused();
  await page.locator("#filter-access").selectOption("e-restricted");
  await expect(page.locator(".facet-explanation")).toContainText("Puede coexistir con audiencia pública");
  await page.getByRole("button", { name: "Limpiar filtros", exact: true }).click();
  await page.getByRole("button", { name: "Seleccionar JSON", exact: true }).click();
  const location = page.locator(".technology-dimensions > div").nth(0);
  await expect(location).toContainText("No especificado por esta ficha");
  const contract = page.locator(".technology-dimensions > div").nth(5);
  await expect(contract.getByRole("button", { name: "JSON", exact: true })).toHaveClass(/trait-defined/);
  await contract.getByRole("button", { name: "JSON", exact: true }).click();
  await expect(page.locator("#filter-contract")).toHaveValue("f-json");
  await expect(page.locator(".taxonomy-profile")).toContainText("Una API pública también puede exigir credenciales");
});

test("comparar capas y relaciones funciona en ambas direcciones sin equipararlas", async ({ page }) => {
  await page.goto("/api-universe");
  for (const [a, b, explanation] of [
    ["rest", "http", "REST fija restricciones arquitectónicas"],
    ["graphql", "tcp", "GraphQL organiza operaciones"],
    ["websocket", "webhook", "WebSocket mantiene comunicación bidireccional"],
    ["json", "openapi", "JSON representa datos"],
    ["http", "tcp", "HTTP/3 usa QUIC"],
  ]) {
    await page.getByLabel("Tecnología A", { exact: true }).selectOption(a);
    await page.getByLabel("Tecnología B", { exact: true }).selectOption(b);
    await expect(page.locator(".comparison-explanation")).toContainText("Cruce de categorías o capas");
    await expect(page.locator(".comparison-explanation")).toContainText(explanation);
    await page.getByLabel("Tecnología A", { exact: true }).selectOption(b);
    await page.getByLabel("Tecnología B", { exact: true }).selectOption(a);
    await expect(page.locator(".comparison-explanation")).toContainText(explanation);
  }
  await page.getByLabel("Tecnología A", { exact: true }).selectOption("rest");
  await page.getByLabel("Tecnología B", { exact: true }).selectOption("rest");
  await expect(page.locator(".comparison-explanation")).toContainText("Misma selección");
  await page.getByLabel("Tecnología B", { exact: true }).selectOption("http");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/taxonomy-desktop.png", fullPage: true });
});

test("actividad explica errores, admite reintento y no toca el progreso de capítulos", async ({ page }) => {
  await page.goto("/api-universe");
  const before = await page.evaluate(() => localStorage.getItem("api-universe-learning-v1"));
  await page.locator(".classification-rows").getByLabel("REST", { exact: true }).selectOption("format");
  await page.getByRole("button", { name: "Evaluar clasificación", exact: true }).click();
  await expect(page.locator(".classification-summary")).toContainText("0 de 5");
  await expect(page.locator(".classification-rows > div").first()).toContainText("restricciones de arquitectura");
  for (const [label, answer] of [["REST", "architecture"], ["HTTP", "protocol"], ["JSON", "format"], ["OpenAPI", "description"], ["API privada", "access"]]) {
    await page.locator(".classification-rows").getByLabel(label, { exact: true }).selectOption(answer);
  }
  await page.getByRole("button", { name: "Evaluar clasificación", exact: true }).click();
  await expect(page.locator(".classification-summary")).toContainText("5 de 5 clasificaciones correctas");
  expect(await page.evaluate(() => localStorage.getItem("api-universe-learning-v1"))).toBe(before);
});

test("mapa, tabla y navegación funcionan con teclado y móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/api-universe");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused();
  await page.keyboard.press("Enter");
  const axis = page.getByRole("button", { name: "Explorar eje F: Contrato y representación", exact: true });
  await axis.focus(); await page.keyboard.press("Enter");
  await expect(page.locator("#filter-contract")).toBeFocused();
  await page.locator("#filter-contract").selectOption("f-openapi");
  await page.getByRole("button", { name: "Seleccionar OpenAPI", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: "test-results/taxonomy-mobile.png", fullPage: true });
  await openCourseArea(page, "Bases"); await page.getByRole("link", { name: "Primeros principios", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Antes de la red." })).toBeVisible();
});
