import { openCourseArea } from "./helpers/navigation";
import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

for (const path of ["/", "/compare"] as const) {
  const create = path === "/" ? "Comprar ahora" : "Crear pedido real";
  const retry = path === "/" ? "Reintentar misma operación" : "Reintentar creación";
  const controls = path === "/" ? "main" : ".real-order-console";

  test(`${path}: un rechazo del reintento conserva la creación incierta`, async ({ page }) => {
    const keys: string[] = [];
    const bodies: string[] = [];
    let originalId = "";
    await page.route("**/api/orders", async route => {
      keys.push(route.request().headers()["idempotency-key"]);
      bodies.push(route.request().postData() ?? "");
      if (keys.length === 2) {
        await route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ traceId: "retry-rejected", events: [], error: { code: "TOO_MANY_REQUESTS", message: "Reintento rechazado" } }) });
        return;
      }
      const response = await route.fetch();
      const body = await response.json();
      if (keys.length === 1) {
        expect(response.status()).toBe(201);
        originalId = body.order.id;
        await route.abort("failed");
      } else {
        expect(response.status()).toBe(200);
        expect(body.order.id).toBe(originalId);
        await route.fulfill({ response });
      }
    });
    await page.goto(path);
    const surface = page.locator(controls);
    await surface.getByRole("button", { name: create, exact: true }).click();
    await surface.getByRole("button", { name: retry, exact: true }).click();
    await expect(surface.locator(".operation-notice")).toContainText("HTTP 429");
    await expect(surface.locator(".operation-notice")).toContainText("sigue sin resolverse");
    await expect(surface.getByRole("button", { name: create, exact: true })).toHaveCount(0);
    await expect(surface.locator("select").first()).toBeDisabled();
    await surface.getByRole("button", { name: retry, exact: true }).click();
    await expect(surface.locator(".operation-notice")).toContainText(originalId);
    await expect(surface.getByRole("button", { name: create, exact: true })).toBeEnabled();
    expect(keys).toHaveLength(3);
    expect(new Set(keys).size).toBe(1);
    expect(new Set(bodies).size).toBe(1);
  });

  test(`${path}: un 502 con HTML conserva status, headers y body original`, async ({ page }) => {
    await page.route("**/api/orders", route => route.fulfill({ status: 502, contentType: "text/html", headers: { "x-demo-note": "respuesta recibida" }, body: "<html>Bad Gateway</html>" }));
    await page.goto(path);
    const surface = page.locator(controls);
    await surface.getByRole("button", { name: create, exact: true }).click();
    await expect(surface.getByRole("button", { name: retry, exact: true })).toBeVisible();
    await surface.getByRole("button", { name: "Request / Response", exact: true }).click();
    const exchange = surface.locator(".exchange-grid");
    await expect(exchange).toContainText("RESPONSE · 502");
    await expect(exchange).toContainText("respuesta recibida");
    await expect(exchange).toContainText("<html>Bad Gateway</html>");
    await expect(exchange).not.toContainText("No existe una respuesta HTTP");
  });

  test(`${path}: recibir headers antes de fallar la lectura no borra el Response`, async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        if (String(args[0]) !== "/api/orders") return originalFetch(...args);
        return new Response(new ReadableStream({ start(controller) { controller.error(new Error("Lectura interrumpida")); } }), { status: 201, headers: { "Content-Type": "application/json", "X-Demo-Note": "headers recibidos" } });
      };
    });
    await page.goto(path);
    const surface = page.locator(controls);
    await surface.getByRole("button", { name: create, exact: true }).click();
    await expect(surface.getByRole("button", { name: retry, exact: true })).toBeVisible();
    await surface.getByRole("button", { name: "Request / Response", exact: true }).click();
    await expect(surface.locator(".exchange-grid")).toContainText("RESPONSE · 201");
    await expect(surface.locator(".exchange-grid")).toContainText("headers recibidos");
    await expect(surface.locator(".exchange-grid")).toContainText(/"readError": ".+"/);
  });

  test(`${path}: un 201 sin pedido válido no libera la clave de creación`, async ({ page }) => {
    await page.route("**/api/orders", route => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ traceId: "missing-order", events: [] }) }));
    await page.goto(path);
    const surface = page.locator(controls);
    await surface.getByRole("button", { name: create, exact: true }).click();
    await expect(surface.getByRole("button", { name: retry, exact: true })).toBeVisible();
    await expect(surface.locator(".operation-notice")).toContainText("sigue sin resolverse");
  });
}

test("cinco áreas conservan jerarquía, contexto y acceso en escritorio, tablet y móvil", async ({ page }) => {
  const areas = ["Bases", "Recorrido central", "Aprendizaje y mapa", "Laboratorios", "Progreso y evaluación"] as const;
  test.setTimeout(90000);
  for (const width of [390, 701, 768, 920, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, area] of [["/", "Recorrido central"], ["/first-principles?chapter=2", "Bases"], ["/api-universe", "Aprendizaje y mapa"], ["/compare", "Aprendizaje y mapa"], ["/playground?tab=rpc", "Laboratorios"], ["/events", "Laboratorios"], ["/security", "Laboratorios"], ["/contracts", "Laboratorios"], ["/systems", "Laboratorios"], ["/build-api", "Recorrido central"], ["/course", "Progreso y evaluación"], ["/reference", "Aprendizaje y mapa"], ["/challenges", "Progreso y evaluación"]] as const) {
      await page.goto(path);
      const nav = page.getByRole("navigation", { name: "Navegación principal" });
      await expect(nav.locator(".nav-group-open")).toHaveAccessibleName(area);
      await expect(nav.locator('[aria-current="page"]:visible')).toHaveCount(1);
      await expect(nav.locator('[aria-current="page"]:visible')).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} a ${width}px`).toBe(true);
      if (width <= 920) await expect(nav.getByRole("combobox", { name: "Área del curso", exact: true })).toHaveValue({ "Bases": "foundations", "Recorrido central": "execution", "Aprendizaje y mapa": "learning", "Laboratorios": "laboratories", "Progreso y evaluación": "evaluation" }[area]!);
      else await expect(nav.locator(".nav-area-button")).toHaveText(areas.map(title => new RegExp(title)));
    }
    for (const area of areas) {
      await openCourseArea(page, area);
      await expect(page.locator(".nav-group-open")).toHaveCount(1);
      const destinations = await page.locator(".sidebar a").evaluateAll(links => links.map(link => link.getAttribute("href")));
      expect(new Set(destinations).size).toBe(destinations.length);
    }
    await openCourseArea(page, "Bases");
    await expect(page.getByRole("link", { name: "Primeros principios", exact: true })).toHaveAccessibleDescription("Capítulo 0");
    await page.getByRole("link", { name: "Primeros principios", exact: true }).click();
    await expect(page).toHaveURL(/\/first-principles\?chapter=0$/);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/compare");
  const bases = page.getByRole("button", { name: "Bases", exact: true });
  await bases.focus(); await page.keyboard.press("Enter");
  await expect(bases).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "Aprendizaje y mapa", exact: true })).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press("Enter"); await expect(bases).toHaveAttribute("aria-expanded", "false");
  await openCourseArea(page, "Laboratorios");
  await page.getByRole("link", { name: "HTTP: petición y respuesta", exact: true }).click();
  await expect(page.getByRole("tab", { name: /^HTTP real/ })).toHaveAttribute("aria-selected", "true");
  await page.goBack(); await expect(page).toHaveURL(/\/compare$/);
  await expect(page.locator(".nav-group-open:visible")).toHaveAccessibleName("Aprendizaje y mapa");
  await page.goForward(); await expect(page).toHaveURL(/\/playground\?tab=http$/);
  await expect(page.locator(".nav-group-open:visible")).toHaveAccessibleName("Laboratorios");
});

test("cada inspector referencia su propio encabezado, incluso en paneles ocultos", async ({ page }) => {
  for (const path of ["/playground", "/events", "/compare"]) {
    await page.goto(path);
    if (path === "/compare") {
      await page.getByRole("button", { name: "Crear pedido real", exact: true }).click();
      await expect(page.locator(".comparison-order")).toBeVisible();
    }
    expect(await page.locator(".inspector").evaluateAll(inspectors => inspectors.every(inspector => {
      const heading = document.getElementById(inspector.getAttribute("aria-labelledby") ?? "");
      return heading !== null && inspector.contains(heading);
    }))).toBe(true);
    const ids = await page.locator("[id]").evaluateAll(elements => elements.map(element => element.id));
    expect(new Set(ids).size).toBe(ids.length);
  }
});

test("los capítulos tienen enlaces propios y sus prácticas conservan borradores sin ejecutar efectos", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) requests.push(request.url()); });
  await page.goto("/first-principles?chapter=1");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1") ?? "null")?.lastChapter)).toBe(1);
  const initialChapters = await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1") ?? "null")?.chapters ?? null);
  for (const [id, name, heading] of [
    [1, "Contratos e implementaciones", "Una promesa que puede sobrevivir al cambio"],
    [2, "APIs locales y DOM", "APIs sin internet"],
    [3, "Procesos y fronteras", "Cuando la memoria deja de ser compartida"],
    [0, "Primeros principios", "Dos componentes, una capacidad"],
  ] as const) {
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(`/first-principles?chapter=${id}`);
    await expect(page.locator("#chapter-title")).toHaveText(heading);
    await expect(page.locator(".page-heading .overline:visible")).toContainText(`CAPÍTULO ${String(id).padStart(2, "0")}`);
    await expect(nav.locator('[aria-current="page"]')).toHaveAccessibleDescription(`Capítulo ${id}`);
    await expect(nav.getByRole("group", { name: `Laboratorios del capítulo ${id}`, exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1") ?? "null")?.lastChapter)).toBe(id);
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("api-universe-learning-v1") ?? "null")?.chapters ?? null)).toEqual(initialChapters);
  await page.getByRole("button", { name: /Explorar capítulo 1/ }).click();
  await expect(page).toHaveURL("/first-principles?chapter=1");
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.reload();
  await expect(page.locator("#chapter-title")).toHaveText("Una promesa que puede sobrevivir al cambio");

  const nav = page.getByRole("navigation", { name: "Navegación principal" });
  await openCourseArea(page, "Laboratorios"); await nav.getByRole("link", { name: "HTTP: petición y respuesta", exact: true }).click();
  await page.getByLabel("Params query", { exact: false }).fill("message=Borrador conservado");
  await nav.getByRole("link", { name: "Red y transporte", exact: true }).click();
  await expect(page.getByRole("tab", { name: /^Red conceptual/ })).toHaveAttribute("aria-selected", "true");
  await expect(nav.locator('[aria-current="page"]')).toHaveAccessibleDescription("Capítulo 4");
  await expect(page.locator(".page-heading .overline:visible")).toContainText("CAPÍTULO 04");
  await nav.getByRole("link", { name: "HTTP: petición y respuesta", exact: true }).click();
  await expect(page.getByLabel("Params query", { exact: false })).toHaveValue("message=Borrador conservado");
  await expect(nav.locator('[aria-current="page"]')).toHaveAccessibleDescription("Capítulo 5");

  await openCourseArea(page, "Aprendizaje y mapa");
  await nav.getByRole("link", { name: "Comparar interfaces", exact: true }).click();
  await expect(nav.getByRole("group", { name: "Laboratorios del capítulo 6", exact: true })).toHaveCount(1);
  await openCourseArea(page, "Laboratorios");
  await nav.getByRole("link", { name: "D · GraphQL", exact: true }).click();
  await expect(page.getByRole("tab", { name: /^GraphQL/ })).toHaveAttribute("aria-selected", "true");
  await expect(nav.locator('[aria-current="page"]')).toHaveAccessibleDescription("Capítulo 6");
  await expect(page.locator(".page-heading .overline:visible")).toContainText("CAPÍTULO 06");
  await nav.getByRole("link", { name: "E · RPC y gRPC", exact: true }).click();
  await expect(page.getByRole("tab", { name: /^RPC \/ gRPC/ })).toHaveAttribute("aria-selected", "true");
  await page.goBack();
  await expect(page.getByRole("tab", { name: /^GraphQL/ })).toHaveAttribute("aria-selected", "true");

  await nav.getByRole("link", { name: "Comunicación y eventos", exact: true }).click();
  await nav.getByRole("link", { name: "G · Entregas de eventos", exact: true }).click();
  await expect(page.getByRole("tab", { name: /^Entregas/ })).toHaveAttribute("aria-selected", "true");
  await nav.getByRole("link", { name: "SSE real", exact: true }).click();
  await expect(page.getByRole("button", { name: "Abrir SSE real", exact: true })).toBeVisible();
  expect(requests).toEqual([]);
});

test("las fichas remotas abren el laboratorio y la pestaña correspondientes sin ejecutar peticiones", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/")) requests.push(request.url()); });
  for (const [name, path, tab] of [
    ["Server-Sent Events · SSE", "/events?tab=sse", "SSE real"],
    ["Webhook", "/events?tab=delivery", "Entregas"],
    ["Broker Messaging API", "/events?tab=delivery", "Entregas"],
    ["GraphQL", "/playground?tab=graphql", "GraphQL"],
    ["gRPC", "/playground?tab=rpc", "RPC / gRPC"],
    ["HTTP", "/playground?tab=http", "HTTP real"],
    ["TCP", "/playground?tab=network", "Red conceptual"],
  ]) {
    await page.goto("/api-universe");
    await page.getByRole("button", { name: `Seleccionar ${name}`, exact: true }).click();
    await page.locator(".taxonomy-mechanism a").click();
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("tab", { name: new RegExp(`^${tab.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) })).toHaveAttribute("aria-selected", "true");
    if (name === "Server-Sent Events · SSE") await expect(page.getByRole("button", { name: "Abrir SSE real", exact: true })).toBeVisible();
  }
  expect(requests).toEqual([]);
  await page.goto("/playground?tab=no-existe");
  await expect(page.getByRole("tab", { name: /^HTTP real/ })).toHaveAttribute("aria-selected", "true");
  await page.goto("/events?tab=no-existe");
  await expect(page.getByRole("tab", { name: /^Comunicación/ })).toHaveAttribute("aria-selected", "true");
});
