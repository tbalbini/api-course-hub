"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { XRayToggle } from "./xray-mode";
import { Sidebar } from "./sidebar";
import { HTTPEditor } from "./http-editor";
import { NetworkLab } from "./network-lab";
import { ProtocolLab } from "./protocol-lab";

const tabs = [{ id: "http", name: "HTTP real", detail: "C / Construye mensajes" }, { id: "network", name: "Red conceptual", detail: "04 / Sigue los datos" }, { id: "graphql", name: "GraphQL", detail: "D / Selecciona campos" }, { id: "rpc", name: "RPC / gRPC", detail: "E / Invoca capacidades" }] as const;

export function APIPlayground() {
  const requestedTab = useSearchParams().get("tab");
  const tab = tabs.find(item => item.id === requestedTab)?.id ?? "http";
  const chapter = tab === "network" ? 4 : tab === "http" ? 5 : 6;
  function setTab(id: string) { window.history.replaceState(null, "", `/playground?tab=${id}`); }
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  return <div className="app-shell"><a className="skip-link" href="#experiment">Saltar al experimento</a><Sidebar active="playground" chapter={chapter} practice={tab} /><div className="main-shell"><header className="topbar"><span className="breadcrumb">Capítulo {chapter} <span>/</span><strong>API Playground</strong></span><span className="pill">Real y conceptual, identificados</span><XRayToggle /></header><main id="experiment" tabIndex={-1}><div className="page-heading"><div><span className="overline">CAPÍTULO {String(chapter).padStart(2, "0")} / {tab === "network" ? "RED Y TRANSPORTE" : tab === "http" ? "LABORATORIO C / HTTP" : tab === "graphql" ? "LABORATORIO D / GRAPHQL" : "LABORATORIO E / RPC Y GRPC"}</span><h1>Del dato al mensaje<span>.</span></h1><p>Edita, envía y desmonta una interacción. Descubre qué parte pertenece al contrato y cuál al camino.</p></div></div><div className="playground-tabs" role="tablist" aria-label="Laboratorios de APIs">{tabs.map((item, index) => <button key={item.id} ref={element => { tabRefs.current[index] = element; }} role="tab" id={`tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={e => {
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault(); setTab(tabs[next].id); tabRefs.current[next]?.focus();
  }}><strong>{item.name}</strong><span>{item.detail}</span></button>)}</div>{tabs.map(item => <div key={item.id} role="tabpanel" id={`panel-${item.id}`} aria-labelledby={`tab-${item.id}`} hidden={tab !== item.id}>{item.id === "http" ? <HTTPEditor active={tab === item.id} /> : item.id === "network" ? <NetworkLab active={tab === item.id} /> : <ProtocolLab kind={item.id} active={tab === item.id} />}</div>)}</main><footer>Los mensajes transportan datos. Los contratos les dan significado.</footer></div></div>;
}
