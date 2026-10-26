import { expect, test, type Page } from "@playwright/test";
import { openCourseArea } from "./helpers/navigation";
declare global { interface Window { wasmCalls: number } }
test.use({ reducedMotion: "reduce" });
const tab = (page: Page, name: string) => page.getByRole("tab", { name: new RegExp(`^${name}`) });
const binary = (page: Page) => page.getByRole("button", { name: "Ejecutar frontera binaria", exact: true }).click();
const tools = (page: Page) => page.getByRole("button", { name: "Validar y ejecutar herramienta", exact: true }).click();
const wasmCalls = (page: Page) => page.evaluate(() => window.wasmCalls);

test("AC-2/9: conservar API no conserva ABI y lifetime impide la invocación", async ({ page }) => {
  await page.goto("/advanced"); await expect(tab(page, "Binario y Wasm")).toHaveAttribute("aria-selected", "true");
  await page.getByLabel("Layout esperado por el proveedor").selectOption("swapped"); await binary(page);
  await expect(page.getByTestId("binary-result")).toHaveText("-7");
  await page.getByRole("button", { name: /Paso \d+: El proveedor interpreta los argumentos/ }).click();
  await expect(page.locator("#advanced-panel-binary .xray-metadata")).toContainText("Modelo ABI · mismo proceso");
  await page.getByRole("checkbox", { name: "Liberar el buffer antes de la llamada FFI modelada", exact: true }).check(); await binary(page);
  await expect(page.getByTestId("binary-result")).toHaveText("LIFETIME");
  await expect(page.getByRole("button", { name: /Paso \d+: El proveedor interpreta los argumentos/ })).toHaveCount(0);
  await expect(page.getByLabel("Resultado binario capturado")).toContainText("Función invocadaNo");
});

test("AC-3/9: Wasm ejecuta y produce trap real, sin compilar al abrir o reproducir", async ({ page }) => {
  const requests: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url()); });
  await page.addInitScript(() => {
    const session = window; session.wasmCalls = 0;
    WebAssembly.instantiate = new Proxy(WebAssembly.instantiate, { apply(target, receiver, args) { session.wasmCalls++; return Reflect.apply(target, receiver, args); } });
  });
  await page.goto("/advanced"); await page.getByLabel("Mecanismo de ejecución").selectOption("wasm");
  expect(await wasmCalls(page)).toBe(0); await binary(page); await expect(page.getByTestId("binary-result")).toHaveText("3"); expect(await wasmCalls(page)).toBe(1);
  await page.getByLabel("Argumento b (entero −1000 a1000)").fill("0"); await binary(page); await expect(page.getByTestId("binary-result")).toHaveText("WASM_TRAP");
  expect(await wasmCalls(page)).toBe(2);
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click(); await page.getByRole("button", { name: "Pausar", exact: true }).click();
  await page.getByRole("button", { name: "Paso siguiente", exact: true }).click(); await page.getByRole("button", { name: "Paso anterior", exact: true }).click();
  expect(await wasmCalls(page)).toBe(2);
  await page.getByLabel("Argumento a (entero −1000 a1000)").fill("0.5"); await binary(page); await expect(page.getByRole("alert").filter({ hasText: "dos enteros" })).toBeVisible();
  expect(await wasmCalls(page)).toBe(2); expect(requests).toEqual([]);
});

test("AC-4/9: cada byte lleva al buffer del cursor y EOF truncado no inventa SQL", async ({ page }) => {
  await page.goto("/advanced?tab=wire"); await page.getByLabel("Sentencia fija del ejemplo").selectOption("utf8");
  await page.getByLabel("Bytes por fragmento conceptual").selectOption("1"); await page.getByRole("button", { name: "Ejecutar framing", exact: true }).click();
  const bytes = page.getByRole("group", { name: "Bytes del mensaje Query", exact: true });
  await bytes.getByRole("button").first().click(); await expect(page.getByLabel("Sentencia disponible en el cursor")).toContainText("Todavía no");
  await bytes.getByRole("button").last().click(); await expect(page.getByLabel("Sentencia disponible en el cursor")).toHaveText("SELECT 'á';");
  const original = await bytes.textContent(); await page.getByLabel("Sentencia fija del ejemplo").selectOption("number"); expect(await bytes.textContent()).toBe(original);
  await page.getByLabel("Condición del mensaje").selectOption("truncated"); await page.getByRole("button", { name: "Ejecutar framing", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "INCOMPLETE_FRAME" })).toBeVisible();
  await bytes.getByRole("button").last().click(); await expect(page.getByLabel("Sentencia disponible en el cursor")).toContainText("Todavía no");
  await expect(page.getByLabel("Buffer del cursor")).toContainText("error");
  await page.getByLabel("Condición del mensaje").selectOption("length"); await page.getByRole("button", { name: "Ejecutar framing", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "INVALID_FRAME" })).toBeVisible();
});

test("AC-5: JSON y nombres no se evalúan, y schema no concede permiso", async ({ page }) => {
  await page.goto("/advanced?tab=tools");
  await page.getByLabel("Propuesta JSON editable (máximo2048 bytes UTF-8)").fill("(()=>{window.compromised=true})()"); await tools(page);
  await expect(page.getByTestId("tool-consumed")).toHaveText("INVALID_JSON");
  expect(await page.evaluate(() => Object.hasOwn(window, "compromised"))).toBe(false);
  for (const [preset, error] of [["invented", "UNKNOWN_TOOL"], ["invalid", "INVALID_ARGUMENTS"]]) {
    await page.getByLabel("Propuesta prefabricada", { exact: true }).selectOption(preset); await tools(page); await expect(page.getByTestId("tool-consumed")).toHaveText(error);
    await expect(page.getByTestId("tool-order")).toHaveText("created");
  }
  await page.getByLabel("Propuesta prefabricada", { exact: true }).selectOption("confirm"); await page.getByLabel("Identidad del ejecutor modelado").selectOption("reader"); await tools(page);
  await expect(page.getByTestId("tool-consumed")).toHaveText("FORBIDDEN"); await expect(page.getByTestId("tool-order")).toHaveText("created");
  await expect(page.getByRole("button", { name: /Paso \d+: La herramienta actúa sobre el pedido aislado/ })).toHaveCount(0);
});

test("AC-6/9: resultado incompatible no revierte efecto y el adaptador traduce el contrato", async ({ page }) => {
  await page.goto("/advanced?tab=tools"); await page.getByLabel("Propuesta prefabricada", { exact: true }).selectOption("confirm");
  await page.getByLabel("Contrato de salida del proveedor").selectOption("v2"); await tools(page);
  await expect(page.getByTestId("tool-order")).toHaveText("confirmed"); await expect(page.getByTestId("tool-consumed")).toHaveText("INCOMPATIBLE_RESULT");
  await page.getByRole("checkbox", { name: "Adaptar explícitamente salida v2 al consumidor v1", exact: true }).check(); await tools(page);
  await expect(page.getByTestId("tool-consumed")).toHaveText("confirmed");
  await expect(page.getByLabel("Mensaje correlacionado de herramienta")).toContainText('"callId": "call-1"');
  await page.getByRole("button", { name: /Paso \d+: El adaptador traduce v2 al contrato v1/ }).click();
  await expect(page.locator("#advanced-panel-tools .xray-metadata")).toContainText("Adaptador v2 a v1");
  await page.getByLabel("Propuesta prefabricada", { exact: true }).selectOption("read"); await page.getByLabel("Contrato de salida del proveedor").selectOption("v1"); await tools(page);
  await expect(page.getByTestId("tool-order")).toHaveText("created");
});

test("AC-7/8: seis ejecuciones y doce respuestas comprobadas completan y persisten capítulo12", async ({ page }) => {
  await page.goto("/advanced"); await page.getByLabel("Layout esperado por el proveedor").selectOption("swapped"); await binary(page);
  await page.getByRole("checkbox", { name: "Liberar el buffer antes de la llamada FFI modelada", exact: true }).check(); await binary(page);
  await page.getByLabel("Mecanismo de ejecución").selectOption("wasm"); await page.getByLabel("Argumento b (entero −1000 a1000)").fill("0"); await binary(page); await expect(page.getByTestId("binary-result")).toHaveText("WASM_TRAP");
  await tab(page, "Mensajes y bytes").click(); await page.getByLabel("Condición del mensaje").selectOption("truncated"); await page.getByRole("button", { name: "Ejecutar framing", exact: true }).click();
  await tab(page, "Herramientas").click(); await page.getByLabel("Propuesta prefabricada", { exact: true }).selectOption("confirm"); await page.getByLabel("Identidad del ejecutor modelado").selectOption("reader"); await tools(page);
  await page.getByLabel("Identidad del ejecutor modelado").selectOption("buyer"); await page.getByLabel("Contrato de salida del proveedor").selectOption("v2"); await page.getByRole("checkbox", { name: "Adaptar explícitamente salida v2 al consumidor v1", exact: true }).check(); await tools(page);
  await tab(page, "Capítulo 12").click();
  await page.getByRole("radio", { name: "La URL de la función.", exact: true }).check(); await page.getByRole("button", { name: "Comprobar esta frontera", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Comprobaciones del capítulo:" })).toContainText("0/12");
  const checks = [
    ["abi", "El contrato binario entre consumidor y proveedor."], ["ffi", "Comprobar y respetar el contrato de vida y ownership."],
    ["wasm", "Que la llamada local encontró una condición de trap del módulo."], ["bindings", "Las garantías y dependencias de ambos contratos binarios."],
    ["database", "Que un servidor real acepte y ejecute la operación."], ["streams", "Reconocer el estado incompleto según el contrato y recuperarse o fallar."],
    ["model", "Que cumple esa forma; el uso todavía exige otras comprobaciones."], ["tools", "El ejecutor rechaza la confirmación por permiso."],
    ["agents", "Un identificador de llamada conservado en cada resultado."], ["schema", "Rechazarlo antes de invocar por campos fuera del schema."],
    ["product", "Identificar consumidores, ofrecer transición y observar compatibilidad."], ["evolution", "Que el efecto puede existir aunque el consumidor rechace el resultado."],
  ];
  for (const [id, answer] of checks) {
    await page.getByLabel("Tema del capítulo").selectOption(id); await page.getByRole("radio", { name: answer, exact: true }).check();
    await page.getByRole("button", { name: "Comprobar esta frontera", exact: true }).click(); await expect(page.getByRole("status").filter({ hasText: /^Correcto\./ })).toBeVisible();
  }
  await expect(page.getByRole("status").filter({ hasText: "Capítulo completo:" })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("api-universe-course-v1")); expect(saved).not.toContain("PED-1042"); expect(saved).not.toContain("arguments");
  await page.reload(); await expect(page.getByRole("status").filter({ hasText: "Capítulo completo:" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Comprobaciones del capítulo:" })).toContainText("12/12");
  await openCourseArea(page, "Progreso y evaluación"); await page.getByRole("link", { name: /^Tu recorrido/ }).click();
  await expect(page.locator(".course-chapter").filter({ hasText: "Fronteras avanzadas" })).toContainText("Completado");
});

test("AC-1/9: profundidad y X Ray conservan datos, captura, panel y borradores", async ({ page }) => {
  const requests: string[] = []; page.on("request", r => { if (new URL(r.url()).pathname.startsWith("/api/")) requests.push(r.url()); });
  await page.goto("/advanced"); await page.getByLabel("Layout esperado por el proveedor").selectOption("swapped"); await binary(page);
  await page.getByRole("button", { name: /Paso \d+: El proveedor interpreta los argumentos/ }).click();
  const details = await page.locator("#advanced-panel-binary .xray-metadata").textContent();
  await page.getByRole("button", { name: "Código", exact: true }).click(); await page.getByRole("button", { name: "3Internals", exact: true }).click();
  await page.getByRole("button", { name: "X Ray Mode", exact: true }).click(); await expect(page.getByRole("button", { name: "Código", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "X Ray Mode", exact: true }).click(); await page.getByRole("button", { name: "Explicación causal", exact: true }).click();
  expect(await page.locator("#advanced-panel-binary .xray-metadata").textContent()).toBe(details);
  await page.getByRole("button", { name: "Reproducir desde el inicio", exact: true }).click(); await tab(page, "Herramientas").click(); await expect(tab(page, "Herramientas")).toHaveAttribute("aria-selected", "true");
  await tab(page, "Binario y Wasm").click(); await expect(tab(page, "Binario y Wasm")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: "Pausar", exact: true })).toHaveCount(0); await expect(page.getByLabel("Layout esperado por el proveedor")).toHaveValue("swapped");
  expect(requests).toEqual([]);
});

test("AC-1/8: teclado, móvil y modo de sesión permiten explorar sin almacenamiento", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error("Bloqueado"); }; Storage.prototype.setItem = () => { throw new Error("Bloqueado"); }; });
  await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/advanced");
  await expect(page.getByRole("status").filter({ hasText: "Almacenamiento no disponible" })).toBeVisible();
  const skip = page.getByRole("link", { name: "Saltar al experimento", exact: true }); await expect(skip).toBeVisible(); await page.keyboard.press("Tab"); await expect(skip).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.getByRole("main")).toBeFocused();
  await tab(page, "Binario y Wasm").focus(); await page.keyboard.press("ArrowRight"); await expect(tab(page, "Mensajes y bytes")).toBeFocused();
  await expect(tab(page, "Mensajes y bytes")).toHaveAttribute("aria-selected", "true"); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByLabel("Condición del mensaje").selectOption("truncated"); await page.getByRole("button", { name: "Ejecutar framing", exact: true }).click();
  await tab(page, "Mensajes y bytes").focus(); await page.keyboard.press("End"); await expect(tab(page, "Capítulo 12")).toBeFocused(); await expect(tab(page, "Capítulo 12")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Terminar el flujo antes de completar el frame · observado", { exact: false })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
