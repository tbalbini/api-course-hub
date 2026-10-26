export const sampleUpdates = ["Pedido recibido", "Pedido confirmado", "Preparando entrega"] as const;
export interface SampleUpdate { sequence: number; message: string; simulatedData: true }
export function sampleUpdate(sequence: number): SampleUpdate { return { sequence, message: sampleUpdates[sequence - 1], simulatedData: true }; }
export function sseFrame(event: string, id: string, data: unknown): string { return `id: ${id}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`; }
export function parseSampleUpdate(raw: string): SampleUpdate {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || !("sequence" in value) || typeof value.sequence !== "number" || !Number.isInteger(value.sequence) || value.sequence < 1 || value.sequence > 3 || !("message" in value) || typeof value.message !== "string" || value.message !== sampleUpdates[value.sequence - 1] || !("simulatedData" in value) || value.simulatedData !== true) throw new Error("Evento de muestra fuera del contrato.");
  return { sequence: value.sequence, message: value.message, simulatedData: true };
}
