import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("GET, POST, errores y favoritos mantienen significado y contexto en las tres profundidades", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) calls.push(request.url()); });
  await page.goto("/follow-the-click");
  await page.getByLabel("Simulación", { exact: true }).check();
  const inspector = page.locator(".inspector");
  const levels = ["1Intuition", "2Engineering", "3Internals"];
  for (const scenario of ["200", "201", "404", "200", "400", "401", "403"]) {
    await page.getByLabel("Inyectar condición").selectOption(scenario);
    await page.getByRole("button", { name: "Ejecutar escenario", exact: true }).click();
    await page.locator(".timeline").getByRole("button").nth(2).click();
    const capture = await inspector.getAttribute("data-capture-id"), selected = await inspector.getAttribute("data-event-id");
    const query = scenario === "200" || scenario === "404";
    const concepts = query ? [/consult/, /GET/, /GET/] : [/cree un pedido/, /JSON/, /Idempotency-Key/];
    for (const [index, level] of levels.entries()) {
      await inspector.getByRole("button", { name: level, exact: true }).click();
      await expect(inspector.locator(".explanation > p")).toContainText(concepts[index]);
      await expect(inspector).toHaveAttribute("data-event-id", selected!);
      await expect(inspector).toHaveAttribute("data-capture-id", capture!);
    }
    await inspector.getByRole("button", { name: "Código", exact: true }).click();
    for (const level of levels) {
      await inspector.getByRole("button", { name: level, exact: true }).click();
      await expect(inspector.getByRole("button", { name: "Código", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(inspector).toHaveAttribute("data-event-id", selected!);
    }
    await expect(inspector.locator("pre")).toContainText(query ? "{ headers }" : 'method: "POST"');
    await inspector.getByRole("button", { name: "Explicación causal", exact: true }).click();
    await page.locator(".timeline").getByRole("button").last().click();
    for (const level of levels) {
      await inspector.getByRole("button", { name: level, exact: true }).click();
      await expect(inspector.locator(".explanation > p")).toContainText(Number(scenario) >= 400 ? /error|rechazo/ : /estado|setter|commit/);
    }
    if (scenario === "201") {
      await page.getByRole("button", { name: "Guardar en favoritos" }).click();
      await page.locator(".timeline").getByRole("button").last().click();
      for (const [index, level] of levels.entries()) {
        await inspector.getByRole("button", { name: level, exact: true }).click();
        await expect(inspector.locator(".explanation > p")).toContainText([/favorito/, /setFavorite/, /paint/][index]);
      }
      await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
      await page.getByRole("button", { name: "Pausar", exact: true }).click();
      await expect(page.getByRole("button", { name: "Quitar de favoritos" })).toHaveAttribute("aria-pressed", "true");
    }
  }
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(calls).toEqual([]);
});

test("la compra y el rechazo reales registran setters sin atribuirles un paint observado", async ({ page }) => {
  let posts = 0;
  page.on("request", request => { if (request.method() === "POST" && new URL(request.url()).pathname === "/api/orders") posts++; });
  await page.goto("/follow-the-click");
  const inspector = page.locator(".inspector");
  for (const credential of ["demo-buyer", "demo-reader"]) {
    await page.getByLabel("Credencial demostrativa").selectOption(credential);
    await page.getByRole("button", { name: "Comprar ahora", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(credential === "demo-buyer" ? "Pedido real creado" : "HTTP 403");
    await page.locator(".timeline").getByRole("button").last().click();
    await expect(inspector.getByRole("heading", { name: "El cliente solicita actualizar el estado" })).toBeVisible();
    await inspector.getByRole("button", { name: "3Internals", exact: true }).click();
    await expect(inspector.locator(".explanation > p")).toContainText(/[Nn]o .*commit/);
    await expect(inspector.locator(".explanation > p")).toContainText("paint");
    await inspector.getByRole("button", { name: "Código", exact: true }).click();
    await expect(inspector.locator("pre")).toContainText("setNotice(message)");
    if (credential === "demo-reader") await expect(inspector.locator("pre")).not.toContainText("setActualOrder");
    await inspector.getByRole("button", { name: "Explicación causal", exact: true }).click();
  }
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(posts).toBe(2);
});

for (const path of ["/compare", "/build-api"]) test(`la consola ${path} describe GET y PATCH y sus setters sin heredar creación`, async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/orders")) calls.push(request.method()); });
  await page.goto(path);
  const console = page.getByRole("region", { name: "Un pedido HTTP real", exact: true });
  await console.getByRole("button", { name: "Crear pedido real", exact: true }).click();
  await expect(console.getByRole("status").first()).toContainText("HTTP 201");
  const inspector = console.locator(".inspector");
  for (const [button, method] of [["Consultar real", "GET"], ["Confirmar real", "PATCH"]]) {
    await console.getByRole("button", { name: button, exact: true }).click();
    await expect(console.getByRole("status").first()).toContainText("HTTP 200");
    if (path === "/build-api") {
      await console.locator(".timeline").getByRole("button").nth(1).click();
      for (const level of ["1Intuition", "2Engineering", "3Internals"]) {
        await inspector.getByRole("button", { name: level, exact: true }).click();
        await expect(inspector.locator(".explanation > p")).not.toContainText(/precio del producto|cantidad|prepara una creación/);
      }
    }
    await console.locator(".timeline").getByRole("button").last().click();
    await inspector.getByRole("button", { name: "3Internals", exact: true }).click();
    await expect(inspector.locator(".explanation > p")).toContainText("No se instrumenta el commit de React ni el paint");
    await inspector.getByRole("button", { name: "Código", exact: true }).click();
    await expect(inspector.locator("pre")).toContainText("setOrder(body.order)");
    await inspector.getByRole("button", { name: "Request / Response", exact: true }).click();
    await expect(inspector.locator(".code-caption").first()).toContainText(method);
    await inspector.getByRole("button", { name: "Explicación causal", exact: true }).click();
  }
  await console.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await console.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(calls).toEqual(["POST", "GET", "PATCH"]);
});

test("compra real, consulta, reproducción sin efectos y acción local", async ({ page, request }) => {
  const posts: string[] = [];
  page.on("request", req => { if (req.method() === "POST" && req.url().endsWith("/api/orders")) posts.push(req.url()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Sigue el click." })).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  await page.getByLabel("Cantidad", { exact: true }).selectOption("2");
  const responsePromise = page.waitForResponse(response => response.url().endsWith("/api/orders") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Comprar ahora" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.order.totalMinor).toBe(17800);
  await expect(page.getByRole("status")).toContainText(body.order.id);
  const retrieved = await request.get(`/api/orders/${body.order.id}`, { headers: { Authorization: "Bearer demo-reader" } });
  expect(retrieved.status()).toBe(200);
  expect((await retrieved.json()).order.id).toBe(body.order.id);
  await page.getByRole("button", { name: "Reproducir desde el inicio" }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).click();
  await page.getByRole("button", { name: "Paso anterior", exact: true }).click();
  expect(posts).toHaveLength(1);
  await page.getByRole("button", { name: "Guardar en favoritos" }).click();
  await expect(page.getByRole("status")).toContainText("sin fetch");
  await expect(page.getByRole("group", { name: "Operación dentro del navegador, sin red" })).toBeVisible();
  expect(posts).toHaveLength(1);
  await page.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(page.getByText("Esta operación no envió mensajes por HTTP.")).toBeVisible();
});

test("el servidor distingue 401 de 403 desde la consola", async ({ page }) => {
  await page.goto("/follow-the-click");
  await page.getByLabel("Credencial demostrativa").selectOption("");
  await page.getByRole("button", { name: "Comprar ahora" }).click();
  await expect(page.getByRole("status")).toContainText("HTTP 401");
  await page.getByLabel("Credencial demostrativa").selectOption("demo-reader");
  await page.getByRole("button", { name: "Comprar ahora" }).click();
  await expect(page.getByRole("status")).toContainText("HTTP 403");
  await page.getByRole("button", { name: "Paso 6: Se comprueba el permiso", exact: true }).click();
  await expect(page.getByText("FORBIDDEN", { exact: true })).toBeVisible();
  const eventId = (await page.locator(".xray-metadata").textContent()) ?? "";
  await page.getByRole("button", { name: "3Internals", exact: true }).click();
  await expect(page.locator(".xray-metadata")).toHaveText(eventId);
  await expect(page.getByText("La autorización se decide en el servidor.", { exact: false })).toBeVisible();
});

test("simular fallo antes de entrega y respuesta perdida cambia el flujo sin enviar HTTP", async ({ page }) => {
  let posts = 0;
  page.on("request", req => { if (req.method() === "POST") posts++; });
  await page.goto("/");
  await page.getByLabel("Simulación", { exact: true }).check();
  await page.getByLabel("Inyectar condición").selectOption("network");
  await page.getByRole("button", { name: "Ejecutar escenario" }).click();
  await expect(page.getByRole("button", { name: "Inspeccionar Servidor", exact: true })).toHaveAttribute("aria-disabled", "true");
  await page.getByLabel("Inyectar condición").selectOption("timeout");
  await page.getByRole("button", { name: "Ejecutar escenario" }).click();
  await page.getByRole("button", { name: /Paso \d+: El pedido existe, pero la respuesta se pierde/ }).click();
  await expect(page.getByText("TIMEOUT", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(page.getByText("No existe una respuesta HTTP en esta captura.")).toBeVisible();
  expect(posts).toBe(0);
});

test("perder la respuesta después de guardar conserva la clave y el payload al reintentar", async ({ page }) => {
  const keys: string[] = [];
  const bodies: string[] = [];
  let createdId = "";
  await page.route("**/api/orders", async route => {
    keys.push(route.request().headers()["idempotency-key"]);
    bodies.push(route.request().postData() ?? "");
    const response = await route.fetch();
    if (keys.length === 1) {
      expect(response.status()).toBe(201);
      createdId = (await response.json()).order.id;
      await route.abort("failed");
    } else {
      expect(response.status()).toBe(200);
      expect((await response.json()).order.id).toBe(createdId);
      await route.fulfill({ response });
    }
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Comprar ahora" }).click();
  await expect(page.getByRole("button", { name: "Reintentar misma operación" })).toBeVisible();
  await expect(page.getByLabel("Cantidad", { exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Reintentar misma operación" }).click();
  await expect(page.getByRole("status")).toContainText("Pedido recuperado, sin duplicar");
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
  expect(bodies[0]).toBe(bodies[1]);
  await expect(page.getByLabel("Cantidad", { exact: true })).toBeEnabled();
});

test("móvil y teclado mantienen la consola operable sin desbordar la página", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Comprar ahora" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
