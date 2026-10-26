export function Icon({ name }: { name: "play" | "pause" | "back" | "next" | "replay" | "arrow" | "eye" | "layers" | "heart" | "globe" }) {
  const paths = { play: "m9 5 11 7-11 7Z", pause: "M8 5v14M16 5v14", back: "M6 5v14m13-14L8 12l11 7Z", next: "M18 5v14M5 5l11 7-11 7Z", replay: "M4 10a8 8 0 1 1 1 8M4 4v6h6", arrow: "M4 12h15m-6-6 6 6-6 6", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6", layers: "m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5", heart: "M12 20S2 14 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 6-10 12-10 12Z", globe: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18" };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

