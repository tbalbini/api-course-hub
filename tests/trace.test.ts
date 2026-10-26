import { describe, expect, test } from "vitest";
import { localCapture, scenarios, simulate } from "@/lib/scenarios";
import { event, playback, stages, type Playback } from "@/lib/trace";

describe("Causalidad y reproducción", () => {
  test.each([["201", "200"], ["200", "201"]] as const)("%s seguido de %s conserva las capturas y definiciones anteriores", (first, second) => {
    const definitions = structuredClone(stages);
    const capture = simulate(first);
    const before = structuredClone(capture);
    simulate(second);
    localCapture(true);
    expect(capture).toEqual(before);
    expect(stages).toEqual(definitions);
    expect(simulate(first)).toEqual(before);
  });

  test("personalizar cualquier profundidad no altera otro evento ni su definición", () => {
    const original = structuredClone(stages.render.explanation);
    const first = event("render"), second = event("render");
    for (const depth of ["intuition", "engineering", "internals"] as const) first.explanation[depth] = "Otra operación";
    localCapture(true);
    expect(second.explanation).toEqual(original);
    expect(stages.render.explanation).toEqual(original);
  });

  test.each(["200", "404"] as const)("GET %s describe consulta sin heredar creación o validación de JSON", scenario => {
    const capture = simulate(scenario);
    const handler = capture.events.find(entry => entry.stage === "handler")!;
    expect(handler.input).toEqual({ id: scenario === "404" ? "inexistente" : "pedido-simulado" });
    const request = capture.events.find(entry => entry.stage === "request")!;
    expect(request.action).not.toContain("serializa");
    expect(request.code).not.toContain("JSON.stringify(input)");
    for (const depth of ["intuition", "engineering", "internals"] as const) {
      expect(request.explanation[depth]).toMatch(/consult|GET/);
      expect(request.explanation[depth]).not.toContain("cree un pedido");
      expect(handler.explanation[depth]).not.toContain("cantidad");
    }
    const validation = capture.events.find(entry => entry.stage === "validate")!;
    expect(validation.interaction.technology).not.toContain("JSON");
    expect(Object.values(validation.explanation).join(" ")).not.toContain("tamaño del cuerpo");
  });

  test("POST después de GET conserva creación, cantidad y serialización propias", () => {
    simulate("200");
    const capture = simulate("201", 3);
    const request = capture.events.find(entry => entry.stage === "request")!;
    expect(request.input).toEqual(capture.request);
    expect(request.contract).toContain("POST");
    expect(request.code).toContain("JSON.stringify(input)");
    expect(request.explanation.intuition).toContain("cree un pedido");
    expect(request.explanation.engineering).toContain("JSON");
    expect(request.explanation.internals).toContain("Idempotency-Key");
    const handler = capture.events.find(entry => entry.stage === "handler")!;
    expect(handler.input).toEqual({ sku: "kit-api", quantity: 3 });
    expect(handler.explanation.engineering).toContain("cantidad");
  });

  test.each(["400", "401", "403", "404", "409", "429", "500"] as const)("el aviso de HTTP %s no promete actualizar un pedido", scenario => {
    const capture = simulate(scenario), update = capture.events.at(-1)!;
    expect(update.code).toContain("setNotice");
    expect(update.input).toEqual(capture.response?.body);
    expect(update.output).toEqual({ notice: update.error?.message });
    for (const text of Object.values(update.explanation)) expect(text).toMatch(/error|rechazo|aviso/);
  });

  test.each([true, false])("favorito %s identifica su setter y el límite de observación sin servidor", favorite => {
    const capture = localCapture(favorite), update = capture.events.at(-1)!;
    expect(capture.events[0].code).toContain("changeLocal");
    expect(update.code).toContain("setFavorite(value)");
    expect(update.input).toEqual({ favorite: !favorite });
    expect(update.output).toEqual({ favorite });
    expect(update.explanation.intuition).toContain("favorito");
    expect(update.explanation.engineering).toContain("setter");
    expect(update.explanation.internals).toContain("paint");
    expect(Object.values(update.explanation).join(" ")).not.toContain("resultado del servidor");
  });

  test("actualizar estado no afirma instrumentar un commit o paint", () => {
    const update = event("render");
    expect(update.action).toContain("solicita actualizar");
    expect(update.explanation.engineering).toContain("setter");
    expect(update.explanation.internals).toContain("No se instrumenta el commit");
  });

  test("el mensaje inspeccionable corresponde a la causa del escenario", () => {
    expect(simulate("401").request?.headers.Authorization).toBeUndefined();
    expect(simulate("403").request?.headers.Authorization).toBe("Bearer demo-reader");
    const query = simulate("200");
    expect(query.request?.method).toBe("GET");
    expect(query.request?.body).toBeUndefined();
    expect(query.request?.url).toContain("pedido-simulado");
    const missing = simulate("404");
    expect(missing.request?.url).toContain("inexistente");
    expect(missing.events.find(entry => entry.error?.code === "NOT_FOUND")?.output).toBeNull();
  });

  test.each(scenarios)("el escenario %s conserva dependencias y procedencia", scenario => {
    const capture = simulate(scenario);
    const ids = new Set<string>();
    capture.events.forEach((entry, index) => {
      expect(entry.logicalTime).toBe(index);
      expect(entry.provenance).toBe("conceptual");
      expect(entry.dependencies.every(id => ids.has(id))).toBe(true);
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
    });
  });

  test.each(["400", "401", "403", "404", "409", "429", "500"] as const)("HTTP %s no escribe en almacenamiento", scenario => {
    const capture = simulate(scenario);
    expect(capture.response?.status).toBe(Number(scenario));
    expect(capture.events.some(entry => entry.action === "Se guarda el pedido temporal")).toBe(false);
    expect(capture.events.some(entry => entry.state === "error")).toBe(true);
  });

  test("el timeout conserva el efecto, el fallo previo a entrega no lo tiene", () => {
    const timeout = simulate("timeout");
    expect(timeout.events.some(entry => entry.action === "Se guarda el pedido temporal")).toBe(true);
    expect(timeout.response).toBeUndefined();
    const network = simulate("network");
    expect(network.events.some(entry => entry.actor === "server" || entry.actor === "store")).toBe(false);
    expect(network.response).toBeUndefined();
  });

  test("la petición duplicada guarda una vez y después recupera", () => {
    const capture = simulate("duplicate");
    expect(capture.events.filter(entry => entry.action === "Se guarda el pedido temporal")).toHaveLength(1);
    expect(capture.events.filter(entry => entry.action === "La clave recupera el pedido previo")).toHaveLength(1);
    expect(capture.response?.status).toBe(200);
  });

  test("una acción local no tiene mensajes ni fronteras de red", () => {
    const capture = localCapture(true);
    expect(capture.request).toBeUndefined();
    expect(capture.events.every(entry => entry.boundary === "Mismo proceso")).toBe(true);
  });

  test("navegar acota el cursor, termina y no modifica la captura", () => {
    const capture = simulate("201");
    const original = structuredClone(capture);
    let state: Playback = { capture, cursor: 0, running: false, speed: 1 };
    state = playback(state, { type: "previous" });
    expect(state.cursor).toBe(0);
    state = playback(state, { type: "seek", cursor: 999 });
    expect(state.cursor).toBe(capture.events.length - 1);
    state = playback(state, { type: "replay" });
    expect(state.running).toBe(true);
    expect(state.cursor).toBe(0);
    for (let i = 0; i < capture.events.length + 3; i++) state = playback(state, { type: "next" });
    expect(state.running).toBe(false);
    expect(state.cursor).toBe(capture.events.length - 1);
    expect(state.capture).toEqual(original);
    expect(playback(state, { type: "speed", speed: 999 }).speed).toBe(1);
  });
});
