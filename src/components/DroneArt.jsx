/*
  Top-down layout of our quadcopter, built from photos of the parts, shared by the hero animation and
  the "What's inside" diagram. Coordinates are in a 600×600 drawing, centre
  (300, 300), front of the drone pointing up.

  Motor numbering and spin follow ArduCopter's Quad-X layout:
  M1 front right CCW, M2 rear left CCW, M3 front left CW, M4 rear right CW.
*/

import { inV2Folder } from "../lib/photos.js";

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

/*
  Each part is a photo from photos/parts_drone/ (transparent PNG), found by file
  name through lib/photos.js. Photos are decorative: the groups that show them
  carry the accessible label. `w` is the width in drawing units, `nat` the
  photo's pixel size, `rot` a turn that brings the photo's long axis to the
  drawing's reference direction (horizontal, like the old line drawing).
*/
const PHOTOS = inV2Folder("parts_drone");
const urlOf = (base) => PHOTOS.find((x) => x.base === base)?.url;

function Photo({ file, nat, w, rot = 0, className }) {
  const h = (w * nat[1]) / nat[0];
  return (
    <image
      href={urlOf(file)}
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      preserveAspectRatio="xMidYMid meet"
      transform={rot ? `rotate(${rot})` : undefined}
      className={className}
      aria-hidden="true"
    />
  );
}

const ARM_FILES = { FR: "brazo", RL: "brazo2", FL: "brazo3", RR: "brazo4" };
/* In all four motor photos the cables leave downward (+90deg): turning each by arm angle + 90 points them at the frame. */
const MOTOR_FILES = { FR: "motor_nj", FL: "motor_nj2", RL: "motor_negro", RR: "motor_negro2" };
const MOTOR_NAT = { motor_nj: [110, 103], motor_nj2: [110, 103], motor_negro: [110, 100], motor_negro2: [110, 100] };
const PROP_FILES = { FR: "helice", RL: "helice2", FL: "helice3", RR: "helice4" };

const Battery = () => (
  <g className="k-battery">
    <Photo file="bat" nat={[335, 144]} w={200} />
  </g>
);

const Plate = () => (
  <g className="k-frame">
    <Photo file="frame" nat={[336, 329]} w={170} />
  </g>
);

/* The arm photo is a vertical tube: turned to lie along the arm (x axis). */
const arm = (pos) => () => (
  <g className="k-frame">
    <Photo file={ARM_FILES[pos]} nat={[73, 354]} w={33} rot={-90} />
  </g>
);

const motor = (pos) => () => (
  <g className="k-motor">
    <Photo file={MOTOR_FILES[pos]} nat={MOTOR_NAT[MOTOR_FILES[pos]]} w={54} />
  </g>
);

const prop = (pos) =>
  function Prop({ dir = "cw" }) {
    return (
      <g className="k-prop">
        <circle className="prop-disc" r="108" />
        <g className={`spin ${dir}`}>
          <Photo file={PROP_FILES[pos]} nat={[644, 80]} w={220} className="blade" />
        </g>
      </g>
    );
  };

const Cube = () => (
  <g className="k-cube">
    <Photo file="cube" nat={[115, 230]} w={55} />
  </g>
);

const Gps = () => (
  <g className="k-gps">
    <Photo file="antena" nat={[131, 231]} w={49} />
  </g>
);

const Radio = () => (
  <g className="k-rx">
    <Photo file="radio" nat={[110, 85]} w={56} />
  </g>
);

const POS = ["FR", "RR", "RL", "FL"];
const RENDER = {
  battery: Battery,
  plate: Plate,
  cube: Cube,
  gps: Gps,
  radio: Radio,
  ...Object.fromEntries(POS.flatMap((p) => [[`arm-${p}`, arm(p)], [`motor-${p}`, motor(p)], [`prop-${p}`, prop(p)]])),
};

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
  ...["FR", "RR", "RL", "FL"].map((p) => ({ id: `arm-${p}`, kind: `arm-${p}`, ...xy(polar(ARM_ANGLES[p], 120)), r: ARM_ANGLES[p] })),
  { id: "plate", kind: "plate", x: 300, y: 300, r: 0 },
  { id: "cube", kind: "cube", x: 300, y: 300, r: 0 },
  { id: "radio", kind: "radio", x: 352, y: 250, r: 0 },
  { id: "gps", kind: "gps", x: 300, y: 204, r: 0 },
  ...MOTORS.map((m) => ({ id: `motor-${m.pos}`, kind: `motor-${m.pos}`, ...xy(polar(ARM_ANGLES[m.pos], 200)), r: ARM_ANGLES[m.pos] + 90 })),
  ...MOTORS.map((m, i) => ({ id: `prop-${m.pos}`, kind: `prop-${m.pos}`, ...xy(polar(ARM_ANGLES[m.pos], 200)), r: 20 + i * 47, dir: m.dir })),
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
