import { GhostWord, SplitWords } from "./Reveal.jsx";
import { ghosts, hero, team, ui } from "../content.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rich, joinNames } from "../lib/text.jsx";
import { useReducedMotion } from "../lib/hooks.js";
import { ASSEMBLED, DroneDefs, Part } from "./DroneArt.jsx";
import { Icon } from "./Icons.jsx";

/* Where each part lies on the mat before assembly ("knolled"): x, y, rotation. */
const KNOLL = {
  battery: [500, 120, 90],
  "arm-FR": [60, 120, 90],
  "arm-RR": [98, 120, 90],
  "arm-RL": [136, 120, 90],
  "arm-FL": [174, 120, 90],
  plate: [315, 120, 0],
  cube: [330, 315, 0],
  gps: [432, 315, 0],
  radio: [525, 318, 0],
  "motor-FR": [52, 315, 0],
  "motor-RL": [112, 315, 0],
  "motor-FL": [172, 315, 0],
  "motor-RR": [232, 315, 0],
  "prop-FR": [150, 452, 0],
  "prop-RL": [150, 512, 0],
  "prop-FL": [430, 452, 0],
  "prop-RR": [430, 512, 0],
};

/* When each part moves, as a share of the whole assembly (follows the real build order). */
const TIMING = {
  battery: [0.02, 0.3],
  plate: [0.06, 0.34],
  "arm-FR": [0.14, 0.46],
  "arm-RR": [0.18, 0.5],
  "arm-RL": [0.22, 0.54],
  "arm-FL": [0.26, 0.58],
  "motor-FR": [0.34, 0.62],
  "motor-RL": [0.38, 0.66],
  "motor-FL": [0.42, 0.7],
  "motor-RR": [0.46, 0.74],
  cube: [0.5, 0.74],
  gps: [0.56, 0.8],
  radio: [0.58, 0.82],
  "prop-FR": [0.72, 0.92],
  "prop-RL": [0.76, 0.95],
  "prop-FL": [0.8, 0.98],
  "prop-RR": [0.84, 1],
};

const LABELS = [
  { key: "arms", x: 117, y: 230 },
  { key: "plate", x: 315, y: 230 },
  { key: "battery", x: 500, y: 242 },
  { key: "motors", x: 142, y: 368 },
  { key: "cube", x: 330, y: 368 },
  { key: "gps", x: 432, y: 368 },
  { key: "radio", x: 528, y: 384 },
  { key: "props", x: 290, y: 562 },
];

const ASSEMBLY_MS = 3400;
const START_DELAY_MS = 700;
const SPOOL_MS = 750;

const clamp01 = (t) => Math.min(1, Math.max(0, t));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpAngle = (a, b, t) => a + ((((b - a) % 360) + 540) % 360 - 180) * t;

function stageIndex(p, airborne) {
  if (p >= 1) return airborne ? 5 : 4;
  if (p < 0.08) return 0;
  if (p < 0.46) return 1;
  if (p < 0.62) return 2;
  if (p < 0.84) return 3;
  return 4;
}

export default function Hero() {
  const reduced = useReducedMotion();
  const [p, setP] = useState(reduced ? 1 : 0);
  const [rotor, setRotor] = useState("off"); // off | spooling | flying
  const timers = useRef({ raf: 0, timeouts: [] });

  const stopAll = useCallback(() => {
    cancelAnimationFrame(timers.current.raf);
    timers.current.timeouts.forEach(clearTimeout);
    timers.current.timeouts = [];
  }, []);

  const later = useCallback((fn, ms) => {
    timers.current.timeouts.push(setTimeout(fn, ms));
  }, []);

  const takeOff = useCallback(() => {
    if (reduced) return;
    setRotor("spooling");
    later(() => setRotor("flying"), SPOOL_MS);
  }, [reduced, later]);

  const play = useCallback(() => {
    stopAll();
    setRotor("off");
    if (reduced) {
      setP(1);
      return;
    }
    setP(0);
    later(() => {
      const start = performance.now();
      const tick = (now) => {
        const t = clamp01((now - start) / ASSEMBLY_MS);
        setP(t);
        if (t < 1) timers.current.raf = requestAnimationFrame(tick);
        else takeOff();
      };
      timers.current.raf = requestAnimationFrame(tick);
    }, START_DELAY_MS);
  }, [reduced, stopAll, later, takeOff]);

  useEffect(() => {
    play();
    return stopAll;
  }, [play, stopAll]);

  const onScrub = (e) => {
    stopAll();
    const v = Number(e.target.value) / 100;
    setP(v);
    if (v >= 1) takeOff();
    else setRotor("off");
  };

  const airborne = rotor === "flying";
  const labelOpacity = clamp01(1 - p / 0.14);
  const stage = hero.stages[stageIndex(p, airborne)];
  const names = joinNames(team.members.map((m) => m.name));

  return (
    <section id="top" className="hero wave surface-paper" data-surface="paper" data-wave>
      <GhostWord text={ghosts.top} />
      <div className="wrap hero__grid">
        <div className="hero__text">
          <SplitWords as="h1" className="hero__title" text={hero.title} gate delay={150} />
          <p className="hero__intro"><Rich text={hero.intro} /></p>
          <p className="hero__by">
            {ui.hero.by} <Rich text={names} />
          </p>
        </div>

        <figure className="hero__art">
          <svg
            viewBox="0 0 600 600"
            className={`kit kit--${rotor}`}
            role="img"
            aria-label={ui.hero.artLabel}
          >
            <DroneDefs prefix="kit" />
            <rect width="600" height="600" fill="url(#kit-grid)" />
            <rect width="600" height="600" fill="url(#kit-grid-major)" />

            <g className="kit-labels" style={{ opacity: labelOpacity }} aria-hidden="true">
              {LABELS.map((l) => (
                <text key={l.key} x={l.x} y={l.y} textAnchor="middle">
                  {hero.kitLabels[l.key]}
                </text>
              ))}
            </g>

            <use href="#kit-parts" filter="url(#kit-shadow)" className="kit-shadow" />
            <g className="kit-lift">
              <g className="kit-bob">
                <g id="kit-parts">
                  {ASSEMBLED.map((part) => {
                    const [kx, ky, kr] = KNOLL[part.id];
                    const [t0, t1] = TIMING[part.id];
                    const u = ease(clamp01((p - t0) / (t1 - t0)));
                    const s = 1 + 0.07 * Math.sin(Math.PI * u);
                    return (
                      <Part
                        key={part.id}
                        kind={part.kind}
                        dir={part.dir}
                        x={lerp(kx, part.x, u)}
                        y={lerp(ky, part.y, u)}
                        r={lerpAngle(kr, part.r, u)}
                        s={s}
                      />
                    );
                  })}
                </g>
              </g>
            </g>
          </svg>

          <figcaption className="hero__controls">
            <p className="hero__stage"><Rich text={stage} /></p>
            <div className="scrub">
              <label htmlFor="assembly" className="scrub__label">
                {ui.hero.scrub}
              </label>
              <input
                id="assembly"
                className="scrub__range"
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(p * 100)}
                onChange={onScrub}
                style={{ "--fill": `${Math.round(p * 100)}%` }}
              />
              <output htmlFor="assembly" className="scrub__value">
                {Math.round(p * 100)}%
              </output>
              <button type="button" className="btn btn--ghost" onClick={play}>
                <Icon name="restart" size={18} />
                <span>{ui.hero.replay}</span>
              </button>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
