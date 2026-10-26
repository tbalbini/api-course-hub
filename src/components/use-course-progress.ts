"use client";

import { useSyncExternalStore } from "react";
import { awardCourse, courseGoals, decodeCourseProgress, initialCourseProgress, mergeCourseProgress, type CourseChapter, type CourseGoal, type CourseProgress } from "@/lib/course-progress";
import { useLearningProgress } from "./use-learning-progress";
import type { Depth } from "@/lib/trace";

export const courseProgressKey = "api-universe-course-v1";
const changed = "api-universe-course-progress";
let cached = initialCourseProgress, raw: string | null | undefined, sessionOnly = false;
function snapshot(): CourseProgress {
  if (!sessionOnly) {
    try {
      const next = window.localStorage.getItem(courseProgressKey);
      if (next !== raw) { raw = next; cached = mergeCourseProgress(cached, decodeCourseProgress(next)); }
    } catch { sessionOnly = true; }
  }
  return cached;
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener); window.addEventListener(changed, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(changed, listener); };
}
export function updateCourseProgress(update: (previous: CourseProgress) => CourseProgress) {
  const previous = snapshot(), next = update(previous);
  const encoded = JSON.stringify(next);
  if (next === previous && raw === encoded) return;
  cached = next; raw = encoded;
  try { window.localStorage.setItem(courseProgressKey, raw); sessionOnly = false; } catch { sessionOnly = true; }
  window.dispatchEvent(new Event(changed));
}
export function useCourseProgress() { return useSyncExternalStore(subscribe, snapshot, () => initialCourseProgress); }
export function useCourseStorage() { return useSyncExternalStore(subscribe, () => sessionOnly, () => false); }
export function useChapterProgress<C extends CourseChapter>(chapter: C) {
  const progress = useCourseProgress(), saved = progress.chapters[chapter];
  const goals = Object.fromEntries(courseGoals[chapter].map(flag => [flag, saved?.flags.includes(flag) ?? false])) as Record<CourseGoal<C>, boolean>;
  function setGoals(update: (previous: Record<CourseGoal<C>, boolean>) => Record<CourseGoal<C>, boolean>) {
    updateCourseProgress(previous => {
      const current = Object.fromEntries(courseGoals[chapter].map(flag => [flag, previous.chapters[chapter]?.flags.includes(flag) ?? false])) as Record<CourseGoal<C>, boolean>;
      const next = update(current);
      return awardCourse(previous, chapter, Object.keys(next).filter(flag => next[flag as CourseGoal<C>]));
    });
  }
  function check(correct: boolean) { if (correct) updateCourseProgress(previous => awardCourse(previous, chapter, [], true)); }
  return { goals, setGoals, quizPassed: saved?.quizPassed ?? false, check };
}
export function useCourseDepth(): [Depth, (depth: Depth) => void] {
  const progress = useCourseProgress(), legacy = useLearningProgress();
  return [progress.depth ?? legacy.depth, depth => updateCourseProgress(previous => previous.depth === depth ? previous : { ...previous, depth })];
}
