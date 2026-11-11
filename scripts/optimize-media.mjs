#!/usr/bin/env node
/*
  Optimiza src/photos/** (uso local, no se ejecuta en el build).

  1. Copia cada original de src/photos a ../media-originals/ (fuera del repo), conservando la estructura.
     Nunca sobrescribe una copia existente.
  2. Fotos jpg/jpeg/png -> WebP (max 1600 px en el lado mayor, sin ampliar, calidad 80, orientacion EXIF
     aplicada, metadatos eliminados). El original se borra solo si el WebP se ha generado y verificado.
  3. Videos mp4 -> H.264 (max 1080 px en el lado corto, CRF 26), AAC, +faststart, sin metadatos
     (sin GPS ni fecha). Se escribe a un temporal y solo reemplaza el original si todo sale bien.
     Cada video genera <nombre>.poster.webp con el primer fotograma (max 1080 px en el lado mayor, WebP calidad 75).
  4. Idempotente: un original ya convertido no existe (fotos) o lleva la marca de optimizacion (videos).
     Un poster que existe pero mide mas de 1080 px en el lado mayor se regenera (el video no se toca).

  Se saltan los archivos a los que el codigo de src/ (fuera de src/photos) hace referencia por nombre
  completo entre comillas (por ejemplo "frame.png"), porque Inside.jsx los busca por nombre exacto.
  Los comentarios de codigo (de linea y de bloque) no cuentan como referencia.

  Requisitos: sharp (devDependency) y ffmpeg/ffprobe en el PATH.
*/

import { constants, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);

const MAX_PHOTO_PX = 1600;
const WEBP_QUALITY = 80;
const MAX_POSTER_PX = 1080;
const POSTER_QUALITY = 75;
const MAX_VIDEO_SHORT_SIDE = 1080;
const VIDEO_CRF = 26;
const VIDEO_MARKER = "media-optimized=v1";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
const srcDir = path.join(repo, "src");
const photosDir = path.join(srcDir, "photos");
// Fuera del repo: <carpeta padre del repo>/media-originals, o la ruta de MEDIA_ORIGINALS si se define.
const originalsDir = process.env.MEDIA_ORIGINALS
  ? path.resolve(process.env.MEDIA_ORIGINALS)
  : path.resolve(repo, "..", "media-originals");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);
const VIDEO_EXT = new Set([".mp4"]);
const ORIGINAL_EXT = new Set([...IMAGE_EXT, ...VIDEO_EXT]);

const mb = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`;
const log = (msg) => console.log(msg);
const warn = (msg) => console.warn(`AVISO: ${msg}`);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(abs)));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

async function dirSize(dir) {
  let total = 0;
  for (const f of await walk(dir)) total += (await fs.stat(f)).size;
  return total;
}

async function checkTools() {
  for (const bin of ["ffmpeg", "ffprobe"]) {
    try {
      await run(bin, ["-version"]);
    } catch {
      throw new Error(`No se encuentra ${bin} en el PATH.`);
    }
  }
}

async function ffprobe(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-print_format", "json",
    "-show_format",
    "-show_streams",
    file,
  ]);
  return JSON.parse(stdout);
}

/** Elimina temporales de ejecuciones anteriores interrumpidas (solo nuestros ficheros ".*.tmp.*"). */
async function cleanStaleTemps(dir) {
  for (const f of await walkAll(dir)) {
    if (/^\..*\.tmp\./.test(path.basename(f))) {
      await fs.rm(f, { force: true });
      warn(`temporal de una ejecucion anterior eliminado: ${path.relative(repo, f)}`);
    }
  }
}

/** Como walk, pero incluye los ficheros ocultos (para encontrar temporales). */
async function walkAll(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walkAll(abs)));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

/** Copia cada original (jpg/jpeg/png/mp4) a media-originals. No sobrescribe. */
async function backupOriginals(files) {
  let copied = 0;
  let already = 0;
  for (const abs of files) {
    if (!ORIGINAL_EXT.has(path.extname(abs).toLowerCase())) continue;
    const dest = path.join(originalsDir, path.relative(photosDir, abs));
    await fs.mkdir(path.dirname(dest), { recursive: true });
    try {
      await fs.copyFile(abs, dest, constants.COPYFILE_EXCL);
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
      already++;
      continue;
    }
    const [a, b] = await Promise.all([fs.stat(abs), fs.stat(dest)]);
    if (a.size !== b.size) throw new Error(`La copia de ${abs} no coincide en tamano.`);
    copied++;
  }
  log(`Originales: ${copied} copiados, ${already} ya existian (no sobrescritos) en ${originalsDir}`);
}

/**
 * Quita los comentarios // y /* *\/ de un fuente. Las cadenas ('...', "...", `...`) se conservan
 * enteras, para que una URL como "https://..." no se tome por comentario.
 */
function stripComments(text) {
  const re = /("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g;
  return text.replace(re, (m, str) => str ?? "");
}

/** Nombres de archivo de foto/video citados como cadena completa en src/ (fuera de src/photos). */
async function referencedNames() {
  const names = new Set();
  // Solo cuenta una cadena que sea exactamente un nombre de archivo (opcionalmente con carpetas delante).
  const re = /(["'`])((?:[\w.-]+\/)*[\w.-]+\.(?:jpe?g|png|webp|mp4))\1/gi;
  const textExt = /\.(?:jsx?|tsx?|mjs|css|html|json)$/i;
  for (const f of await walkAll(srcDir)) {
    if (f.startsWith(photosDir + path.sep) || !textExt.test(f)) continue;
    const code = stripComments(await fs.readFile(f, "utf8"));
    for (const m of code.matchAll(re)) names.add(path.posix.basename(m[2]).toLowerCase());
  }
  return names;
}

/** True si el poster existe y su lado mayor no supera MAX_POSTER_PX. */
async function posterIsCurrent(posterPath) {
  if (!(await exists(posterPath))) return false;
  const meta = await sharp(posterPath).metadata();
  return Math.max(meta.width ?? 0, meta.height ?? 0) <= MAX_POSTER_PX;
}

async function convertImage(abs, targets) {
  const dir = path.dirname(abs);
  const name = path.basename(abs, path.extname(abs));
  const out = path.join(dir, `${name}.webp`);
  if (targets.has(out)) throw new Error(`Dos originales generarian ${path.relative(repo, out)}.`);
  targets.add(out);

  const tmp = path.join(dir, `.${name}.tmp.${process.pid}.webp`);
  try {
    // rotate() aplica la orientacion EXIF; sin withMetadata(), sharp elimina el resto de metadatos.
    await sharp(abs)
      .rotate()
      .resize({ width: MAX_PHOTO_PX, height: MAX_PHOTO_PX, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(tmp);

    const meta = await sharp(tmp).metadata();
    if (meta.format !== "webp" || !meta.width || !meta.height) throw new Error("WebP no valido");
    if (meta.exif || meta.xmp || meta.iptc) throw new Error("El WebP conserva metadatos");

    await fs.rename(tmp, out);
  } catch (err) {
    await fs.rm(tmp, { force: true });
    throw err;
  }
  await fs.rm(abs);
  const written = await fs.stat(out);
  log(`  foto  ${path.relative(photosDir, abs)} -> ${path.basename(out)} (${mb(written.size)})`);
}

/** Dimensiones de salida si el lado corto supera 1080 px; null si no hay que escalar. */
function videoTargetSize(stream) {
  const short = Math.min(stream.width, stream.height);
  if (short <= MAX_VIDEO_SHORT_SIDE) return null;
  const scale = MAX_VIDEO_SHORT_SIDE / short;
  const even = (n) => 2 * Math.round(n / 2);
  return { w: even(stream.width * scale), h: even(stream.height * scale) };
}

async function convertVideo(abs) {
  const dir = path.dirname(abs);
  const name = path.basename(abs, path.extname(abs));
  const probe = await ffprobe(abs);
  const video = probe.streams.find((s) => s.codec_type === "video");
  if (!video) throw new Error("El video no tiene pista de vídeo");
  const tags = Object.fromEntries(Object.entries(probe.format.tags ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  const optimized = tags.comment === VIDEO_MARKER;
  const posterPath = path.join(dir, `${name}.poster.webp`);

  if (!optimized) {
    const size = videoTargetSize(video);
    const tmp = path.join(dir, `.${name}.tmp.${process.pid}.mp4`);
    const args = [
      "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
      "-i", abs,
      "-map", "0:v:0", "-map", "0:a?",
      "-c:v", "libx264", "-preset", "medium", "-crf", String(VIDEO_CRF), "-pix_fmt", "yuv420p",
    ];
    if (size) args.push("-vf", `scale=${size.w}:${size.h}`);
    args.push(
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      "-map_metadata", "-1",
      "-metadata", `comment=${VIDEO_MARKER}`,
      "-f", "mp4",
      tmp,
    );
    try {
      await run("ffmpeg", args, { maxBuffer: 16 * 1024 * 1024 });
      const check = await ffprobe(tmp);
      const v = check.streams.find((s) => s.codec_type === "video");
      const dur = Number(check.format.duration);
      const origDur = Number(probe.format.duration);
      if (v?.codec_name !== "h264") throw new Error("La salida no es H.264");
      if (!(dur > 0) || Math.abs(dur - origDur) > 0.5) throw new Error(`Duracion inesperada (${dur} s frente a ${origDur} s)`);
      await fs.rename(tmp, abs);
    } catch (err) {
      await fs.rm(tmp, { force: true });
      throw err;
    }
    log(`  video ${path.relative(photosDir, abs)}: ${mb((await fs.stat(abs)).size)} (era ${mb(Number(probe.format.size))})`);
  } else if (!(await posterIsCurrent(posterPath))) {
    log(`  video ${path.relative(photosDir, abs)} ya optimizado; falta el poster o supera ${MAX_POSTER_PX} px`);
  }

  if (!optimized || !(await posterIsCurrent(posterPath))) {
    const tmp = path.join(dir, `.${name}.tmp.${process.pid}.webp`);
    try {
      await run("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
        "-i", abs,
        "-map", "0:v:0", "-frames:v", "1",
        "-vf", `scale='min(${MAX_POSTER_PX},iw)':'min(${MAX_POSTER_PX},ih)':force_original_aspect_ratio=decrease`,
        "-c:v", "libwebp", "-quality", String(POSTER_QUALITY),
        "-map_metadata", "-1",
        "-f", "webp",
        tmp,
      ], { maxBuffer: 16 * 1024 * 1024 });
      const meta = await sharp(tmp).metadata();
      if (meta.format !== "webp" || !meta.width) throw new Error("Poster no valido");
      await fs.rename(tmp, posterPath);
    } catch (err) {
      await fs.rm(tmp, { force: true });
      throw err;
    }
    log(`  poster ${path.basename(posterPath)}`);
  }
}

async function main() {
  if (!(await exists(photosDir))) throw new Error(`No existe ${photosDir}`);
  await checkTools();

  const before = await dirSize(photosDir);
  await cleanStaleTemps(photosDir);

  const files = await walk(photosDir);
  await backupOriginals(files);

  const referenced = await referencedNames();
  const targets = new Set();
  const failures = [];
  let skipped = 0;
  let done = 0;

  for (const abs of files) {
    const ext = path.extname(abs).toLowerCase();
    if (!ORIGINAL_EXT.has(ext)) continue;
    const rel = path.relative(photosDir, abs);
    if (referenced.has(path.basename(abs).toLowerCase())) {
      warn(`saltado (referenciado por nombre en src/): ${rel}`);
      skipped++;
      continue;
    }
    try {
      if (IMAGE_EXT.has(ext)) await convertImage(abs, targets);
      else await convertVideo(abs);
      done++;
    } catch (err) {
      failures.push(rel);
      console.error(`ERROR en ${rel}: ${err.message}`);
    }
  }

  const after = await dirSize(photosDir);
  log("");
  log(`Procesados: ${done}, saltados: ${skipped}, errores: ${failures.length}`);
  log(`src/photos: ${mb(before)} -> ${mb(after)}`);
  if (failures.length) {
    console.error(`Fallos: ${failures.join(", ")}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exitCode = 1;
});
