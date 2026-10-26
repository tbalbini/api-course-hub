import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("AC-1, AC-2, AC-5: progreso accesible y programa antes de exploración secundaria", async ({ page }) => {
  await page.goto("/course");
  await page.screenshot({ path: test.info().outputPath("recorrido-desktop.png"), fullPage: true });
  const program = page.getByRole("region", { name: "Los trece capítulos" });
  const areas = page.getByRole("region", { name: "Explora por área" });
  expect(await program.evaluate((element, next) => !!(element.compareDocumentPosition(next as Node) & Node.DOCUMENT_POSITION_FOLLOWING), await areas.elementHandle())).toBe(true);
  await page.goto("/playground?tab=http");
  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  await expect(nav.getByRole("link", { name: /^Tu recorrido/ })).toBeVisible();
  for (const width of [390, 701, 920, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(nav.getByRole("link", { name: /^Tu recorrido/ })).toBeVisible();
    expect(await nav.locator('.nav-active[aria-current="page"]').count()).toBe(1);
    expect(await nav.getByRole("link", { name: "HTTP: petición y respuesta", exact: true }).evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/course");
  await page.screenshot({ path: test.info().outputPath("recorrido-mobile.png"), fullPage: true });
  await page.screenshot({ path: test.info().outputPath("recorrido-mobile-viewport.png") });
});

test("AC-3, AC-4: dos pestañas conservan la unión de logros y una lectura inválida no borra los anteriores", async ({ page, context }) => {
  const key = "api-universe-course-v1";
  const previous = { version: 1, chapters: { 6: { flags: ["read", "confirm"], quizPassed: true } }, depth: "internals", location: "/compare" };
  await page.goto("/course");
  await page.evaluate(({ key, previous }) => {
    localStorage.setItem(key, JSON.stringify(previous));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }, { key, previous });
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  const other = await context.newPage();
  await other.goto("/course");
  await other.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, chapters: { 5: { flags: ["json"], quizPassed: false } }, depth: "engineering", location: "/playground?tab=http" })), key);
  await expect(page.locator(".course-chapter").filter({ hasText: "HTTP: petición y respuesta" })).toContainText("En curso");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await other.evaluate(key => localStorage.setItem(key, '{"version":99,"chapters":{}}'), key);
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await page.getByRole("link", { name: "Continuar mi recorrido" }).click();
  await expect(page).toHaveURL(/playground\?tab=http$/);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).chapters[6].quizPassed, key)).toBe(true);
});

test("AC-3, AC-4: los logros de primeros principios también sobreviven a otra pestaña", async ({ page, context }) => {
  const key = "api-universe-learning-v1";
  await page.goto("/course");
  await page.evaluate(key => {
    localStorage.setItem(key, JSON.stringify({ version: 1, lastChapter: 0, depth: "intuition", chapters: { 0: { flags: ["sum42"], quizPassed: true } } }));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }, key);
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  const other = await context.newPage();
  await other.goto("/course");
  await other.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, lastChapter: 1, depth: "internals", chapters: { 1: { flags: ["compatible"], quizPassed: false } } })), key);
  await expect(page.locator(".course-chapter").filter({ hasText: "Contratos e implementaciones" })).toContainText("En curso");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await other.evaluate(key => localStorage.setItem(key, "{"), key);
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
});
