import type { Metadata } from "next";
import { Suspense } from "react";
import { CourseSession } from "@/components/course-session";
import { XRayProvider } from "@/components/xray-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "Follow the Click · The API Universe",
  description: "Observa una operación HTTP real y descubre las interfaces, los datos y las fronteras que conectan un click con su resultado.",
  // El tema ya es oscuro; evita que Dark Reader modifique el HTML antes de hidratar.
  other: { "darkreader-lock": "true" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><XRayProvider><Suspense fallback={null}><CourseSession /></Suspense>{children}</XRayProvider></body>
    </html>
  );
}
