import type { Metadata } from "next";
import { Suspense } from "react";
import { ReferenceExplorer } from "@/components/reference-explorer";
export const metadata: Metadata = { title: "Referencia conceptual | The API Universe", description: "Glosario de APIs, contratos, protocolos y fronteras con búsqueda local, relaciones y experimentos. Guía de ejecución y límites del laboratorio." };
export default function ReferencePage() { return <Suspense><ReferenceExplorer /></Suspense>; }
