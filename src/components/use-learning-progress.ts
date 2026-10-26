"use client";

import { useSyncExternalStore } from "react";
import { decodeProgress, initialProgress, mergeProgress, type Progress } from "@/lib/progress";

export const progressKey = "api-universe-learning-v1";
const changed = "api-universe-progress";
let cachedRaw: string | null | undefined;
let cached = initialProgress;
let sessionOnly = false;
export function getLearningProgress(): Progress {
  if (sessionOnly) return cached;
  try {
    const raw = window.localStorage.getItem(progressKey);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const decoded = decodeProgress(raw);
      if (decoded !== initialProgress) cached = mergeProgress(cached, decoded);
    }
  } catch { sessionOnly = true; }
  return cached;
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener); window.addEventListener(changed, listener);
  return () => { window.removeEventListener("storage", listener); window.removeEventListener(changed, listener); };
}
export function saveProgress(progress: Progress): boolean {
  cached = mergeProgress(getLearningProgress(), progress); cachedRaw = JSON.stringify(cached);
  try { window.localStorage.setItem(progressKey, cachedRaw); sessionOnly = false; }
  catch { sessionOnly = true; }
  window.dispatchEvent(new Event(changed)); return !sessionOnly;
}
export function useLearningProgress(): Progress { return useSyncExternalStore(subscribe, getLearningProgress, () => initialProgress); }
