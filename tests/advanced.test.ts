import { afterEach, describe, expect, test, vi } from "vitest";
import { abiRun, defaultBinary, validateBinary, wasmModuleBytes, wasmRun } from "@/lib/binary-boundary";
import { decodeQuery, defaultWire, encodeQuery, wireQueries, wireRun } from "@/lib/database-wire";
import { defaultToolSettings, parseToolProposal, toolArgumentSchema, toolRun } from "@/lib/tool-boundary";
import { advancedActivities, advancedTopics } from "@/content/advanced";
import { awardCourse, courseComplete, courseGoals, courseLocation, decodeCourseProgress, initialCourseProgress } from "@/lib/course-progress";
import { playback, type Capture } from "@/lib/trace";

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const proposal = (name: string = "confirm_order", args: unknown = { orderId: "PED-1042" }) => JSON.stringify({ id: "call-42", name, arguments: args });
function traceContract(capture: Capture) {
  const ids = new Set<string>();
  for (const event of capture.events) {
    expect(ids.has(event.id)).toBe(false); expect(event.dependencies.every(id => ids.has(id))).toBe(true); ids.add(event.id);
    for (const text of [event.interaction.initiator, event.interaction.receiver, event.interaction.technology, ...event.interaction.possibleFailures]) expect(text.trim().length).toBeGreaterThan(0);
  }
}
describe("0015 AC-2: ABI y FFI de juguete", () => {
  test("los mismos8 bytes significan10−3 o3−10 según el layout", () => {
    const aligned = abiRun(defaultBinary), inverted = abiRun({ ...defaultBinary, swapped: true });
    expect(aligned.bytes).toEqual([10,0,0,0,3,0,0,0]); expect(inverted.bytes).toEqual(aligned.bytes);
    expect(aligned.result).toBe(7); expect(inverted.result).toBe(-7); expect(inverted.expected).toBe(7);
    expect(aligned.capture.mode).toBe("simulation"); expect(aligned.capture.events.every(e => e.boundary === "Mismo proceso" && e.provenance === "conceptual")).toBe(true);
  });
  test("liberar antes de llamar rechaza sin invocación ni resultado", () => {
    const run = abiRun({ ...defaultBinary, released: true, swapped: true });
    expect(run.error).toBe("LIFETIME"); expect(run.invoked).toBe(false); expect(run.result).toBeNull();
    expect(run.capture.events.some(e => e.stage === "providerModel")).toBe(false);
  });
  test.each([NaN, Infinity, -1001, 1001, 0.5])("limita argumentos antes de representar: %s", value => expect(() => validateBinary(value, 3)).toThrow());
  test("admite límites enteros y conserva el snapshot al modificar opciones", () => {
    const options = { ...defaultBinary, left: -1000, right: 1000 }, run = abiRun(options);
    options.left = 0; expect(run.result).toBe(-2000); expect(run.settings.left).toBe(-1000);
  });
});
describe("0015 AC-3/9: WebAssembly real", () => {
  test.each([[10,3,3], [-10,3,-3], [1000,1,1000], [0,3,0]])("el módulo binario divide %i/%i y devuelve%i", async (left, right, expected) => {
    expect(WebAssembly.validate(wasmModuleBytes())).toBe(true);
    const run = await wasmRun({ ...defaultBinary, left, right });
    expect(run.result).toBe(expected); expect(run.invoked).toBe(true); expect(run.error).toBeNull();
    expect(run.capture.mode).toBe("local"); expect(run.capture.request).toBeUndefined(); expect(run.capture.measuredMs).toBeUndefined();
    expect(run.capture.events.every(e => e.provenance === "observed" && e.boundary === "Mismo proceso")).toBe(true); traceContract(run.capture);
  });
  test("dividir por cero captura un trap real, sin confundirlo con HTTP", async () => {
    const run = await wasmRun({ ...defaultBinary, right: 0 });
    expect(run.error).toBe("WASM_TRAP"); expect(run.result).toBeNull(); expect(run.invoked).toBe(true);
    expect(run.capture.events.at(-1)?.error?.code).toBe("WASM_TRAP"); expect(run.capture.response).toBeUndefined();
  });
  test("replay no vuelve a instanciar y los bytes fijos no se comparten mutables", async () => {
    const compile = vi.spyOn(WebAssembly, "instantiate"), bytes = wasmModuleBytes(); bytes[0] = 99;
    expect(wasmModuleBytes()[0]).toBe(0);
    const run = await wasmRun(defaultBinary), before = structuredClone(run.capture);
    let state = { capture: run.capture, cursor: 0, running: false, speed: 1 };
    state = playback(state, { type: "replay" }); state = playback(state, { type: "next" }); state = playback(state, { type: "previous" });
    expect(state.cursor).toBe(0); expect(compile).toHaveBeenCalledTimes(1); expect(run.capture).toEqual(before);
  });
  test("la guarda rechaza entradas antes de instanciar", async () => {
    const compile = vi.spyOn(WebAssembly, "instantiate");
    await expect(wasmRun({ ...defaultBinary, left: 0.5 })).rejects.toThrow(); expect(compile).not.toHaveBeenCalled();
  });
  test("runtime ausente produce un resultado honesto", async () => {
    vi.stubGlobal("WebAssembly", undefined);
    const run = await wasmRun(defaultBinary); expect(run.error).toBe("WASM_UNAVAILABLE"); expect(run.invoked).toBe(false);
  });
});
describe("0015 AC-4: un frame acotado, no un servidor PostgreSQL", () => {
  test.each(Object.values(wireQueries))("reconstruye todos los prefijos de %s sin adelantar la sentencia", query => {
    const frame = encodeQuery(query);
    expect(frame[0]).toBe(81); expect(new DataView(frame.buffer).getInt32(1, false)).toBe(frame.length - 1);
    expect(frame.length).toBe(6 + new TextEncoder().encode(query).length);
    for (let i = 0; i < frame.length; i++) expect(decodeQuery(frame.slice(0, i))).toBeNull();
    expect(decodeQuery(frame)).toBe(query);
  });
  test.each([1,4,8,64])("fragments de%i producen el mismo mensaje y snapshots paralelos a eventos", chunkSize => {
    const run = wireRun({ ...defaultWire, query: "utf8", chunkSize });
    expect(run.query).toBe(wireQueries.utf8); expect(run.error).toBeNull(); expect(run.snapshots).toHaveLength(run.capture.events.length);
    expect(run.snapshots.slice(0, -1).filter(s => s.received < run.frame.length).every(s => s.query === null)).toBe(true);
    expect(run.snapshots.at(-1)?.state).toBe("complete"); traceContract(run.capture);
  });
  test("EOF truncado no inventa ni entrega una sentencia", () => {
    const run = wireRun({ ...defaultWire, fault: "truncated", chunkSize: 1 });
    expect(run.error).toBe("INCOMPLETE_FRAME"); expect(run.query).toBeNull(); expect(run.snapshots.at(-1)?.received).toBe(run.frame.length - 1);
    expect(run.capture.request).toBeUndefined(); expect(run.capture.response).toBeUndefined();
  });
  test.each([0,3,257,-1])("longitud declarada%i se rechaza al disponer del header", length => {
    const frame = encodeQuery("SELECT 1;"); new DataView(frame.buffer).setInt32(1, length, false);
    expect(() => decodeQuery(frame.slice(0,5))).toThrow("Longitud");
  });
  test("tag, terminador, NUL prematuro, bytes extra y UTF-8 inválido se rechazan", () => {
    const tag = encodeQuery("SELECT 1;"); tag[0] = 88; expect(() => decodeQuery(tag)).toThrow("Tag");
    const missing = encodeQuery("SELECT 1;"); missing[missing.length - 1] = 65; expect(() => decodeQuery(missing)).toThrow("NUL");
    const premature = encodeQuery("SELECT 1;"); premature[6] = 0; expect(() => decodeQuery(premature)).toThrow("NUL");
    const extra = new Uint8Array([...encodeQuery("SELECT 1;"),0]); expect(() => decodeQuery(extra)).toThrow("sobrantes");
    const invalid = encodeQuery("SELECT 1;"); invalid[5] = 255; expect(() => decodeQuery(invalid)).toThrow();
  });
  test("el encoder permite mensaje vacío y acota entrada y terminadores", () => {
    expect(decodeQuery(encodeQuery(""))).toBe("");
    expect(() => encodeQuery("a\0b")).toThrow("NUL"); expect(() => encodeQuery("a".repeat(252))).toThrow();
    expect(() => wireRun({ ...defaultWire, chunkSize: 3 })).toThrow();
  });
  test("cursor no cambia snapshots ni bytes capturados", () => {
    const options = { ...defaultWire }, run = wireRun(options), before = structuredClone(run);
    options.chunkSize = 1;
    const state = playback({ capture: run.capture, cursor: run.capture.events.length - 1, running: false, speed: 1 }, { type: "previous" });
    expect(state.cursor).toBe(run.capture.events.length - 2); expect(run).toEqual(before);
  });
});
describe("0015 AC-5/6: propuesta, permiso, efecto y resultado", () => {
  test.each(["{", "[]", "null", "42", JSON.stringify({ id: "x", name: "get_order", arguments: {}, extra: true }), JSON.stringify({ id: "", name: "get_order", arguments: {} }), JSON.stringify({ id: "x", name: "get_order", arguments: [] })])("propuesta inválida no invoca: %s", source => {
    const run = toolRun(source, defaultToolSettings); expect(run.error).toMatch(/INVALID_/); expect(run.invoked).toBe(false); expect(run.order.status).toBe("created");
  });
  test("el límite cuenta bytes UTF-8 antes de parsear", () => expect(() => parseToolProposal('"' + "á".repeat(1100) + '"')).toThrow("2048"));
  test.each(["run_shell", "constructor", "__proto__", "https://example.com/execute"])("un nombre %s no se convierte en código o URL", name => {
    const run = toolRun(proposal(name), defaultToolSettings); expect(run.error).toBe("UNKNOWN_TOOL"); expect(run.invoked).toBe(false);
  });
  test.each([{}, { orderId: "" }, { orderId: " " }, { orderId: 42 }, { orderId: "x".repeat(81) }, { orderId: "PED-1042", price: 1 }])("argumentos inválidos no llegan a negocio: %j", args => {
    const run = toolRun(proposal("confirm_order", args), defaultToolSettings); expect(run.error).toBe("INVALID_ARGUMENTS"); expect(run.invoked).toBe(false);
  });
  test.each([["none", "get_order", "UNAUTHENTICATED"], ["none", "confirm_order", "UNAUTHENTICATED"], ["reader", "confirm_order", "FORBIDDEN"]] as const)("rol%s no ejecuta%s", (role, name, error) => {
    const run = toolRun(proposal(name), { ...defaultToolSettings, role });
    expect(run.error).toBe(error); expect(run.invoked).toBe(false); expect(run.order.status).toBe("created");
    expect(run.capture.events.some(e => e.stage === "providerModel")).toBe(false);
  });
  test("lector consulta, comprador confirma y el resultado conserva callId", () => {
    const read = toolRun(proposal("get_order"), { ...defaultToolSettings, role: "reader" });
    const confirm = toolRun(proposal(), defaultToolSettings);
    expect(read.consumed?.status).toBe("created"); expect(confirm.consumed?.status).toBe("confirmed");
    expect(confirm.message).toEqual({ callId: "call-42", result: { id: "PED-1042", status: "confirmed" } });
    expect(toolRun(proposal("get_order"), defaultToolSettings).order.status).toBe("created");
  });
  test("pedido ausente se busca, sin confirmar otro pedido", () => {
    const run = toolRun(proposal("confirm_order", { orderId: "another" }), defaultToolSettings);
    expect(run.error).toBe("NOT_FOUND"); expect(run.order.status).toBe("created");
  });
  test("la confirmación sobrevive al rechazo del consumidor v1, y el adaptador conserva significado", () => {
    const failed = toolRun(proposal(), { ...defaultToolSettings, version: "v2" });
    const adapted = toolRun(proposal(), { ...defaultToolSettings, version: "v2", adapt: true });
    expect(failed.error).toBe("INCOMPATIBLE_RESULT"); expect(failed.order.status).toBe("confirmed"); expect(failed.consumed).toBeNull();
    expect(failed.providerResult).toEqual({ id: "PED-1042", state: "confirmed" });
    expect(adapted.consumed).toEqual({ id: "PED-1042", status: "confirmed" }); expect(adapted.error).toBeNull();
    expect(failed.order).not.toBe(adapted.order); traceContract(adapted.capture);
  });
  test("schema y validador coinciden en string no vacío y no blanco", () => {
    const pattern = new RegExp(toolArgumentSchema.properties.orderId.pattern);
    expect(pattern.test("PED-1042")).toBe(true); expect(pattern.test(" ")).toBe(false);
  });
});
describe("0015 AC-7/8: doce temas y progreso sin datos operativos", () => {
  test("cada tema tiene mecanismo, límites, código y una explicación evaluable", () => {
    expect(advancedTopics).toHaveLength(12); expect(new Set(advancedTopics.map(t => t.goal)).size).toBe(12);
    for (const topic of advancedTopics) {
      for (const text of [topic.question, topic.why, topic.what, topic.how, topic.tradeoffs, topic.alternatives, topic.boundaries, topic.code, topic.misconception, topic.check]) expect(text.length).toBeGreaterThan(15);
      expect(topic.answers).toHaveLength(3); expect(topic.answers[topic.correct].feedback).toContain("Correcto.");
    }
  });
  test("completar exige seis actividades y doce comprobaciones, sin borrar capítulos previos", () => {
    expect(new Set([...advancedTopics.map(t => t.goal), ...advancedActivities.map(([id]) => id)])).toEqual(new Set(courseGoals[12]));
    const previous = awardCourse(initialCourseProgress, 11, ["created"]), activities = awardCourse(previous, 12, advancedActivities.map(([id]) => id), true);
    expect(courseComplete(activities, 12)).toBe(false);
    const finished = decodeCourseProgress(JSON.stringify(awardCourse(activities, 12, advancedTopics.map(t => t.goal), true)));
    expect(courseComplete(finished, 12)).toBe(true); expect(finished.chapters[11]).toEqual(previous.chapters[11]);
    expect(courseLocation("/advanced?tab=tools&proposal=private")).toBe("/advanced?tab=tools");
    expect(courseLocation("/advanced?tab=unknown")).toBe("/advanced");
  });
});
