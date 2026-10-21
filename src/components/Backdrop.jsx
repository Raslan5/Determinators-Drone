import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/hooks.js";

/*
  One fixed dot field behind the whole page (aria-hidden, below every section).
  - The wave is computed from viewport x and (viewport y + scrollY): one continuous pattern, no per-section offsets.
  - Background and dot colour come from the sections that carry [data-wave]: each one declares
    --wave-bg and --wave-dot in CSS; the canvas blends between their centres as you scroll.
  - Cheap: sprite atlas, no per-dot trig, ~30 fps, paused in background tabs, DPR <= 2, ~14k dots max,
    no allocations inside the frame loop. Reduced motion: still dots, colour follows the scroll only.
*/
const LEVELS = 12;
const FRAME_MS = 33;
const SPACING = 13;
const RADIUS = 0.8;
const MAX_DOTS = 14000;

export default function Backdrop() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return undefined;
    const atlas = document.createElement("canvas");
    const actx = atlas.getContext("2d");
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    probe.canvas.width = 1;
    probe.canvas.height = 1;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let cell = 0;
    let raf = 0;
    let last = 0;
    let scrollY = 0;
    let stopsY = new Float32Array(0);
    let stopsC = new Float32Array(0); /* per stop: bg r,g,b, dot r,g,b */
    let nStops = 0;
    let stopColors = null; /* cached parsed colours per [data-wave] element */
    let tokenSig = "";
    let bgKey = -1;
    let dotKey = -1;
    let colX = new Float32Array(0);
    let rowY = new Float32Array(0);
    let colS1 = new Float32Array(0);
    let colC1 = new Float32Array(0);
    let colS2 = new Float32Array(0);
    let colC2 = new Float32Array(0);
    let rowS1 = new Float32Array(0);
    let rowC1 = new Float32Array(0);
    let rowS2 = new Float32Array(0);
    let rowC2 = new Float32Array(0);
    const rgb = new Float32Array(6);

    const parse = (css, out, at) => {
      probe.clearRect(0, 0, 1, 1);
      probe.fillStyle = "#000";
      probe.fillStyle = css;
      probe.fillRect(0, 0, 1, 1);
      const d = probe.getImageData(0, 0, 1, 1).data;
      out[at] = d[0];
      out[at + 1] = d[1];
      out[at + 2] = d[2];
    };

    const buildAtlas = (r, g, b) => {
      const rMax = RADIUS * 1.6;
      cell = Math.ceil(rMax * 2 + 2);
      const px = Math.ceil(cell * dpr);
      atlas.width = px * LEVELS;
      atlas.height = px;
      actx.clearRect(0, 0, atlas.width, atlas.height);
      actx.fillStyle = `rgb(${r} ${g} ${b})`;
      for (let i = 0; i < LEVELS; i++) {
        const v = i / (LEVELS - 1);
        actx.globalAlpha = Math.min(0.14 + v * v * 0.46, 1);
        actx.beginPath();
        actx.arc(i * px + px / 2, px / 2, RADIUS * (0.5 + v * 1.1) * dpr, 0, Math.PI * 2);
        actx.fill();
      }
      actx.globalAlpha = 1;
    };

    /* Read the stops: centre of every [data-wave] block, in document coordinates. */
    const readStops = () => {
      const els = document.querySelectorAll("[data-wave]");
      const list = [];
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        list.push({ el, y: r.top + window.scrollY + r.height / 2 });
      });
      list.sort((a, b) => a.y - b.y);
      nStops = list.length;
      stopsY = new Float32Array(nStops);
      /* colours are read (getComputedStyle + getImageData) only when the tokens changed */
      const raw = list.map((s) => {
        const cs = getComputedStyle(s.el);
        return [cs.getPropertyValue("--wave-bg").trim(), cs.getPropertyValue("--wave-dot").trim()];
      });
      const sig = raw.map((r) => r.join("|")).join(";");
      if (sig !== tokenSig || !stopColors || stopColors.length !== nStops * 6) {
        tokenSig = sig;
        stopColors = new Float32Array(nStops * 6);
        raw.forEach((r, i) => {
          parse(r[0] || "#000", stopColors, i * 6);
          parse(r[1] || "#ff6a1a", stopColors, i * 6 + 3);
        });
        bgKey = -1;
        dotKey = -1;
      }
      stopsC = stopColors;
      list.forEach((s, i) => {
        stopsY[i] = s.y;
      });
    };

    const applyColors = () => {
      if (nStops === 0) return;
      const pos = scrollY + window.innerHeight / 2;
      let a = 0;
      while (a < nStops - 1 && pos > stopsY[a + 1]) a++;
      const b = Math.min(a + 1, nStops - 1);
      let k = 0;
      if (b !== a) {
        const span = stopsY[b] - stopsY[a];
        k = span > 0 ? (pos - stopsY[a]) / span : 1; /* equal y: use the next stop */
        k = k < 0 ? 0 : k > 1 ? 1 : k;
        k = k * k * (3 - 2 * k);
      }
      for (let c = 0; c < 6; c++) rgb[c] = Math.round(stopsC[a * 6 + c] + (stopsC[b * 6 + c] - stopsC[a * 6 + c]) * k);
      const bk = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];
      if (bk !== bgKey) {
        bgKey = bk;
        canvas.style.backgroundColor = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
      }
      const qr = rgb[3] & ~3;
      const qg = rgb[4] & ~3;
      const qb = rgb[5] & ~3;
      const dk = (qr << 16) | (qg << 8) | qb;
      if (dk !== dotKey) {
        dotKey = dk;
        buildAtlas(qr, qg, qb);
      }
    };

    const draw = (now) => {
      scrollY = window.scrollY;
      applyColors();
      ctx.clearRect(0, 0, w, h);
      if (!cols || !atlas.width) return;
      const t = reduced ? 0 : now / 1000;
      const sy = reduced ? 0 : scrollY;
      const a1 = t * 1.3;
      const a2 = t * 0.9;
      for (let i = 0; i < cols; i++) {
        const p1 = colX[i] * 0.012 - a1;
        const p2 = colX[i] * 0.004 + a2;
        colS1[i] = Math.sin(p1);
        colC1[i] = Math.cos(p1);
        colS2[i] = Math.sin(p2);
        colC2[i] = Math.cos(p2);
      }
      for (let j = 0; j < rows; j++) {
        const y = rowY[j] + sy;
        rowS1[j] = Math.sin(y * 0.005);
        rowC1[j] = Math.cos(y * 0.005);
        rowS2[j] = Math.sin(-y * 0.013);
        rowC2[j] = Math.cos(-y * 0.013);
      }
      const px = atlas.height;
      const half = cell / 2;
      const drift = reduced ? 0 : 1;
      const top = LEVELS - 1;
      for (let j = 0; j < rows; j++) {
        const y = rowY[j];
        const sy1 = rowS1[j];
        const cy1 = rowC1[j];
        const sy2 = rowS2[j];
        const cy2 = rowC2[j];
        for (let i = 0; i < cols; i++) {
          const s1 = colS1[i] * cy1 + colC1[i] * sy1;
          const s2 = colS2[i] * cy2 + colC2[i] * sy2;
          const lv = (((s1 + s2) * 0.25 + 0.5) * top + 0.5) | 0;
          ctx.drawImage(atlas, lv * px, 0, px, px, colX[i] + s2 * 2 * drift - half, y + s1 * 2.5 * drift - half, cell, cell);
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth || document.documentElement.clientWidth;
      h = canvas.clientHeight || window.innerHeight;
      const step = Math.max(SPACING, Math.sqrt((w * h) / MAX_DOTS));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(0, Math.ceil((w - step / 2) / step));
      rows = Math.max(0, Math.ceil((h - step / 2) / step));
      colX = new Float32Array(cols);
      rowY = new Float32Array(rows);
      colS1 = new Float32Array(cols);
      colC1 = new Float32Array(cols);
      colS2 = new Float32Array(cols);
      colC2 = new Float32Array(cols);
      rowS1 = new Float32Array(rows);
      rowC1 = new Float32Array(rows);
      rowS2 = new Float32Array(rows);
      rowC2 = new Float32Array(rows);
      for (let i = 0; i < cols; i++) colX[i] = step / 2 + i * step;
      for (let j = 0; j < rows; j++) rowY[j] = step / 2 + j * step;
      dotKey = -1; /* atlas depends on DPR */
      readStops();
      draw(performance.now());
    };

    let rRaf = 0;
    const relayout = () => {
      if (rRaf) return;
      rRaf = requestAnimationFrame(() => {
        rRaf = 0;
        readStops();
        if (!raf) draw(performance.now());
      });
    };

    const loop = (now) => {
      raf = 0;
      if (document.hidden) return;
      if (now - last >= FRAME_MS) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (!document.hidden) start();
    };
    let sRaf = 0;
    const onScroll = () => {
      if (sRaf) return;
      sRaf = requestAnimationFrame(() => {
        sRaf = 0;
        draw(performance.now());
      });
    };

    resize();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(relayout);
      ro.observe(document.documentElement);
      ro.observe(document.body);
    }
    window.addEventListener("resize", resize);
    if (reduced) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      document.addEventListener("visibilitychange", onVis);
      start();
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(sRaf);
      cancelAnimationFrame(rRaf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      ro?.disconnect();
    };
  }, [reduced]);

  return <canvas ref={ref} className="backdrop" aria-hidden="true" />;
}
