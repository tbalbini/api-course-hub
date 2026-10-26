import { sampleUpdate, sseFrame } from "@/lib/sse";

export async function GET(request: Request) {
  const path = new URL(request.url).pathname;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let closed = false;
  let abort: () => void = () => {};
  const cleanup = () => { if (timer) clearTimeout(timer); request.signal.removeEventListener("abort", abort); };
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      const finish = () => { if (closed) return; closed = true; cleanup(); controller.close(); };
      abort = finish;
      if (request.signal.aborted) { finish(); return; }
      request.signal.addEventListener("abort", abort, { once: true });
      controller.enqueue(encoder.encode(`: flujo local real ${path} con datos de muestra\n\n`));
      let sequence = 0;
      const send = () => {
        if (closed) return;
        sequence++;
        controller.enqueue(encoder.encode(sseFrame("update", `sample-${sequence}`, sampleUpdate(sequence))));
        if (sequence === 3) { controller.enqueue(encoder.encode(sseFrame("complete", "complete", { count: 3 }))); finish(); }
        else timer = setTimeout(send, 350);
      };
      timer = setTimeout(send, 350);
    },
    cancel() { closed = true; cleanup(); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
