import { openCourseArea } from "./helpers/navigation";
import { expect, test } from "@playwright/test";
test.use({ reducedMotion: "reduce" });
const key = "api-universe-course-v1";

test("el recorrido conserva logros anteriores y no completa capítulos por visitarlos", async ({ page }) => {
  const old = { version: 1, lastChapter: 1, depth: "internals", chapters: { 0: { quizPassed: true, flags: ["sum42"] }, 1: { quizPassed: false, flags: ["compatible"] }, 2: { quizPassed: false, flags: [] }, 3: { quizPassed: false, flags: [] } } };
  await page.addInitScript(value => localStorage.setItem("api-universe-learning-v1", JSON.stringify(value)), old);
  await page.goto("/course");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await expect(page.locator(".course-chapter").filter({ hasText: "Primeros principios" })).toContainText("Completado");
  await expect(page.locator(".course-chapter").filter({ hasText: "Contratos e implementaciones" })).toContainText("En curso");
  await page.getByRole("link", { name: "Continuar mi recorrido" }).click();
  await expect(page).toHaveURL(/first-principles\?chapter=1$/);
  await openCourseArea(page, "Aprendizaje y mapa"); await page.getByRole("link", { name: "Comparar interfaces", exact: true }).click();
  await expect(page.getByRole("button", { name: "3Internals", exact: true }).first()).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1")!))).toEqual(old);
  expect(await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!).chapters, key)).toEqual({});
});

test("actividades y razonamiento de red persisten sin completar por solo elegir una respuesta", async ({ page }) => {
  const requests: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url()); });
  await page.goto("/playground?tab=network");
  await page.getByLabel("Pila del modelo").selectOption("h3"); await page.getByRole("checkbox", { name: "Perder la unidad 2", exact: true }).check();
  await page.getByRole("button", { name: "Ejecutar modelo de red", exact: true }).click();
  await page.reload();
  await expect(page.locator(".lab-challenge").filter({ hasText: "HTTP/3 recupera" })).toContainText("observado");
  await page.getByLabel("Pila del modelo").selectOption("udp"); await page.getByRole("checkbox", { name: "Perder la unidad 2", exact: true }).check();
  await page.getByRole("button", { name: "Ejecutar modelo de red", exact: true }).click();
  await page.getByRole("radio", { name: "QUIC añade streams fiables y recuperación sobre UDP.", exact: true }).check();
  expect(await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!).chapters[4].quizPassed, key)).toBe(false);
  await page.getByRole("button", { name: "Comprobar red", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
  await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await expect(page.locator(".course-chapter").filter({ hasText: "Red y transporte" })).toContainText("Completado");
  expect(requests).toEqual([]);
});

test("continuar recupera pestaña y profundidad, sin guardar parámetros arbitrarios", async ({ page }) => {
  await page.goto("/contracts?tab=retries&token=private");
  await page.getByRole("button", { name: "2Engineering", exact: true }).click();
  await expect.poll(() => page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)!).location, key)).toBe("/contracts?tab=retries");
  await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click(); await page.getByRole("link", { name: "Continuar mi recorrido" }).click();
  await expect(page).toHaveURL(/contracts\?tab=retries$/);
  await expect(page.getByRole("tab", { name: /^Reintentos/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "2Engineering", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(storageKey => localStorage.getItem(storageKey), key)).not.toContain("private");
});

test("el comparador conserva operaciones exploradas y razonamiento al recargar", async ({ page }) => {
  await page.goto("/compare");
  await page.getByRole("button", { name: "Ejecutar comparación", exact: true }).click();
  await page.getByLabel("Objetivo de negocio").selectOption("confirm"); await page.getByRole("button", { name: "Ejecutar comparación", exact: true }).click();
  await page.getByRole("radio", { name: "El cliente no sabe el resultado; puede consultar o repetir un comando idempotente.", exact: true }).check();
  await page.getByRole("button", { name: "Comprobar razonamiento", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Capítulo completado y guardado" })).toBeVisible();
  await page.reload(); await expect(page.getByRole("status").filter({ hasText: "Capítulo completado y guardado" })).toBeVisible();
  await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click();
  await expect(page.locator(".course-chapter").filter({ hasText: "Comparar interfaces" })).toContainText("Completado");
});

test("almacenamiento bloqueado permite aprender y conserva logros durante la navegación", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error("Bloqueado"); }; Storage.prototype.setItem = () => { throw new Error("Bloqueado"); }; });
  await page.goto("/playground?tab=network");
  await expect(page.getByRole("status").filter({ hasText: "Almacenamiento no disponible" })).toBeVisible();
  await page.getByLabel("Pila del modelo").selectOption("h3"); await page.getByRole("checkbox", { name: "Perder la unidad 2", exact: true }).check();
  await page.getByRole("button", { name: "Ejecutar modelo de red", exact: true }).click();
  await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click();
  await expect(page.locator(".course-chapter").filter({ hasText: "Red y transporte" })).toContainText("En curso");
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
});

test("datos inválidos y cambios de otra pestaña mantienen un resumen válido", async ({ page }) => {
  await page.addInitScript(storageKey => localStorage.setItem(storageKey, '{"version":99,"chapters":{"7":{"quizPassed":true}}}'), key);
  await page.goto("/course"); await expect(page.getByRole("progressbar")).toHaveAttribute("value", "0");
  await page.evaluate(storageKey => {
    const next = { version: 1, chapters: { 7: { flags: ["sseCommand", "webhookDedupe", "pubsubLag"], quizPassed: true }, 10: { flags: ["partial", "late", "stale", "compensated"], quizPassed: true } }, depth: null, location: "/events?tab=chapter" };
    localStorage.setItem(storageKey, JSON.stringify(next)); window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
  }, key);
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "2");
  await expect(page.locator(".course-chapter").filter({ hasText: "Sistemas y fallos parciales" })).toContainText("Completado");
});

test("áreas orientativas, teclado, 404 y navegación móvil mantienen estados honestos", async ({ page }) => {
  for (const width of [390, 701, 920, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/course", "/challenges", "/reference"]) {
      await page.goto(path); await expect(page.getByRole("main")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (path === "/reference") await expect(page.getByRole("heading", { name: "Conecta los conceptos." })).toBeVisible();
      if (path === "/challenges") await expect(page.getByRole("heading", { name: "0 de 7 desafíos completados" })).toBeVisible();
    }
  }
  await page.goto("/course"); await expect(page.getByRole("link", { name: "Continuar mi recorrido", exact: true })).toBeVisible(); const skip = page.getByRole("link", { name: "Saltar al recorrido", exact: true }); await expect(skip).toBeVisible();
  await page.keyboard.press("Tab"); await expect(skip).toBeFocused(); await page.keyboard.press("Enter"); await expect(page.getByRole("main")).toBeFocused();
  await expect(page.locator(".course-area-grid > a")).toHaveCount(5);
  const response = await page.goto("/esta-ruta-no-existe"); expect(response?.status()).toBe(404);
  await page.getByRole("link", { name: "Volver a mi recorrido", exact: true }).click(); await expect(page).toHaveURL(/\/course$/);
});
