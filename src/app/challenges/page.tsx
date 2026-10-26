import type { Metadata } from "next";
import { Suspense } from "react";
import { ChallengesLab } from "@/components/challenges-lab";
export const metadata: Metadata = { title: "Desafíos y evaluación razonada | The API Universe", description: "Siete desafíos para ejecutar, inspeccionar y explicar APIs, contratos, permisos y fallos con criterios transparentes." };
export default function ChallengesPage() { return <Suspense fallback={<p role="status">Cargando desafíos…</p>}><ChallengesLab /></Suspense>; }
