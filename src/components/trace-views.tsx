"use client";

import { useState } from "react";
import { destination, omission } from "@/lib/network";
import type { Capture, Stage } from "@/lib/trace";
import { FlowDiagram } from "./flow-diagram";

type Group = { title: string; stages: Stage[]; absent: string };
const processing: Stage[] = ["serverAccept", "route", "middleware", "authenticate", "authorize", "validate", "endpoint", "business", "persist", "deduplicate", "response"];

export function TraceViews({ capture, cursor, onSelect }: { capture: Capture; cursor: number; onSelect: (index: number) => void }) {
  const [view, setView] = useState<"app" | "network" | "infrastructure">("app");
  const real = capture.mode === "real";
  const settings = capture.network;
  const target = settings ? destination(settings) : undefined;
  const groups: Group[] = view === "network" ? [
    { title: "Invocación desde el navegador", stages: ["request"], absent: "No se inició una petición." },
    { title: "Resolución DNS", stages: ["dns"], absent: "" },
    { title: "Conexión TCP", stages: ["tcp"], absent: "" },
    { title: "Seguridad TLS", stages: ["tls"], absent: "" },
    { title: "Transmisión → proveedor", stages: ["wireRequest"], absent: real ? "Transmisión no instrumentada. El evento fetch registra la invocación, no el envío de bytes." : "No se alcanzó esta etapa." },
    { title: "Procesamiento", stages: processing, absent: real ? "Sin eventos del servidor recibidos: su resultado puede ser incierto." : "No alcanzado: la solicitud falló antes de llegar al proveedor." },
    { title: "Retorno → consumidor", stages: ["wireResponse", "receive", "parse", "failure"], absent: "No se alcanzó el retorno." },
  ] : [
    { title: "Entrada opcional · proxy y balanceador", stages: ["proxy", "balancer"], absent: real ? "Roles externos sin instrumentar. No inferimos su presencia o ausencia." : settings?.ingress === "direct" ? "Acceso directo elegido: no hay proxy ni balanceador en este escenario." : "No alcanzado: falló la entrega antes de la entrada." },
    { title: "Proceso de aplicación · recepción y ruta", stages: ["serverAccept", "route"], absent: "No hay recepción observada o alcanzada en esta captura." },
    { title: "Comprobaciones y coordinación local", stages: ["middleware", "authenticate", "authorize", "validate", "endpoint", "business"], absent: "No alcanzado o no observado. No se inventa ejecución de código." },
    { title: "Aplicación → almacenamiento · Map temporal", stages: ["persist", "deduplicate"], absent: "Sin escritura ni recuperación por clave en esta ejecución. Una consulta simulada lee su fixture en negocio." },
    { title: "Resultado y retorno", stages: ["response", "wireResponse", "receive", "failure"], absent: "No se ha observado un resultado remoto." },
  ];
  return <>
    <div className="view-selector" role="group" aria-label="Vista de la traza">{([{ id: "app", name: "Aplicación" }, { id: "network", name: "Red" }, { id: "infrastructure", name: "Infraestructura" }] as const).map(item => <button key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.name}</button>)}</div>
    {view === "app" ? <FlowDiagram capture={capture} selected={capture.events[cursor]} onSelect={onSelect} /> : <section className="trace-view" aria-label={view === "network" ? "Detalle de red" : "Detalle de infraestructura"}>
      {capture.mode === "local" ? <div className="empty-trace"><span className="overline">DENTRO DEL NAVEGADOR</span><h3>Esta operación permanece local.</h3><p>Favoritos modifica estado React. No hay DNS, conexión, petición HTTP ni infraestructura remota en su traza.</p></div> : <>
        <div className="capture-settings"><span className="overline">{real ? "EVIDENCIA DE ESTA CAPTURA" : "CONDICIONES CAPTURADAS"}</span><p>{target && settings ? `${target.origin} · puerto ${target.port} · ${settings.reuseConnection ? "conexión reutilizada" : "conexión nueva"} · ${settings.dnsCached ? "caché DNS válida" : "sin caché DNS"} · ${settings.ingress === "direct" ? "entrada directa" : settings.ingress === "proxy" ? "proxy" : "proxy y balanceador"}` : "Eventos cliente y funciones del Route Handler instrumentados. El protocolo HTTP negociado y los detalles de conexión no están instrumentados."}</p></div>
        <ol className="mechanism-groups">{groups.map(group => {
          const entries = capture.events.map((entry, index) => ({ entry, index })).filter(({ entry }) => group.stages.includes(entry.stage));
          const preparationStage = group.stages[0];
          const absent = ["dns", "tcp", "tls"].includes(preparationStage) ? real ? "Sin instrumentar: esta captura no permite afirmar si ocurrió ni cómo." : settings ? omission(preparationStage as "dns" | "tcp" | "tls", settings) ?? "No alcanzado en esta ejecución." : "Sin configuración de red." : group.absent;
          return <li key={group.title}><h3>{group.title}</h3>{entries.length ? <div className="mechanism-events">{entries.map(({ entry, index }) => <button key={entry.id} className={`mechanism-event actor-${entry.actor} ${entry.state === "error" ? "failed" : ""}`} aria-label={`Inspeccionar evento ${index + 1}: ${entry.action}`} aria-current={index === cursor ? "step" : undefined} onClick={() => onSelect(index)}><span className="event-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{entry.action}</strong><small>{entry.boundary} · {index === cursor ? "Seleccionado" : index < cursor ? "Recorrido" : "Por recorrer"}</small></span><span className="event-status">{entry.state === "error" ? "ERROR" : entry.provenance === "conceptual" ? "MODELO" : "OBSERVADO"}</span></button>)}</div> : <p className="omission-reason">{absent}</p>}</li>;
        })}</ol>
        <p className="view-limits">{view === "network" ? real ? "La vista agrupa mecanismos; la timeline conserva el orden completo. No se agregan handshakes ficticios a una captura real. fetch por sí solo no revela DNS, sockets ni TLS." : "La vista agrupa mecanismos; las repeticiones conservan su número de evento. Modelo HTTP/1.1 sobre TCP. HTTP/2 multiplexa streams; HTTP/3 usa QUIC. Se omiten paquetes, retransmisiones, TTL, reanudación TLS y tiempos de negociación. Los números indican orden lógico, no latencia." : real ? "Las comprobaciones son funciones locales del Route Handler. No afirmamos que se ejecutó un middleware de Next.js ni un proxy externo." : "Proxy y balanceador son roles que pueden compartir componente. En HTTPS con proxy, TLS termina en la entrada. El transporte de entrada a aplicación y el reenvío de respuesta quedan fuera de detalle. Middleware es una responsabilidad conceptual, no un proceso adicional."}</p>
      </>}
    </section>}
  </>;
}
