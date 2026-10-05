/*
  Text helpers.
  [Anything in square brackets] is a placeholder from src/content.js. It is
  shown with a dashed underline so it is easy to spot and replace.
*/

const PLACEHOLDER = /(\[[^\]]+\])/g;

export function Rich({ text }) {
  if (typeof text !== "string") return text ?? null;
  if (!text.includes("[")) return text;
  return text.split(PLACEHOLDER).map((part, i) =>
    part.length > 2 && part.startsWith("[") && part.endsWith("]") ? (
      <span key={i} className="ph" title="Placeholder: replace it in src/content.js">
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}

export const isPlaceholder = (s) => typeof s === "string" && /^\s*\[[^\]]*\]\s*$/.test(s);

export const hasPlaceholder = (s) => typeof s === "string" && /\[[^\]]+\]/.test(s);

/** Text without brackets, for places that cannot show styling (titles, alt text). */
export const plain = (s) => (typeof s === "string" ? s.replace(/\[([^\]]*)\]/g, "$1") : "");

/** "A", "A and B", "A, B and C" */
export function joinNames(names) {
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
