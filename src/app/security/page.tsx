import type { Metadata } from "next";
import { Suspense } from "react";
import { SecurityLab } from "@/components/security-lab";

export const metadata: Metadata = { title: "Seguridad y acceso | The API Universe", description: "Explora identidad, permisos, CORS, CSRF y credenciales mediante modelos causales y HTTP local real." };
export default function SecurityPage() { return <Suspense fallback={<p role="status">Cargando seguridad…</p>}><SecurityLab /></Suspense>; }
