import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

const routes = ["/", "/follow-the-click", "/course", "/first-principles", "/api-universe", "/compare", "/playground", "/events", "/security", "/contracts", "/systems", "/build-api", "/advanced", "/reference", "/challenges"];

for (const route of routes) {
  test(`AC-3/4/6: ${route} conserva contenido, foco y navegación en tres tamaños`, async ({ page, browserName }, testInfo) => {
    const errors: string[] = [], calls: string[] = [], measurements = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) calls.push(request.url()); });
    for (const width of [1440, 701, 390]) {
      await page.goto("about:blank");
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(route);
      expect([200, 304]).toContain(response?.status());
      await expect(page.getByRole("navigation", { name: "Navegación principal", exact: true })).toBeVisible();
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
      await expect(page.getByRole("button", { name: "", exact: true })).toHaveCount(0);
      for (const role of ["textbox", "combobox", "spinbutton", "checkbox", "radio"] as const) {
        await expect(page.getByRole(role, { name: "", exact: true })).toHaveCount(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const missing = await page.locator('a[href^="#"]').evaluateAll(links => links.map(link => link.getAttribute("href")!).filter(href => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))));
      expect(missing).toEqual([]);
      await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
      const skip = page.locator(".skip-link");
      await expect(skip).toBeFocused();
      expect(await skip.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe("none");
      await page.keyboard.press("Enter");
      await expect(page.getByRole("main")).toBeFocused();
      measurements.push(await page.evaluate(({ route, width }) => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        const scripts = performance.getEntriesByType("resource").filter(entry => entry.name.includes("/_next/") && new URL(entry.name).pathname.endsWith(".js")) as PerformanceResourceTiming[];
        return { route, width, ttfbMs: navigation.responseStart - navigation.requestStart, domContentLoadedMs: navigation.domContentLoadedEventEnd, scriptBytes: scripts.reduce((sum, script) => sum + script.encodedBodySize, 0), scriptCount: scripts.length };
      }, { route, width }));
    }
    expect(errors).toEqual([]);
    expect(calls).toEqual([]);
    await testInfo.attach("navigation-measurements", { body: JSON.stringify(measurements, null, 2), contentType: "application/json" });
    await testInfo.attach("accessible-content", { body: await page.getByRole("main").ariaSnapshot(), contentType: "text/plain" });
    await page.screenshot({ path: testInfo.outputPath("mobile.png"), fullPage: true });
  });
}

test("AC-2/5/6: compra, confirmación, permisos y replay funcionan contra HTTP real", async ({ page }, testInfo) => {
  const requests: string[] = [], receipts: { method: string; status: number; responseEndMs: number; orderStatus?: string; error?: string }[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) requests.push(request.method()); });
  await page.goto("/build-api");
  const real = page.getByRole("region", { name: "Un pedido HTTP real", exact: true });
  async function operate(name: string, method: string, status: number) {
    const pending = page.waitForResponse(response => new URL(response.url()).pathname.startsWith("/api/orders") && response.request().method() === method);
    await real.getByRole("button", { name, exact: true }).click();
    const response = await pending;
    expect(response.status()).toBe(status);
    const body = await response.json();
    await response.finished();
    receipts.push({ method, status, responseEndMs: response.request().timing().responseEnd, orderStatus: body.order?.status, error: body.error?.code });
    await expect(real.getByRole("status").first()).toContainText(`HTTP ${status}`);
    return body;
  }
  const created = await operate("Crear pedido real", "POST", 201);
  expect((await operate("Confirmar real", "PATCH", 200)).order.status).toBe("confirmed");
  const repeated = await operate("Repetir POST original", "POST", 200);
  expect(repeated.order.id).toBe(created.order.id);
  expect(repeated.order.status).toBe("created");
  expect((await operate("Consultar real", "GET", 200)).order.status).toBe("confirmed");
  await real.getByLabel("Credencial real de demostración").selectOption("reader");
  await operate("Confirmar real", "PATCH", 403);
  await real.getByLabel("Credencial real de demostración").selectOption("none");
  await operate("Consultar real", "GET", 401);
  const before = requests.length;
  await real.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("tab", { name: /^Código ejecutado/ }).click();
  await page.getByRole("tab", { name: /^Aplicación/ }).click();
  await expect(real.getByRole("button", { name: "Reproducir", exact: true })).toBeVisible();
  await page.goto("/");
  await page.getByRole("button", { name: "Guardar en favoritos" }).click();
  await expect(page.getByRole("status")).toContainText("sin fetch");
  expect(requests).toHaveLength(before);
  await testInfo.attach("http-receipts", { body: JSON.stringify(receipts, null, 2), contentType: "application/json" });
});

test("AC-3: los colores de texto y controles conservan contraste y reducción de movimiento", async ({ page }, testInfo) => {
  await page.goto("/");
  const ratios = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    function luminance(token: string) {
      const hex = style.getPropertyValue(token).trim().slice(1);
      const channels = [0, 2, 4].map(index => parseInt(hex.slice(index, index + 2), 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    }
    const foregrounds = ["--ink", "--body", "--muted", "--accent", "--consumer", "--contract", "--data", "--error", "--persistent", "--control-border"];
    const pairs = foregrounds.flatMap(foreground => ["--canvas", "--surface", "--raised"].map(background => ({ foreground, background })));
    pairs.push({ foreground: "--on-accent", background: "--accent" });
    return pairs.map(pair => {
      const a = luminance(pair.foreground), b = luminance(pair.background);
      return { ...pair, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
    });
  });
  for (const pair of ratios) expect(pair.ratio, `${pair.foreground} / ${pair.background}`).toBeGreaterThanOrEqual(pair.foreground === "--control-border" ? 3 : 4.5);
  await expect(page.getByRole("button", { name: "Comprar ahora", exact: true })).toHaveCSS("transition-duration", "0s");
  await page.getByRole("button", { name: "Guardar en favoritos" }).click();
  await expect(page.getByRole("button", { name: "Reproducir", exact: true })).toBeVisible();
  await testInfo.attach("contrast-ratios", { body: JSON.stringify(ratios, null, 2), contentType: "application/json" });
});
