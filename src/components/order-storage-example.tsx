import { useId } from "react";
import { orderInsertColumns, orderInsertLimits, orderInsertSQL, storageResponsibilities } from "@/content/order-storage";
import { storageParameters } from "@/lib/order-storage";
import type { TraceEvent } from "@/lib/trace";

export function OrderStorageExample({ captureId, entry }: { captureId: string; entry: TraceEvent }) {
  const heading = useId();
  if (entry.stage !== "persist") return null;
  const parameters = storageParameters(entry);
  return <section className="panel comparison storage-example" aria-labelledby={heading} data-capture-id={captureId} data-event-id={entry.id}>
    <span className="overline">ALMACENAMIENTO DE ESTE PASO</span>
    <h2 id={heading}>Del Map a una fila SQL</h2>
    <p>Captura: <code>{captureId}</code> · evento: <code>{entry.id}</code>. Referencias de traza; las simulaciones pueden reutilizar estos ids.</p>
    {!parameters ? <p className="operation-notice">{entry.state === "error" ? "Este paso no confirma una escritura correcta. No se ofrece un INSERT." : "La salida capturada no contiene los seis campos válidos de creación. No se completan desde el formulario ni desde otra respuesta."}</p> : <>
      <div className="exchange-grid">
        <div><h3>Map · {entry.provenance === "observed" ? "escritura observada" : "escritura conceptual del escenario"}</h3><p>Este es el mecanismo de almacenamiento de la captura seleccionada.</p><pre tabIndex={0}><code>{entry.code}</code></pre></div>
        <div><h3>Alternativa SQL · conceptual · no ejecutada</h3><p>Si el backend usara una base SQL, esta creación podría representarse así:</p><pre tabIndex={0}><code>{orderInsertSQL}</code></pre></div>
      </div>
      <h3>Parámetros del INSERT conceptual</h3>
      <dl className="storage-parameters" aria-label="Parámetros del INSERT conceptual">{orderInsertColumns.map((column, index) => <div key={column}><dt>${index + 1} · {column}</dt><dd>{JSON.stringify(parameters[index])}</dd></div>)}</dl>
      <dl className="storage-responsibilities">{storageResponsibilities.map(item => <div key={item.role}><dt>{item.role}</dt><dd>{item.explanation}</dd></div>)}</dl>
      <p>{orderInsertLimits}</p>
    </>}
  </section>;
}
