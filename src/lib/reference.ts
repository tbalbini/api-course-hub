import { referenceEntries, referenceTopics, type ReferenceTopic } from "@/content/reference";
import { normalize } from "./taxonomy";

export interface ReferenceState { q: string; topic: ReferenceTopic | ""; term: string; view: "glossary" | "guide" }
const ids = new Set(referenceEntries.map(entry => entry.id));
const collator = new Intl.Collator("es", { sensitivity: "base" });
const indexed = referenceEntries.map(entry => ({ entry, names: [entry.title, ...entry.aliases].map(normalize), text: normalize([entry.title, ...entry.aliases, entry.definition, entry.mechanism, entry.boundary].join(" ")) }));
export function filterReference(query: string, topic: ReferenceState["topic"] = "") {
  const text = normalize(query.slice(0, 160)), tokens = text.split(/\s+/).filter(Boolean);
  const score = (names: string[]) => !text ? 0 : names.includes(text) ? 2 : names.some(name => name.startsWith(text)) ? 1 : 0;
  return indexed.filter(item => (!topic || item.entry.topic === topic) && tokens.every(token => item.text.includes(token)))
    .sort((a, b) => score(b.names) - score(a.names) || collator.compare(a.entry.title, b.entry.title) || a.entry.id.localeCompare(b.entry.id))
    .map(item => item.entry);
}
export function parseReferenceState(params: Pick<URLSearchParams, "get">): ReferenceState & { invalidTerm: boolean } {
  const term = params.get("term"), topic = params.get("topic");
  return { q: (params.get("q") ?? "").slice(0, 160), topic: topic && Object.hasOwn(referenceTopics, topic) ? topic as ReferenceTopic : "", term: term && ids.has(term) ? term : "api", view: params.get("view") === "guide" ? "guide" : "glossary", invalidTerm: term !== null && !ids.has(term) };
}
export function referenceURL(state: ReferenceState): string {
  const valid = parseReferenceState(new URLSearchParams({ q: state.q, topic: state.topic, term: state.term, view: state.view }));
  const params = new URLSearchParams();
  if (valid.view === "guide") params.set("view", valid.view);
  if (valid.term !== "api") params.set("term", valid.term);
  if (valid.q) params.set("q", valid.q);
  if (valid.topic) params.set("topic", valid.topic);
  return "/reference" + (params.size ? `?${params}` : "");
}
