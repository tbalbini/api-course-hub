import { expect, test } from "@playwright/test";

test("SSE usa comando separado y reconectar sin historial deja el chat retrasado", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); });
  await page.goto("/events");
  await page.getByLabel("Mecanismo de comunicación").selectOption("sse");
  await page.getByLabel("Mensaje de chat del modelo").fill("Necesito una actualización");
  await page.getByRole("checkbox", { name: "Perder primera actualización después de guardar" }).check();
  await page.getByRole("checkbox", { name: "Recuperar historial con cursor al reconectar" }).uncheck();
  await page.getByRole("button", { name: "Enviar mensaje al modelo", exact: true }).click();
  await expect(page.getByRole("region", { name: "Canal y estado del chat" })).toContainText("Vista retrasada");
  await expect(page.getByRole("button", { name: /Paso \d+: POST separado envía el mensaje/ })).toBeVisible();
  await page.getByRole("button", { name: /Paso \d+: Se pierde la primera actualización/ }).click();
  await expect(page.getByText("UPDATE_LOST", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Recuperar historial con cursor al reconectar" }).check();
  await page.getByRole("button", { name: "Enviar mensaje al modelo", exact: true }).click();
  await expect(page.getByRole("region", { name: "Canal y estado del chat" })).toContainText("Vista actualizada");
  await expect(page.locator(".chat-bubble")).toHaveCount(2);
  await page.getByLabel("Mecanismo de comunicación").selectOption("websocket");
  await page.getByRole("button", { name: "Enviar mensaje al modelo", exact: true }).click();
  await expect(page.getByRole("button", { name: /Paso \d+: POST separado/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Paso \d+: El cliente envía chat.send por WebSocket/ })).toBeVisible();
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(calls).toEqual([]);
});

test("un ACK perdido reentrega el mismo id y sin filtros repite aplicaciones", async ({ page }) => {
  await page.goto("/events"); await page.getByRole("tab", { name: /Entregas/ }).click();
  await page.getByLabel("Fallo de entrega").selectOption("lost-ack");
  await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  const count = page.locator(".event-projections article dl > div").filter({ hasText: "Aplicaciones de efecto" });
  await expect(count).toHaveText("Aplicaciones de efecto2");
  await expect(page.getByRole("region", { name: "Intentos de entrega", exact: true })).toContainText("Confirmación perdida");
  await page.getByRole("button", { name: /Paso \d+: Pedidos pierde la confirmación después del efecto/ }).click();
  await expect(page.getByText("ACK_LOST", { exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Deduplicar por event.id", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Rechazar snapshot antiguo o igual", exact: true }).uncheck();
  await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  await expect(count).toHaveText("Aplicaciones de efecto3");
  await page.getByRole("checkbox", { name: "Publicar copia de pay-1 con el mismo id" }).check();
  await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  await expect(count).toHaveText("Aplicaciones de efecto4");
  await page.getByRole("button", { name: "Inspeccionar rol Receiver", exact: true }).click();
  await expect(page.locator(".event-delivery-flow .comparison-current")).toContainText("recibe pay-1");
});

test("copias publicadas tienen otro offset, relectura conserva ids y agotamiento no salta registros", async ({ page }) => {
  await page.goto("/events"); await page.getByRole("tab", { name: /Entregas/ }).click();
  await page.getByLabel("Mecanismo de entrega").selectOption("stream");
  await page.getByRole("checkbox", { name: "Publicar copia de pay-1 con el mismo id" }).check();
  await page.getByRole("checkbox", { name: "Publicar o entregar revisión 2 antes de 1" }).check();
  await page.getByRole("checkbox", { name: "Releer desde offset 0 en este experimento" }).check();
  await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  await expect(page.locator(".event-log > div")).toHaveCount(3);
  await expect(page.locator(".event-projections article dl > div").filter({ hasText: "Siguiente offset confirmado" })).toHaveText("Siguiente offset confirmado3");
  await expect(page.getByRole("region", { name: "Intentos de entrega", exact: true }).locator("tbody tr")).toHaveCount(6);
  await page.getByLabel("Fallo de entrega").selectOption("exhaust");
  await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  await expect(page.locator(".event-projections article dl > div").filter({ hasText: "Siguiente offset confirmado" })).toHaveText("Siguiente offset confirmado0");
  const rows = await page.getByRole("region", { name: "Intentos de entrega", exact: true }).locator("tbody tr").allTextContents();
  expect(rows.every(text => text.includes("offset 0"))).toBe(true);
  await expect(page.locator(".event-projections")).toContainText("pending");
});

test("pub/sub permite inspeccionar dos ramas y deja Analítica adelantada", async ({ page }) => {
  await page.goto("/events"); await page.getByRole("tab", { name: /Entregas/ }).click();
  await page.getByLabel("Mecanismo de entrega").selectOption("pubsub");
  await page.getByLabel("Fallo de entrega").selectOption("exhaust");
  await page.getByRole("checkbox", { name: "Publicar o entregar revisión 2 antes de 1" }).check();
  await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  const projections = page.locator(".event-projections article");
  await expect(projections.nth(0)).toContainText("confirmed"); await expect(projections.nth(1)).toContainText("refunded");
  await page.getByRole("button", { name: /Rama B, tiempo \d+: Analítica aplica revisión 2/ }).click();
  await expect(page.locator(".event-delivery-flow .comparison-current")).toContainText("Rama B");
  await expect(page.locator("#event-panel-delivery .xray-metadata")).toContainText("delivery:pubsub:");
  await page.getByRole("button", { name: "3Internals", exact: true }).click();
  await expect(page.locator(".event-delivery-flow .comparison-current")).toContainText("Analítica aplica revisión 2");
});

test("SSE real recibe tres eventos en un GET y replay no abre otra conexión", async ({ page }) => {
  const calls: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/lab/events")) calls.push(request.url()); });
  await page.goto("/events"); await page.getByRole("tab", { name: /SSE real/ }).click();
  expect(calls).toEqual([]);
  await page.getByRole("button", { name: "Abrir SSE real", exact: true }).click();
  await expect(page.getByLabel("Actualizaciones observadas").locator("li")).toHaveCount(3);
  await expect(page.getByRole("status").filter({ hasText: "Completado: 3 eventos" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar SSE", exact: true })).toBeDisabled();
  expect(calls).toHaveLength(1);
  await page.getByRole("button", { name: /Paso \d+: Se recibe update 2/ }).click();
  await expect(page.getByText("Evento observado por la instrumentación de esta app", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await page.getByRole("button", { name: "Pausar", exact: true }).click();
  expect(calls).toHaveLength(1);
  await page.getByRole("button", { name: "Abrir SSE real", exact: true }).click();
  await expect(page.getByRole("button", { name: "Cerrar SSE", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Cerrar SSE", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Conexión cerrada por el usuario" })).toBeVisible();
  await page.getByRole("button", { name: "Abrir SSE real", exact: true }).click();
  await page.getByRole("tab", { name: /Comunicación/ }).click(); await page.getByRole("tab", { name: /SSE real/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Conexión cerrada al cambiar de pestaña" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Cerrar SSE", exact: true })).toBeDisabled();
});

test("EventSource cierra ante error sin inventar status HTTP", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/lab/events", route => { calls++; return route.fulfill({ status: 503, headers: { "Content-Type": "text/plain" }, body: "No disponible" }); });
  await page.goto("/events"); await page.getByRole("tab", { name: /SSE real/ }).click();
  await page.getByRole("button", { name: "Abrir SSE real", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Error del stream" })).toBeVisible();
  await page.locator("#event-panel-sse .timeline button").nth(1).click();
  await expect(page.getByText("EVENT_SOURCE_ERROR", { exact: true })).toBeVisible();
  await expect(page.getByText("Su API no entrega aquí el status HTTP exacto.", { exact: false })).toBeVisible();
  expect(calls).toBe(1);
});

test("datos SSE fuera del contrato se rechazan y no se muestran como actualización", async ({ page }) => {
  await page.route("**/api/lab/events", route => route.fulfill({ status: 200, headers: { "Content-Type": "text/event-stream" }, body: 'id: bad\nevent: update\ndata: {"sequence":4,"message":"incorrecto","simulatedData":true}\n\n' }));
  await page.goto("/events"); await page.getByRole("tab", { name: /SSE real/ }).click();
  await page.getByRole("button", { name: "Abrir SSE real", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Datos inválidos" })).toBeVisible();
  await expect(page.getByLabel("Actualizaciones observadas").locator("li")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Cerrar SSE", exact: true })).toBeDisabled();
});

test("el capítulo exige actividades observadas y feedback razonado", async ({ page }) => {
  await page.goto("/events");
  await page.getByLabel("Mecanismo de comunicación").selectOption("sse"); await page.getByRole("button", { name: "Enviar mensaje al modelo", exact: true }).click();
  await page.getByRole("tab", { name: /Entregas/ }).click();
  await page.getByLabel("Fallo de entrega").selectOption("lost-ack"); await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  await page.getByLabel("Mecanismo de entrega").selectOption("pubsub"); await page.getByLabel("Fallo de entrega").selectOption("exhaust");
  await page.getByRole("checkbox", { name: "Publicar o entregar revisión 2 antes de 1" }).check(); await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  await page.getByRole("tab", { name: /Capítulo 7/ }).click();
  await page.getByRole("radio", { name: "El efecto se revierte automáticamente al perderse el ACK." }).check(); await page.getByRole("button", { name: "Comprobar garantías", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "La pérdida de la confirmación no revierte" })).toBeVisible();
  await page.getByRole("radio", { name: "Puede reentregar el mismo evento; el receptor debe evitar repetir el efecto." }).check(); await page.getByRole("button", { name: "Comprobar garantías", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-course-v1")!).chapters[7].quizPassed)).toBe(true);
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
});

test("teclado y móvil conservan ajustes, pausa y navegación sin desbordar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/events"); await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.locator("#experiment")).toBeFocused();
  await page.getByLabel("Mensaje de chat del modelo").fill(""); await page.getByRole("button", { name: "Enviar mensaje al modelo", exact: true }).click();
  await expect(page.locator("#event-panel-communication").getByRole("alert")).toContainText("1 a 120");
  await page.getByRole("tab", { name: /Comunicación/ }).focus(); await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Entregas/ })).toHaveAttribute("aria-selected", "true");
  await page.getByLabel("Mecanismo de entrega").selectOption("pubsub"); await page.getByRole("button", { name: "Ejecutar entregas", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Reproducir", exact: true }).click();
  await page.getByRole("tab", { name: /Capítulo 7/ }).click(); await page.getByRole("tab", { name: /Entregas/ }).click();
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Mecanismo de entrega")).toHaveValue("pubsub");
  await page.getByRole("link", { name: "HTTP: petición y respuesta", exact: true }).click(); await expect(page).toHaveURL(/playground\?tab=http$/);
  await page.getByRole("link", { name: "Comunicación y eventos", exact: true }).click(); await expect(page).toHaveURL(/events$/);
});
