import { parseHash, routeHash } from "./route.js";
import Lenis from "lenis";

/*
  Motion helpers for the site:
  - motionOK(): false when the visitor asked for reduced motion
  - spring(): a tiny rAF spring with react-spring's { tension, friction } model
  - Lenis smooth scroll (never started with reduced motion)
  - adaptive root size above 1920px
  - one scroll loop for parallax items
*/

const REDUCED = "(prefers-reduced-motion: reduce)";

export function motionOK() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return !window.matchMedia(REDUCED).matches;
}

export function spring({ from = 0, to = 1, tension = 180, friction = 26, mass = 1, precision = 0.0005, onUpdate, onRest }) {
  let x = from;
  let v = 0;
  let target = to;
  let raf = 0;
  let last = 0;

  const step = (now) => {
    const dt = Math.min(0.064, Math.max(0.001, (now - last) / 1000));
    last = now;
    const n = Math.ceil(dt / 0.004);
    const h = dt / n;
    for (let i = 0; i < n; i += 1) {
      const a = (-tension * (x - target) - friction * v) / mass;
      v += a * h;
      x += v * h;
    }
    if (Math.abs(v) < precision && Math.abs(x - target) < precision) {
      x = target;
      raf = 0;
      onUpdate?.(x);
      onRest?.();
      return;
    }
    onUpdate?.(x);
    raf = requestAnimationFrame(step);
  };

  const run = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  };
  run();

  return {
    set(next) {
      target = next;
      run();
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

/* ------------------------------------------------------------- Lenis -- */

let lenis = null;
let lenisRaf = 0;

export function startLenis() {
  if (lenis || !motionOK()) return lenis;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const loop = (t) => {
    lenis?.raf(t);
    lenisRaf = requestAnimationFrame(loop);
  };
  lenisRaf = requestAnimationFrame(loop);
  return lenis;
}

export function destroyLenis() {
  cancelAnimationFrame(lenisRaf);
  lenis?.destroy();
  lenis = null;
}

/** Jump to the top instantly (page change), with or without Lenis. */
export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}

export const getLenis = () => lenis;

/** Pause smooth scroll (loader, photo viewer). Safe when Lenis is off. */
export function lockScroll(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/**
 * In-page links (#id) glide with Lenis and still move keyboard focus to the
 * target, so the next Tab continues from there.
 */
export function scrollToId(id, { focus = true, immediate = false } = {}) {
  const el = id ? document.getElementById(id) : null;
  if (!el) return false;
  const offset = -(document.querySelector(".nav")?.offsetHeight ?? 64) - 12;
  const focusTarget = () => {
    if (!focus) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  if (lenis) {
    lenis.scrollTo(el, { offset: id === "top" ? 0 : offset, duration: 1.2, immediate, force: immediate, onComplete: focusTarget });
  } else {
    el.scrollIntoView({ block: "start" });
    focusTarget();
  }
  return true;
}

export function handleAnchors() {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    const here = parseHash(window.location.hash); // page we are on, if any
    let id;
    if (href.startsWith("#/")) {
      const target = parseHash(href);
      // Another page (or a plain page link): let the router handle it.
      if (!target.section || !here || target.path !== here.path) return;
      id = target.section;
    } else {
      id = decodeURIComponent(href.slice(1));
    }
    if (!document.getElementById(id)) return;
    e.preventDefault();
    scrollToId(id);
    // Keep page + section in the URL so a reload opens the same place.
    if (here) window.history.replaceState(window.history.state, "", routeHash(here.path, id === "top" ? "" : id));
    else window.history.replaceState(window.history.state, "", `#${id}`);
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}

/* ------------------------------------------------------- adaptive rem -- */

/* Below 1920px the CSS clamp drives the root size; above it the layout grows with the screen. */
export function adaptiveRem() {
  const html = document.documentElement;
  const BASE_W = 1920;
  const COEF = 0.6666;
  const apply = () => {
    const w = window.innerWidth;
    if (w > BASE_W) html.style.fontSize = `${100 * (1 + ((w - BASE_W) / BASE_W) * COEF)}%`;
    else html.style.removeProperty("font-size");
  };
  apply();
  window.addEventListener("resize", apply);
  return () => window.removeEventListener("resize", apply);
}

/* -------------------------------------------------------- scroll loop -- */

const scrollItems = new Set();
let scrollFrame = 0;
let scrollBound = false;

function runScrollItems() {
  scrollFrame = 0;
  const vh = window.innerHeight;
  for (const item of scrollItems) {
    const r = item.el.getBoundingClientRect();
    // 0 when the element's top meets the bottom of the screen, 1 when its bottom meets the top
    const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    item.update(p);
  }
}

function onScrollFrame() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(runScrollItems);
}

/** Calls update(progress 0..1) as `el` crosses the screen. Returns an unsubscribe function. */
export function onScrollProgress(el, update) {
  if (!motionOK()) return () => {};
  const item = { el, update };
  scrollItems.add(item);
  if (!scrollBound) {
    window.addEventListener("scroll", onScrollFrame, { passive: true });
    window.addEventListener("resize", onScrollFrame);
    scrollBound = true;
  }
  onScrollFrame();
  // Cleanup: drop this item and, when none are left, remove the shared listeners.
  return () => {
    scrollItems.delete(item);
    if (scrollItems.size === 0 && scrollBound) {
      window.removeEventListener("scroll", onScrollFrame);
      window.removeEventListener("resize", onScrollFrame);
      cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
      scrollBound = false;
    }
  };
}

/* ------------------------------------------------------ auto reveal -- */

/**
 * Springs up every element matching `selector` the first time it enters the
 * screen. The hidden start state is set from script only, so nothing is
 * hidden when motion is reduced or IntersectionObserver is missing.
 */
export function autoReveal(selector, { y = 32, tension = 170, friction = 24, stagger = 70 } = {}) {
  if (!motionOK() || typeof IntersectionObserver === "undefined") return () => {};
  const els = Array.from(document.querySelectorAll(selector));
  const springs = new Set();
  const timers = [];
  els.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0)`;
  });
  const io = new IntersectionObserver(
    (entries) => {
      const shown = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      shown.forEach((el, i) => {
        io.unobserve(el);
        timers.push(
          window.setTimeout(() => {
            const s = spring({
              tension,
              friction,
              onUpdate: (p) => {
                el.style.opacity = String(Math.min(1, Math.max(0, p)));
                el.style.transform = `translate3d(0, ${(1 - p) * y}px, 0)`;
              },
              onRest: () => {
                el.style.opacity = "";
                el.style.transform = "";
                springs.delete(s);
              },
            });
            springs.add(s);
          }, i * stagger),
        );
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
  );
  els.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    timers.forEach(window.clearTimeout);
    springs.forEach((s) => s.stop());
    els.forEach((el) => {
      el.style.opacity = "";
      el.style.transform = "";
    });
  };
}
