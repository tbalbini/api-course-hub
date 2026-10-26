import type { Metadata } from "next";
import { Suspense } from "react";
import { APIPlayground } from "@/components/api-playground";

export const metadata: Metadata = { title: "API Playground | The API Universe", description: "Construye peticiones HTTP locales, inspecciona respuestas y explora TCP, UDP, TLS, QUIC, GraphQL y RPC mediante modelos explícitos." };
export default function PlaygroundPage() { return <Suspense fallback={<p role="status">Cargando laboratorios…</p>}><APIPlayground /></Suspense>; }
