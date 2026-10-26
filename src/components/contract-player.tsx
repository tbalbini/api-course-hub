"use client";
import { useEffect, useState, type Dispatch } from "react";
import type { Depth, Playback, PlaybackAction } from "@/lib/trace";
import { TracePlayer } from "./trace-player";

export function ContractPlayer({ active, state, dispatch, label = "Simulación ejecutable · eventos y datos inspeccionables", codeNote = "Código representativo del modelo. No ejecuta HTTP, DB ni código arbitrario. Reproducir conserva las operaciones ya calculadas y solo cambia la observación." }: { active: boolean; state: Playback; dispatch: Dispatch<PlaybackAction>; label?: string; codeNote?: string }) {
  const [depth, setDepth] = useState<Depth>("engineering");
  useEffect(() => { if (!active) dispatch({ type: "pause" }); }, [active, dispatch]);
  return <><div className="contract-xray"><span>{label}</span></div><TracePlayer state={state} dispatch={dispatch} depth={depth} onDepth={setDepth} codeNote={codeNote} /></>;
}
