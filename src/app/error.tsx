"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return <main className="route-message"><span className="overline">THE API UNIVERSE / ERROR</span><h1>No pudimos mostrar esta experiencia.</h1><p role="alert">Puedes volver a cargarla o regresar a tu recorrido. Un error de pantalla no demuestra que una operación HTTP anterior haya sido cancelada.</p><div className="course-actions"><button className="primary-button" onClick={() => retry()}>Reintentar carga</button><Link className="secondary-button" href="/course">Volver a mi recorrido</Link></div></main>;
}
