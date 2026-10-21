import { GhostWord, SplitWords } from "./Reveal.jsx";
import { ghosts, physics, ui } from "../content.js";
import { Rich, fill } from "../lib/text.jsx";
import { useEffect, useRef, useState } from "react";
import { Calibration, MissionPlanner } from "./PreFlight.jsx";
import { MOTORS } from "./DroneArt.jsx";

/* Illustrative demands for each move (0..1). Mixer for ArduCopter Quad-X,
   with R = roll right, P = pitch forward (nose down), Y = yaw right. */
const DEMAND = {
  hover: { T: 0.5, R: 0, P: 0, Y: 0 },
  climb: { T: 0.7, R: 0, P: 0, Y: 0 },
  forward: { T: 0.5, R: 0, P: 0.1, Y: 0 },
  right: { T: 0.5, R: 0.1, P: 0, Y: 0 },
  turn: { T: 0.5, R: 0, P: 0, Y: 0.1 },
};
const MIX = {
  FR: { R: -1, P: -1, Y: 1 },
  RL: { R: 1, P: 1, Y: 1 },
  FL: { R: 1, P: -1, Y: -1 },
  RR: { R: -1, P: 1, Y: -1 },
};
/* Mode 2 sticks: left = throttle (up) and yaw (right); right = pitch (up) and roll (right). */
const STICKS = {
  hover: { left: [0, 0], right: [0, 0] },
  climb: { left: [0, 0.75], right: [0, 0] },
  forward: { left: [0, 0], right: [0, 0.75] },
  right: { left: [0, 0], right: [0.75, 0] },
  turn: { left: [0.75, 0], right: [0, 0] },
};
const t = ui.physics;
const pt = ui.ptf;
const TAB_IDS = ["fly", "calibration", "planner"];
const NAMES = t.names;
const POS = { FR: [283, 117], RL: [117, 283], FL: [117, 117], RR: [283, 283] };

const output = (move, pos) => {
  const d = DEMAND[move];
  const m = MIX[pos];
  return d.T + m.R * d.R + m.P * d.P + m.Y * d.Y;
};

export default function HowItFlies() {
  const [move, setMove] = useState("hover");
  const current = physics.moves.find((m) => m.id === move);
  const [tab, setTab] = useState("fly");
  const tabRefs = useRef({});

  /* Links to "#previous-to-flight-calibration" (Journey step 07) open the Calibration tab. */
  useEffect(() => {
    let timer;
    const open = () => {
      setTab("calibration");
      /* Move focus to the tab after the switch; preventScroll leaves the native/CSS
         scroll (which honours prefers-reduced-motion) untouched. */
      clearTimeout(timer);
      timer = setTimeout(() => tabRefs.current.calibration?.focus({ preventScroll: true }), 50);
    };
    const onClick = (e) => {
      if (e.target.closest?.('a[href$="previous-to-flight-calibration"]')) open();
    };
    const onHash = () => {
      if (window.location.hash.endsWith("previous-to-flight-calibration")) open();
    };
    onHash();
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  const onTabKey = (e) => {
    const i = TAB_IDS.indexOf(tab);
    let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % TAB_IDS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TAB_IDS.length) % TAB_IDS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TAB_IDS.length - 1;
    if (n === null) return;
    e.preventDefault();
    setTab(TAB_IDS[n]);
    tabRefs.current[TAB_IDS[n]]?.focus();
  };

  return (
    <section id="physics" className="section surface-paper" data-surface="paper" data-wave>
      <GhostWord text={ghosts.physics} />
      <div className="wrap">
        <span id="previous-to-flight-calibration" className="ptf-anchor" />
        <div className="section-head">
          <SplitWords as="h2" className="h2" text={pt.title} />
        </div>

        <div className="ptf-tabs" role="tablist" aria-label={pt.tabsLabel} onKeyDown={onTabKey}>
          {TAB_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`ptf-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`ptf-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              className="ptf-tabs__tab"
              ref={(el) => (tabRefs.current[id] = el)}
              onClick={() => setTab(id)}
            >
              {pt.tabs[id]}
            </button>
          ))}
        </div>

        <div role="tabpanel" id="ptf-panel-fly" aria-labelledby="ptf-tab-fly" hidden={tab !== "fly"} tabIndex={0} className="ptf-panel">
        <p className="ptf-cal__hint"><Rich text={physics.lead} /></p>

        <div className="moves" role="group" aria-label={t.moves}>
          {physics.moves.map((m) => (
            <button key={m.id} type="button" className="moves__btn" aria-pressed={move === m.id} onClick={() => setMove(m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="mixer">
          <figure className="mixer__art">
            <Schematic move={move} />
          </figure>

          <div className="mixer__info" aria-live="polite">
            <h3 className="h3">{current.label}</h3>
            <p className="mixer__text" key={move}><Rich text={current.text} /></p>

            <div className="sticks">
              <Stick side="left" pos={STICKS[move].left} />
              <Stick side="right" pos={STICKS[move].right} />
            </div>
          </div>
        </div>
        </div>

        <div role="tabpanel" id="ptf-panel-calibration" aria-labelledby="ptf-tab-calibration" hidden={tab !== "calibration"} tabIndex={0} className="ptf-panel">
          <Calibration />
        </div>
        <div role="tabpanel" id="ptf-panel-planner" aria-labelledby="ptf-tab-planner" hidden={tab !== "planner"} tabIndex={0} className="ptf-panel">
          <MissionPlanner />
        </div>
      </div>
    </section>
  );
}

function Schematic({ move }) {
  return (
    <svg viewBox="0 0 400 400" className={`schematic schematic--${move}`} role="img" aria-label={fill(t.schematic, { move })}>
      <text x="200" y="24" textAnchor="middle" className="schematic__front">
        {t.front}
      </text>
      <path d="M192 38l8-8 8 8" className="schematic__front-mark" />

      {/* arms and body */}
      <path d="M117 117L283 283M283 117L117 283" className="schematic__arm" />
      <rect x="165" y="165" width="70" height="70" rx="10" className="schematic__body" />
      <rect x="187" y="187" width="26" height="26" rx="4" className="schematic__cube" />

      {MOTORS.map((m) => {
        const [x, y] = POS[m.pos];
        const v = output(move, m.pos);
        const r = 12 + 44 * v;
        const dur = (1.5 - v).toFixed(2);
        const cw = m.dir === "cw";
        // rotation arrow: a short arc on the outer side of the motor
        const mid = x > 200 ? 0 : 180;
        const a0 = cw ? mid - 30 : mid + 30;
        const a1 = cw ? mid + 30 : mid - 30;
        const R = 56;
        const p0 = [x + R * Math.cos((a0 * Math.PI) / 180), y + R * Math.sin((a0 * Math.PI) / 180)];
        const p1 = [x + R * Math.cos((a1 * Math.PI) / 180), y + R * Math.sin((a1 * Math.PI) / 180)];
        const sweep = cw ? 1 : 0;
        const tangent = cw ? a1 + 90 : a1 - 90;
        const label = `${Math.round(v * 100)}%`;
        const ly = y < 200 ? y - 60 : y + 72;
        return (
          <g key={m.n}>
            <circle cx={x} cy={y} r="46" className="schematic__disc" />
            <circle cx={x} cy={y} r={r.toFixed(1)} className="schematic__thrust" />
            <g transform={`translate(${x} ${y})`}>
              <g className={`spin ${m.dir}`} style={{ animationDuration: `${dur}s` }}>
                <path d="M-40 0H40" className="schematic__blade" />
              </g>
              <circle r="9" className="schematic__hub" />
            </g>
            <path
              d={`M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}A${R} ${R} 0 0 ${sweep} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`}
              className="schematic__rot"
            />
            <path
              d="M-6 -5L0 0L-6 5"
              transform={`translate(${p1[0].toFixed(1)} ${p1[1].toFixed(1)}) rotate(${tangent})`}
              className="schematic__rot"
            />
            <text x={x} y={ly} textAnchor="middle" className="schematic__label">
              {label}
            </text>
          </g>
        );
      })}

      {/* what the drone does */}
      <g className="schematic__move" aria-hidden="true">
        {move === "forward" ? <path d="M200 150V62M184 80l16-18 16 18" /> : null}
        {move === "right" ? <path d="M250 200H338M320 184l18 16-18 16" /> : null}
        {move === "turn" ? <path d="M160.1 152.5A62 62 0 0 1 239.9 152.5M229.8 150.5L239.9 152.5L236.2 142.9" /> : null}
        {move === "climb" ? (
          <>
            <circle cx="200" cy="200" r="62" className="pulse" />
            <circle cx="200" cy="200" r="62" className="pulse pulse--late" />
          </>
        ) : null}
      </g>
    </svg>
  );
}

function Stick({ side, pos }) {
  const [x, y] = pos;
  const label = side === "left" ? t.leftStick : t.rightStick;
  const moved = x !== 0 || y !== 0;
  return (
    <figure className={`stick${moved ? " is-moved" : ""}`}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label}${moved ? t.pushed : t.centred}`}>
        <rect x="4" y="4" width="92" height="92" rx="14" className="stick__frame" />
        <path d="M50 14V86M14 50H86" className="stick__cross" />
        <circle cx={50 + x * 36} cy={50 - y * 36} r="11" className="stick__knob" />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
