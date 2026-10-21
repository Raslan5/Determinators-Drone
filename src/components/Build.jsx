import { useEffect, useRef, useState } from "react";
import { GhostWord, SplitWords } from "./Reveal.jsx";
import { ghosts, ui } from "../content.js";
import { routeHash } from "../lib/route.js";
import { Rich, fill } from "../lib/text.jsx";
import { pad2, useReducedMotion } from "../lib/hooks.js";
import { startingWith } from "../lib/photos.js";
import Media from "./Media.jsx";
import Drone3D from "./Drone3D.jsx";
import DroneModel, { createTurn } from "./DroneModel.jsx";

const DESKTOP = "(min-width: 900px)";

function useDesktop() {
  const [yes, setYes] = useState(() => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(DESKTOP).matches : true));
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const on = () => setYes(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return yes;
}

/* Cut-out window: copies the model slot's box into CSS variables on the orange card. */
function useHole(frame, on) {
  useEffect(() => {
    const card = frame.current;
    if (!on || !card) return undefined;
    let raf = 0;
    let slot = null;
    let ro = null;
    let prev = [];
    let near = true;
    const run = () => {
      raf = 0;
      const el = card.querySelector(".drone-model");
      if (el !== slot) {
        if (slot) ro?.unobserve(slot);
        slot = el;
        if (el && ro) ro.observe(el);
      }
      if (!el) {
        card.removeAttribute("data-hole");
        return;
      }
      const a = card.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      const next = [b.left - a.left, b.top - a.top, b.width, b.height, Math.min(r, b.width / 2, b.height / 2)].map(Math.round);
      if (!card.hasAttribute("data-hole") || next.some((v, i) => v !== prev[i])) {
        ["x", "y", "w", "h", "r"].forEach((k, i) => card.style.setProperty(`--hole-${k}`, `${next[i]}px`));
        prev = next;
      }
      if (!card.hasAttribute("data-hole")) card.setAttribute("data-hole", "");
    };
    const queue = () => {
      if (near && !raf) raf = requestAnimationFrame(run);
    };
    /* No work while the card is far from the viewport. */
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) queue(); }, { rootMargin: "200px 0px" })
      : null;
    io?.observe(card);
    if ("ResizeObserver" in window) ro = new ResizeObserver(queue);
    ro?.observe(card);
    run();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      ro?.disconnect();
      io?.disconnect();
      cancelAnimationFrame(raf);
      card.removeAttribute("data-hole");
    };
  }, [frame, on]);
}

export default function Build({ id = "build", data, preview = false }) {
  const reduced = useReducedMotion();
  const desktop = useDesktop();
  const pinned = !reduced && desktop;
  const frame = useRef(null);
  useHole(frame, preview);
  return (
    <section id={id} className="section build surface-paper" data-surface="paper" data-wave>
      <div ref={frame} className="build__frame surface-cube" data-surface="cube">
        <GhostWord text={ghosts.build} />
        {pinned ? <Pinned data={data} preview={preview} /> : <Static data={data} preview={preview} />}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <a className="btn btn--solid build__cta" href={routeHash("/phase-1")}>
      {ui.build.explore}
    </a>
  );
}

function Phase2Note({ note }) {
  return (
    <p className="phase2__working">
      <strong>{note.title}</strong> {note.text}
    </p>
  );
}

function Head({ data, preview, cta = true }) {
  return (
    <div className="section-head">
      <SplitWords as="h2" className="h2" text={data.title} />
      <p className="lead"><Rich text={data.lead} /></p>
      {preview && cta ? <Cta /> : null}
    </div>
  );
}

/* Reduced motion and small screens: every step in a plain list, drone at rest. */
function Static({ data, preview }) {
  const list = useRef(null);
  const [active, setActive] = useState(0);
  const turn = useRef(null);
  if (!turn.current) turn.current = createTurn();

  /* On the home preview the model follows the step list as it scrolls. */
  useEffect(() => {
    if (!preview || !list.current || !("IntersectionObserver" in window)) return undefined;
    const items = [...list.current.children];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(items.indexOf(e.target));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    items.forEach((li) => io.observe(li));
    /* Turn: one full circle from the centre of step 02 to the centre of step 08. */
    let raf = 0;
    const run = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      const c = items.map((li) => {
        const r = li.getBoundingClientRect();
        return r.top + r.height / 2;
      });
      let s = 0;
      if (mid >= c[c.length - 1]) s = c.length - 1;
      else if (mid > c[0]) {
        const i = c.findIndex((y, k) => y <= mid && mid < c[k + 1]);
        s = i + (mid - c[i]) / (c[i + 1] - c[i]);
      }
      turn.current.set(Math.min(1, Math.max(0, (s - 1) / (items.length - 2))));
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, [preview]);

  return (
    <div className="wrap">
      <Head data={data} preview={preview} />
      <div className={preview ? "build__still build__still--model" : "build__still"}>
        {preview ? <DroneModel step={active} turn={turn.current} /> : <Drone3D label={ui.build.drone} progress={0.12} />}
      </div>
      <ol ref={list} className="steps">
        {data.steps.map((step, i) => (
          <Step key={step.title} n={i + 1} step={step} preview={preview} />
        ))}
      </ol>
      {preview && data.phase2 ? <Phase2Note note={data.phase2} /> : null}
      {preview ? (
        <div className="build__cta-bar">
          <Cta />
        </div>
      ) : null}
    </div>
  );
}

/* Tall track + sticky stage: scroll progress through the track picks the step. */
function Pinned({ data, preview }) {
  const TOTAL = data.steps.length;
  const track = useRef(null);
  const drone = useRef(null);
  const [active, setActive] = useState(0);
  const turn = useRef(null);
  if (!turn.current) turn.current = createTurn();
  const [steps, setSteps] = useState(false);

  useEffect(() => {
    const el = track.current;
    let raf = 0;
    let last = -1;
    const run = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      drone.current?.setProgress(p);
      setSteps(p > 0.02);
      /* Turn: one full circle from the centre of step 02 to the centre of step 08. */
      const s = Math.min(TOTAL - 1, Math.max(0, p * TOTAL - 0.5));
      turn.current.set(Math.min(1, Math.max(0, (s - 1) / (TOTAL - 2))));
      const idx = Math.min(TOTAL - 1, Math.floor(p * TOTAL));
      if (idx !== last) {
        last = idx;
        setActive(idx);
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    run();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      cancelAnimationFrame(raf);
    };
  }, []);

  const step = data.steps[active];
  return (
    <div ref={track} className="build__track" style={{ "--build-steps": TOTAL }}>
      <div className="build__stage" data-phase={steps ? "steps" : "intro"}>
        <div className="wrap build__wrap">
          <div className="build__head">
            <div className="build__head-in">
              <Head data={data} preview={preview} cta={false} />
            </div>
          </div>
          <div className="build__grid">
            <div className="build__art">
              {preview ? <DroneModel step={active} turn={turn.current} /> : <Drone3D ref={drone} label={ui.build.drone} />}
            </div>
            <div className="build__panel">
              <div key={active} className="build__card" aria-hidden="true">
                <span className="build__num">{pad2(active + 1)}</span>
                <h3 className="build__title">{step.title}</h3>
                {step.date ? (
                  <p className="step__date">
                    <Rich text={step.date} />
                  </p>
                ) : null}
                <p className="build__text"><Rich text={step.text} /></p>
              </div>
              <ol className="build__dots" aria-label={ui.build.progress}>
                {data.steps.map((s, i) => (
                  <li key={s.title} className="build__dot" data-state={i === active ? "now" : i < active ? "done" : "next"}>
                    <span className="sr-only">{fill(ui.build.goTo, { n: i + 1, total: TOTAL })}</span>
                  </li>
                ))}
              </ol>
              {preview && data.phase2 ? <Phase2Note note={data.phase2} /> : null}
              {preview ? <Cta /> : null}
            </div>
          </div>
        </div>
      </div>
      {/* Screen readers get the full list; the sticky card above is decorative. */}
      <ol className="sr-only" aria-label={data.title}>
        {data.steps.map((s, i) => (
          <li key={s.title} aria-current={i === active ? "step" : undefined}>
            <strong>{fill(ui.build.step, { n: i + 1 })}{s.title}</strong>
            <p><Rich text={s.text} /></p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Step({ n, step, preview }) {
  const photos = preview ? [] : startingWith("steps", n);
  const num = pad2(n);
  return (
    <li className="step">
      <div className="step__head">
        <span className="step__num" aria-hidden="true">
          {num}
        </span>
        <div className="step__titles">
          <h3 className="step__title">
            <span className="sr-only">{fill(ui.build.step, { n })}</span>
            {step.title}
          </h3>
          {step.date ? (
            <p className="step__date">
              <Rich text={step.date} />
            </p>
          ) : null}
        </div>
      </div>
      <div className="step__body">
        <Media
          items={photos}
          glyph={step.glyph}
          label={step.title}
          // Developer note (not shown): add photos for this step as
          // src/photos/steps/NN-description.jpg, where NN is the step number.
        />
        <div className="step__copy">
          <p className="step__text"><Rich text={step.text} /></p>
        </div>
      </div>
    </li>
  );
}
