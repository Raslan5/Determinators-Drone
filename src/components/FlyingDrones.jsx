import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/hooks.js";
import { inV2Folder } from "../lib/photos.js";

/* Same photo as the intro (home/home_title), found by folder like Intro.jsx. */
const heroPhoto = () => inV2Folder("home/home_title").find((x) => x.type === "image");

/* Per drone: width (px), speed (px/s), opacity, tilt strength. */
const SPECS = [
  { size: 84, speed: 38, alpha: 0.5, tilt: 0.35 },
  { size: 56, speed: 56, alpha: 0.42, tilt: 0.5 },
  { size: 40, speed: 72, alpha: 0.36, tilt: 0.6 },
];

/*
  Decorative drones wandering over the whole home. One rAF loop moves all of them with transform only.
  Path: each drone has a heading that is steered by a smooth sum of sines (different frequencies and
  phases per drone), so the route curves without jumps; near the edges it is gently turned inwards.
  Tilt follows the heading's turning rate. Hidden with reduced motion (reacts live).
*/
export default function FlyingDrones({ inverted = false }) {
  const reduced = useReducedMotion();
  const photo = heroPhoto();
  const refs = useRef([]);

  useEffect(() => {
    if (reduced || !photo) return undefined;
    const els = refs.current.filter(Boolean);
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const st = els.map((_, i) => {
      const s = SPECS[i];
      return {
        x: Math.random() * vw,
        y: Math.random() * vh,
        a: Math.random() * Math.PI * 2,
        f1: 0.11 + Math.random() * 0.1,
        f2: 0.27 + Math.random() * 0.15,
        p1: Math.random() * 6.28,
        p2: Math.random() * 6.28,
        bank: 0,
        s,
      };
    });
    const onResize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
    };
    let alive = true;
    let raf = 0;
    let last = 0;
    let t = 0;
    const frame = (now) => {
      raf = 0;
      if (!alive || document.hidden) return;
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      t += dt;
      for (let i = 0; i < st.length; i++) {
        const d = st[i];
        let turn = Math.sin(t * d.f1 * 6.28 + d.p1) * 0.7 + Math.sin(t * d.f2 * 6.28 + d.p2) * 0.4;
        const m = d.s.size;
        /* steer back inside when near an edge (soft, proportional) */
        const cx = vw / 2 - d.x;
        const cy = vh / 2 - d.y;
        const edge = Math.max(Math.abs(cx) / (vw / 2), Math.abs(cy) / (vh / 2));
        if (edge > 0.8) {
          const diff = Math.atan2(Math.sin(Math.atan2(cy, cx) - d.a), Math.cos(Math.atan2(cy, cx) - d.a));
          turn += diff * (edge - 0.8) * 12;
        }
        d.a += turn * dt;
        d.x = Math.max(-m, Math.min(vw + m, d.x + Math.cos(d.a) * d.s.speed * dt));
        d.y = Math.max(-m, Math.min(vh + m, d.y + Math.sin(d.a) * d.s.speed * dt));
        d.bank += (Math.max(-1, Math.min(1, turn)) - d.bank) * Math.min(1, dt * 3);
        const rot = Math.cos(d.a) * 8 * d.s.tilt + d.bank * 14 * d.s.tilt;
        els[i].style.transform = `translate3d(${(d.x - m / 2).toFixed(1)}px, ${(d.y - m / 2).toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (alive && !raf && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", start);
    window.addEventListener("resize", onResize);
    start();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener("visibilitychange", start);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, photo]);

  if (reduced || !photo) return null;
  return (
    <div className={inverted ? "flydrones flydrones--inverted" : "flydrones"} aria-hidden="true">
      {SPECS.map((s, i) => (
        <img
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="flydrones__drone"
          src={photo.url}
          alt=""
          draggable="false"
          style={{ width: s.size, opacity: s.alpha }}
        />
      ))}
    </div>
  );
}
