import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const tab = (page: Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) });

test("AC-2/3: JSON inválido, validación previa y forma válida con negocio incorrecto", async ({ page }) => {
  await page.goto("/contracts"); const result = page.getByRole("region", { name: "Resultado del contrato" });
  await page.getByLabel("Mensaje JSON editable").fill("{"); await button(page, "Probar contrato").click(); await expect(page.getByRole("tabpanel").getByRole("alert")).toContainText("no es JSON válido");
  await page.getByLabel("Mensaje JSON editable").fill('{"sku":"kit-api","quantity":0}'); await button(page, "Probar contrato").click(); await expect(result).toContainText("HTTP 400");
  await expect(page.getByRole("button", { name: /Paso \d+: Construir el pedido/ })).toHaveCount(0);
  await button(page, "Preparar mensaje del diseño").click(); await page.getByRole("checkbox", { name: /Implementación defectuosa/ }).check(); await button(page, "Probar contrato").click();
  await expect(result).toContainText("HTTP 201"); await expect(result).toContainText("Schema de respuestaCumple"); await expect(result).toContainText("Regla de negocioIncumple");
  await page.getByLabel("Nombre del campo cantidad").fill("sku"); await expect(button(page, "Probar contrato")).toBeDisabled(); await expect(button(page, "Descargar JSON del contrato")).toBeDisabled();
  await button(page, "Restaurar diseño v1").click(); await page.getByLabel("Campo note", { exact: true }).selectOption("optional");
  await page.getByLabel("Mensaje JSON editable").fill('{"sku":"kit-api","quantity":2,"note":null}'); await button(page, "Probar contrato").click(); await expect(result).toContainText("/note: se esperaba string");
});

test("AC-4: renombre rompe, coexistencia conserva v1 y dirección inversa falla", async ({ page }) => {
  await page.goto("/contracts"); await page.getByLabel("Nombre del campo cantidad").fill("units"); await tab(page, "Compatibilidad").click();
  const result = page.getByRole("region", { name: "Antes y después del cambio" });
  await button(page, "Comparar contratos").click(); await expect(result).toContainText("esperaba HTTP 201 y recibió 400");
  await button(page, "Inspeccionar antes").click(); await expect(button(page, "Inspeccionar antes")).toHaveAttribute("aria-pressed", "true");
  await tab(page, "Diseñar").click(); await page.getByLabel("Versión de la ruta").selectOption("v2"); await page.getByRole("checkbox", { name: "Conservar POST /v1/orders con contrato anterior", exact: true }).check();
  await tab(page, "Compatibilidad").click(); await button(page, "Comparar contratos").click(); await expect(result).not.toContainText("esperaba HTTP");
  await page.getByLabel("Dirección de compatibilidad").selectOption("new-old"); await button(page, "Comparar contratos").click(); await expect(result).toContainText("esperaba HTTP 201 y recibió 404");
});

test("AC-4: extras tolerados o estrictos y contrato de errores", async ({ page }) => {
  await page.goto("/contracts"); await page.getByRole("checkbox", { name: "Añadir tracking a respuesta", exact: true }).check(); await tab(page, "Compatibilidad").click(); await button(page, "Comparar contratos").click();
  const result = page.getByRole("region", { name: "Antes y después del cambio" }); await expect(result).not.toContainText("/tracking: campo desconocido");
  await page.getByRole("checkbox", { name: /Consumidor estricto/ }).check(); await button(page, "Comparar contratos").click(); await expect(result).toContainText("/tracking: campo desconocido");
  await tab(page, "Diseñar").click(); await button(page, "Restaurar diseño v1").click(); await page.getByLabel("Representación de errores").selectOption("text");
  await tab(page, "Compatibilidad").click(); await page.getByLabel("Mensaje del consumidor").selectOption("invalid"); await button(page, "Comparar contratos").click(); await expect(result).toContainText("se esperaba un objeto");
});

test("AC-5: offset repite tras inserción, cursor evita ese duplicado y se valida", async ({ page }) => {
  await page.goto("/contracts?tab=collections"); const result = page.getByRole("region", { name: "Página de colección", exact: true });
  await button(page, "Insertar antes de la ventana").click(); await button(page, "Página siguiente").click(); await expect(result).toContainText("Ids repetidos en el recorrido: PED-1002");
  await page.getByLabel("Mecanismo de paginación").selectOption("cursor"); await button(page, "Reiniciar colección").click(); await button(page, "Insertar antes de la ventana").click(); await button(page, "Página siguiente").click();
  await expect(result).toContainText("No hay ids repetidos"); await expect(result).toContainText("PED-1003");
  await page.getByLabel("Cursor editable").fill("!!!"); await button(page, "Consultar colección").click(); await expect(page.getByRole("tabpanel").getByRole("alert")).toContainText("Cursor"); await expect(result).toContainText("PED-1003");
  await page.getByLabel("Filtrar por status").selectOption("confirmed"); await page.getByLabel("Orden de colección").selectOption("total-desc"); await button(page, "Reiniciar colección").click();
  const rows = result.getByRole("row"); await expect(rows.nth(1)).toContainText("PED-1006"); await expect(rows.nth(2)).toContainText("PED-1004");
});

test("AC-6/9: reintentos, conflicto, retención y replay sin HTTP", async ({ page }) => {
  const calls: string[] = []; page.on("request", req => { if (new URL(req.url()).pathname.startsWith("/api/")) calls.push(req.url()); });
  await page.goto("/contracts?tab=retries"); const result = page.getByRole("region", { name: "Efectos de los reintentos" });
  await button(page, "Ejecutar dos intentos").click(); await expect(result).toContainText("Pedidos creados1"); await expect(result).toContainText("recuperado");
  await page.getByLabel("Identidad del segundo intento").selectOption("changed-body"); await button(page, "Ejecutar dos intentos").click(); await expect(result).toContainText("409"); await expect(result).toContainText("Pedidos creados1");
  await page.getByRole("checkbox", { name: "Olvidar claves antes del segundo intento", exact: true }).check(); await button(page, "Ejecutar dos intentos").click(); await expect(result).toContainText("Pedidos creados2");
  await button(page, "Reproducir desde el inicio").click(); await button(page, "Pausar").click(); await button(page, "Paso siguiente").click(); await button(page, "Paso anterior").click(); await button(page, "3Internals").click(); await button(page, "Código").click();
  expect(calls).toEqual([]);
});

test("AC-7: descargas reales reflejan el diseño y AsyncAPI es independiente", async ({ page }) => {
  await page.goto("/contracts"); await page.getByLabel("Versión de la ruta").selectOption("v2"); await page.getByLabel("Nombre del campo cantidad").fill("units"); await page.getByRole("checkbox", { name: "Conservar POST /v1/orders con contrato anterior", exact: true }).check();
  for (const kind of ["openapi", "asyncapi"]) {
    await page.getByLabel("Documento de descripción").selectOption(kind); const downloading = page.waitForEvent("download"); await button(page, "Descargar JSON del contrato").click(); const download = await downloading;
    expect(download.suggestedFilename()).toBe(`pedidos.${kind}.json`); const doc = JSON.parse(await readFile((await download.path())!, "utf8"));
    if (kind === "openapi") { expect(doc.openapi).toBe("3.1.1"); expect(doc.paths["/v2/orders"].post.requestBody.content["application/json"].schema.required).toContain("units"); expect(doc.paths["/v1/orders"]).toBeDefined(); }
    else { expect(doc.asyncapi).toBe("3.0.0"); expect(doc.channels.confirmed.address).toBe("orders.confirmed"); expect(doc.paths).toBeUndefined(); }
  }
});

test("AC-8: cuatro actividades y feedback razonado completan el desafío", async ({ page }) => {
  await page.goto("/contracts"); await page.getByRole("checkbox", { name: /Implementación defectuosa/ }).check(); await button(page, "Probar contrato").click();
  await page.getByLabel("Nombre del campo cantidad").fill("units"); await tab(page, "Compatibilidad").click(); await button(page, "Comparar contratos").click();
  await tab(page, "Colecciones").click(); await button(page, "Insertar antes de la ventana").click(); await button(page, "Página siguiente").click();
  await tab(page, "Reintentos").click(); await button(page, "Ejecutar dos intentos").click(); await tab(page, "Capítulo 9").click();
  await page.getByRole("radio", { name: "Que el pedido es correcto porque su JSON cumple el schema.", exact: true }).check(); await button(page, "Comprobar contratos").click(); await expect(page.getByRole("status").filter({ hasText: "No calcula por sí mismo" })).toBeVisible();
  await page.getByRole("radio", { name: "Que la representación cumple esas restricciones; falta comprobar el negocio.", exact: true }).check(); await button(page, "Comprobar contratos").click(); await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-course-v1")!).chapters[9].quizPassed)).toBe(true);
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible();
});

test("AC-1: móvil, enlaces, teclado y pausa conservan contexto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/contracts");
  await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeVisible(); await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused(); await page.keyboard.press("Enter"); await expect(page.locator("#experiment")).toBeFocused();
  await page.getByLabel("Nombre del campo cantidad").fill("units"); await button(page, "Reproducir").click(); await tab(page, "Diseñar").focus(); await page.keyboard.press("ArrowRight"); await expect(tab(page, "Compatibilidad")).toBeFocused(); await expect(tab(page, "Compatibilidad")).toHaveAttribute("aria-selected", "true"); await expect(page.locator("#contract-panel-design")).toBeHidden();
  await page.keyboard.press("Home"); await expect(tab(page, "Diseñar")).toBeFocused(); await expect(button(page, "Pausar")).toHaveCount(0); await expect(page.getByLabel("Nombre del campo cantidad")).toHaveValue("units");
  await page.keyboard.press("End"); await expect(tab(page, "Capítulo 9")).toBeFocused();
  for (const name of ["Diseñar", "Compatibilidad", "Colecciones", "Reintentos", "Capítulo 9"]) { await tab(page, name).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.getByRole("link", { name: "I · Diseñar una interfaz", exact: true }).click(); await expect(tab(page, "Diseñar")).toHaveAttribute("aria-selected", "true");
  await page.getByRole("link", { name: "Seguridad y acceso", exact: true }).click(); await expect(page).toHaveURL(/security$/); await page.getByRole("link", { name: "Diseño de contratos", exact: true }).click(); await expect(page).toHaveURL(/contracts$/);
});
