import type { Metadata } from "next";
import { Suspense } from "react";
import { AdvancedLab } from "@/components/advanced-lab";
export const metadata: Metadata = { title: "Fronteras avanzadas | The API Universe", description: "Explora ABI, FFI, WebAssembly real, protocolos de bases de datos y herramientas de modelos con contratos y permisos inspeccionables." };
export default function AdvancedPage() { return <Suspense fallback={<p role="status">Cargando fronteras avanzadas…</p>}><AdvancedLab /></Suspense>; }
