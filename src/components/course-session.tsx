"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { courseLocation } from "@/lib/course-progress";
import { updateCourseProgress, useCourseProgress, useCourseStorage } from "./use-course-progress";

export function CourseSession() {
  const pathname = usePathname(), params = useSearchParams();
  const location = courseLocation(`${pathname}?${params.toString()}`);
  useCourseProgress();
  const sessionOnly = useCourseStorage();
  useEffect(() => {
    if (location) updateCourseProgress(previous => previous.location === location ? previous : { ...previous, location });
  }, [location]);
  return sessionOnly ? <p className="storage-notice" role="status">Almacenamiento no disponible. Tus logros se conservan solo mientras esta página esté abierta.</p> : null;
}
