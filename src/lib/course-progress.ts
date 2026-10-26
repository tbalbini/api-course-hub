import type { Depth } from "./trace";
import { challengeIds, type ChallengeId } from "@/content/challenges";

export const courseGoals = {
  4: ["quic", "udp"], 5: ["json", "text", "conditional"], 6: ["read", "confirm"],
  7: ["sseCommand", "webhookDedupe", "pubsubLag"],
  8: ["real401", "real403", "hiddenEffect", "csrfReject"],
  9: ["businessMismatch", "consumerBroken", "offsetDuplicate", "retrySafe"],
  10: ["partial", "late", "stale", "compensated"],
  11: ["created", "read", "confirmed", "invalid", "forbidden", "repeated"],
  12: ["abiMismatch", "lifetime", "wasmTrap", "wireIncomplete", "toolDenied", "evolved", "qAbi", "qFfi", "qWasm", "qBindings", "qDatabase", "qStreams", "qModel", "qTools", "qAgents", "qSchema", "qProduct", "qEvolution"],
} as const;
export type CourseChapter = keyof typeof courseGoals;
export type CourseGoal<C extends CourseChapter> = typeof courseGoals[C][number];
export interface CourseAchievement { flags: string[]; quizPassed: boolean }
export interface CourseProgress { version: 1; chapters: Partial<Record<CourseChapter, CourseAchievement>>; challenges: ChallengeId[]; depth: Depth | null; location: string | null }
export const initialCourseProgress: CourseProgress = { version: 1, chapters: {}, challenges: [], depth: null, location: null };

const locations: Record<string, { param: string; values: string[] } | null> = {
  "/first-principles": { param: "chapter", values: ["0", "1", "2", "3"] },
  "/playground": { param: "tab", values: ["http", "network", "graphql", "rpc"] },
  "/events": { param: "tab", values: ["communication", "delivery", "sse", "chapter"] },
  "/security": { param: "tab", values: ["access", "browser", "credentials", "real", "chapter"] },
  "/contracts": { param: "tab", values: ["design", "compatibility", "collections", "retries", "chapter"] },
  "/systems": { param: "tab", values: ["system", "transactions", "chapter"] },
  "/build-api": { param: "tab", values: ["app", "code", "chapter"] },
  "/advanced": { param: "tab", values: ["binary", "wire", "tools", "chapter"] },
  "/challenges": { param: "challenge", values: [...challengeIds] },
  "/compare": null, "/api-universe": null, "/follow-the-click": null,
};
export function courseLocation(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 200 || !value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, "https://course.example");
    if (url.origin !== "https://course.example" || !Object.hasOwn(locations, url.pathname)) return null;
    const settings = locations[url.pathname], selected = settings && url.searchParams.get(settings.param);
    return url.pathname + (settings && selected && settings.values.includes(selected) ? `?${settings.param}=${selected}` : "");
  } catch { return null; }
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
export function decodeCourseProgress(raw: string | null): CourseProgress {
  if (!raw || raw.length > 8192) return initialCourseProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !record(value.chapters)) return initialCourseProgress;
    const chapters: CourseProgress["chapters"] = {};
    for (const key of Object.keys(courseGoals)) {
      const id = Number(key) as CourseChapter, saved = value.chapters[key];
      if (record(saved)) chapters[id] = { flags: courseGoals[id].filter(flag => Array.isArray(saved.flags) && saved.flags.includes(flag)), quizPassed: saved.quizPassed === true };
    }
    const depth = value.depth === "intuition" || value.depth === "engineering" || value.depth === "internals" ? value.depth : null;
    const challenges = challengeIds.filter(id => Array.isArray(value.challenges) && value.challenges.includes(id));
    return { version: 1, chapters, challenges, depth, location: courseLocation(value.location) };
  } catch { return initialCourseProgress; }
}
export function awardCourse<C extends CourseChapter>(progress: CourseProgress, id: C, additions: readonly string[] = [], quizPassed = false): CourseProgress {
  const previous = progress.chapters[id];
  const flags = courseGoals[id].filter(flag => previous?.flags.includes(flag) || additions.includes(flag));
  const passed = previous?.quizPassed === true || quizPassed;
  if (previous && passed === previous.quizPassed && flags.join() === previous.flags.join()) return progress;
  return { ...progress, chapters: { ...progress.chapters, [id]: { flags, quizPassed: passed } } };
}
export function mergeCourseProgress(previous: CourseProgress, incoming: CourseProgress): CourseProgress {
  let merged: CourseProgress = { ...previous, challenges: challengeIds.filter(id => previous.challenges.includes(id) || incoming.challenges.includes(id)), depth: incoming.depth ?? previous.depth, location: incoming.location ?? previous.location };
  for (const key of Object.keys(courseGoals)) {
    const id = Number(key) as CourseChapter, saved = incoming.chapters[id];
    if (saved) merged = awardCourse(merged, id, saved.flags, saved.quizPassed);
  }
  return merged;
}
export function awardChallenge(progress: CourseProgress, id: ChallengeId): CourseProgress {
  if (!challengeIds.includes(id) || progress.challenges.includes(id)) return progress;
  return { ...progress, challenges: challengeIds.filter(known => known === id || progress.challenges.includes(known)) };
}
export function courseComplete(progress: CourseProgress, id: CourseChapter): boolean {
  const saved = progress.chapters[id];
  return saved?.quizPassed === true && courseGoals[id].every(flag => saved.flags.includes(flag));
}
