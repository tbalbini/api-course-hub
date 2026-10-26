import { expect, test } from "@playwright/test";
import { openCourseArea } from "./helpers/navigation";

test.use({ reducedMotion: "reduce" });

const surfaces: [string, string?][] = [
  ["/"], ["/first-principles?chapter=0"], ["/first-principles?chapter=1"], ["/first-principles?chapter=2"], ["/first-principles?chapter=3"], ["/compare"],
  ["/playground?tab=http", "Enviar petición"], ["/playground?tab=network"], ["/playground?tab=graphql"], ["/playground?tab=rpc"],
  ["/events?tab=communication"], ["/events?tab=delivery"], ["/events?tab=sse", "Abrir SSE real"],
  ["/security?tab=access"], ["/security?tab=browser"], ["/security?tab=credentials"], ["/security?tab=real", "Crear pedido real"],
  ["/contracts?tab=design"], ["/contracts?tab=compatibility"], ["/contracts?tab=collections"], ["/contracts?tab=retries"],
  ["/advanced?tab=binary"], ["/advanced?tab=wire"], ["/advanced?tab=tools"],
  ["/systems?tab=system"], ["/systems?tab=transactions"], ["/build-api", "Crear pedido real"],
  ["/challenges", "Comprobar intento"],
];

for (const [path, execute] of surfaces) test(`AC-1/2/3/4/5: X Ray conserva contexto sin efectos en ${path}`, async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) calls.push(request.url()); });
  await page.goto(path);
  if (execute) await page.getByRole("button", { name: execute, exact: true }).click();
  if (path.includes("tab=sse")) await expect(page.getByRole("status").filter({ hasText: "Completado: 3 eventos" })).toBeVisible();
  const inspector = page.locator(".inspector:visible").first();
  await expect(inspector).toBeVisible();
  const timeline = page.locator(".timeline:visible").first();
  if (await timeline.getByRole("button").count() > 1) await timeline.getByRole("button").nth(1).click();
  const captureId = await inspector.getAttribute("data-capture-id"), eventId = await inspector.getAttribute("data-event-id");
  const count = calls.length;
  const metadata = inspector.locator(".xray-metadata");
  await expect(metadata).toContainText("Iniciador"); await expect(metadata).toContainText("Receptor");
  await expect(metadata).toContainText("Tecnología"); await expect(metadata).toContainText("Estado del paso");
  await expect(metadata).toContainText("Fallos posibles");
  const metadataText = await metadata.innerText();
  await inspector.getByRole("button", { name: "Inspeccionar datos de este paso", exact: false }).click();
  const data = inspector.locator(".data-disclosure .exchange-grid"), originalData = await data.innerText();
  for (const level of ["1Intuition", "2Engineering", "3Internals"]) {
    await inspector.getByRole("button", { name: level, exact: true }).click();
    await expect(inspector).toHaveAttribute("data-capture-id", captureId!);
    await expect(inspector).toHaveAttribute("data-event-id", eventId!);
    expect(await data.innerText()).toBe(originalData);
    expect(await metadata.innerText()).toBe(metadataText);
  }
  for (const panel of ["Código", "Request / Response"]) {
    await inspector.getByRole("button", { name: panel, exact: true }).click();
    await inspector.getByRole("button", { name: "1Intuition", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(inspector.getByRole("button", { name: panel, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(inspector).toHaveAttribute("data-event-id", eventId!);
  }
  await inspector.getByRole("button", { name: "Explicación causal", exact: true }).click();
  const toggle = page.getByRole("button", { name: "X Ray Mode", exact: true });
  await expect(toggle).toHaveCount(1);
  await toggle.click(); await expect(metadata).toHaveCount(0);
  await toggle.click(); expect(await data.innerText()).toBe(originalData);
  await expect(inspector).toHaveAttribute("data-event-id", eventId!);
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).first().click();
  await page.getByRole("button", { name: "Pausar", exact: true }).first().click();
  expect(calls).toHaveLength(count);
});

test("AC-7: X Ray permite inspeccionar datos y fallos con teclado a390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/systems");
  await page.getByRole("button", { name: "Inspeccionar componente Inventario", exact: true }).click();
  const inspector = page.locator(".inspector:visible");
  await inspector.getByRole("button", { name: "3Internals", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(inspector.locator(".xray-metadata")).toContainText("Servicio de inventario");
  await expect(inspector.locator(".xray-metadata")).toContainText("Posibilidades declaradas, no fallos observados");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/xray-mobile.png", fullPage: true });
});

test("AC-1: cambiar profundidad conserva reproducción en marcha y el evento", async ({ page }) => {
  await page.goto("/");
  await page.locator(".timeline").getByRole("button").nth(2).click();
  const inspector = page.locator(".inspector"), selected = await inspector.getAttribute("data-event-id");
  await page.getByRole("combobox", { name: /Velocidad/ }).selectOption("0.5");
  await page.getByRole("button", { name: "Reproducir", exact: true }).click();
  await inspector.getByRole("button", { name: "3Internals", exact: true }).click();
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toBeVisible();
  await expect(inspector).toHaveAttribute("data-event-id", selected!);
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await inspector.screenshot({ path: "test-results/xray-inspector-desktop.png" });
});

test("X Ray tiene un control reconocible en la cabecera de cada laboratorio", async ({ page }) => {
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ["/", "/first-principles", "/compare", "/playground", "/events", "/security", "/contracts", "/systems", "/build-api", "/advanced"]) {
      await page.goto(path);
      const toggle = page.locator(".topbar").getByRole("button", { name: "X Ray Mode", exact: true });
      await expect(toggle).toHaveCount(1); await expect(toggle).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (path === "/systems") await page.locator(".topbar").screenshot({ path: `test-results/xray-header-${width}.png` });
    }
  }
});

test("el modo X Ray se comparte entre capítulos, pestañas, protocolos y SSE", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) calls.push(request.url()); });
  await page.goto("/first-principles?chapter=3");
  const toggle = page.getByRole("button", { name: "X Ray Mode", exact: true });
  await toggle.click(); await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await openCourseArea(page, "Laboratorios");
  await page.getByRole("link", { name: "Red y transporte", exact: true }).click();
  await expect(page).toHaveURL(/playground\?tab=network/);
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".inspector:visible .xray-metadata")).toHaveCount(0);
  for (const name of [/^GraphQL/, /^RPC/]) {
    await page.getByRole("tab", { name }).click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".inspector:visible .xray-metadata")).toHaveCount(0);
  }
  await page.getByRole("link", { name: "Comunicación y eventos", exact: true }).click();
  await page.getByRole("tab", { name: /^SSE real/ }).click();
  await page.getByRole("button", { name: "Abrir SSE real", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Completado: 3 eventos" })).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".inspector:visible .xray-metadata")).toHaveCount(0);
  const count = calls.length;
  await toggle.click();
  await expect(page.locator(".inspector:visible .xray-metadata")).toBeVisible();
  expect(calls).toHaveLength(count); expect(count).toBe(1);
});

test("un interruptor gobierna ambas capturas del comparador sin cambiar sus eventos", async ({ page }) => {
  let posts = 0;
  page.on("request", request => { if (request.method() === "POST" && new URL(request.url()).pathname === "/api/orders") posts++; });
  await page.goto("/compare");
  await page.getByRole("button", { name: "Crear pedido real", exact: true }).click();
  const inspectors = page.locator(".inspector:visible");
  await expect(inspectors).toHaveCount(2);
  const ids = await inspectors.evaluateAll(elements => elements.map(element => element.getAttribute("data-event-id")));
  const toggle = page.getByRole("button", { name: "X Ray Mode", exact: true });
  await toggle.click(); await expect(page.locator(".xray-metadata:visible")).toHaveCount(0);
  await toggle.click(); await expect(page.locator(".xray-metadata:visible")).toHaveCount(2);
  expect(await inspectors.evaluateAll(elements => elements.map(element => element.getAttribute("data-event-id")))).toEqual(ids);
  expect(posts).toBe(1);
});
