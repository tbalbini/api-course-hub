import type { Metadata } from "next";
import { Suspense } from "react";
import { ContractsLab } from "@/components/contracts-lab";

export const metadata: Metadata = { title: "Diseño de contratos | The API Universe", description: "Diseña una interfaz de pedidos, comprueba compatibilidad, schemas, paginación e idempotencia y exporta su descripción." };
export default function ContractsPage() { return <Suspense fallback={<p role="status">Cargando laboratorio de contratos…</p>}><ContractsLab /></Suspense>; }
