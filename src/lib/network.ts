import { event, type TraceEvent } from "./trace";

export interface NetworkSettings {
  target: "local" | "http" | "https";
  dnsCached: boolean;
  reuseConnection: boolean;
  ingress: "direct" | "proxy" | "balanced";
}

export const defaultNetwork: NetworkSettings = { target: "https", dnsCached: false, reuseConnection: false, ingress: "direct" };
export const origins = { local: "http://127.0.0.1:3000", http: "http://tienda.example", https: "https://tienda.example" };

export function destination(settings: NetworkSettings) {
  const url = new URL(origins[settings.target]);
  return { origin: url.origin, hostname: url.hostname, ip: settings.target === "local" ? "127.0.0.1" : "203.0.113.10", port: Number(url.port || (url.protocol === "https:" ? 443 : 80)), tls: url.protocol === "https:" };
}

export function omission(stage: "dns" | "tcp" | "tls", settings: NetworkSettings): string | undefined {
  if (stage === "dns" && settings.target === "local") return "IP literal: no se necesita resolver un nombre.";
  if (stage === "tls" && settings.target !== "https") return "HTTP sin TLS en este escenario.";
  if (settings.reuseConnection) return "Conexión ya abierta: no se repite la preparación.";
  if (stage === "dns" && settings.dnsCached) return "Caché DNS válida: no se hace otra consulta.";
}

export function preparation(settings: NetworkSettings): TraceEvent[] {
  const target = destination(settings);
  return (["dns", "tcp", "tls"] as const).filter(stage => !omission(stage, settings)).map(stage => event(stage, target, stage === "dns" ? { address: target.ip } : { established: true, simulated: true }, "conceptual"));
}

export function ingress(settings: NetworkSettings): TraceEvent[] {
  if (settings.ingress === "direct") return [];
  const entries = [event("proxy", { tlsTerminatesHere: settings.target === "https" }, { forwarding: true }, "conceptual")];
  if (settings.ingress === "balanced") entries.push(event("balancer", { available: ["app-1", "app-2"] }, { destination: "app-1" }, "conceptual"));
  return entries;
}
