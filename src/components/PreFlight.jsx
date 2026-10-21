import { useMemo, useState } from "react";
import { ui } from "../content.js";
import { Rich, fill } from "../lib/text.jsx";
import { inV2Folder } from "../lib/photos.js";
import PhotoRoller from "./PhotoRoller.jsx";
import { MOTORS } from "./DroneArt.jsx";

const p = ui.ptf;
const POS = { FR: [283, 117], RL: [117, 283], FL: [117, 117], RR: [283, 283] };

/* ------------------------------------------------------------ Calibration */

export function Calibration() {
  const [active, setActive] = useState(p.steps[0].id);
  const photos = useMemo(() => inV2Folder("phase-1/ph1_hif_calibration").filter((x) => x.type === "image"), []);
  const step = p.steps.find((s) => s.id === active);

  return (
    <div className="ptf-cal">
      <div className="ptf-cal__list-wrap">
        <p className="ptf-cal__hint">{p.intro}</p>
        <ol className="ptf-cal__list" aria-label={p.listLabel}>
          {p.steps.map((s, i) => (
            <li key={s.id}>
              <button type="button" className="ptf-cal__step" aria-pressed={active === s.id} onClick={() => setActive(s.id)}>
                <span className="ptf-cal__num">{i + 1}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>

        <div className="ptf-box" aria-live="polite">
          <h3 className="h3">{step.label}</h3>
          {typeof step.body === "string" ? <p>{step.body}</p> : <p key={step.id}><Rich text={step.body} /></p>}
        </div>
      </div>

      <div className="ptf-cal__stage">
        <CalibrationDrone id={active} label={step.label} />
        {photos.length ? (
          <PhotoRoller items={photos} label={p.photosLabel} className="photoroll--journey" />
        ) : (
          <div className="ptf-video" role="img" aria-label={`${step.label}: ${p.videoSlot}`}>
            <span>{p.videoSlot}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CalibrationDrone({ id, label }) {
  return (
    <svg viewBox="0 0 400 400" className={`ptf-drone ptf-drone--${id}`} role="img" aria-label={fill(p.animLabel, { step: label })}>
      {/* static, illustrative cues (visible with reduced motion) */}
      <g className="ptf-cue" aria-hidden="true">
        {id === "accel" ? <path d="M60 60H110M60 60V110M340 340H290M340 340V290" /> : null}
        {id === "accel" ? (
          <>
            <circle cx="200" cy="200" r="150" />
            <path d="M200 40L188 66H212ZM200 360V334" />
          </>
        ) : null}
        {id === "battery" ? <path d="M40 360H110V380H40ZM110 366V374" /> : null}
        {id === "arm" ? <path d="M30 40H120V70H30Z" /> : null}
      </g>

      {id === "arm" ? (
        <g aria-hidden="true">
          <rect x="30" y="40" width="90" height="30" rx="15" className="ptf-sw" />
          <circle cx="45" cy="55" r="11" className="ptf-sw__knob" />
        </g>
      ) : null}
      {id === "battery" ? <rect x="44" y="364" width="20" height="12" className="ptf-bat" /> : null}

      <g className="ptf-body">
        <path d="M117 117L283 283M283 117L117 283" className="ptf-arm" />
        <rect x="165" y="165" width="70" height="70" rx="10" className="ptf-hull" />
        <rect x="187" y="187" width="26" height="26" rx="4" className="ptf-cube" />
        <path d="M200 160V132M190 142L200 130L210 142" className="ptf-nose" />
        {MOTORS.map((m) => {
          const [x, y] = POS[m.pos];
          return (
            <g key={m.n} transform={`translate(${x} ${y})`}>
              <circle r="46" className={`ptf-disc ptf-disc--n${m.n}`} style={{ animationDelay: `${(m.n - 1) * 1.5}s` }} />
              <g className={`ptf-spin ptf-spin--${m.dir}`}>
                <path d="M-40 0H40" className="ptf-blade" />
              </g>
              <circle r="9" className="ptf-hub" />
              <text y="70" textAnchor="middle" className="ptf-mlabel">
                M{m.n}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------- Mission Planner */

export function MissionPlanner() {
  return (
    <div className="ptf-mp">
      <svg viewBox="0 0 640 320" className="ptf-scene" role="img" aria-label={p.planner.sceneLabel}>
        {/* ground */}
        <path d="M0 290H640" className="ptf-ground" />

        {/* laptop */}
        <g transform="translate(40 200)">
          <rect x="0" y="0" width="130" height="82" rx="6" className="ptf-laptop" />
          <path d="M14 20H70M14 36H96M14 52H58" className="ptf-screen" />
          <circle cx="104" cy="56" r="10" className="ptf-screen" />
          <path d="M-14 90H144L132 82H-2Z" className="ptf-laptop" />
        </g>

        {/* antenna */}
        <g transform="translate(250 290)">
          <path d="M0 0V-110M-26 0H26" className="ptf-ant" />
          <circle cy="-116" r="7" className="ptf-ant-tip" />
          <path d="M-18 -140A28 28 0 0 1 -18 -92M18 -140A28 28 0 0 0 18 -92" className="ptf-ant-tip" />
        </g>
        <path d="M170 275H230L250 270" className="ptf-link" />

        {/* radio waves from antenna to the drone */}
        <g className="ptf-waves" transform="translate(250 174)">
          <path d="M40 -30A60 60 0 0 1 40 30" className="ptf-wave ptf-wave--1" />
          <path d="M80 -52A100 100 0 0 1 80 52" className="ptf-wave ptf-wave--2" />
          <path d="M120 -74A140 140 0 0 1 120 74" className="ptf-wave ptf-wave--3" />
        </g>

        {/* drone far away */}
        <g transform="translate(500 70)">
          <g className="ptf-fly">
            <path d="M-26 -14L26 14M26 -14L-26 14" className="ptf-arm" />
            <rect x="-9" y="-9" width="18" height="18" rx="3" className="ptf-hull" />
            {[
              [-26, -14],
              [26, -14],
              [-26, 14],
              [26, 14],
            ].map(([x, y]) => (
              <g key={`${x}${y}`} transform={`translate(${x} ${y})`}>
                <g className="ptf-spin ptf-spin--cw">
                  <path d="M-14 0H14" className="ptf-blade" />
                </g>
              </g>
            ))}
          </g>
        </g>
      </svg>

      <div className="ptf-mp__boxes">
        {p.planner.sections.map((t) => (
          <div key={t.heading} className="ptf-box">
            <h3 className="h3">{t.heading}</h3>
            <p>{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
