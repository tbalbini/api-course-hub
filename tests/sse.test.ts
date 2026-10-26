import { afterEach, describe, expect, test, vi } from "vitest";
import { GET } from "@/app/api/lab/events/route";
import { parseSampleUpdate, sampleUpdate, sseFrame } from "@/lib/sse";

afterEach(() => vi.useRealTimers());
describe("Stream SSE real acotado", () => {
  test("envía tres updates y complete con formato SSE y libera timers", async () => {
    vi.useFakeTimers();
    const response = await GET(new Request("http://localhost/api/lab/events"));
    expect(response.headers.get("content-type")).toBe("text/event-stream; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = response.text();
    await vi.advanceTimersByTimeAsync(1050);
    const raw = await body;
    for (let sequence = 1; sequence <= 3; sequence++) expect(raw).toContain(sseFrame("update", `sample-${sequence}`, sampleUpdate(sequence)));
    expect(raw).toContain('event: complete\ndata: {"count":3}\n\n');
    expect(raw.match(/event: update/g)).toHaveLength(3);
    expect(vi.getTimerCount()).toBe(0);
  });
  test("cancelar el lector limpia el timer y no emite trabajo posterior", async () => {
    vi.useFakeTimers();
    const abort = new AbortController();
    const response = await GET(new Request("http://localhost/api/lab/events", { signal: abort.signal }));
    const reader = response.body!.getReader(); await reader.read();
    expect(vi.getTimerCount()).toBe(1);
    await reader.cancel(); abort.abort();
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(5000); expect(vi.getTimerCount()).toBe(0);
  });
  test("abortar antes o durante el stream cierra sin timers huérfanos", async () => {
    vi.useFakeTimers();
    const abort = new AbortController(); abort.abort();
    const immediate = await GET(new Request("http://localhost/api/lab/events", { signal: abort.signal })); expect(await immediate.text()).toBe("");
    const activeAbort = new AbortController();
    const active = await GET(new Request("http://localhost/api/lab/events", { signal: activeAbort.signal }));
    const reader = active.body!.getReader(); await reader.read();
    activeAbort.abort(); expect((await reader.read()).done).toBe(true); expect(vi.getTimerCount()).toBe(0);
  });
  test("valida payload antes de mostrarlo y conserva UTF-8 y límites", () => {
    expect(parseSampleUpdate(JSON.stringify(sampleUpdate(2))).message).toBe("Pedido confirmado");
    for (const raw of ["{", "null", '{"sequence":1,"message":"otro","simulatedData":true}', '{"sequence":4,"message":"x","simulatedData":true}', '{"sequence":1,"message":"Pedido recibido","simulatedData":false}']) expect(() => parseSampleUpdate(raw)).toThrow();
  });
});
