"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Icon } from "./icon";

const XRayContext = createContext<{ enabled: boolean; toggle: () => void } | null>(null);

export function XRayProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  return <XRayContext.Provider value={{ enabled, toggle: () => setEnabled(previous => !previous) }}>{children}</XRayContext.Provider>;
}

export function useXRay() {
  const context = useContext(XRayContext);
  if (!context) throw new Error("X Ray necesita su proveedor de sesión.");
  return context;
}

export function XRayToggle() {
  const { enabled, toggle } = useXRay();
  return <button className={`xray-button ${enabled ? "enabled" : ""}`} aria-label="X Ray Mode" aria-pressed={enabled} onClick={toggle} title="Mostrar u ocultar los detalles de todas las operaciones del laboratorio"><Icon name="eye" />X Ray<span>{enabled ? "Activo" : "Inactivo"}</span></button>;
}
