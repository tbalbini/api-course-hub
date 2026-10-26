import { PRODUCT } from "./product";
import type { TraceEvent } from "./trace";

export function storageParameters(entry: TraceEvent): [string, string, number, number, string, string] | null {
  if (entry.stage !== "persist" || entry.state !== "ok" || !entry.output || typeof entry.output !== "object" || Array.isArray(entry.output)) return null;
  const { id, sku, quantity, totalMinor, currency, status } = entry.output as Record<string, unknown>;
  if (typeof id !== "string" || !id.trim() || id.length > 80 || sku !== PRODUCT.sku || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 5 || typeof totalMinor !== "number" || !Number.isInteger(totalMinor) || totalMinor !== quantity * PRODUCT.priceMinor || currency !== PRODUCT.currency || status !== "created") return null;
  return [id, sku, quantity, totalMinor, currency, status];
}
