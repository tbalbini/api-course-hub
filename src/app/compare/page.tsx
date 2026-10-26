import type { Metadata } from "next";
import { ComparisonLab } from "@/components/comparison-lab";

export const metadata: Metadata = { title: "Un pedido, distintas interfaces | API Universe", description: "Compara función local, REST, GraphQL, RPC, gRPC, SOAP, polling y suscripción con el mismo pedido. Inspecciona trazas y ejecuta HTTP local real." };
export default function ComparePage() { return <ComparisonLab />; }
