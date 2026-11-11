import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

/*
  Simple 3D quadcopter drawn in SVG. Isolated and easy to replace: any
  component that forwards a ref exposing setProgress(0..1) can take its place.
  - Quad-X layout: four motors on the diagonals, centred body.
  - Perspective projection computed in JS; the SVG nodes are created once and
    updated through attributes (no React renders while scrolling).
*/

const VIEW = 400;
const CAM = 5; // camera distance
const FOCAL = 330;
const TILT = 0.5; // fixed pitch (rad) so the top is visible
const TURN = Math.PI * 2; // yaw over the full progress range
const ARM = 1.5; // motor distance on each axis
const HEIGHT = 0.12; // body half height
const PROP_R = 0.95;
const RING = 20;

/* Body: a flat box. Vertices as [x, y, z], y up. */
const BODY = [];
for (const y of [-HEIGHT, HEIGHT]) for (const [x, z] of [[-0.45, -0.7], [0.45, -0.7], [0.45, 0.7], [-0.45, 0.7]]) BODY.push([x, y, z]);
const BODY_EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
/* Motors in Quad-X positions (front-left, front-right, back-right, back-left). */
const MOTORS = [[-ARM, -ARM], [ARM, -ARM], [ARM, ARM], [-ARM, ARM]];
const MOTOR_Y = HEIGHT + 0.12;

/* Every point lives in one flat array [x,y,z, x,y,z, ...]; edges index into it. */
const POINTS = [];
const push = (x, y, z) => POINTS.push(x, y, z) / 3 - 1;
const bodyIdx = BODY.map(([x, y, z]) => push(x, y, z));
const armIdx = MOTORS.map(([x, z]) => [push(0, 0, 0), push(x, 0, z), push(x, MOTOR_Y, z)]);
const ringIdx = MOTORS.map(([x, z]) =>
  Array.from({ length: RING }, (_, k) => {
    const a = (k / RING) * TURN;
    return push(x + Math.cos(a) * PROP_R, MOTOR_Y, z + Math.sin(a) * PROP_R);
  }),
);
/* Two blades per motor: their ends rotate with progress. */
const bladeIdx = MOTORS.map(([x, z]) => [push(x, MOTOR_Y, z), push(x, MOTOR_Y, z), push(x, MOTOR_Y, z), push(x, MOTOR_Y, z)]);
const MOTOR_DIR = [1, -1, 1, -1]; // alternating spin; same sense as the kit's motor layout
const COUNT = POINTS.length / 3;

const Drone3D = forwardRef(function Drone3D({ label, progress = 0 }, ref) {
  const svg = useRef(null);
  const nodes = useRef({ lines: [], rings: [], blades: [] });
  const sx = useMemo(() => new Float32Array(COUNT), []);
  const sy = useMemo(() => new Float32Array(COUNT), []);

  const draw = (p) => {
    const { lines, rings, blades } = nodes.current;
    if (!lines.length) return;
    const yaw = p * TURN;
    const cy = Math.cos(yaw);
    const sn = Math.sin(yaw);
    const ct = Math.cos(TILT);
    const st = Math.sin(TILT);
    const spin = p * TURN * 14;
    const half = VIEW / 2;

    /* Blade ends depend on the spin angle, so write them into the point list first. */
    for (let m = 0; m < 4; m += 1) {
      const [mx, mz] = MOTORS[m];
      const a = spin * MOTOR_DIR[m];
      for (let b = 0; b < 4; b += 1) {
        const ang = a + (b * Math.PI) / 2;
        const o = bladeIdx[m][b] * 3;
        POINTS[o] = mx + Math.cos(ang) * PROP_R;
        POINTS[o + 2] = mz + Math.sin(ang) * PROP_R;
      }
    }

    for (let i = 0; i < COUNT; i += 1) {
      const x0 = POINTS[i * 3];
      const y0 = POINTS[i * 3 + 1];
      const z0 = POINTS[i * 3 + 2];
      const x1 = x0 * cy + z0 * sn; // yaw around the vertical axis
      const z1 = -x0 * sn + z0 * cy;
      const y2 = y0 * ct - z1 * st; // tilt towards the camera
      const z2 = y0 * st + z1 * ct;
      const k = FOCAL / (CAM + z2);
      sx[i] = half + x1 * k;
      sy[i] = half - y2 * k;
    }

    for (let e = 0; e < lines.length; e += 1) {
      const [a, b] = lines[e].pair;
      const n = lines[e].el;
      n.setAttribute("x1", sx[a].toFixed(1));
      n.setAttribute("y1", sy[a].toFixed(1));
      n.setAttribute("x2", sx[b].toFixed(1));
      n.setAttribute("y2", sy[b].toFixed(1));
    }
    for (let m = 0; m < 4; m += 1) {
      let d = "";
      for (let k = 0; k < RING; k += 1) d += `${k ? "L" : "M"}${sx[ringIdx[m][k]].toFixed(1)} ${sy[ringIdx[m][k]].toFixed(1)}`;
      rings[m].setAttribute("d", `${d}Z`);
      const bl = bladeIdx[m];
      blades[m].setAttribute(
        "d",
        `M${sx[bl[0]].toFixed(1)} ${sy[bl[0]].toFixed(1)}L${sx[bl[2]].toFixed(1)} ${sy[bl[2]].toFixed(1)}M${sx[bl[1]].toFixed(1)} ${sy[bl[1]].toFixed(1)}L${sx[bl[3]].toFixed(1)} ${sy[bl[3]].toFixed(1)}`,
      );
    }
  };

  /* Callback refs register the nodes once; the pairs are the segments to draw. */
  const segs = useMemo(() => {
    const s = BODY_EDGES.map(([a, b]) => ({ pair: [bodyIdx[a], bodyIdx[b]], cls: "drone3d__edge" }));
    armIdx.forEach(([c, e, t]) => {
      s.push({ pair: [c, e], cls: "drone3d__arm" }, { pair: [e, t], cls: "drone3d__arm" });
    });
    return s;
  }, []);

  useImperativeHandle(ref, () => ({ setProgress: draw }));

  const setLine = (i) => (el) => {
    if (!el) return;
    nodes.current.lines[i] = { el, pair: segs[i].pair };
  };
  const setRing = (m) => (el) => {
    if (el) nodes.current.rings[m] = el;
  };
  const setBlade = (m) => (el) => {
    if (el) {
      nodes.current.blades[m] = el;
      if (m === 3) draw(progress);
    }
  };

  return (
    <svg ref={svg} className="drone3d" viewBox={`0 0 ${VIEW} ${VIEW}`} role="img" aria-label={label}>
      {segs.map((s, i) => (
        <line key={i} ref={setLine(i)} className={s.cls} />
      ))}
      {MOTORS.map((_, m) => (
        <g key={m} className="drone3d__prop">
          <path ref={setRing(m)} className="drone3d__ring" />
          <path ref={setBlade(m)} className="drone3d__blade" />
        </g>
      ))}
    </svg>
  );
});

export default Drone3D;
