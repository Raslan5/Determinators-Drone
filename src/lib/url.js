// Allows only in-page anchors ("#id"), the site's own hash routes ("#/phase-1/x": segments of letters, digits, "-") or strict https URLs. Returns { href, external } or null.
const ANCHOR = /^#[A-Za-z0-9_-]+$/;
const ROUTE = /^#\/(?:[A-Za-z0-9-]+(?:\/[A-Za-z0-9-]+)*)?$/;
const FORBIDDEN = /[\s"'<>\\]/;
const HOST_LABEL = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

export function safeHref(u) {
  if (typeof u !== "string") return null;
  if (ANCHOR.test(u) || ROUTE.test(u)) return { href: u, external: false };
  if (!u.startsWith("https://") || u.startsWith("https:///") || FORBIDDEN.test(u)) return null;
  try {
    const p = new URL(u);
    const h = p.hostname;
    if (p.protocol !== "https:" || !h) return null;
    const validHost = h.includes(".") ? h.split(".").every((l, i, a) => l ? HOST_LABEL.test(l) : i === a.length - 1) : HOST_LABEL.test(h) || /^\[[0-9a-f:.]+\]$/i.test(h);
    if (!validHost) return null;
    return { href: p.href, external: true };
  } catch {
    // not a valid absolute URL
  }
  return null;
}
