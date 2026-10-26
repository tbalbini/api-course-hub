import type { ChapterId } from "@/content/foundations";
import type { Depth } from "./trace";

export const chapterIds = [0, 1, 2, 3] as const;
export const flags = { 0: ["sum42"], 1: ["compatible", "incompatible"], 2: ["dom-first", "dom-second"], 3: ["uncertain-concurrent"] };
export interface ChapterProgress { quizPassed: boolean; flags: string[] }
export interface Progress { version: 1; lastChapter: ChapterId; depth: Depth; chapters: Record<ChapterId, ChapterProgress> }
export const initialProgress: Progress = { version: 1, lastChapter: 0, depth: "intuition", chapters: { 0: { quizPassed: false, flags: [] }, 1: { quizPassed: false, flags: [] }, 2: { quizPassed: false, flags: [] }, 3: { quizPassed: false, flags: [] } } };
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function decodeProgress(raw: string | null): Progress {
  if (!raw || raw.length > 8192) return initialProgress;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !record(value.chapters)) return initialProgress;
    const progress: Progress = { ...initialProgress, chapters: { ...initialProgress.chapters } };
    if (chapterIds.some(id => id === value.lastChapter)) progress.lastChapter = value.lastChapter as ChapterId;
    if (["intuition", "engineering", "internals"].includes(String(value.depth))) progress.depth = value.depth as Depth;
    for (const id of chapterIds) {
      const saved = value.chapters[id];
      const savedFlags: unknown[] = record(saved) && Array.isArray(saved.flags) ? saved.flags : [];
      progress.chapters[id] = { quizPassed: record(saved) && saved.quizPassed === true, flags: flags[id].filter(flag => savedFlags.includes(flag)) };
    }
    return progress;
  } catch { return initialProgress; }
}

export function complete(id: ChapterId, progress: ChapterProgress): boolean { return progress.quizPassed && flags[id].every(flag => progress.flags.includes(flag)); }
export function award(progress: Progress, id: ChapterId, additions: string[] = [], quizPassed = false): Progress {
  const previous = progress.chapters[id];
  return { ...progress, chapters: { ...progress.chapters, [id]: { quizPassed: previous.quizPassed || quizPassed, flags: flags[id].filter(flag => previous.flags.includes(flag) || additions.includes(flag)) } } };
}
export function mergeProgress(previous: Progress, incoming: Progress): Progress {
  let merged = incoming;
  for (const id of chapterIds) merged = award(merged, id, previous.chapters[id].flags, previous.chapters[id].quizPassed);
  return merged;
}
