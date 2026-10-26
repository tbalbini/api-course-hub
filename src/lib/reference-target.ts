import type { Stage } from "./trace";

const concepts: Partial<Record<Stage, string>> = {
  invokeLocal: "invocation", enterFrame: "call-stack", executeLocal: "function", returnLocal: "invocation", checkContract: "contract",
  authenticate: "authentication", authorize: "authorization", validate: "validation", persist: "persistence", readStore: "persistence", confirmStored: "persistence", deduplicate: "idempotency",
  request: "serialization", response: "status", parse: "serialization", dns: "dns", tcp: "tcp", tls: "tls", proxy: "reverse-proxy", balancer: "reverse-proxy", endpoint: "endpoint", route: "endpoint", selectDOM: "browser", writeDOM: "browser",
};
export const referenceForStage = (stage: Stage) => `/reference?term=${concepts[stage] ?? "api"}`;
