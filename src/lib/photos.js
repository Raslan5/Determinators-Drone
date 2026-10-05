/*
  Finds your photos automatically. You never need to edit this file.

  src/photos/steps/   photos of the build steps, named by step number:
                      01-box.jpg, 01-parts.jpg, 02-radio.jpg ...
  src/photos/flight/  flight photos and short videos (.mp4) for the gallery
  src/photos/team/    portraits: 1.jpg, 2.jpg, 3.jpg (same order as in content.js)
  src/photos/logs/    screenshots of your log graphs from Mission Planner

  The words after the number become the caption:
  "03-arms-on-the-body.jpg" is shown as "Arms on the body".
  Camera names like IMG_1234 get no caption.
*/

const images = import.meta.glob(
  "../photos/*/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}",
  { eager: true, import: "default" },
);
const videos = import.meta.glob("../photos/*/*.{mp4,webm,m4v,MP4,WEBM,M4V}", {
  eager: true,
  import: "default",
});

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export function captionFrom(base) {
  const words = base
    .replace(/^\d+[a-z]?(?=[-_ .]|$)/i, "")
    .replace(/[-_.]+/g, " ")
    .trim();
  if (!words) return "";
  if (/^(img|dsc|dscn|dscf|pxl|mvimg|vid|photo|image|whatsapp|screenshot|captura|foto)\b/i.test(words)) return "";
  if (/^[\d\s]+$/.test(words)) return "";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function toItem(path, url, type) {
  const segments = path.split("/");
  const file = segments[segments.length - 1];
  const folder = segments[segments.length - 2];
  const base = file.replace(/\.[^.]+$/, "");
  return { url, type, folder, file, base, caption: captionFrom(base) };
}

const all = [
  ...Object.entries(images).map(([p, u]) => toItem(p, u, "image")),
  ...Object.entries(videos).map(([p, u]) => toItem(p, u, "video")),
].sort((a, b) => collator.compare(a.file, b.file));

export const inFolder = (folder) => all.filter((x) => x.folder === folder);

/** Files in a folder whose name starts with the number n (01, 1, 01b ...). */
export function startingWith(folder, n) {
  const re = new RegExp(`^0*${n}(?!\\d)`);
  return inFolder(folder).filter((x) => re.test(x.base));
}

/* Optional flight log: a CSV with CTUN messages, see README. */
const csvFiles = import.meta.glob("../flight-log/*.csv", {
  eager: true,
  query: "?raw",
  import: "default",
});

export function readAltitudeLog() {
  const text = Object.values(csvFiles)[0];
  if (!text) return null;
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 3) return null;
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const find = (...names) => header.findIndex((h) => names.some((n) => h.toLowerCase() === n.toLowerCase()));
  const iTime = find("TimeUS", "timestamp", "time", "t");
  const iAlt = find("Alt", "CTUN.Alt", "altitude");
  const iDAlt = find("DAlt", "CTUN.DAlt");
  if (iTime < 0 || iAlt < 0) return null;
  const isMicro = header[iTime].toLowerCase() === "timeus";
  const rows = [];
  for (const line of lines.slice(1)) {
    const cells = line.split(",");
    const t = parseFloat(cells[iTime]);
    const alt = parseFloat(cells[iAlt]);
    if (!Number.isFinite(t) || !Number.isFinite(alt)) continue;
    const dalt = iDAlt >= 0 ? parseFloat(cells[iDAlt]) : NaN;
    rows.push({ t: isMicro ? t / 1e6 : t, alt, dalt: Number.isFinite(dalt) ? dalt : null });
  }
  if (rows.length < 2) return null;
  const t0 = rows[0].t;
  return rows.map((r) => ({ ...r, t: r.t - t0 }));
}
