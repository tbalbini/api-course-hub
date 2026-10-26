import type { Metadata } from "next";
import { Suspense } from "react";
import { EventsLab } from "@/components/events-lab";

export const metadata: Metadata = { title: "Comunicación y eventos | API Universe", description: "Explora polling, SSE, WebSocket, webhooks, colas y event streams. Inyecta pérdidas y duplicados y observa un stream HTTP local real." };
export default function EventsPage() { return <Suspense fallback={<p role="status">Cargando laboratorios…</p>}><EventsLab /></Suspense>; }
