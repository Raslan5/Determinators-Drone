import { useState } from "react";
import { physics } from "../content.js";
import { Say, useMode } from "../lib/mode.jsx";
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
const NAMES = { FR: "Front right", RL: "Rear left", FL: "Front left", RR: "Rear right" };
const POS = { FR: [283, 117], RL: [117, 283], FL: [117, 117], RR: [283, 283] };

const term = (sign, name) => `${sign > 0 ? "+" : "\u2212"} ${name}`;

const output = (move, pos) => {
  const d = DEMAND[move];
  const m = MIX[pos];
  return d.T + m.R * d.R + m.P * d.P + m.Y * d.Y;
};

export default function HowItFlies() {
  const { mode } = useMode();
  const [move, setMove] = useState("hover");
  const current = physics.moves.find((m) => m.id === move);
  const tech = mode === "tech";

  return (
    <section id="physics" className="section surface-paper" data-surface="paper">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2">{physics.title}</h2>
          <Say v={physics.lead} as="p" className="lead" />
        </div>

        <div className="moves" role="group" aria-label="Choose a move">
          {physics.moves.map((m) => (
            <button key={m.id} type="button" className="moves__btn" aria-pressed={move === m.id} onClick={() => setMove(m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="mixer">
          <figure className="mixer__art">
            <Schematic move={move} tech={tech} />
          </figure>

          <div className="mixer__info" aria-live="polite">
            <h3 className="h3">{current.label}</h3>
            <Say v={{ simple: current.simple, tech: current.tech }} as="p" className="mixer__text" key={move} />

            <div className="sticks">
              <Stick side="left" pos={STICKS[move].left} tech={tech} />
              <Stick side="right" pos={STICKS[move].right} tech={tech} />
            </div>

            {tech ? (
              <div className="swap">
                <table className="mix-table">
                  <caption className="sr-only">Motor outputs for this move (illustrative)</caption>
                  <thead>
                    <tr>
                      <th scope="col">Motor</th>
                      <th scope="col">Position</th>
                      <th scope="col">Spins</th>
                      <th scope="col" className="num">
                        Output
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOTORS.map((m) => {
                      const v = output(move, m.pos);
                      const delta = v - 0.5;
                      return (
                        <tr key={m.n} className={delta > 0.001 ? "up" : delta < -0.001 ? "down" : undefined}>
                          <td>M{m.n}</td>
                          <td>{NAMES[m.pos]}</td>
                          <td>{m.dir.toUpperCase()}</td>
                          <td className="num">{Math.round(1000 + 1000 * v)} µs</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mixer__formula">{physics.mixerIntro}</p>
                <ul className="equations">
                  {MOTORS.map((m) => (
                    <li key={m.n}>
                      <span className="equations__lhs">M{m.n}</span>
                      <span>= T {term(MIX[m.pos].R, "R")} {term(MIX[m.pos].P, "P")} {term(MIX[m.pos].Y, "Y")}</span>
                    </li>
                  ))}
                </ul>
                <p className="mixer__formula">{physics.mixerOutro}</p>
                <p className="mixer__note">Outputs are illustrative ESC pulse widths; real values depend on weight and battery.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Schematic({ move, tech }) {
  return (
    <svg viewBox="0 0 400 400" className={`schematic schematic--${move}`} role="img" aria-label={`Top view of the drone during the move: ${move}. Larger orange discs mean faster motors.`}>
      <text x="200" y="24" textAnchor="middle" className="schematic__front">
        Front
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
        const label = tech ? `M${m.n} ${Math.round(1000 + 1000 * v)} µs` : `${Math.round(v * 100)}%`;
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

function Stick({ side, pos, tech }) {
  const [x, y] = pos;
  const label =
    side === "left"
      ? tech
        ? "Left stick: throttle CH3, yaw CH4"
        : "Left stick"
      : tech
        ? "Right stick: pitch CH2, roll CH1"
        : "Right stick";
  const moved = x !== 0 || y !== 0;
  return (
    <figure className={`stick${moved ? " is-moved" : ""}`}>
      <svg viewBox="0 0 100 100" role="img" aria-label={`${label}${moved ? ", pushed" : ", centred"}`}>
        <rect x="4" y="4" width="92" height="92" rx="14" className="stick__frame" />
        <path d="M50 14V86M14 50H86" className="stick__cross" />
        <circle cx={50 + x * 36} cy={50 - y * 36} r="11" className="stick__knob" />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
