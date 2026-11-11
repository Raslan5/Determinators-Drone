import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ghosts, kit, kitParts, ui } from "../content.js";
import { Rich, fill } from "../lib/text.jsx";
import { GhostWord, SplitWords } from "./Reveal.jsx";
import { inV2Folder } from "../lib/photos.js";
import PhotoRoller from "./PhotoRoller.jsx";
import { ASSEMBLED, DroneDefs, Part } from "./DroneArt.jsx";

const partFiles = inV2Folder("parts_drone");
const partsOf = (key) => (kitParts[key] ?? []).map((p) => ({ ...p, url: partFiles.find((f) => f.file === p.file)?.url })).filter((p) => p.url);

const STAGE_W = 1000;
const STAGE_H = 600;
const DRONE_X = 200; // where the 600 x 600 drawing sits inside the stage
const TRAY_SCALE = 0.5;
const SNAP = 70; // drop this close (stage units) to the spot and it clicks in

function useWide() {
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

/* Where each piece waits: left tray for the first half (9 of 17), right tray for the rest. */
const half = Math.ceil(ASSEMBLED.length / 2);
const TRAY = Object.fromEntries(
  ASSEMBLED.map((p, i) => {
    const left = i < half;
    const row = left ? i : i - half;
    return [p.id, { x: left ? 100 : STAGE_W - 100, y: 40 + row * 65 }];
  }),
);
const target = (p) => ({ x: DRONE_X + p.x, y: p.y });

/* Bigger box with more information. Only data that exists for the piece; gaps stay in [brackets]. */
function Detail({ item, t, modal, onClose }) {
  const d = t.detail;
  const box = useRef(null);
  const closeBtn = useRef(null);
  const titleId = `inside-detail-${item.key}`;
  const parts = useMemo(() => partsOf(item.key), [item.key]);

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    const onDown = (e) => {
      const b = box.current;
      if (!b || b.contains(e.target)) return;
      if (!modal && b.parentElement?.contains(e.target)) return; // inline: the box that opened it toggles it
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [modal, onClose]);

  const trap = (e) => {
    if (!modal || e.key !== "Tab" || !box.current) return;
    const f = [...box.current.querySelectorAll("button, a[href]")];
    if (!f.length) return;
    const a = f[0];
    const z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) {
      e.preventDefault();
      z.focus();
    } else if (!e.shiftKey && document.activeElement === z) {
      e.preventDefault();
      a.focus();
    }
  };

  return (
    <div
      className={`inside__detail${modal ? " inside__detail--modal" : ""}`}
      ref={box}
      role="dialog"
      aria-modal={modal ? "true" : undefined}
      aria-labelledby={titleId}
      onKeyDown={trap}
    >
      <button type="button" className="inside__close" ref={closeBtn} aria-label={d.close} onClick={onClose}>
        <span aria-hidden="true">{"\u00D7"}</span>
      </button>
      <h3 className="inside__detail-name" id={titleId}>
        {item.name}
      </h3>
      <dl className="inside__facts">
        <dt>{d.inside}</dt>
        <dd>{item.open}</dd>
      </dl>
      {parts.length ? (
        <ul className="inside__parts" aria-label={ui.partsView.partsLabel}>
          {parts.map((p) => (
            <li key={p.file}>
              <img src={p.url} alt={p.alt} loading="lazy" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Card({ item, t, extra, onOpen, detail }) {
  const onClick = (e) => {
    if (!onOpen || e.target.closest("a") || e.target.closest(".inside__detail")) return;
    onOpen();
  };
  const onKey = (e) => {
    if (!onOpen || e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return;
    e.preventDefault();
    onOpen();
  };
  const { ref, tabIndex, onFocus, ...itemProps } = extra ?? {};
  return (
    <li className="inside__card" data-part={item.key} onClick={onClick} {...itemProps}>
      <div
        className="inside__card-body"
        ref={ref}
        tabIndex={tabIndex}
        role={tabIndex !== undefined ? "group" : undefined}
        aria-labelledby={tabIndex !== undefined ? `inside-card-${item.key}` : undefined}
        aria-roledescription={tabIndex !== undefined ? t.cardHint : undefined}
        onKeyDown={onKey}
        onFocus={onFocus}
      >
      <h3 className="inside__name" id={`inside-card-${item.key}`}>
        {item.name}
      </h3>
      <p className="inside__does">{item.closed}</p>
      </div>
      {detail}
    </li>
  );
}

/* The 11 kit objects come from kit.items (content.js). */
const WHEEL_LOCK = 450; // ms: one piece per gesture
const SWIPE = 36; // px of vertical touch travel per piece

function Group({ items, t, openKey, onToggle, onClose, setRef }) {
  return (
    <div
      className="inside__group"
      role="group"
      aria-label={t.sectionLabel}
    >
      <ul className="inside__list">
        {items.map((it) => (
          <Card
            key={it.key}
            item={it}
            t={t}
            onOpen={() => onToggle(it.key)}
            extra={{ tabIndex: 0, ref: (el) => setRef(it.key, el) }}
            detail={openKey === it.key ? <Detail item={it} t={t} modal={false} onClose={onClose} /> : null}
          />
        ))}
      </ul>
    </div>
  );
}

/* Slot of a card relative to the main one; the loop is circular (modular index). */
function slotOf(i, idx, n) {
  const d = ((((i - idx) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
  if (d === 0) return "main";
  if (d === -1) return "up";
  if (d === 1) return "down";
  return d < 0 ? "far-up" : "far-down";
}

function Exploded({ rolling, head, media }) {
  const t = ui.parts;
  const root = useRef(null);
  const hole = useRef(null);
  const roller = useRef(null);
  const cards = useRef([]);
  const idxRef = useRef(0);
  const openRef = useRef(null);
  const staticCards = useRef({});
  const first = useRef(true);
  const [lines, setLines] = useState([]);
  const [idx, setIdx] = useState(0);
  const [live, setLive] = useState("");
  const [open, setOpen] = useState(null); // index of the piece whose detail is open (roller) or its key (stacked)
  const flat = useMemo(() => kit.items.map((it) => ({ item: it })), []);
  const total = flat.length;

  const turnTo = useCallback((n, focus) => {
    idxRef.current = n;
    setIdx(n);
    if (focus) cards.current[n]?.focus({ preventScroll: true });
  }, []);
  const step = useCallback((delta, focus) => openRef.current === null && turnTo((((idxRef.current + delta) % total) + total) % total, focus), [turnTo, total]);

  const openDetail = (i) => {
    turnTo(i);
    openRef.current = i;
    setOpen(i);
  };
  /* Crossing the breakpoint swaps roller and stack: an open detail would be orphaned (slider disabled, no detail). */
  useLayoutEffect(() => {
    const prev = openRef.current;
    openRef.current = null;
    setOpen(null);
    if (prev === null) return undefined;
    /* The detail unmounted with the layout swap: hand focus back to the card that opened it. */
    const key = typeof prev === "number" ? flat[prev]?.item.key : prev;
    const i = flat.findIndex((f) => f.item.key === key);
    if (i < 0) return undefined;
    if (rolling) turnTo(i);
    const raf = requestAnimationFrame(() => {
      const el = rolling ? cards.current[i] : staticCards.current[key];
      if (el?.isConnected) el.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling]);
  const closeDetail = useCallback(() => {
    const i = openRef.current;
    openRef.current = null;
    setOpen(null);
    if (typeof i === "number") cards.current[i]?.focus({ preventScroll: true });
    else if (i) staticCards.current[i]?.focus({ preventScroll: true });
  }, []);
  const toggleStatic = (key) => {
    if (openRef.current === key) return closeDetail();
    openRef.current = key;
    setOpen(key);
  };

  /* Wheel and touch turn the roller only; the page scrolls normally everywhere else. */
  useEffect(() => {
    const r = roller.current;
    if (!rolling || !r) return undefined;
    let lockUntil = 0;
    let lastWheel = 0;
    let touchY = null;
    const onWheel = (e) => {
      if (openRef.current !== null) return; // a detail is open: the roller stays still
      e.preventDefault();
      const now = performance.now();
      const quiet = now - lastWheel > 160; // a trackpad's inertia tail keeps the gap short
      lastWheel = now;
      if (now < lockUntil || (!quiet && now < lockUntil + 400) || Math.abs(e.deltaY) < 4) return;
      lockUntil = now + WHEEL_LOCK;
      step(e.deltaY > 0 ? 1 : -1);
    };
    const onStart = (e) => {
      touchY = openRef.current === null ? (e.touches[0]?.clientY ?? null) : null;
    };
    const onMove = (e) => {
      if (touchY === null) return;
      const y = e.touches[0]?.clientY ?? touchY;
      if (Math.abs(touchY - y) >= SWIPE) {
        step(touchY - y > 0 ? 1 : -1);
        touchY = null; // one piece per gesture
      }
    };
    const onEnd = () => {
      touchY = null;
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
  }, [rolling, step]);

  const onKeyDown = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (openRef.current !== null) return;
    step(e.key === "ArrowDown" ? 1 : -1, true);
  };

  /* Vertical range: up goes to piece 1 (the browser would add), and it never loops. */
  const onSliderKey = (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    if (openRef.current !== null) return;
    turnTo(Math.min(total - 1, Math.max(0, idxRef.current + (e.key === "ArrowDown" ? 1 : -1))));
  };

  /* Announce "part X of N, group" when the main piece changes (not on first render). */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setLive(fill(t.announce, { i: idx + 1, n: total }));
  }, [idx, flat, total, t]);

  /* One line: hole -> main card. The main card always sits at the roller's centre, so no transform is read. */
  const measure = useCallback(() => {
    const el = root.current;
    const h = hole.current;
    const r = roller.current;
    if (!el || !h || !r || !rolling) return setLines([]);
    const b = el.getBoundingClientRect();
    const hb = h.getBoundingClientRect();
    const rb = r.getBoundingClientRect();
    const cy = rb.top - b.top + rb.height / 2;
    const hcy = hb.top - b.top + hb.height / 2;
    setLines([{ key: flat[idx].item.key, x1: hb.right - b.left, y1: hcy + (cy - hcy) * 0.35, x2: rb.left - b.left, y2: cy }]);
  }, [rolling, idx, flat]);

  useLayoutEffect(() => {
    measure();
    const again = () => measure();
    document.fonts?.ready.then(again); // fonts change widths and heights
    document.fonts?.addEventListener?.("loadingdone", again);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) {
      if (root.current) ro.observe(root.current);
      if (roller.current) ro.observe(roller.current);
    }
    window.addEventListener("resize", measure);
    return () => {
      document.fonts?.removeEventListener?.("loadingdone", again);
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const holeEl = (
    <figure className="inside__hole" ref={hole}>
      {media}
    </figure>
  );

  if (!rolling) {
    return (
      <div className="inside__exploded inside__exploded--static" ref={root}>
        {head}
        {holeEl}
        <div className="inside__stack">
          <Group
            items={kit.items}
            t={t}
            openKey={open}
            onToggle={toggleStatic}
            onClose={closeDetail}
            setRef={(k, el) => {
              staticCards.current[k] = el;
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="inside__exploded" ref={root}>
      <div className="inside__side">
        {head}
        {holeEl}
      </div>

      <div className="inside__rolling">
        <div className="inside__reel">
        <ul className="inside__roller" ref={roller} onKeyDown={onKeyDown} aria-label={t.rollerLabel}>
          {flat.map((f, i) => {
            const slot = slotOf(i, idx, total);
            return (
              <Card
                key={f.item.key}
                item={f.item}
                t={t}
                onOpen={() => openDetail(i)}
                extra={{
                  ref: (el) => {
                    cards.current[i] = el;
                  },
                  tabIndex: slot.startsWith("far") ? -1 : 0,
                  inert: slot.startsWith("far"),
                  "data-slot": slot,
                  "aria-current": slot === "main" ? "true" : undefined,
                  onFocus: () => {
                    if (idxRef.current !== i) turnTo(i);
                  },
                }}
              />
            );
          })}
        </ul>
        <input
          type="range"
          className="inside__slider"
          min={0}
          max={total - 1}
          step={1}
          value={idx}
          aria-orientation="vertical"
          aria-label={t.sliderLabel}
          aria-valuetext={fill(t.sliderValue, { name: flat[idx].item.name, i: idx + 1, n: total })}
          disabled={open !== null}
          onChange={(e) => turnTo(Number(e.target.value))}
          onKeyDown={onSliderKey}
        />
        </div>
        {typeof open === "number" ? <Detail item={flat[open].item} t={t} modal onClose={closeDetail} /> : null}
        <p className="sr-only" aria-live="polite" role="status">
          {live}
        </p>
      </div>

      <svg className="inside__lines" aria-hidden="true" focusable="false" key={idx}>
        {lines.map((l) => (
          <g key={l.key}>
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} pathLength="1" />
            <circle cx={l.x2} cy={l.y2} r="4" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function Builder({ bare = false }) {
  const t = ui.parts;
  const svg = useRef(null);
  const grab = useRef({ dx: 0, dy: 0 });
  const [placed, setPlaced] = useState(() => new Set());
  const [drag, setDrag] = useState(null); // { id, x, y }

  const toStage = (e) => {
    const m = svg.current.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const pt = svg.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const q = pt.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  };

  const down = (e, p) => {
    if (placed.has(p.id)) return;
    svg.current.setPointerCapture?.(e.pointerId); // on the svg: pieces are never re-inserted
    const s = toStage(e);
    const at = TRAY[p.id];
    grab.current = { dx: at.x - s.x, dy: at.y - s.y };
    setDrag({ id: p.id, x: at.x, y: at.y });
  };

  const move = (e) => {
    if (!drag) return;
    const s = toStage(e);
    setDrag({ id: drag.id, x: s.x + grab.current.dx, y: s.y + grab.current.dy });
  };

  const up = () => {
    if (!drag) return;
    const p = ASSEMBLED.find((a) => a.id === drag.id);
    const g = target(p);
    if (Math.hypot(drag.x - g.x, drag.y - g.y) <= SNAP) {
      setPlaced((cur) => new Set(cur).add(p.id));
    }
    setDrag(null);
  };

  const cancel = () => setDrag(null);
  const place = (p) => setPlaced((cur) => new Set(cur).add(p.id));
  const label = (p, n) => {
    const base = p.id.split("-")[0];
    return fill(t.pieceLabel, { n, name: `${t.pieceNames[base] ?? base}${p.id.includes("-") ? ` ${p.id.split("-")[1]}` : ""}` });
  };
  const dragged = drag ? ASSEMBLED.find((a) => a.id === drag.id) : null;
  const total = ASSEMBLED.length;
  const finished = placed.size === total;

  return (
    <div className="inside__build">
      {bare ? null : <h3 className="inside__subtitle">{t.buildTitle}</h3>}
      <div className="inside__build-head">
        <p className="inside__hint">{t.buildHint}</p>
        <p className="inside__count" role="status">
          {finished ? t.done : fill(t.placed, { n: placed.size, total })}
        </p>
        <button type="button" className="btn btn--ghost" onClick={() => setPlaced(new Set())}>
          {t.reset}
        </button>
      </div>
      <svg
        ref={svg}
        className="inside__stage"
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} role="group" aria-label={t.stageLabel}>
        <DroneDefs prefix="ins" />
        <g className="inside__slots" aria-hidden="true" transform={`translate(${DRONE_X} 0)`}>
          {ASSEMBLED.map((p) => (
            <Part key={p.id} kind={p.kind} dir={p.dir} x={p.x} y={p.y} r={p.r} />
          ))}
        </g>
        {ASSEMBLED.map((p, n) => {
          const done = placed.has(p.id);
          const dragging = drag?.id === p.id;
          const pos = done ? target(p) : dragging ? drag : TRAY[p.id];
          const full = done || dragging;
          return (
            <g
              key={p.id}
              className={`inside__piece${dragging ? " is-drag" : ""}${done ? " is-placed" : ""}`}
              style={done ? { pointerEvents: "none", cursor: "default" } : undefined}
              onPointerDown={(e) => down(e, p)}
              role="button"
              tabIndex={done ? -1 : 0}
              aria-label={`${label(p, n + 1)}${done ? `, ${t.piecePlaced}` : `, ${t.pieceTray}`}`}
              aria-disabled={done ? "true" : undefined}
              onKeyDown={(e) => {
                if (done || (e.key !== "Enter" && e.key !== " ")) return;
                e.preventDefault();
                place(p);
              }}
            >
              {dragging ? null : <Part kind={p.kind} dir={p.dir} x={pos.x} y={pos.y} r={p.r} s={full ? 1 : TRAY_SCALE} />}
            </g>
          );
        })}
        {dragged ? (
          <g className="inside__piece is-drag" style={{ pointerEvents: "none" }}>
            <Part kind={dragged.kind} dir={dragged.dir} x={drag.x} y={drag.y} r={dragged.r} s={1} />
          </g>
        ) : null}
      </svg>
    </div>
  );
}

/* Same breakdown, embedded in a Journey step: no section, no id, no heading (the step has its own title). */
export function ExplodedEmbed() {
  const wide = useWide();
  const t = ui.partsView;
  const photos = useMemo(() => inV2Folder("phase-1/ph1_step02").filter((x) => x.type === "image"), []);
  const media = photos.length ? (
    <PhotoRoller items={photos} label={t.photosLabel} className="photoroll--journey" />
  ) : (
    <p className="ptf-video" role="img" aria-label={t.photoHint}>
      <span>{t.photoHint}</span>
    </p>
  );
  return (
    <div className="inside inside--embed surface-paper" data-surface="paper" role="group" aria-label={ui.parts.sectionLabel}>
      <Exploded rolling={wide} head={null} media={media} />
    </div>
  );
}

/* "Build by yourself": the drag-the-components game. */
export default function BuildYourself() {
  const wide = useWide();
  const t = ui.byYourself;

  return (
    <section id="build-yourself" className="section inside inside--solo surface-ink" data-surface="ink" data-wave aria-labelledby="build-yourself-title">
      <GhostWord text={ghosts.byYourself} />
      <div className="wrap">
        <div className="section-head">
          <SplitWords as="h2" id="build-yourself-title" className="h2" text={t.title} />
          <p className="lead"><Rich text={t.lead} /></p>
        </div>
        {wide ? <Builder bare /> : <p className="inside__note">{t.fallback}</p>}
      </div>
    </section>
  );
}
