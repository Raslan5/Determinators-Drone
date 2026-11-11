import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motionOK, onScrollProgress, spring } from "../lib/motion.js";

/*
  Entrance animations. Nothing here hides content when motion is reduced
  or when IntersectionObserver is missing: the hidden start state is only
  applied from script, right before the first paint.
*/

/* True once the loader has lifted (the hero waits for it). */
export const ReadyContext = createContext(true);
export const useReady = () => useContext(ReadyContext);

function useInView(ref, { margin = "0px 0px -10% 0px" } = {}) {
  const [seen, setSeen] = useState(() => !motionOK() || typeof IntersectionObserver === "undefined");
  useEffect(() => {
    if (seen) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, ref, margin]);
  return seen;
}

/**
 * Headline that rises word by word from behind a mask.
 * Screen readers get the sentence once, as plain text.
 */
export function SplitWords({ text, as: Tag = "span", className, delay = 0, stagger = 90, gate = false, ...rest }) {
  const ref = useRef(null);
  const ready = useReady();
  const seen = useInView(ref);
  const shown = seen && (!gate || ready);
  const words = String(text).split(/\s+/).filter(Boolean);
  const cls = ["split", shown ? "is-in" : null, className].filter(Boolean).join(" ");
  return (
    <Tag ref={ref} className={cls} style={{ "--d": `${delay}ms`, "--stagger": `${stagger}ms` }} {...rest}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span className="split__mask">
              <span className="split__word" style={{ "--i": i }}>
                {w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/** Block that springs up and fades in the first time it enters the screen. */
export function Reveal({ as: Tag = "div", delay = 0, y = 28, scale = 1, tension = 190, friction = 26, gate = false, className, children, ...rest }) {
  const ref = useRef(null);
  const ready = useReady();
  const armed = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !motionOK() || typeof IntersectionObserver === "undefined") return undefined;
    armed.current = true;
    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    return () => {
      armed.current = false;
      el.style.opacity = "";
      el.style.transform = "";
    };
  }, [y, scale]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !armed.current) return undefined;
    if (gate && !ready) return undefined;
    let s = null;
    let t = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        t = window.setTimeout(() => {
          s = spring({
            tension,
            friction,
            onUpdate: (p) => {
              el.style.opacity = String(Math.min(1, Math.max(0, p)));
              el.style.transform = `translate3d(0, ${(1 - p) * y}px, 0) scale(${scale + (1 - scale) * p})`;
            },
            onRest: () => {
              el.style.opacity = "";
              el.style.transform = "";
            },
          });
        }, delay);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
      s?.stop();
    };
  }, [gate, ready, delay, y, scale, tension, friction]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** A giant, faint word behind a section. It slides sideways as the section scrolls past. */
export function GhostWord({ text, from = -4, to = 4, className }) {
  const ref = useRef(null);
  const seen = useInView(ref, { margin: "0px" });
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const inner = el.firstElementChild;
    return onScrollProgress(el, (p) => {
      inner.style.transform = `translate3d(${from + (to - from) * p}%, 0, 0)`;
    });
  }, [from, to]);
  return (
    <div ref={ref} className={["ghost", seen ? "is-in" : null, className].filter(Boolean).join(" ")} aria-hidden="true">
      <span className="ghost__word">
        <span className="ghost__mask">
          <span className="ghost__text">{text}</span>
        </span>
      </span>
    </div>
  );
}

/** Counts from 0 to `value` with a spring when it scrolls into view. */
export function CountUp({ value, className }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  const [shown, setShown] = useState(() => (motionOK() ? 0 : value));
  useEffect(() => {
    if (!seen) return undefined;
    if (!motionOK()) {
      setShown(value);
      return undefined;
    }
    const s = spring({ from: 0, to: value, tension: 120, friction: 22, precision: 0.01, onUpdate: (x) => setShown(x) });
    return () => s.stop();
  }, [seen, value]);
  return (
    <span ref={ref} className={className}>
      {Math.max(0, Math.round(shown))}
    </span>
  );
}
