import { expect, test } from "@playwright/test";

test("la selección espera a que sus handlers estén conectados, incluso con JavaScript retrasado", async ({ page }) => {
  let release!: () => void;
  const ready = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/_next/static/chunks/*.js", async route => { await ready; await route.continue(); });
  try {
    await page.goto("/compare", { waitUntil: "commit" });
    await expect(page.getByLabel("Interfaz A", { exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Ejecutar comparación", exact: true })).toBeDisabled();
  } finally { release(); }
  await expect(page.getByLabel("Interfaz A", { exact: true })).toBeEnabled();
  await page.getByLabel("Interfaz A", { exact: true }).selectOption("polling");
  await page.getByRole("button", { name: "Ejecutar comparación", exact: true }).click();
  await expect(page.getByRole("article", { name: "Alternativa A: Polling" })).toBeVisible();
});

test("proyecta campos GraphQL y cambia el flujo gRPC sin tráfico real", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) requests.push(request.url()); });
  await page.goto("/compare");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("El mismo pedido.");
  await page.getByLabel("Interfaz A", { exact: true }).selectOption("graphql");
  await page.getByLabel("Interfaz B", { exact: true }).selectOption("grpc");
  await page.getByRole("checkbox", { name: "id", exact: true }).uncheck();
  await expect(page.getByRole("checkbox", { name: "status", exact: true })).toBeDisabled();
  await page.getByLabel("Objetivo de negocio").selectOption("confirm");
  await page.getByLabel("Modalidad gRPC ilustrativa").selectOption("client");
  await expect(page.getByRole("status").filter({ hasText: "Ajustes pendientes" })).toBeVisible();
  await page.getByRole("button", { name: "Ejecutar comparación" }).click();
  await expect(page.getByTestId("result-A")).toContainText('"status": "confirmed"');
  await expect(page.getByTestId("result-A")).not.toContainText('"id"');
  await expect(page.getByTestId("result-B")).toContainText('"orders"');
  await page.getByRole("button", { name: "Inspeccionar traza B" }).click();
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).click();
  await page.getByRole("button", { name: "3Internals", exact: true }).click();
  await expect(page.getByLabel("Fronteras de la alternativa activa")).toContainText("Se envían los argumentos");
  await page.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(page.getByText("Esta captura conceptual no detalla un intercambio HTTP.", { exact: false })).toBeVisible();
  expect(requests).toEqual([]);
});

test("polling y suscripción separan comando y observación que resuelve la incertidumbre", async ({ page }) => {
  await page.goto("/compare");
  await page.getByLabel("Interfaz A", { exact: true }).selectOption("polling");
  await page.getByLabel("Interfaz B", { exact: true }).selectOption("subscription");
  await page.getByLabel("Objetivo de negocio").selectOption("confirm");
  await page.getByLabel("Condición del modelo").selectOption("lost");
  await page.getByRole("button", { name: "Ejecutar comparación" }).click();
  for (const label of ["A: Polling", "B: Suscripción a eventos"]) {
    const card = page.getByRole("article", { name: `Alternativa ${label}` });
    await expect(card).toContainText("confirmed → Resultado conocido");
    await expect(card).toContainText("1 cambios de estado");
  }
  await expect(page.getByRole("button", { name: /Paso \d+: Consulta periódica 3 de 3/ })).toBeVisible();
  await page.getByRole("button", { name: /Paso \d+: Se pierde la respuesta remota/ }).click();
  await expect(page.getByText("RESPONSE_LOST", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Inspeccionar traza B" }).click();
  await expect(page.getByRole("button", { name: /Paso \d+: El proveedor entrega order.confirmed/ })).toBeVisible();
  await page.getByLabel("Objetivo de negocio").selectOption("read");
  await page.getByLabel("Condición del modelo").selectOption("success");
  await page.getByRole("button", { name: "Ejecutar comparación" }).click();
  await expect(page.getByTestId("result-B")).toContainText('"status": "created"');
  await expect(page.getByRole("button", { name: /Paso \d+: Se envía un comando separado/ })).toHaveCount(0);
  await expect(page.getByText("Operaciones exploradas: 2/2.", { exact: false })).toBeVisible();
});

test("SOAP y XML RPC muestran contratos XML válidos y evaluación razonada", async ({ page }) => {
  await page.goto("/compare");
  await page.getByLabel("Interfaz A", { exact: true }).selectOption("soap");
  await page.getByLabel("Interfaz B", { exact: true }).selectOption("xmlrpc");
  await page.getByLabel("Condición del modelo").selectOption("missing");
  await page.getByRole("button", { name: "Ejecutar comparación" }).click();
  const a = page.getByRole("article", { name: "Alternativa A: SOAP" });
  const b = page.getByRole("article", { name: "Alternativa B: XML RPC" });
  for (const card of [a, b]) {
    for (const text of await card.locator("details pre").allTextContents()) {
      if (text.trim().startsWith("<")) expect(await page.evaluate(xml => new DOMParser().parseFromString(xml, "text/xml").querySelector("parsererror")?.textContent ?? null, text)).toBeNull();
    }
  }
  await expect(page.getByTestId("result-A")).toContainText("soap:Fault");
  await expect(page.getByTestId("result-B")).toContainText("faultCode");
  await page.getByRole("radio", { name: "El pedido sigue created porque el cliente no recibió éxito." }).check();
  await page.getByRole("button", { name: "Comprobar razonamiento" }).click();
  await expect(page.getByRole("status").filter({ hasText: "La recepción de la respuesta" })).toBeVisible();
  await page.getByRole("radio", { name: "El cliente no sabe el resultado; puede consultar o repetir un comando idempotente." }).check();
  await page.getByRole("button", { name: "Comprobar razonamiento" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Correcto. Una lectura" })).toBeVisible();
});

test("HTTP real crea, consulta y confirma con permisos y reproducción sin efectos", async ({ page }) => {
  const requests: { method: string; url: string }[] = [];
  page.on("request", request => { if (request.url().includes("/api/orders")) requests.push({ method: request.method(), url: request.url() }); });
  await page.goto("/compare");
  const console = page.getByRole("region", { name: "Un pedido HTTP real", exact: true });
  await console.getByRole("button", { name: "Crear pedido real", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("HTTP 201");
  await expect(console.getByLabel("Último pedido real conocido")).toContainText("created");
  await console.getByRole("button", { name: "Confirmar real", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("HTTP 200");
  await expect(console.getByLabel("Último pedido real conocido")).toContainText("confirmed");
  await console.getByLabel("Credencial real de demostración").selectOption("reader");
  await console.getByRole("button", { name: "Confirmar real", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("HTTP 403");
  await expect(console.locator(".timeline-stop.failed")).toHaveCount(2);
  await console.getByRole("button", { name: /Paso \d+: El cliente interpreta el rechazo HTTP/ }).click();
  await expect(console.getByText("FORBIDDEN", { exact: true })).toBeVisible();
  await console.getByRole("button", { name: "Consultar real", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("HTTP 200");
  await expect(console.getByLabel("Último pedido real conocido")).toContainText("confirmed");
  const count = requests.length;
  await console.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await console.getByRole("button", { name: "Pausar", exact: true }).click();
  await console.getByRole("button", { name: "Paso siguiente", exact: true }).click();
  await console.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(console.locator(".exchange-grid")).toContainText('"method": "GET"');
  expect(requests.length).toBe(count);
  expect(requests.filter(request => request.method === "POST")).toHaveLength(1);
  await console.getByLabel("Credencial real de demostración").selectOption("none");
  await console.getByRole("button", { name: "Consultar real", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("HTTP 401");
  await expect(console.locator(".timeline-stop.failed")).toHaveCount(2);
});

test("una creación con respuesta perdida conserva clave y recupera el mismo pedido", async ({ page }) => {
  const keys: string[] = [];
  let originalId = "";
  await page.route("**/api/orders", async route => {
    keys.push(route.request().headers()["idempotency-key"]);
    if (keys.length === 1) {
      const response = await route.fetch(); originalId = (await response.json()).order.id;
      await route.abort("failed");
    } else await route.continue();
  });
  await page.goto("/compare");
  const console = page.getByRole("region", { name: "Un pedido HTTP real", exact: true });
  await console.getByRole("button", { name: "Crear pedido real", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("Resultado incierto");
  await expect(console.getByLabel("Credencial real de demostración")).toBeDisabled();
  await console.getByRole("button", { name: "Reintentar creación", exact: true }).click();
  await expect(console.getByRole("status")).toContainText("HTTP 200");
  await expect(console.getByLabel("Último pedido real conocido")).toContainText(originalId);
  expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
});

test("navegación por teclado y móvil sin desbordar la página", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/compare");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#experiment")).toBeFocused();
  await page.getByLabel("Interfaz A", { exact: true }).focus();
  await page.keyboard.press("g"); await page.keyboard.press("Enter");
  await expect(page.getByLabel("Interfaz A", { exact: true })).toHaveValue("graphql");
  await page.getByRole("button", { name: "Ejecutar comparación" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "API Universe", exact: true }).click();
  await expect(page).toHaveURL(/api-universe$/);
  await page.getByRole("link", { name: "Comparar interfaces", exact: true }).click();
  await expect(page).toHaveURL(/compare$/);
});
