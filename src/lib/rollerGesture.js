import { useEffect, useLayoutEffect, useState } from "react";

const WHEEL_LOCK = 450; // ms: one step per gesture
const SWIPE = 36; // px of horizontal touch travel per step

/** True from 900px up (the rolling layout); below it the track scrolls natively. */
export function useWide() {
  const query = "(min-width: 900px)";
  const [wide, setWide] = useState(() => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : true));
  useLayoutEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener?.("change", on);
    on();
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return wide;
}

/*
  Wheel and horizontal swipe over `ref` step the roller by one (-1 / +1).
  The wheel listener is not passive so the page does not move, but only over the roller.
  `blocked()` is read on every event (true while a photo is expanded; the wheel then scrolls the page normally).
*/
export function useStepGesture(ref, { enabled, blocked, onStep }) {
  useEffect(() => {
    const r = ref.current;
    if (!enabled || !r) return undefined;
    let lockUntil = 0;
    let lastWheel = 0;
    let start = null;
    const onWheel = (e) => {
      if (blocked()) return;
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const now = performance.now();
      const quiet = now - lastWheel > 160; // a trackpad's inertia tail keeps the gap short
      lastWheel = now;
      if (now < lockUntil || (!quiet && now < lockUntil + 400) || Math.abs(d) < 4) return;
      lockUntil = now + WHEEL_LOCK;
      onStep(d > 0 ? 1 : -1);
    };
    const onStart = (e) => {
      const t = e.touches[0];
      start = blocked() || !t ? null : { x: t.clientX, y: t.clientY };
    };
    const onMove = (e) => {
      const t = e.touches[0];
      if (!start || !t) return;
      const dx = start.x - t.clientX;
      if (Math.abs(dx) >= SWIPE && Math.abs(dx) > Math.abs(start.y - t.clientY)) {
        onStep(dx > 0 ? 1 : -1);
        start = null; // one step per gesture
      }
    };
    const onEnd = () => {
      start = null;
    };
    r.addEventListener("wheel", onWheel, { passive: false });
    r.addEventListener("touchstart", onStart, { passive: true });
    r.addEventListener("touchmove", onMove, { passive: true });
    r.addEventListener("touchend", onEnd);
    r.addEventListener("touchcancel", onEnd);
    return () => {
      r.removeEventListener("wheel", onWheel);
      r.removeEventListener("touchstart", onStart);
      r.removeEventListener("touchmove", onMove);
      r.removeEventListener("touchend", onEnd);
      r.removeEventListener("touchcancel", onEnd);
    };
  }, [ref, enabled, blocked, onStep]);
}
