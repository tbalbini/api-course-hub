export type OrderStatus = "created" | "confirmed";
export interface OrderState { id: string; status: OrderStatus }

export function readOrder<T extends OrderState>(order: T): T {
  return { ...order };
}

export function confirmOrder<T extends OrderState>(order: T): T {
  return { ...order, status: "confirmed" };
}
