import type { Metadata } from "next";
import { CourseOverview } from "@/components/course-overview";
export const metadata: Metadata = { title: "Tu recorrido | The API Universe", description: "Capítulos, actividades, herramientas y progreso local del laboratorio de APIs." };
export default function CoursePage() { return <CourseOverview />; }
