export type Representation = "application/json" | "text/plain";

export function negotiate(accept: string | null): Representation | null {
  const ranges = (accept ?? "*/*").toLowerCase().split(",").map(part => {
    const [media, ...params] = part.trim().split(";");
    const quality = params.map(param => param.trim()).find(param => param.startsWith("q="))?.slice(2) ?? "1";
    return { media: media.trim(), q: /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(quality) ? Number(quality) : 0 };
  });
  const choices: Representation[] = ["application/json", "text/plain"];
  let best: Representation | null = null;
  let bestQ = 0;
  for (const choice of choices) {
    let specificity = -1; let q = 0;
    for (const range of ranges) {
      const score = range.media === choice ? 2 : range.media === `${choice.split("/")[0]}/*` ? 1 : range.media === "*/*" ? 0 : -1;
      if (score > specificity) { specificity = score; q = range.q; }
    }
    if (q > bestQ) { best = choice; bestQ = q; }
  }
  return best;
}

export function etagMatches(header: string | null, tag: string): boolean {
  return header?.trim() === "*" || !!header?.split(",").some(value => value.trim().replace(/^W\//, "") === tag);
}
