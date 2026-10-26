import { openCourseArea } from "./helpers/navigation";
import { expect, test } from "@playwright/test";

test("negocia JSON y texto, revalida con 304 y evalúa el capítulo HTTP", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/lab/http")) calls.push(request.url()); });
  await page.goto("/playground");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Del dato al mensaje");
  await page.getByLabel("URL local", { exact: true }).fill("/api/lab/http#solo-local");
  await page.getByLabel("Params query", { exact: false }).fill("message=Hola+red&x=1&x=2");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  const response = page.getByRole("region", { name: "Respuesta HTTP observada" });
  await expect(response).toContainText("HTTP 200"); await expect(response).toContainText("Hola red");
  expect(calls[0]).not.toContain("#");
  await page.getByLabel("Headers configurados", { exact: false }).fill("Accept: text/plain");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(response).toContainText("GET: Hola red");
  await page.getByRole("button", { name: "Usar ETag recibido", exact: true }).click();
  await expect(page.getByLabel("Headers configurados", { exact: false })).toHaveValue(/If-None-Match:/);
  expect(calls).toHaveLength(2);
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(response).toContainText("HTTP 304"); await expect(response).toContainText("Body vacío");
  await page.getByRole("radio", { name: "No necesariamente: el efecto pretendido puede permanecer igual." }).check();
  await page.getByRole("button", { name: "Comprobar HTTP", exact: true }).click();
  await expect(page.getByText("Exploración completa:", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(calls).toHaveLength(3);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-course-v1")!).chapters[5].quizPassed)).toBe(true);
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
});

test("presets de pedido, permisos y métodos no soportados conservan status y body", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "Cargar creación", exact: true }).click();
  await expect(page.getByLabel("Headers configurados", { exact: false })).toHaveValue(/Idempotency-Key:/);
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  const response = page.getByRole("region", { name: "Respuesta HTTP observada" });
  await expect(response).toContainText("HTTP 201");
  await page.getByRole("button", { name: "Cargar confirmación", exact: true }).click();
  await page.getByLabel("Headers configurados", { exact: false }).fill("Content-Type: application/json\nAuthorization: Bearer demo-reader");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(response).toContainText("HTTP 403");
  await page.getByLabel("Headers configurados", { exact: false }).fill("Content-Type: application/json\nAuthorization: Bearer demo-buyer");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(response).toContainText("confirmed");
  await page.getByRole("button", { name: "Cargar consulta", exact: true }).click();
  await page.getByLabel("Método HTTP", { exact: true }).selectOption("PUT");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(response).toContainText("HTTP 405"); await expect(response).toContainText("Body vacío");
  await page.getByRole("button", { name: "Cargar POST diagnóstico", exact: true }).click();
  await page.getByLabel("Body · texto exacto", { exact: false }).fill("{");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(response).toContainText("HTTP 400"); await expect(response).toContainText("INVALID_JSON");
  await page.getByLabel("Body · texto exacto", { exact: false }).fill('{"value":2}');
  for (const method of ["PUT", "DELETE"]) {
    await page.getByLabel("Método HTTP", { exact: true }).selectOption(method);
    await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
    await expect(response).toContainText(`"method":"${method}"`); await expect(response).toContainText("HTTP 200");
  }
});

test("rechaza edición fuera del contrato sin enviar tráfico", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); });
  await page.goto("/playground");
  await page.getByLabel("URL local", { exact: true }).fill("https://example.com/api/orders");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(page.locator(".http-editor-panel").getByRole("status").filter({ hasText: "Error de edición" })).toContainText("Solo se permiten");
  await page.getByRole("button", { name: "Cargar GET diagnóstico", exact: true }).click();
  await page.getByLabel("Headers configurados", { exact: false }).fill("Host: example.com");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(page.locator(".http-editor-panel").getByRole("status").filter({ hasText: "Error de edición" })).toContainText("Header no admitido");
  expect(calls).toEqual([]);
});

test("HTTP3 recupera contenido y UDP no inventa transporte fiable ni respuesta HTTP", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); });
  await page.goto("/playground");
  await page.getByRole("tab", { name: /Red conceptual/ }).click();
  await page.getByLabel("Pila del modelo").selectOption("h3");
  await page.getByRole("checkbox", { name: "Perder la unidad 2", exact: true }).check();
  await page.getByRole("button", { name: "Ejecutar modelo de red", exact: true }).click();
  await expect(page.getByRole("button", { name: /Paso \d+: QUIC prepara transporte y seguridad/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Paso \d+: TCP establece/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Paso \d+: QUIC recupera el contenido perdido/ })).toBeVisible();
  await page.getByLabel("Pila del modelo").selectOption("udp");
  await expect(page.getByText("Ajustes pendientes:", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Ejecutar modelo de red", exact: true }).click();
  await expect(page.getByRole("region", { name: "Ruta conceptual y entrega", exact: true })).toContainText("contenido ausente");
  await page.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(page.getByText("Esta captura conceptual no detalla un intercambio HTTP.", { exact: false })).toBeVisible();
  await page.getByRole("radio", { name: "QUIC añade streams fiables y recuperación sobre UDP." }).check();
  await page.getByRole("button", { name: "Comprobar red", exact: true }).click();
  await expect(page.getByText("Exploración completa:", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reproducir", exact: true }).click();
  await page.getByRole("tab", { name: /HTTP real/ }).click();
  await page.getByRole("tab", { name: /Red conceptual/ }).click();
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0);
  expect(calls).toEqual([]);
});

test("GraphQL y RPC usan contratos compartidos y conservan campos entre pestañas", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("tab", { name: /GraphQL/ }).click();
  await page.getByRole("checkbox", { name: "id", exact: true }).uncheck();
  await page.getByLabel("Operación del modelo GraphQL").selectOption("confirm");
  await expect(page.getByRole("tabpanel", { name: /GraphQL/ }).getByLabel("Invocación generada", { exact: false })).toHaveValue(/mutation ConfirmOrder/);
  await page.getByRole("button", { name: "Ejecutar modelo GraphQL", exact: true }).click();
  await expect(page.getByTestId("graphql-result")).toContainText('"status": "confirmed"');
  await expect(page.getByTestId("graphql-result")).not.toContainText('"id"');
  await page.getByRole("tab", { name: /RPC \/ gRPC/ }).click();
  await page.getByLabel("Mecanismo remoto").selectOption("grpc");
  await page.getByLabel("Modalidad de streaming").selectOption("bidi");
  await page.getByRole("button", { name: "Ejecutar modelo RPC", exact: true }).click();
  await expect(page.getByRole("region", { name: "Contrato y resultado rpc" })).toContainText("stream OrderRequest");
  await expect(page.getByTestId("rpc-result")).toContainText('"grpcStatus": "OK"');
  await page.getByRole("tab", { name: /GraphQL/ }).click();
  await expect(page.getByRole("checkbox", { name: "id", exact: true })).not.toBeChecked();
  await expect(page.getByTestId("graphql-result")).toContainText("confirmed");
});

test("JSON inválido recibido conserva status, headers y texto original", async ({ page }) => {
  await page.route("**/api/lab/http?**", route => route.fulfill({ status: 200, headers: { "Content-Type": "application/json", "X-Trace-Id": "malformed-response" }, body: "{invalid-json" }));
  await page.goto("/playground");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  const response = page.getByRole("region", { name: "Respuesta HTTP observada" });
  await expect(response).toContainText("HTTP 200"); await expect(response).toContainText("malformed-response");
  await expect(response).toContainText("{invalid-json");
  await page.getByRole("button", { name: /Paso \d+: Se interpreta el JSON recibido/ }).click();
  await expect(page.getByText("INVALID_RESPONSE_JSON", { exact: true })).toBeVisible();
  await expect(page.locator("#panel-http .xray-metadata")).toContainText("malformed-response:2");
});

test("respuesta de creación perdida conserva la solicitud al cambiar pestañas y reintenta la misma clave", async ({ page }) => {
  const keys: string[] = []; let orderId = "";
  await page.route("**/api/orders", async route => {
    keys.push(route.request().headers()["idempotency-key"]);
    if (keys.length === 1) { const response = await route.fetch(); orderId = (await response.json()).order.id; await route.abort("failed"); }
    else await route.continue();
  });
  await page.goto("/playground");
  await page.getByRole("button", { name: "Cargar creación", exact: true }).click();
  const payload = await page.getByLabel("Body · texto exacto", { exact: false }).inputValue();
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(page.getByRole("button", { name: "Reintentar solicitud exacta", exact: true })).toBeVisible();
  await page.getByRole("tab", { name: /Red conceptual/ }).click();
  await page.getByRole("tab", { name: /HTTP real/ }).click();
  await expect(page.getByLabel("URL local", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Body · texto exacto", { exact: false })).toHaveValue(payload);
  await page.getByRole("button", { name: "Reintentar solicitud exacta", exact: true }).click();
  await expect(page.getByRole("region", { name: "Respuesta HTTP observada" })).toContainText(orderId);
  await expect(page.getByRole("region", { name: "Respuesta HTTP observada" })).toContainText("HTTP 200");
  expect(keys).toHaveLength(2); expect(keys[0]).toBe(keys[1]);
});

test("un fallo al leer body no borra el Response ya recibido", async ({ page }) => {
  await page.goto("/playground");
  await page.evaluate(() => {
    const original = window.fetch;
    window.fetch = async (...args) => {
      const response = await original(...args);
      if (!String(args[0]).includes("/api/lab/http")) return response;
      const stream = new ReadableStream({ start(controller) { controller.error(new Error("Lectura interrumpida para prueba")); } });
      return new Response(stream, { status: response.status, headers: response.headers });
    };
  });
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  const response = page.getByRole("region", { name: "Respuesta HTTP observada" });
  await expect(response).toContainText("HTTP 200"); await expect(response).toContainText("No se pudo leer el body");
  await expect(response).toContainText("etag");
  await page.locator("#panel-http .timeline button").last().click();
  await expect(page.getByText("BODY_READ_FAILURE", { exact: true })).toBeVisible();
});

test("móvil y teclado navegan pestañas, mantienen el borrador y no desbordan", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/playground");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.locator("#experiment")).toBeFocused();
  await page.getByLabel("Params query", { exact: false }).fill("message=Borrador");
  await page.getByRole("tab", { name: /HTTP real/ }).focus(); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Red conceptual/ })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Ejecutar modelo de red", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("tab", { name: /Red conceptual/ }).focus(); await page.keyboard.press("Home");
  await expect(page.getByLabel("Params query", { exact: false })).toHaveValue("message=Borrador");
  await page.getByRole("button", { name: "Enviar petición", exact: true }).click();
  await expect(page.getByRole("region", { name: "Respuesta HTTP observada" })).toContainText("Borrador");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await openCourseArea(page, "Aprendizaje y mapa"); await page.getByRole("link", { name: "Comparar interfaces", exact: true }).click(); await expect(page).toHaveURL(/compare$/);
  await openCourseArea(page, "Laboratorios"); await page.getByRole("link", { name: "HTTP: petición y respuesta", exact: true }).click(); await expect(page).toHaveURL(/playground\?tab=http$/);
});
