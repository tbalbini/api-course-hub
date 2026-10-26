import { openCourseArea } from "./helpers/navigation";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });
const chapterButton = (index: number) => `.chapter-navigation button:nth-child(${index + 1})`;

for (const width of [1440, 390]) test(`B abre Browser API y Anatomy conserva su propio destino a${width}px sin ejecutar operaciones`, async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) calls.push(request.url()); });
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/first-principles?chapter=2");
  const nav = page.getByRole("navigation", { name: "Navegación principal", exact: true });
  const browserLab = nav.getByRole("link", { name: "B · Browser API: DOM sin red", exact: true });
  await expect(browserLab).toHaveAttribute("href", "/first-principles?chapter=2#local-lab-title");
  await page.getByLabel("Texto para el nodo", { exact: true }).fill("Borrador sin ejecutar");
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1") ?? "null")?.chapters);
  await browserLab.focus(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/first-principles\?chapter=2#local-lab-title$/);
  await expect(page.locator("#local-lab-title")).toHaveText("Un cambio DOM, cero fetch");
  await expect(page.locator(".function-experiment .overline").first()).toHaveText("LABORATORIO B · BROWSER API");
  await expect(page.getByLabel("Texto para el nodo", { exact: true })).toHaveValue("Borrador sin ejecutar");
  await expect(page.locator("[data-demo-node]")).toHaveText("Texto inicial");
  await nav.getByRole("link", { name: "Procesos y fronteras", exact: true }).click();
  const anatomy = nav.getByRole("link", { name: "API Anatomy", exact: true });
  await expect(anatomy).toHaveAttribute("href", "/first-principles?chapter=3#api-anatomy");
  await expect(nav.getByRole("link", { name: "B · API Anatomy", exact: true })).toHaveCount(0);
  await anatomy.focus(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/first-principles\?chapter=3#api-anatomy$/);
  await expect(page.locator("#api-anatomy")).toHaveAccessibleName("API Anatomy");
  await expect(page.locator("#api-anatomy").getByRole("combobox").locator("option")).toHaveCount(7);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1") ?? "null")?.chapters)).toEqual(progress);
  expect(calls).toEqual([]);
});

test("función real, pila reversible, evaluación y progreso persistente", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/") || request.url().includes("api.example")) calls.push(request.url()); });
  await page.goto("/first-principles");
  await page.getByLabel("Argumento a", { exact: true }).fill("10");
  await page.getByLabel("Argumento b", { exact: true }).fill("20");
  await page.getByRole("button", { name: "Ejecutar función", exact: true }).click();
  await expect(page.locator(".local-result > strong")).toHaveText("30");
  await expect(page.locator(".execution-count")).toContainText("1 ejecución real");
  await page.getByRole("button", { name: "Paso 2: El control entra en sumar", exact: true }).click();
  await expect(page.locator(".stack-frames li")).toHaveCount(2);
  await page.getByRole("button", { name: "Paso 4: El valor vuelve al consumidor", exact: true }).click();
  await expect(page.locator(".stack-frames li")).toHaveCount(1);
  await page.getByRole("button", { name: "Paso anterior", exact: true }).click();
  await expect(page.locator(".stack-frames li")).toHaveCount(2);
  await page.getByRole("button", { name: "Reproducir desde el inicio" }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(page.locator(".execution-count")).toContainText("1 ejecución real");
  await page.getByLabel("Argumento a", { exact: true }).fill("21");
  await page.getByLabel("Argumento b", { exact: true }).fill("21");
  await page.getByRole("button", { name: "Ejecutar función", exact: true }).click();
  await page.getByRole("button", { name: /No es una API porque no tiene una URL/ }).click();
  await expect(page.locator(".quiz-feedback")).toContainText("Una interfaz de funciones también puede ser una API");
  await expect(page.locator(".practical-challenge")).not.toContainText("Capítulo completado");
  await page.getByRole("button", { name: /Una interfaz puede ofrecer una capacidad/ }).click();
  await expect(page.locator(".practical-challenge")).toContainText("Capítulo completado");
  await page.getByRole("button", { name: "3Internals", exact: true }).click();
  const event = await page.locator(".xray-metadata").textContent();
  await page.getByRole("button", { name: "2Engineering", exact: true }).click();
  await expect(page.locator(".xray-metadata")).toHaveText(event!);
  await page.reload();
  await expect(page.locator(chapterButton(0))).toContainText("Completado");
  await expect(page.getByRole("button", { name: "2Engineering", exact: true })).toHaveAttribute("aria-pressed", "true");
  expect(calls).toEqual([]);
});

test("sustituir la implementación conserva o rompe el contrato del consumidor", async ({ page }) => {
  await page.goto("/first-principles");
  await page.locator(chapterButton(1)).click();
  await page.getByLabel("Implementación del proveedor").selectOption("fold");
  await page.getByRole("button", { name: "Ejecutar función", exact: true }).click();
  await expect(page.locator(".local-result")).toContainText("tipo: number");
  await page.getByLabel("Implementación del proveedor").selectOption("broken");
  await page.getByRole("button", { name: "Ejecutar función", exact: true }).click();
  await expect(page.locator(".local-result > strong")).toHaveText('"5"');
  await page.getByRole("button", { name: /Paso \d+: Se comprueba la promesa de la interfaz/ }).click();
  await expect(page.getByText("CONTRACT_VIOLATION", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /No: se rompió el retorno numérico prometido/ }).click();
  await expect(page.locator(".practical-challenge")).toContainText("Capítulo completado");
  await page.reload();
  await expect(page.locator(chapterButton(1))).toHaveAttribute("aria-current", "page");
  await expect(page.locator(chapterButton(1))).toContainText("Completado");
});

test("DOM real trata entrada como texto y replay no repite mutaciones", async ({ page }) => {
  const requests: string[] = [];
  await page.goto("/first-principles");
  page.on("request", request => requests.push(request.url()));
  await page.locator(chapterButton(2)).click();
  await page.getByLabel("Texto para el nodo").fill('<img src="https://api.example/probe">');
  await page.getByRole("button", { name: "Aplicar cambio DOM" }).click();
  await expect(page.locator("[data-demo-node]")).toHaveText('<img src="https://api.example/probe">');
  await expect(page.locator(".dom-sandbox img")).toHaveCount(0);
  await page.getByLabel("Texto para el nodo").fill("Interfaz local");
  await page.getByRole("button", { name: "Aplicar cambio DOM" }).click();
  await page.getByRole("button", { name: "Reproducir desde el inicio" }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await expect(page.locator("[data-demo-node]")).toHaveText("Interfaz local");
  await expect(page.locator(".execution-count")).toContainText("2 ejecuciones reales");
  await page.getByRole("button", { name: /Esta mutación del DOM se hizo localmente/ }).click();
  await expect(page.locator(".practical-challenge")).toContainText("Capítulo completado");
  await page.getByRole("button", { name: "SDK y wrapper", exact: true }).click();
  await expect(page.locator(".example-detail")).toContainText("interfaces distintas");
  expect(requests).toEqual([]);
});

test("Anatomy distingue siete fronteras y concurrencia conserva cadenas separadas", async ({ page }) => {
  await page.goto("/first-principles");
  await page.locator(chapterButton(3)).click();
  await expect(page.locator("#chapter-title")).toHaveText("Cuando la memoria deja de ser compartida");
  for (const mode of ["function", "ipc", "syscall", "http", "rpc", "message", "subscription"]) {
    await page.getByLabel("Mecanismo de la interfaz").selectOption(mode);
    for (const part of ["Consumer", "Contract", "Provider", "Execution", "Result"]) {
      await page.getByRole("button", { name: `Inspeccionar ${part}`, exact: true }).click();
      await expect(page.locator(".anatomy-detail p")).not.toBeEmpty();
    }
    if (mode === "function") await expect(page.locator(".anatomy-crossing")).toHaveCount(0);
    if (mode === "syscall") await expect(page.locator(".anatomy-crossing")).toContainText("privilegio, no otro proceso");
    if (mode === "ipc") await expect(page.locator(".anatomy-crossing")).toContainText("no requiere internet");
  }
  await page.getByLabel("Mecanismo de la interfaz").selectOption("http");
  await page.getByLabel("Condición de entrega").selectOption("lost");
  await page.getByLabel("Dos llamadas concurrentes A y B").check();
  await page.getByRole("button", { name: "Ejecutar modelo", exact: true }).click();
  await expect(page.getByRole("region", { name: "Cadenas concurrentes A y B" })).toBeVisible();
  await page.getByRole("button", { name: /Rama B, tiempo 3:/ }).click();
  await expect(page.locator(".xray-metadata")).toContainText("model-http:B:3");
  await expect(page.locator(".xray-metadata")).toContainText("model-http:B:2");
  await expect(page.locator(".error-detail").getByText("TIMEOUT", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /El resultado remoto es incierto/ }).click();
  await expect(page.locator(".practical-challenge")).toContainText("Capítulo completado");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/foundations-desktop.png", fullPage: true });
});

test("datos locales inválidos y almacenamiento bloqueado no impiden aprender", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("api-universe-learning-v1", "{invalid"));
  await page.goto("/first-principles");
  await expect(page.locator(chapterButton(0))).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".practical-challenge")).not.toContainText("Capítulo completado");
  await page.evaluate(() => {
    Object.defineProperty(Storage.prototype, "setItem", { value: () => { throw new Error("blocked"); } });
  });
  await page.locator(chapterButton(1)).click();
  await expect(page.locator(chapterButton(1))).toHaveAttribute("aria-current", "page");
  await page.getByRole("button", { name: /No: se rompió el retorno numérico prometido/ }).click();
  await expect(page.locator(".operation-notice")).toContainText("Progreso conservado en esta sesión");
});

test("consola y navegación funcionan por teclado y en móvil", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/first-principles");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused();
  await page.keyboard.press("Enter");
  const provider = page.getByRole("button", { name: "Inspeccionar Provider", exact: true });
  await provider.focus(); await page.keyboard.press("Enter");
  await expect(provider).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { (document.activeElement as HTMLElement)?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: "test-results/foundations-mobile.png", fullPage: true });
  await openCourseArea(page, "Recorrido central"); await page.getByRole("link", { name: /Follow the Click/ }).click();
  await expect(page.getByRole("heading", { name: "Sigue el click." })).toBeVisible();
});
