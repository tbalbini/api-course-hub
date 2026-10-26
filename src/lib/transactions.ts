import { interaction } from "./interaction";
import { modelStep } from "./communication";
import type { Capture, TraceEvent } from "./trace";

export interface TransactionSettings { mode: "local" | "independent" | "saga" | "two-phase"; failure: "none" | "payment" | "compensation" | "coordinator" }
export const defaultTransaction: TransactionSettings = { mode: "saga", failure: "payment" };
export interface TransactionState { stock: number; reserved: number; chargedMinor: number; order: "created" | "confirmed" | "cancelled" | "attention"; prepared: boolean; decision: "commit" | "abort" | null }
export interface TransactionEvent extends TraceEvent { publicState: TransactionState }
export interface TransactionRun { settings: TransactionSettings; state: TransactionState; pending: "compensation" | "commit" | null; recovered: boolean; capture: Omit<Capture, "events"> & { events: TransactionEvent[] } }
const initialState = (): TransactionState => ({ stock: 3, reserved: 0, chargedMinor: 0, order: "created", prepared: false, decision: null });
function emit(run: TransactionRun, action: string, cause: string, data: unknown = null, error?: string) {
  const i = run.capture.events.length, id = `transaction:${i}`;
  const entry: TransactionEvent = { ...modelStep(error ? "failure" : "persist", action, data, run.state, cause, "store", "Reserva + asiento ficticio + pedido", "// Modelo transaccional sin DB, red ni pagos\n// El estado público se conserva en cada evento", `${cause} Solo orden lógico, sin duración ni ejecución real de protocolo. Un asiento del libro ficticio no es un pago externo.`, interaction(run.settings.mode === "local" ? "Transacción local" : "Coordinador del modelo", run.settings.mode === "local" ? "Almacenamiento transaccional local" : "Participantes de reserva, asiento y pedido", run.settings.mode === "local" ? "Transacción local conceptual" : `${run.settings.mode} · almacenamiento distribuido conceptual`, "Fallo de participante, compensación o coordinador según el escenario.")), id, logicalTime: i, dependencies: i ? [`transaction:${i - 1}`] : [], publicState: structuredClone(run.state) };
  if (error) { entry.state = "error"; entry.error = { code: error, message: cause }; }
  run.capture.events.push(entry);
}
const committed = (): TransactionState => ({ stock: 2, reserved: 0, chargedMinor: 8900, order: "confirmed", prepared: false, decision: null });
export function runTransaction(options: TransactionSettings): TransactionRun {
  if (!["local", "independent", "saga", "two-phase"].includes(options.mode) || !["none", "payment", "compensation", "coordinator"].includes(options.failure)) throw new Error("Modelo transaccional desconocido.");
  if (options.failure === "compensation" && options.mode !== "saga" || options.failure === "coordinator" && options.mode !== "two-phase") throw new Error("El fallo no corresponde a este mecanismo.");
  const settings = { ...options }, run: TransactionRun = { settings, state: initialState(), pending: null, recovered: false, capture: { id: "systems:transaction", mode: "simulation", events: [] } };
  emit(run, "Comenzar operación de confirmación", "Una unidad de inventario, un asiento8900 y una confirmación deben coordinarse. Todo es ficticio.");
  if (settings.mode === "local") {
    emit(run, "Preparar cambios privados en una DB", "El estado público no cambia hasta commit. Todas las tablas están en una misma base, sin proveedor de pago externo.", { working: committed() });
    if (settings.failure === "payment") emit(run, "Rollback local", "La transacción local descarta todos los cambios privados. El estado inicial sigue publicado.", null, "LEDGER_REJECTED");
    else { run.state = committed(); emit(run, "Commit local atómico", "Las restricciones de una DB permiten publicar juntos estos cambios bajo la transacción del modelo."); }
  } else if (settings.mode === "two-phase") {
    run.state.prepared = true;
    emit(run, "Prepare: inventario vota sí", "El participante prepara cambios y conserva locks, sin publicar la reserva.", { participant: "inventory", vote: "yes" });
    const no = settings.failure === "payment";
    emit(run, no ? "Prepare: libro y pedido votan no" : "Prepare: libro y pedido votan sí", "El coordinador necesita todos los votos; no basta con recibir uno.", { participant: "ledger-order", vote: no ? "no" : "yes" }, no ? "VOTE_NO" : undefined);
    run.state.decision = no ? "abort" : "commit";
    emit(run, "Registrar decisión del coordinador", "Registro durable conceptual anterior al envío a participantes. Este modelo no escribe en disco ni implementa consenso.", { decision: run.state.decision });
    if (settings.failure === "coordinator") { run.pending = "commit"; emit(run, "Coordinador cae antes de entregar commit", "Los participantes preparados esperan la decisión registrada. No asumen abort por un timeout.", null, "COORDINATOR_DOWN"); }
    else if (no) { run.state.prepared = false; emit(run, "Aplicar abort y liberar preparación", "Ningún participante publica los cambios preparados."); }
    else { run.state = { ...committed(), decision: "commit" }; emit(run, "Entregar commit a participantes", "Snapshot agregado simplificado. Se omite visibilidad intermedia entre DBs, aislamiento y fallos de cada mensaje."); }
  } else {
    run.state.stock--; run.state.reserved++;
    emit(run, "Commit de reserva en inventario", "La reserva ya es visible en su almacén aunque falle el siguiente paso.");
    if (settings.failure === "none") {
      run.state.chargedMinor = 8900; emit(run, "Commit de asiento en libro", "Otro almacén publica un asiento ficticio. No hay transacción global implícita.");
      run.state.order = "confirmed"; run.state.reserved = 0; emit(run, "Confirmar pedido y consumir reserva", "Los pasos independientes llegaron al estado deseado. Una saga no proporciona aislamiento global.");
    } else {
      emit(run, "El libro rechaza el asiento", "No se cobra nada, pero la reserva ya está confirmada en otra DB.", null, "LEDGER_REJECTED");
      if (settings.mode === "independent") emit(run, "Queda una reserva sin recuperación", "Una excepción no revierte automáticamente los commits anteriores.", null, "PARTIAL_COMMIT");
      else if (settings.failure === "compensation") { run.state.order = "attention"; run.pending = "compensation"; emit(run, "Falla la compensación de reserva", "Compensar es otra operación que puede fallar. Se conserva la tarea pendiente para recuperarla.", null, "COMPENSATION_FAILED"); }
      else { run.state.stock++; run.state.reserved = 0; run.state.order = "cancelled"; emit(run, "Compensar reserva y cancelar pedido", "La compensación aplica una operación de negocio inversa; no borra la historia como un rollback local."); }
    }
  }
  return run;
}
export function recoverTransaction(previous: TransactionRun): TransactionRun {
  const run = structuredClone(previous);
  if (!run.pending) return run;
  if (run.pending === "compensation") { run.state.stock++; run.state.reserved = 0; run.state.order = "cancelled"; emit(run, "Recuperar compensación pendiente", "Se libera la reserva existente; no se reserva ni se cobra otra vez. La recuperación puede reintentarse sin repetir el efecto."); }
  else { run.state = { ...committed(), decision: "commit" }; emit(run, "Recuperar decisión commit registrada", "La recuperación consulta la decisión conocida del coordinador, la entrega y libera la preparación. No inventa una decisión nueva."); }
  run.pending = null; run.recovered = true; return run;
}
