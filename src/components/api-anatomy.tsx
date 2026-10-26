import { useState } from "react";
import { mechanisms, type Mechanism } from "@/lib/anatomy";
import type { Capture } from "@/lib/trace";

const parts = ["Consumer", "Contract", "Provider", "Execution", "Result"] as const;
type Part = typeof parts[number];
export function APIAnatomy({ mode, onMode, capture, dom = false }: { mode: Mechanism; onMode: (mode: Mechanism) => void; capture: Capture; dom?: boolean }) {
  const [part, setPart] = useState<Part>("Contract");
  const base = mechanisms[mode];
  const mechanism = dom && mode === "function" ? { ...base, left: "Entorno del navegador · API local", consumer: "JavaScript del ejemplo", provider: "DOM del navegador", contract: "querySelector → Element | null; textContent = texto", execution: "El navegador busca el nodo y cambia su texto sin fetch.", result: "Elemento encontrado y nuevo texto visible. No hay respuesta HTTP." } : base;
  const descriptions: Record<Part, string> = { Consumer: mechanism.consumer, Contract: mechanism.contract, Provider: mechanism.provider, Execution: mechanism.execution, Result: mechanism.result };
  const button = (name: Part) => <button key={name} className={`anatomy-node part-${name.toLowerCase()}`} aria-pressed={part === name} aria-label={`Inspeccionar ${name}`} onClick={() => setPart(name)}><small>{String(parts.indexOf(name) + 1).padStart(2, "0")}</small><strong>{name}</strong><span>{{ Consumer: "Quién pide", Contract: "Qué se promete", Provider: "Quién ofrece", Execution: "Cómo se realiza", Result: "Qué se obtiene" }[name]}</span></button>;
  return <section id="api-anatomy" className="panel anatomy-panel" aria-label="API Anatomy">
    <div className="panel-heading"><span className="overline">API ANATOMY</span><span className="pill">{capture.mode === "simulation" ? "Modelo conceptual" : "Operación local real"}</span></div>
    <div className="anatomy-content"><label className="anatomy-select">Mecanismo de la interfaz<select value={mode} onChange={e => onMode(e.target.value as Mechanism)}>{Object.entries(mechanisms).map(([id, value]) => <option key={id} value={id}>{value.name}</option>)}</select></label>
      <p className="anatomy-caption">Los bloques son responsabilidades de una API. Su agrupación indica fronteras; no son cinco equipos.</p>
      <div className={`anatomy-topology ${mode === "function" ? "one-zone" : "two-zones"}`}>
        <div className="anatomy-zone"><span className="zone-label">{mechanism.left}</span><div className="anatomy-nodes">{(mode === "function" ? parts : ["Consumer", "Contract", "Result"] as const).map(button)}</div></div>
        {mode !== "function" && <><div className={`anatomy-crossing ${mode === "http" || mode === "rpc" ? "crossing-network" : ""}`}><span>{mechanism.boundary}</span><small>{mode === "syscall" ? "Transición de privilegio, no otro proceso obligatorio" : mode === "ipc" ? "Mismo equipo · no requiere internet" : mode === "subscription" ? "Registro hacia el proveedor · eventos hacia el suscriptor" : mode === "message" ? "Productor → broker → trabajador · no retorno síncrono" : "Representación transmitida entre equipos"}</small></div><div className="anatomy-zone"><span className="zone-label">{mechanism.right}</span><div className="anatomy-nodes">{(["Provider", "Execution"] as const).map(button)}</div></div></>}
      </div>
      <div className="anatomy-detail"><span className="overline">{part} / {mode === "function" ? "FRONTERA LOCAL" : mechanism.boundary}</span><p>{descriptions[part]}</p></div>
      <p className="anatomy-caption">Cambiar el mecanismo carga un modelo; no ejecuta infraestructura. Usa el experimento para capturar una operación local real.</p>
    </div>
  </section>;
}
