import type { Metadata } from "next";
import { Suspense } from "react";
import { BuildApiLab } from "@/components/build-api-lab";
import sources from "@/generated/project-sources.json";

export const metadata: Metadata = { title: "Construir una API | The API Universe", description: "Sigue una aplicación real de pedidos desde el click al Map y abre el código exacto de esta compilación." };
export default function BuildApiPage() { return <Suspense fallback={<p role="status">Cargando proyecto de pedidos…</p>}><BuildApiLab sources={sources} /></Suspense>; }
