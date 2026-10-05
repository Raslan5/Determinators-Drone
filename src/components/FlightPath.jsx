import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMode } from "../lib/mode.jsx";
import { useReducedMotion } from "../lib/hooks.js";
import { Icon } from "./Icons.jsx";

/*
  3D replay of the flight-test pattern defined in content.js (flight.test).
  World frame: x = initial forward, y = initial left, z = up, metres.
  Moves are in the drone's own frame, like the pilot flies them.
*/

const rad = (d) => (d * Math.PI) / 180;
const SPEED = { horizontal: 0.9, vertical: 0.7, yaw: 75 }; // m/s, m/s, deg/s
const PAUSE = 0.4; // s between moves
const round = (v) => Math.round(v * 1e6) / 1e6;

export function buildTimeline(test) {
  let pose = { x: 0, y: 0, z: 0, psi: 0 };
  let t = 0;
  const segs = test.map((step) => {
    const v = Number(step.value) || 0;
    const fx = Math.cos(rad(pose.psi));
    const fy = Math.sin(rad(pose.psi));
    const end = { ...pose };
    switch (step.move) {
      case "up": end.z += v; break;
      case "down": end.z = Math.max(0, end.z - v); break;
      case "forward": end.x += fx * v; end.y += fy * v; break;
      case "back": end.x -= fx * v; end.y -= fy * v; break;
      case "left": end.x += -fy * v; end.y += fx * v; break;
      case "right": end.x -= -fy * v; end.y -= fx * v; break;
      case "turnLeft": end.psi += v; break;
      case "turnRight": end.psi -= v; break;
      case "land": end.z = 0; break;
      default: break;
    }
    end.x = round(end.x);
    end.y = round(end.y);
    const moveTime =
      Math.hypot(end.x - pose.x, end.y - pose.y) / SPEED.horizontal +
      Math.abs(end.z - pose.z) / SPEED.vertical +
      Math.abs(end.psi - pose.psi) / SPEED.yaw;
    const seg = { step, start: pose, end, t0: t, move: Math.max(0.5, moveTime) };
    seg.t1 = t + seg.move + PAUSE;
    t = seg.t1;
    pose = end;
    return seg;
  });
  return { segs, total: t };
}

const smooth = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);

export function poseAt(timeline, t) {
  const { segs } = timeline;
  if (!segs.length) return { x: 0, y: 0, z: 0, psi: 0, index: -1 };
  const i = Math.max(0, segs.findIndex((s) => t < s.t1));
  const seg = t >= timeline.total ? segs[segs.length - 1] : segs[i];
  const idx = t >= timeline.total ? segs.length - 1 : i;
  const u = smooth(Math.min(1, Math.max(0, (t - seg.t0) / seg.move)));
  const a = seg.start;
  const b = seg.end;
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    z: a.z + (b.z - a.z) * u,
    psi: a.psi + (b.psi - a.psi) * u,
    index: idx,
  };
}

/* Orthographic view from slightly above and to the side: forward runs to the
   right, left recedes into the picture, up is up. */
const AZIMUTH = rad(-20);
const ELEVATION = rad(24);
const EX = [Math.cos(AZIMUTH), -Math.sin(AZIMUTH) * Math.sin(ELEVATION)];
const EY = [-Math.sin(AZIMUTH), -Math.cos(AZIMUTH) * Math.sin(ELEVATION)];
const EZ = -Math.cos(ELEVATION);

function useProjection(timeline) {
  return useMemo(() => {
    const pts = [timeline.segs[0]?.start ?? { x: 0, y: 0, z: 0 }, ...timeline.segs.map((s) => s.end)];
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const zs = pts.map((p) => p.z);
    const gx0 = Math.floor(Math.min(...xs)) - 1;
    const gx1 = Math.ceil(Math.max(...xs)) + 1;
    const gy0 = Math.floor(Math.min(...ys)) - 1;
    const gy1 = Math.ceil(Math.max(...ys)) + 1;
    const zTop = Math.max(2, Math.ceil(Math.max(...zs)));
    const raw = (x, y, z) => [x * EX[0] + y * EY[0], x * EX[1] + y * EY[1] + z * EZ];
    const probe = [
      raw(gx0, gy0, 0), raw(gx1, gy1, 0), raw(gx0, gy1, 0), raw(gx1, gy0, 0),
      raw(gx1, gy1, zTop + 0.6),
      ...pts.map((p) => raw(p.x, p.y, p.z)),
    ];
    const minX = Math.min(...probe.map((p) => p[0]));
    const maxX = Math.max(...probe.map((p) => p[0]));
    const minY = Math.min(...probe.map((p) => p[1]));
    const maxY = Math.max(...probe.map((p) => p[1]));
    const W = 560;
    const padLeft = 24;
    const padRight = 56;
    const s = (W - padLeft - padRight) / (maxX - minX);
    const padTop = 28;
    const padBottom = 24;
    const H = Math.round((maxY - minY) * s + padTop + padBottom);
    const ox = padLeft - minX * s;
    const oy = padTop - minY * s;
    const project = (x, y, z) => {
      const [rx, ry] = raw(x, y, z);
      return [ox + rx * s, oy + ry * s];
    };
    /* SVG matrix that maps drone-local metres (u forward, v left) at a pose to the screen. */
    const matrixAt = (x, y, z, psi) => {
      const c = Math.cos(rad(psi));
      const si = Math.sin(rad(psi));
      const a = s * (c * EX[0] + si * EY[0]);
      const b = s * (c * EX[1] + si * EY[1]);
      const cc = s * (-si * EX[0] + c * EY[0]);
      const d = s * (-si * EX[1] + c * EY[1]);
      const [e, f] = project(x, y, z);
      return `matrix(${a.toFixed(3)} ${b.toFixed(3)} ${cc.toFixed(3)} ${d.toFixed(3)} ${e.toFixed(2)} ${f.toFixed(2)})`;
    };
    return { W, H, s, project, matrixAt, grid: { gx0, gx1, gy0, gy1 }, zTop };
  }, [timeline]);
}

const DETAIL = {
  up: "CH3 throttle up",
  down: "CH3 throttle down",
  forward: "CH2 pitch forward",
  back: "CH2 pitch back",
  left: "CH1 roll left",
  right: "CH1 roll right",
  turnLeft: "CH4 yaw left",
  turnRight: "CH4 yaw right",
  land: "Throttle down, disarm",
};

export function stepLabel(step) {
  const v = step.value;
  switch (step.move) {
    case "up": return `Climb ${v} m`;
    case "down": return `Descend ${v} m`;
    case "forward": return `Fly forward ${v} m`;
    case "back": return `Fly backward ${v} m`;
    case "left": return `Fly left ${v} m`;
    case "right": return `Fly right ${v} m`;
    case "turnLeft": return `Turn left ${v}°`;
    case "turnRight": return `Turn right ${v}°`;
    case "land": return "Land";
    default: return step.move;
  }
}

export default function FlightPath({ test }) {
  const { mode } = useMode();
  const reduced = useReducedMotion();
  const timeline = useMemo(() => buildTimeline(test), [test]);
  const view = useProjection(timeline);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);
  const tRef = useRef(0);
  tRef.current = t;

  useEffect(() => {
    if (!playing) return undefined;
    last.current = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.1, (now - last.current) / 1000);
      last.current = now;
      const next = Math.min(timeline.total, tRef.current + dt);
      tRef.current = next;
      setT(next);
      if (next >= timeline.total) setPlaying(false);
      else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, timeline.total]);

  const toggle = useCallback(() => {
    if (reduced) {
      // Without animation, step through the pattern one move at a time.
      const cur = poseAt(timeline, t).index;
      const nextSeg = timeline.segs[t >= timeline.total ? 0 : Math.min(cur + 1, timeline.segs.length - 1)];
      setT(t >= timeline.total ? timeline.segs[0].t0 + timeline.segs[0].move : nextSeg.t0 + nextSeg.move);
      return;
    }
    if (t >= timeline.total) setT(0);
    setPlaying((p) => !p);
  }, [reduced, t, timeline]);

  const restart = () => {
    setT(0);
    setPlaying(!reduced);
  };

  const seek = (i) => {
    const seg = timeline.segs[i];
    setT(reduced ? seg.t0 + seg.move : seg.t0);
    setPlaying(!reduced);
  };

  const pose = poseAt(timeline, t);
  const idle = t === 0 || t >= timeline.total;
  const { project, matrixAt, grid, W, H, zTop } = view;

  // waypoints and the flown part of the path
  const waypoints = [timeline.segs[0].start, ...timeline.segs.map((s) => s.end)];
  const full = waypoints.map((p) => project(p.x, p.y, p.z));
  const flown = [];
  if (!idle) {
    for (let i = 0; i <= pose.index; i += 1) flown.push(waypoints[i]);
    flown.push(pose);
  }
  const toPts = (arr) => arr.map((p) => (Array.isArray(p) ? p : project(p.x, p.y, p.z)).map((n) => n.toFixed(1)).join(",")).join(" ");

  const gridLines = [];
  for (let gx = grid.gx0; gx <= grid.gx1; gx += 1) {
    const [a, b] = [project(gx, grid.gy0, 0), project(gx, grid.gy1, 0)];
    gridLines.push(<line key={`x${gx}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />);
  }
  for (let gy = grid.gy0; gy <= grid.gy1; gy += 1) {
    const [a, b] = [project(grid.gx0, gy, 0), project(grid.gx1, gy, 0)];
    gridLines.push(<line key={`y${gy}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />);
  }

  // altitude ruler on the back-right corner of the grid
  const rulerBase = [grid.gx1, grid.gy1];
  const ruler = [];
  for (let z = 0; z <= zTop; z += 1) {
    const [x, y] = project(rulerBase[0], rulerBase[1], z);
    ruler.push(
      <g key={z}>
        <line x1={x - 5} y1={y} x2={x + 5} y2={y} />
        {z > 0 && z % 2 === 0 ? (
          <text x={x + 10} y={y} dy="0.35em">
            {z} m
          </text>
        ) : null}
      </g>,
    );
  }
  const [r0x, r0y] = project(rulerBase[0], rulerBase[1], 0);
  const [r1x, r1y] = project(rulerBase[0], rulerBase[1], zTop + 0.5);
  const ground = project(pose.x, pose.y, 0);
  const here = project(pose.x, pose.y, pose.z);

  return (
    <div className="replay">
      <figure className="replay__art">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="3D view of the flight test route over a 1-metre grid, with the drone's current position.">
          <g className="replay__grid">{gridLines}</g>
          <g className="replay__ruler">
            <line x1={r0x} y1={r0y} x2={r1x} y2={r1y} />
            {ruler}
          </g>

          {/* take-off pad */}
          <g transform={matrixAt(0, 0, 0, 0)} className="replay__pad">
            <circle r="0.36" vectorEffect="non-scaling-stroke" />
            <path d="M-0.12 -0.14V0.14M0.12 -0.14V0.14M-0.12 0H0.12" vectorEffect="non-scaling-stroke" transform="rotate(90)" />
          </g>

          {/* the route's shadow on the ground, with a line down from every waypoint */}
          <polyline points={toPts(waypoints.map((p) => ({ ...p, z: 0 })))} className="replay__track" />
          {waypoints.map((p, i) => {
            if (p.z < 0.01) return null;
            const [x1, y1] = project(p.x, p.y, p.z);
            const [x2, y2] = project(p.x, p.y, 0);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="replay__stem" />;
          })}

          <polyline points={toPts(full)} className={`replay__route${idle ? "" : " is-dim"}`} />
          {!idle ? <polyline points={toPts(flown)} className="replay__flown" /> : null}
          {waypoints.slice(1, -1).map((p, i) => {
            const [x, y] = project(p.x, p.y, p.z);
            return <circle key={i} cx={x} cy={y} r="3" className="replay__wp" />;
          })}

          {/* drop line and shadow */}
          {pose.z > 0.02 ? (
            <>
              <line x1={here[0]} y1={here[1]} x2={ground[0]} y2={ground[1]} className="replay__drop" />
              <g transform={matrixAt(pose.x, pose.y, 0, pose.psi)} className="replay__shadow">
                <circle r="0.42" />
              </g>
            </>
          ) : null}

          {/* the drone */}
          <g transform={matrixAt(pose.x, pose.y, pose.z, pose.psi)} className="replay__drone">
            <path d="M-0.26 -0.26L0.26 0.26M-0.26 0.26L0.26 -0.26" vectorEffect="non-scaling-stroke" className="replay__frame" />
            {[[0.26, 0.26], [0.26, -0.26], [-0.26, 0.26], [-0.26, -0.26]].map(([u, v]) => (
              <circle key={`${u}${v}`} cx={u} cy={v} r="0.12" vectorEffect="non-scaling-stroke" className="replay__rotor" />
            ))}
            <rect x="-0.08" y="-0.08" width="0.16" height="0.16" className="replay__core" />
            <path d="M0.5 0L0.36 -0.08V0.08Z" className="replay__nose" />
          </g>
        </svg>
        <figcaption className="replay__readout">
          {mode === "tech" ? (
            <>
              <span>x {pose.x.toFixed(1)} m</span>
              <span>y {pose.y.toFixed(1)} m</span>
              <span>Height {pose.z.toFixed(1)} m</span>
              <span>Heading {(((Math.round(pose.psi) % 360) + 360) % 360).toString().padStart(3, "0")}°</span>
            </>
          ) : (
            <span>Height {pose.z.toFixed(1)} m</span>
          )}
        </figcaption>
      </figure>

      <div className="replay__side">
        <div className="replay__controls">
          <button type="button" className="btn btn--solid" onClick={toggle}>
            <Icon name={playing ? "pause" : "play"} size={18} />
            <span>{reduced ? "Next move" : playing ? "Pause" : t >= timeline.total ? "Play again" : t > 0 ? "Resume" : "Play the route"}</span>
          </button>
          <button type="button" className="btn btn--ghost" onClick={restart} disabled={t === 0 && !playing}>
            <Icon name="restart" size={18} />
            <span>Restart</span>
          </button>
        </div>
        <ol className="route">
          {timeline.segs.map((seg, i) => {
            const state = idle ? "" : i < pose.index ? "is-done" : i === pose.index ? "is-now" : "";
            return (
              <li key={i} className={state || undefined}>
                <button type="button" onClick={() => seek(i)} aria-current={state === "is-now" ? "step" : undefined}>
                  <span className="route__n">{i + 1}</span>
                  <span className="route__label">{stepLabel(seg.step)}</span>
                  {mode === "tech" ? <span className="route__detail">{DETAIL[seg.step.move]}</span> : null}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
