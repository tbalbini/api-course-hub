import { openCourseArea } from "./helpers/navigation";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
test.use({ reducedMotion: "reduce" });
const consoleOf = (page: Page) => page.getByRole("region", { name: "Un pedido HTTP real", exact: true });
const notice = (page: Page) => consoleOf(page).getByRole("status").first();
const create = (page: Page) => consoleOf(page).getByRole("button", { name: "Crear pedido real", exact: true }).click();
const tab = (page: Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) });

test("AC-1/2/4/5/8: crea, confirma, distingue snapshot y estado actual y acredita resultados reales", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/orders")) requests.push(r.method()); });
  await page.goto("/build-api"); await expect(tab(page, "Aplicación")).toHaveAttribute("aria-selected", "true"); expect(requests).toEqual([]);
  await create(page); await expect(notice(page)).toContainText("HTTP 201");
  const real = consoleOf(page), id = await real.getByLabel("Id para consultar o confirmar").inputValue();
  await real.getByRole("button", { name: "Confirmar real", exact: true }).click(); await expect(notice(page)).toContainText("confirmed");
  await real.getByRole("button", { name: "Repetir POST original", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 200");
  await expect(real.getByLabel("Último pedido real conocido")).toContainText("created");
  await real.getByRole("button", { name: "Consultar real", exact: true }).click(); await expect(notice(page)).toContainText("confirmed");
  await real.getByRole("button", { name: /Paso \d+: Se lee el pedido almacenado/ }).click();
  await real.getByRole("button", { name: "Abrir archivo de este paso", exact: true }).click();
  await expect(page.getByLabel("Archivo por responsabilidad")).toHaveValue("item");
  await tab(page, "Aplicación").click(); await expect(real.getByLabel("Último pedido real conocido")).toContainText(id);
  const before = requests.length;
  await real.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click();
  await tab(page, "Código ejecutado").click(); await expect(tab(page, "Código ejecutado")).toHaveAttribute("aria-selected", "true");
  await tab(page, "Aplicación").click(); await expect(real.getByRole("button", { name: "Reproducir", exact: true })).toBeVisible(); expect(requests.length).toBe(before);
  await real.getByLabel("Cantidad del pedido (contrato servidor: 1 a 5)").fill("0"); await create(page); await expect(notice(page)).toContainText("INVALID_INPUT");
  await real.getByLabel("Credencial real de demostración").selectOption("reader"); await create(page); await expect(notice(page)).toContainText("HTTP 403");
  await real.getByLabel("Credencial real de demostración").selectOption("buyer"); await real.getByLabel("Cantidad del pedido (contrato servidor: 1 a 5)").fill("2");
  await real.getByRole("button", { name: "Repetir POST original", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 409");
  await expect(real.getByLabel("Último pedido real conocido")).toContainText("confirmed");
  await tab(page, "Capítulo 11").click();
  await page.getByRole("radio", { name: "POST recuperó el snapshot de creación; GET permite observar el estado actual.", exact: true }).check();
  await expect(page.getByRole("status").filter({ hasText: "Proyecto completo:" })).toHaveCount(0);
  await page.getByRole("button", { name: "Comprobar proyecto", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Proyecto completo:" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("api-universe-course-v1"))).not.toContain(id);
  await page.reload(); await expect(page.getByRole("status").filter({ hasText: "Proyecto completo:" })).toBeVisible();
  await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click();
  await expect(page.locator(".course-chapter").filter({ hasText: "Proyecto final de pedidos" })).toContainText("Completado");
});

test("AC-5: recupera la creación B y repetir original usa B, no la anterior A", async ({ page }) => {
  const attempts: { key: string; body: string; id?: string }[] = [];
  await page.route("**/api/orders", async route => {
    const attempt = { key: route.request().headers()["idempotency-key"], body: route.request().postData()!, id: "" }; attempts.push(attempt);
    if (attempts.length === 2) { const response = await route.fetch(); attempt.id = (await response.json()).order.id; await route.abort("failed"); }
    else await route.continue();
  });
  await page.goto("/build-api"); await create(page); await expect(notice(page)).toContainText("HTTP 201");
  const real = consoleOf(page), first = await real.getByLabel("Id para consultar o confirmar").inputValue();
  await real.getByLabel("Cantidad del pedido (contrato servidor: 1 a 5)").fill("2"); await create(page); await expect(notice(page)).toContainText("Resultado incierto");
  await expect(real.getByLabel("Último pedido real conocido")).toContainText(first);
  for (const label of ["Credencial real de demostración", "Cantidad del pedido (contrato servidor: 1 a 5)", "Id para consultar o confirmar"]) await expect(real.getByLabel(label)).toBeDisabled();
  await tab(page, "Código ejecutado").click(); await tab(page, "Aplicación").click();
  await real.getByRole("button", { name: "Reintentar creación", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 200");
  await expect(real.getByLabel("Último pedido real conocido")).toContainText(attempts[1].id!);
  await real.getByRole("button", { name: "Repetir POST original", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 200");
  expect(attempts).toHaveLength(4); expect(attempts[0].key).not.toBe(attempts[1].key);
  expect(attempts[2].key).toBe(attempts[1].key); expect(attempts[3].key).toBe(attempts[1].key);
  expect(attempts[2].body).toBe(attempts[1].body); expect(attempts[3].body).toBe(attempts[1].body);
});

for (const fault of ["trace", "order"] as const) test(`AC-4/5/8: ${fault} inválido conserva Response y operación sin aplicar Order ni logros`, async ({ page }) => {
  let count = 0;
  await page.route("**/api/orders", async route => {
    if (++count !== 1) { await route.continue(); return; }
    const response = await route.fetch(), body = await response.json();
    if (fault === "trace") body.events[1].stage = "invalid-event";
    else { body.order.quantity = 3; body.order.totalMinor = 26700; }
    await route.fulfill({ response, json: body });
  });
  await page.goto("/build-api"); await create(page); await expect(notice(page)).toContainText("Resultado incierto");
  const real = consoleOf(page);
  await expect(real.getByLabel("Último pedido real conocido")).toHaveCount(0);
  await expect(real.getByRole("button", { name: /Paso \d+: El servidor reconoce la ruta/ })).toHaveCount(0);
  await real.getByRole("button", { name: "Request / Response", exact: true }).click();
  await expect(real.locator(".exchange-grid")).toContainText('"status": 201');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-course-v1")!).chapters[11]?.flags ?? [])).toEqual([]);
  await real.getByRole("button", { name: "Reintentar creación", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 200");
  await expect(real.getByLabel("Último pedido real conocido")).toContainText("created");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-course-v1")!).chapters[11].flags)).toEqual(["repeated"]);
});

for (const fault of ["lost", "malformed"] as const) test(`AC-5: PATCH ${fault} conserva id y GET observa el efecto sin repetir escritura`, async ({ page }) => {
  let patches = 0;
  await page.route("**/api/orders/*", async route => {
    if (route.request().method() !== "PATCH") { await route.continue(); return; }
    patches++; const response = await route.fetch();
    if (fault === "lost") await route.abort("failed");
    else await route.fulfill({ response, body: "{" });
  });
  await page.goto("/build-api"); await create(page); await expect(notice(page)).toContainText("HTTP 201");
  const real = consoleOf(page), id = await real.getByLabel("Id para consultar o confirmar").inputValue();
  await real.getByRole("button", { name: "Confirmar real", exact: true }).click(); await expect(notice(page)).toContainText("Resultado incierto");
  await expect(real.getByLabel("Id para consultar o confirmar")).toBeDisabled(); await expect(real.getByRole("button", { name: "Crear pedido real", exact: true })).toBeDisabled();
  await expect(real.getByLabel("Último pedido real conocido")).toContainText("created");
  await tab(page, "Capítulo 11").click(); await tab(page, "Aplicación").click(); expect(patches).toBe(1);
  await real.getByRole("button", { name: "Consultar real", exact: true }).click(); await expect(notice(page)).toContainText("confirmed");
  await expect(real.getByLabel("Id para consultar o confirmar")).toHaveValue(id); await expect(real.getByLabel("Id para consultar o confirmar")).toBeEnabled(); expect(patches).toBe(1);
});

test("AC-2/4: 401 y404 no cambian el último pedido y GET fallido no bloquea una creación", async ({ page }) => {
  await page.goto("/build-api"); await create(page); await expect(notice(page)).toContainText("HTTP 201");
  const real = consoleOf(page), id = await real.getByLabel("Id para consultar o confirmar").inputValue();
  await real.getByLabel("Credencial real de demostración").selectOption("none");
  await real.getByRole("button", { name: "Consultar real", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 401");
  await real.getByLabel("Credencial real de demostración").selectOption("reader"); await real.getByLabel("Id para consultar o confirmar").fill("no existe/é");
  await real.getByRole("button", { name: "Consultar real", exact: true }).click(); await expect(notice(page)).toContainText("HTTP 404");
  await expect(real.getByLabel("Último pedido real conocido")).toContainText(id); await expect(real.getByRole("button", { name: "Crear pedido real", exact: true })).toBeEnabled();
});

test("AC-6: fuente y descarga coinciden con el archivo y hash incorporados", async ({ page }) => {
  const requests: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url()); });
  await page.goto("/build-api?tab=code");
  const expected = await readFile("src/app/api/orders/route.ts", "utf8");
  await expect(page.getByLabel("Fuente completa del archivo")).toHaveText(expected);
  await expect(page.getByTestId("project-source-sha")).toHaveText(createHash("sha256").update(expected).digest("hex"));
  const downloading = page.waitForEvent("download"); await page.getByRole("button", { name: "Descargar archivo", exact: true }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe("src__app__api__orders__route.ts"); expect(await readFile((await download.path())!, "utf8")).toBe(expected);
  await page.getByLabel("Archivo por responsabilidad").selectOption("client");
  await expect(page.getByTestId("project-source-path")).toHaveText("src/components/order-console.tsx");
  await page.getByText("Cómo ejecutar y modificar el proyecto completo", { exact: true }).click(); await expect(page.getByText("Usa Node.js24.", { exact: false })).toBeVisible();
  expect(requests).toEqual([]);
});

test("AC-1: teclado, reducción de movimiento y móvil conservan contexto sin desbordar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/build-api");
  const skip = page.getByRole("link", { name: "Saltar al experimento", exact: true }); await expect(skip).toBeVisible(); await page.keyboard.press("Tab"); await expect(skip).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.getByRole("main")).toBeFocused();
  await tab(page, "Aplicación").focus(); await page.keyboard.press("ArrowRight"); await expect(tab(page, "Código ejecutado")).toBeFocused();
  await expect(tab(page, "Código ejecutado")).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("End"); await expect(tab(page, "Capítulo 11")).toBeFocused(); await expect(tab(page, "Capítulo 11")).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Home"); await expect(tab(page, "Aplicación")).toBeFocused();
  await create(page); await expect(notice(page)).toContainText("HTTP 201"); await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
