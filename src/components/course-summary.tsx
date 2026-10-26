"use client";
import Link from "next/link";
import { courseChapters } from "@/content/course";
import { complete } from "@/lib/progress";
import { courseComplete, courseGoals, type CourseChapter } from "@/lib/course-progress";
import type { ChapterId } from "@/content/foundations";
import { useCourseProgress } from "./use-course-progress";
import { useLearningProgress } from "./use-learning-progress";

export function useCourseSummary() {
  const course = useCourseProgress(), foundations = useLearningProgress();
  function status(id: number) {
    const achievement = id < 4 ? foundations.chapters[id as ChapterId] : course.chapters[id as CourseChapter];
    const finished = id < 4 ? complete(id as ChapterId, foundations.chapters[id as ChapterId]) : Object.hasOwn(courseGoals, id) && courseComplete(course, id as CourseChapter);
    return finished ? "Completado" : achievement && (achievement.quizPassed || achievement.flags.length > 0) ? "En curso" : "Por explorar";
  }
  const available = courseChapters.filter(chapter => chapter.available);
  const finished = available.filter(chapter => status(chapter.id) === "Completado").length;
  const inProgress = available.filter(chapter => status(chapter.id) === "En curso").length;
  const started = foundations.lastChapter !== 0 || course.location !== null || course.challenges.length > 0 || Object.keys(course.chapters).length > 0 || Object.values(foundations.chapters).some(chapter => chapter.quizPassed || chapter.flags.length > 0);
  return { status, finished, inProgress, challengesFinished: course.challenges.length, total: available.length, started, resume: course.location ?? `/first-principles?chapter=${foundations.lastChapter}` };
}

export function CourseSummaryLink({ current, onNavigate }: { current: boolean; onNavigate: () => void }) {
  const { finished, total } = useCourseSummary();
  return <Link href="/course" prefetch={false} onNavigate={onNavigate} className={`course-summary-link ${current ? "nav-active" : ""}`} aria-current={current ? "page" : undefined}><strong>Tu recorrido</strong><span>{finished} de {total} capítulos completados</span></Link>;
}

