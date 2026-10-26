import Link from "next/link";
export default function NotFound() {
  return <main className="route-message"><span className="overline">THE API UNIVERSE / 404</span><h1>Esta ruta no está disponible.</h1><p>Puede que el enlace haya cambiado o que esa experiencia todavía no exista. Tus logros guardados siguen disponibles.</p><div className="course-actions"><Link href="/course" className="primary-button">Volver a mi recorrido</Link><Link href="/first-principles?chapter=0" className="secondary-button">Empezar por primeros principios</Link></div></main>;
}
