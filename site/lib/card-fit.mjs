import metrics from "./card-font-metrics.json" with { type: "json" };
const width = (text, size) => [...text].reduce((n,c) => {
  if (metrics.widths[c] === undefined) throw new Error("Unsupported card character");
  return n + metrics.widths[c] * size / metrics.units;
}, 0);
// Fit whole words using advances from the exact embedded Archivo instance.
export function fitText(text, { maxSize, minSize, maxLines, maxWidth = 1056 }) {
  for (let size = maxSize; size >= minSize; size--) {
    const lines = [];
    for (const paragraph of String(text).split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (width(word, size) > maxWidth) { lines.push(...Array(maxLines + 1).fill("")); break; }
        const next = line ? `${line} ${word}` : word;
        if (width(next, size) > maxWidth) { lines.push(line); line = word; } else line = next;
      }
      if (line) lines.push(line);
    }
    if (lines.length <= maxLines) return { size, lines };
  }
  throw new Error("Card text does not fit without cutting words");
}
