import { openCourseArea } from "./helpers/navigation";
import { expect, test, type Page } from "@playwright/test";
const button = (p: Page, name: string) => p.getByRole("button", { name, exact: true });
const tab = (p: Page, name: string) => p.getByRole("tab", { name: new RegExp(`^${name}`) });
const execute = (p: Page) => button(p, "Ejecutar lote").click();

test("AC-2/4/6: inventario opcional degrada y el obligatorio falla toda la respuesta", async ({ page }) => {
  await page.goto("/systems"); const result = page.getByRole("region", { name: "Resultados del lote", exact: true });
  await expect(result).toContainText("Buenas: 4/4");
  await page.getByLabel("Fallo de inventario").selectOption("all"); await page.getByLabel("Retries máximos").fill("0"); await execute(page);
  await expect(result.getByRole("row").nth(1)).toContainText("200 / Sí"); await expect(result).toContainText("Buenas: 0/4");
  await page.getByRole("checkbox", { name: "Exigir inventario completo", exact: true }).check(); await execute(page); await expect(result.getByRole("row").nth(1)).toContainText("503 / No");
  await page.getByRole("checkbox", { name: "Incluir inventario", exact: true }).uncheck(); await execute(page); await expect(result).toContainText("Buenas: 4/4"); await expect(result.getByRole("row").nth(1)).toContainText("200 / No");
});

test("AC-2/3: arquitectura y roles cambian captura, fronteras y proyección", async ({ page }) => {
  await page.goto("/systems"); await page.getByLabel("Frontera de inventario").selectOption("monolith"); await execute(page);
  await page.getByRole("button", { name: "Inspeccionar componente Inventario", exact: true }).click(); await expect(page.locator("#systems-panel-system .xray-metadata")).toContainText("Mismo proceso");
  await page.getByLabel("Frontera de inventario").selectOption("services"); await expect(page.getByRole("status").filter({ hasText: "Ajustes pendientes" })).toBeVisible(); await expect(page.getByRole("group", { name: "Arquitectura modelada" })).toContainText("FUNCIÓN LOCAL");
  await page.getByLabel("Entrada al sistema").selectOption("gateway"); await page.getByLabel("Ejecución de aplicación").selectOption("functions"); await page.getByRole("checkbox", { name: "Balancear entre dos réplicas", exact: true }).check(); await page.getByRole("checkbox", { name: "Añadir BFF", exact: true }).check(); await execute(page);
  await page.getByRole("button", { name: "Inspeccionar componente Inventario", exact: true }).focus(); await page.keyboard.press("Enter"); await expect(page.locator("#systems-panel-system .xray-metadata")).toContainText("Red remota");
  await page.getByRole("button", { name: "Inspeccionar componente API Gateway", exact: true }).click(); await expect(page.locator("#systems-panel-system .explanation")).toContainText("gateway selecciona");
  const result = page.getByRole("region", { name: "Resultados del lote", exact: true }); await result.getByText("Respuestas completas del lote", { exact: true }).click(); await expect(result).toContainText('"availability": 3'); await expect(result).toContainText('"partial": false');
});

test("AC-3/4/9: timeout conserva finalización tardía, inspector y replay sin red", async ({ page }) => {
  const calls: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(r.url()); });
  await page.goto("/systems"); await page.getByLabel("Consultas del lote").fill("1"); await page.getByLabel("Trabajo de inventario (ms simulados)").fill("200"); await page.getByLabel("Timeout por intento (ms simulados)").fill("50"); await execute(page);
  const events = page.getByRole("region", { name: "Eventos de las consultas", exact: true });
  await events.getByRole("button", { name: /^\d+\. El proveedor termina después del timeout/ }).first().click(); await expect(page.locator("#systems-panel-system .explanation")).toContainText("El proveedor termina después del timeout");
  await button(page, "3Internals").click(); await button(page, "Inspeccionar datos de este paso +").click(); await expect(page.locator("#systems-panel-system .data-disclosure")).toContainText('"parentSpanId": "R1-root"');
  await button(page, "Reproducir desde el inicio").click(); await button(page, "Pausar").click(); await button(page, "Paso siguiente").click(); await button(page, "Paso anterior").click(); expect(calls).toEqual([]);
});

test("AC-5/6: circuito rechaza llamadas y half open recupera tras cooldown", async ({ page }) => {
  await page.goto("/systems"); await page.getByLabel("Consultas del lote").fill("6"); await page.getByLabel("Separación entre llegadas").selectOption("100"); await page.getByLabel("Retries máximos").fill("0"); await page.getByLabel("Fallo de inventario").selectOption("first-two"); await page.getByRole("checkbox", { name: "Circuit breaker por réplica", exact: true }).check(); await execute(page);
  const result = page.getByRole("region", { name: "Resultados del lote", exact: true }); await expect(result).toContainText("réplica1: closed");
  await expect(page.getByRole("region", { name: "Eventos de las consultas", exact: true })).toContainText("Circuito half open");
  await result.getByText("Comparar con la ejecución anterior", { exact: true }).click(); await expect(result).toContainText("No es un benchmark");
  await page.getByLabel("Consultas del lote").fill("7"); await execute(page); await expect(page.getByRole("tabpanel").getByRole("alert")).toContainText("count: necesita un entero"); await expect(result).toContainText("Buenas: 1/6");
});

test("AC-5: caché antigua evita trabajo y TTL permite nueva lectura", async ({ page }) => {
  await page.goto("/systems"); await page.getByLabel("Consultas del lote").fill("6"); await page.getByLabel("Concurrencia del cliente").fill("1"); await page.getByLabel("Trabajo de inventario (ms simulados)").fill("20"); await page.getByLabel("Separación entre llegadas").selectOption("100"); await page.getByRole("checkbox", { name: /^Caché compartida/ }).check(); await page.getByRole("checkbox", { name: /^Cambiar fuente/ }).check(); await execute(page);
  const result = page.getByRole("region", { name: "Resultados del lote", exact: true }); await expect(result.getByRole("row").nth(3)).toContainText("0 / Hit"); await expect(result.getByRole("row").nth(3)).toContainText("5ms");
  await page.getByLabel("Separación entre llegadas").selectOption("300"); await execute(page); await expect(result.getByRole("row").nth(3)).toContainText("1 / No"); await expect(result.getByRole("row").nth(3).getByRole("cell").nth(2)).toHaveText("2");
});

test("AC-7: local hace rollback, saga recupera compensación y 2PC decisión", async ({ page }) => {
  await page.goto("/systems?tab=transactions"); const result = page.getByRole("region", { name: "Estado público del evento", exact: true });
  await page.getByLabel("Modelo de coordinación").selectOption("local"); await page.getByLabel("Fallo transaccional").selectOption("payment"); await button(page, "Ejecutar confirmación modelada").click(); await page.getByRole("button", { name: /^\d+\. Rollback local/ }).click(); await expect(result).toContainText("Stock disponible3"); await expect(result).toContainText("Asiento ficticio0");
  await page.getByLabel("Modelo de coordinación").selectOption("independent"); await page.getByLabel("Fallo transaccional").selectOption("payment"); await button(page, "Ejecutar confirmación modelada").click(); await page.getByRole("button", { name: /^\d+\. Queda una reserva/ }).click(); await expect(result).toContainText("Reserva1");
  await page.getByLabel("Modelo de coordinación").selectOption("saga"); await page.getByLabel("Fallo transaccional").selectOption("compensation"); await button(page, "Ejecutar confirmación modelada").click(); await button(page, "Recuperar operación pendiente").click(); await page.getByRole("button", { name: /^\d+\. Recuperar compensación/ }).click(); await expect(result).toContainText("Pedidocancelled"); await expect(result).toContainText("Reserva0"); await expect(button(page, "Recuperar operación pendiente")).toBeDisabled();
  await page.getByLabel("Modelo de coordinación").selectOption("two-phase"); await page.getByLabel("Fallo transaccional").selectOption("coordinator"); await button(page, "Ejecutar confirmación modelada").click(); await page.getByRole("button", { name: /^\d+\. Coordinador cae/ }).click(); await expect(result).toContainText("Sí · espera y locks"); await expect(result).toContainText("Decisión registrada: commit");
  await button(page, "Recuperar operación pendiente").click(); await page.getByRole("button", { name: /^\d+\. Recuperar decisión commit/ }).click(); await expect(result).toContainText("Pedidoconfirmed"); await expect(result).toContainText("Asiento ficticio8900");
});

test("AC-8: cuatro observaciones y explicación correcta completan desafío", async ({ page }) => {
  await page.goto("/systems"); await page.getByLabel("Timeout por intento (ms simulados)").fill("50"); await execute(page);
  await page.getByLabel("Timeout por intento (ms simulados)").fill("150"); await page.getByLabel("Trabajo de inventario (ms simulados)").fill("20"); await page.getByLabel("Consultas del lote").fill("6"); await page.getByLabel("Concurrencia del cliente").fill("1"); await page.getByLabel("Separación entre llegadas").selectOption("100"); await page.getByRole("checkbox", { name: /^Caché compartida/ }).check(); await page.getByRole("checkbox", { name: /^Cambiar fuente/ }).check(); await execute(page);
  await tab(page, "Transacciones").click(); await page.getByLabel("Fallo transaccional").selectOption("compensation"); await button(page, "Ejecutar confirmación modelada").click(); await button(page, "Recuperar operación pendiente").click(); await tab(page, "Capítulo 10").click();
  await page.getByRole("radio", { name: "Que el timeout canceló automáticamente la reserva.", exact: true }).check(); await button(page, "Comprobar sistemas").click(); await expect(page.getByRole("status").filter({ hasText: "No prueba cancelación" })).toBeVisible();
  await page.getByRole("radio", { name: "Que esperar y ejecutar son hechos distintos; hay que consultar o recuperar la operación.", exact: true }).check(); await button(page, "Comprobar sistemas").click(); await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible(); await page.reload(); await expect(page.getByRole("status").filter({ hasText: "Exploración completa:" })).toBeVisible(); await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click(); await expect(page.locator(".course-chapter").filter({ hasText: "Sistemas y fallos parciales" })).toContainText("Completado");
});

test("AC-1: móvil, teclado, pausa y práctica J preservan contexto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto("/systems"); await page.getByLabel("Consultas del lote").fill("3"); await page.getByRole("link", { name: "Saltar al experimento" }).focus(); await expect(page.getByRole("link", { name: "Saltar al experimento" })).toBeFocused(); await page.keyboard.press("Enter"); await expect(page.locator("#experiment")).toBeFocused();
  await page.getByLabel("Consultas del lote").fill("3"); await button(page, "Reproducir").click(); await tab(page, "Sistema").focus(); await page.keyboard.press("ArrowRight"); await expect(tab(page, "Transacciones")).toBeFocused(); await expect(tab(page, "Transacciones")).toHaveAttribute("aria-selected", "true"); await expect(page.locator("#systems-panel-system")).toBeHidden(); await page.keyboard.press("Home"); await expect(tab(page, "Sistema")).toBeFocused(); await expect(button(page, "Pausar")).toHaveCount(0); await expect(page.getByLabel("Consultas del lote")).toHaveValue("3"); await page.keyboard.press("End"); await expect(tab(page, "Capítulo 10")).toBeFocused();
  for (const name of ["Sistema", "Transacciones", "Capítulo 10"]) { await tab(page, name).click(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await page.getByRole("link", { name: "J · Systems Lab", exact: true }).click(); await expect(tab(page, "Sistema")).toHaveAttribute("aria-selected", "true"); await page.getByRole("link", { name: "Diseño de contratos", exact: true }).click(); await expect(page).toHaveURL(/contracts$/); await page.getByRole("link", { name: "Sistemas y fallos parciales", exact: true }).click(); await expect(page).toHaveURL(/systems$/);
});
