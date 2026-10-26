import type { Metadata } from "next";
import { Suspense } from "react";
import { SystemsLab } from "@/components/systems-lab";
export const metadata: Metadata = { title: "Systems Lab | The API Universe", description: "Construye una arquitectura guiada y explora concurrencia, fallos parciales, caché, circuit breakers, transacciones y recuperación." };
export default function SystemsPage() { return <Suspense fallback={<p role="status">Cargando laboratorio de sistemas…</p>}><SystemsLab /></Suspense>; }
