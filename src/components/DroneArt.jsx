/*
  Top-down line drawing of our quadcopter, shared by the hero animation and
  the "What's inside" diagram. Coordinates are in a 600×600 drawing, centre
  (300, 300), front of the drone pointing up.

  Motor numbering and spin follow ArduCopter's Quad-X layout:
  M1 front right CCW, M2 rear left CCW, M3 front left CW, M4 rear right CW.
*/

export const CENTER = 300;
export const ARM_ANGLES = { FR: -45, RR: 45, RL: 135, FL: -135 };
export const MOTORS = [
  { n: 1, pos: "FR", dir: "ccw" },
  { n: 2, pos: "RL", dir: "ccw" },
  { n: 3, pos: "FL", dir: "cw" },
  { n: 4, pos: "RR", dir: "cw" },
];

const rad = (d) => (d * Math.PI) / 180;
export const polar = (angle, r) => [CENTER + r * Math.cos(rad(angle)), CENTER + r * Math.sin(rad(angle))];

/* ---------------------------------------------------------------- parts */

function Battery() {
  return (
    <g className="k-battery">
      <rect className="d-line" x="-95" y="-29" width="190" height="58" rx="5" />
      <rect className="d-thin" x="-78" y="-17" width="64" height="34" />
      <path className="d-thin" d="M4 -10h50M4 0h36M4 10h44" />
      <rect className="d-line" x="-52" y="-35" width="12" height="70" rx="2" />
      <rect className="d-line" x="40" y="-35" width="12" height="70" rx="2" />
      <path className="d-thin" d="M95 -9h16M95 9h16" />
    </g>
  );
}

function Plate() {
  const holes = [];
  for (const a of [-45, 45, 135, -135]) {
    const [dx, dy] = [Math.cos(rad(a)), Math.sin(rad(a))];
    const [nx, ny] = [-dy, dx];
    for (const s of [-1, 1]) holes.push([52 * dx + 15 * s * nx, 52 * dy + 15 * s * ny]);
  }
  return (
    <g className="k-frame">
      <path className="d-line" d="M-46 -76H46L76 -46V46L46 76H-46L-76 46V-46Z" />
      <path className="d-thin d-dash" d="M-30 -60H30L60 -30V30L30 60H-30L-60 30V-30Z" />
      {holes.map(([x, y], i) => (
        <circle key={i} className="d-line" cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.5" />
      ))}
    </g>
  );
}

function Arm() {
  return (
    <>
      <g className="k-frame">
        <path className="d-line" d="M-80 -9H72a9 9 0 0 1 0 18H-80Z" />
        <path className="d-thin d-dash" d="M-70 0H58" />
      </g>
      <g className="k-esc">
        <rect className="d-line" x="-22" y="-8" width="36" height="16" rx="2" />
        <path className="d-thin" d="M-15 -3h22M-15 3h22" />
      </g>
    </>
  );
}

function Motor() {
  const slots = [0, 60, 120, 180, 240, 300].map((a) => {
    const c = Math.cos(rad(a + 30));
    const s = Math.sin(rad(a + 30));
    return `M${(10 * c).toFixed(1)} ${(10 * s).toFixed(1)}L${(15 * c).toFixed(1)} ${(15 * s).toFixed(1)}`;
  });
  return (
    <g className="k-motor">
      <circle className="d-line" r="24" />
      <circle className="d-thin" r="18" />
      <path className="d-thin" d={slots.join("")} />
      <circle className="d-line" r="6.5" />
      <circle className="d-dot" r="2" />
    </g>
  );
}

const BLADE = "M9 -4C30 -12 64 -12 100 -6C110 -4.5 110 4.5 100 5C64 8 30 9 9 5Z";

function Prop({ dir = "cw" }) {
  return (
    <g className="k-prop">
      <circle className="prop-disc" r="108" />
      <g className={`spin ${dir}`}>
        <path className="d-line blade" d={BLADE} />
        <path className="d-line blade" d={BLADE} transform="rotate(180)" />
      </g>
      <circle className="d-line" r="9" />
      <circle className="d-dot" r="2.5" />
    </g>
  );
}

function Cube() {
  const ports = [-28, -14, 0, 14];
  return (
    <g className="k-cube">
      <rect className="d-line" x="-38" y="-30" width="76" height="60" rx="3" />
      {ports.map((x) => (
        <rect key={`t${x}`} className="d-line" x={x - 4} y="-34" width="10" height="6" rx="1" />
      ))}
      {ports.map((x) => (
        <rect key={`b${x}`} className="d-line" x={x - 4} y="28" width="10" height="6" rx="1" />
      ))}
      <rect className="d-cube" x="-23" y="-23" width="46" height="46" rx="4" />
      <path className="d-ink" d="M0 12V-11M-7 -4L0 -11L7 -4" />
    </g>
  );
}

function Gps() {
  return (
    <g className="k-gps">
      <circle className="d-line" r="22" />
      <circle className="d-thin" r="15.5" />
      <path className="d-thin" d="M0 9V-9M-6 -3L0 -9L6 -3" />
    </g>
  );
}

function Rx() {
  return (
    <g className="k-rx">
      <path className="d-thin" d="M-17 -5L-31 -17M-17 5L-31 17" />
      <rect className="d-line" x="-17" y="-11" width="34" height="22" rx="2" />
      <circle className="d-dot" cx="9" cy="0" r="2.2" />
    </g>
  );
}

function Telem() {
  return (
    <g className="k-telem">
      <path className="d-thin" d="M20 -6H35" />
      <circle className="d-line" cx="39" cy="-6" r="4" />
      <rect className="d-line" x="-20" y="-13" width="40" height="26" rx="2" />
      <path className="d-thin" d="M-12 -5h18M-12 1h18M-12 7h11" />
    </g>
  );
}

const RENDER = { battery: Battery, plate: Plate, arm: Arm, motor: Motor, prop: Prop, cube: Cube, gps: Gps, rx: Rx, telem: Telem };

export function Part({ kind, x, y, r = 0, s = 1, dir }) {
  const Shape = RENDER[kind];
  const t = `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${r.toFixed(2)})${s !== 1 ? ` scale(${s.toFixed(4)})` : ""}`;
  return (
    <g transform={t}>
      <Shape dir={dir} />
    </g>
  );
}

/* ------------------------------------------------------- assembled layout */

const xy = ([x, y]) => ({ x, y });

/** Every part in its assembled position, in drawing order (bottom to top). */
export const ASSEMBLED = [
  { id: "battery", kind: "battery", x: 300, y: 300, r: 90 },
  ...["FR", "RR", "RL", "FL"].map((p) => ({ id: `arm-${p}`, kind: "arm", ...xy(polar(ARM_ANGLES[p], 120)), r: ARM_ANGLES[p] })),
  { id: "plate", kind: "plate", x: 300, y: 300, r: 0 },
  { id: "cube", kind: "cube", x: 300, y: 300, r: 0 },
  { id: "rx", kind: "rx", x: 252, y: 252, r: 0 },
  { id: "telem", kind: "telem", x: 348, y: 252, r: 0 },
  { id: "gps", kind: "gps", x: 300, y: 360, r: 0 },
  ...MOTORS.map((m) => ({ id: `motor-${m.pos}`, kind: "motor", ...xy(polar(ARM_ANGLES[m.pos], 200)), r: 0 })),
  ...MOTORS.map((m, i) => ({ id: `prop-${m.pos}`, kind: "prop", ...xy(polar(ARM_ANGLES[m.pos], 200)), r: 20 + i * 47, dir: m.dir })),
];

/** Shared <defs>: the cutting-mat grid and the soft shadow. */
export function DroneDefs({ prefix }) {
  return (
    <defs>
      <pattern id={`${prefix}-grid`} width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M30 0H0V30" className="mat-line" />
      </pattern>
      <pattern id={`${prefix}-grid-major`} width="150" height="150" patternUnits="userSpaceOnUse">
        <path d="M150 0H0V150" className="mat-line mat-line--major" />
      </pattern>
      <filter id={`${prefix}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.28 0" />
        <feGaussianBlur stdDeviation="9" />
      </filter>
    </defs>
  );
}
