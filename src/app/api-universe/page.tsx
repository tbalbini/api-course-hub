import type { Metadata } from "next";
import { TaxonomyExplorer } from "@/components/taxonomy-explorer";

export const metadata: Metadata = { title: "API Universe | Taxonomy Explorer", description: "Explora seis dimensiones independientes de las APIs y compara contratos, formatos, protocolos y estilos sin confundir sus capas." };
export default function APIUniverse() { return <TaxonomyExplorer />; }
