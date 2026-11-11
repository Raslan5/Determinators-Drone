import { useEffect, useRef, useState } from "react";
import { brand } from "../content.js";
import { lockScroll, motionOK, spring } from "../lib/motion.js";
import { BrandMark } from "./Nav.jsx";

/*
  Opening curtain: wordmark and a filling bar, then it slides up.
  It is decorative (aria-hidden) and never traps focus: the page behind it
  is fully readable by screen readers, and any key press lifts it at once.
  With reduced motion it is not shown at all.
*/

const MIN_VISIBLE_MS = 1400;
const MAX_VISIBLE_MS = 2600;
const EXIT_MS = 850;

export default function Loader({ onReady }) {
  const [phase, setPhase] = useState(() => (motionOK() ? "in" : "gone")); // in | out | gone
  const markRef = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    if (phase === "gone") onReady();
    if (phase !== "out") return undefined;
    const t = window.setTimeout(() => setPhase("gone"), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [phase, onReady]);

  useEffect(() => {
    if (phase !== "in") return undefined;
    lockScroll(true);
    const el = markRef.current;
    const s = el
      ? spring({
          tension: 200,
          friction: 22,
          onUpdate: (p) => {
            el.style.opacity = String(Math.min(1, Math.max(0, p)));
            el.style.transform = `translate3d(0, ${(1 - p) * 16}px, 0)`;
          },
        })
      : null;

    const timers = [];
    const lift = () => {
      if (done.current) return;
      done.current = true;
      lockScroll(false);
      onReady();
      setPhase("out");
    };
    const countdown = () => timers.push(window.setTimeout(lift, MIN_VISIBLE_MS));
    if (document.readyState === "complete") countdown();
    else window.addEventListener("load", countdown, { once: true });
    timers.push(window.setTimeout(lift, MAX_VISIBLE_MS));
    window.addEventListener("keydown", lift, { once: true });

    return () => {
      s?.stop();
      timers.forEach(window.clearTimeout);
      window.removeEventListener("load", countdown);
      window.removeEventListener("keydown", lift);
      lockScroll(false);
    };
  }, [phase, onReady]);

  if (phase === "gone") return null;
  return (
    <div className={`loader surface-ink${phase === "out" ? " is-out" : ""}`} aria-hidden="true">
      <div className="loader__inner">
        <p ref={markRef} className="loader__mark">
          <BrandMark size={34} />
          <span>{brand.name}</span>
        </p>
        <span className="loader__track">
          <span className="loader__fill" />
        </span>
      </div>
    </div>
  );
}
