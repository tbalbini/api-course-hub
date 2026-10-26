import type { Metadata } from "next";
import { Suspense } from "react";
import { FoundationsLab } from "@/components/foundations-lab";

export const metadata: Metadata = { title: "Primeros principios | The API Universe", description: "Ejecuta una función, explora contratos y descubre las fronteras de una API sin empezar por HTTP." };
export default function FirstPrinciples() { return <Suspense fallback={<p role="status">Cargando capítulo…</p>}><FoundationsLab /></Suspense>; }
