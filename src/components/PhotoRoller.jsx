import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ui } from "../content.js";
import { Rich, fill } from "../lib/text.jsx";
import { useStepGesture, useWide } from "../lib/rollerGesture.js";
import { Thumb } from "./Media.jsx";

const t = ui.flight;

/* Slot of a photo relative to the main one; the loop is circular (modular index). */
function slotOf(i, idx, n) {
  const half = Math.floor(n / 2);
  const d = ((((i - idx) % n) + n + half) % n) - half;
  if (d === 0) return "main";
  if (d === -1) return "prev";
  if (d === 1) return "next";
  return d < 0 ? "far-prev" : "far-next";
}

const titleOf = (it) => it.caption || t.titleGap;

function Panel({ item, sample, id, panelId, onClose, closeRef }) {
  const title = titleOf(item);
  return (
    <div className="photoroll__panel" id={panelId} role="region" aria-labelledby={id}>
      <button type="button" className="photoroll__close" ref={closeRef} aria-label={t.close} onClick={onClose}>
        <span aria-hidden="true">{"×"}</span>
      </button>
      <div className="photoroll__text">
        <h3 className="photoroll__title" id={id}>
          <Rich text={title} />
        </h3>
        <h4 className="photoroll__head">{t.explainHead}</h4>
        <p>
          <Rich text={sample ? t.sampleText : t.explainGap} />
        </p>
      </div>
      <div className="photoroll__media">
        {sample ? (
          <div className="photoroll__ph" aria-hidden="true" />
        ) : item.type === "video" ? (
          <video src={item.url} controls playsInline preload="metadata" aria-label={item.caption || t.altGap} />
        ) : (
          <img src={item.url} alt={item.caption || t.altGap} decoding="async" />
        )}
      </div>
    </div>
  );
}

const SAMPLES = Array.from({ length: t.sampleCount }, (_, i) => ({
  type: "sample",
  url: `sample-${i + 1}`,
  caption: fill(t.sampleTitle, { i: i + 1 }),
}));

export default function PhotoRoller({ items: real, label = t.rollerLabel, className = "" }) {
  const uid = useId();
  // Real photos win; the example boxes only show while there are none.
  const items = real.length ? real : SAMPLES;
  const n = items.length;
  const wide = useWide();
  const roller = useRef(null);
  const cards = useRef([]);
  const idxRef = useRef(0);
  const openRef = useRef(null);
  const first = useRef(true);
  const wasOpen = useRef(false);
  const closeRef = useRef(null);
  const panelItem = useRef(null);
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(null);
  const [live, setLive] = useState("");

  const turnTo = useCallback((i, focus) => {
    idxRef.current = i;
    setIdx(i);
    if (focus) cards.current[i]?.focus({ preventScroll: true });
  }, []);
  const step = useCallback(
    (d, focus) => {
      if (openRef.current !== null || n < 2) return;
      turnTo((((idxRef.current + d) % n) + n) % n, focus);
    },
    [turnTo, n],
  );
  const blocked = useCallback(() => openRef.current !== null, []);
  useStepGesture(roller, { enabled: wide && n > 1, blocked, onStep: step });

  const openAt = (i) => {
    turnTo(i);
    openRef.current = i;
    setOpen(i);
  };
  const refocus = useRef(true);
  const close = useCallback((restoreFocus = true) => {
    refocus.current = restoreFocus === true;
    openRef.current = null;
    setOpen(null);
  }, []);

  useEffect(() => {
    if (open !== null) {
      wasOpen.current = true;
      closeRef.current?.focus({ preventScroll: true });
      const onKey = (e) => {
        if (e.key === "Escape") close(true);
      };
      const onDown = (e) => {
        if (!panelItem.current?.contains(e.target)) close(false);
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("pointerdown", onDown);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("pointerdown", onDown);
      };
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      const card = cards.current[idxRef.current];
      if (refocus.current) card?.focus({ preventScroll: true });
      if (!window.matchMedia("(min-width: 900px)").matches) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        card?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
      }
    }
  }, [open, close]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setLive(fill(t.announce, { i: idx + 1, n }));
  }, [idx, n]);

  if (!n) return <p className="photoroll__empty"><Rich text={t.empty} /></p>;

  const onKeyDown = (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (openRef.current !== null) return;
    e.preventDefault();
    const d = e.key === "ArrowRight" ? 1 : -1;
    if (wide) return step(d, true);
    // Narrow: native scroll-snap track; move to the previous or next photo.
    if (openRef.current !== null || n < 2) return;
    const i = Math.min(n - 1, Math.max(0, idxRef.current + d));
    turnTo(i, true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.current[i]?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={`photoroll ${className}`.trim()} data-wide={wide ? "true" : "false"} data-open={open !== null ? "true" : undefined}>
      <div className="photoroll__stage">
        <ul className="photoroll__track" ref={roller} onKeyDown={onKeyDown} aria-label={label}>
          {items.map((it, i) => {
            const slot = slotOf(i, idx, n);
            const main = slot === "main";
            const sample = it.type === "sample";
            const isOpen = open === i;
            const title = titleOf(it);
            const pid = `photoroll-${uid}-title-${i}`;
            return (
              <li
                key={it.url}
                ref={isOpen ? panelItem : undefined}
                className="photoroll__item"
                data-slot={wide ? slot : undefined}
                data-expanded={isOpen ? "true" : undefined}
                aria-current={main ? "true" : undefined}
                aria-hidden={open !== null && !isOpen ? "true" : undefined}
              >
                <button
                  type="button"
                  className="photoroll__card"
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                  tabIndex={(!wide || main) && open === null ? 0 : -1}
                  aria-label={fill(sample ? t.sampleOpen : t.open, { i: i + 1, n, title: sample ? title : it.caption || t.altGap })}
                  aria-expanded={!wide || main ? (isOpen ? "true" : "false") : undefined}
                  aria-controls={isOpen ? pid + "-panel" : undefined}
                  onClick={() => (main || !wide ? openAt(i) : turnTo(i))}
                  onFocus={() => idxRef.current !== i && turnTo(i)}
                >
                  {sample ? (
                    <>
                      <span className="photoroll__ph" aria-hidden="true" />
                      <span className="photoroll__cap" aria-hidden="true">
                        <strong>{title}</strong>
                        <span>{t.sampleNote}</span>
                      </span>
                    </>
                  ) : (
                    <Thumb item={it} alt={it.caption || t.altGap} />
                  )}
                </button>
                {isOpen ? <Panel item={it} sample={sample} id={pid} panelId={pid + "-panel"} onClose={() => close(true)} closeRef={closeRef} /> : null}
              </li>
            );
          })}
        </ul>
      </div>
      {wide && n > 1 ? (
        <input
          type="range"
          className="photoroll__slider"
          min={0}
          max={n - 1}
          step={1}
          value={idx}
          aria-label={t.sliderLabel}
          aria-valuetext={fill(t.sliderValue, { i: idx + 1, n })}
          disabled={open !== null}
          onChange={(e) => turnTo(Number(e.target.value))}
        />
      ) : null}
      <p className="sr-only" aria-live="polite" role="status">
        {live}
      </p>
    </div>
  );
}
