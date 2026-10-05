import { useMemo, useState } from "react";
import { useWidth } from "../lib/useWidth.js";
import { poseAt } from "./FlightPath.jsx";

/*
  Altitude over time.
  Without a log: the planned profile of the test pattern (one series).
  With src/flight-log/*.csv: the autopilot's target (CTUN.DAlt) and the
  measured altitude (CTUN.Alt) from the real flight.
*/

const M = { l: 44, r: 20, t: 18, b: 38 };

function niceStep(range, target) {
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
}

/* Keeps at most ~1200 points so long logs stay fast to draw. */
function thin(points, max = 1200) {
  if (points.length <= max) return points;
  const k = Math.ceil(points.length / max);
  return points.filter((_, i) => i % k === 0 || i === points.length - 1);
}

function nearest(points, t) {
  let lo = 0;
  let hi = points.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid][0] < t) lo = mid;
    else hi = mid;
  }
  return Math.abs(points[lo][0] - t) <= Math.abs(points[hi][0] - t) ? points[lo] : points[hi];
}

export default function AltitudeChart({ timeline, log, stepLabel }) {
  const [ref, width] = useWidth(720);
  const [hoverT, setHoverT] = useState(null);
  const H = width < 520 ? 230 : 280;

  const series = useMemo(() => {
    if (log) {
      const target = log.filter((r) => r.dalt !== null).map((r) => [r.t, r.dalt]);
      const out = [];
      if (target.length) out.push({ id: "target", name: "Target (CTUN.DAlt)", short: "Target", cls: "line--target", points: thin(target) });
      out.push({ id: "measured", name: "Measured (CTUN.Alt)", short: "Measured", cls: "line--measured", points: thin(log.map((r) => [r.t, r.alt])) });
      return out;
    }
    const pts = [];
    for (let t = 0; t <= timeline.total + 1e-9; t += 0.1) pts.push([t, poseAt(timeline, t).z]);
    pts.push([timeline.total, 0]);
    return [{ id: "plan", name: "Planned altitude", short: "Planned", cls: "line--measured", points: pts }];
  }, [log, timeline]);

  const xMax = Math.max(...series.map((s) => s.points[s.points.length - 1][0]));
  const yMaxData = Math.max(...series.flatMap((s) => s.points.map((p) => p[1])));
  const yStep = niceStep(Math.max(1, yMaxData), 4);
  const yMax = Math.max(yStep, Math.ceil((yMaxData + yStep * 0.25) / yStep) * yStep);
  const xStep = niceStep(xMax, width < 520 ? 4 : 8);

  const iw = width - M.l - M.r;
  const ih = H - M.t - M.b;
  const sx = (t) => M.l + (t / xMax) * iw;
  const sy = (z) => M.t + ih - (z / yMax) * ih;

  const xTicks = [];
  for (let t = 0; t <= xMax + 1e-9; t += xStep) xTicks.push(t);
  const yTicks = [];
  for (let z = 0; z <= yMax + 1e-9; z += yStep) yTicks.push(Math.round(z * 100) / 100);

  const pathOf = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)} ${sy(p[1]).toFixed(1)}`).join("");

  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - box.left;
    const t = ((x - M.l) / iw) * xMax;
    setHoverT(Math.min(xMax, Math.max(0, t)));
  };
  const onKey = (e) => {
    const step = xMax / 60;
    if (e.key === "ArrowRight") setHoverT((v) => Math.min(xMax, (v ?? 0) + step));
    else if (e.key === "ArrowLeft") setHoverT((v) => Math.max(0, (v ?? 0) - step));
    else if (e.key === "Escape") setHoverT(null);
    else return;
    e.preventDefault();
  };

  const readings = hoverT === null ? [] : series.map((s) => ({ s, p: nearest(s.points, hoverT) }));
  const hoverStep = !log && hoverT !== null ? poseAt(timeline, hoverT).index : -1;
  const tipLeft = hoverT === null ? 0 : sx(hoverT);
  const tipFlip = tipLeft > width * 0.62;

  // direct label at the end of each line (only when there is more than one series)
  const ends = series.length > 1 ? series.map((s) => ({ s, p: s.points[s.points.length - 1] })) : [];

  return (
    <div className="chart" ref={ref}>
      {series.length > 1 ? (
        <ul className="chart__legend">
          {series.map((s) => (
            <li key={s.id}>
              <svg width="22" height="10" aria-hidden="true">
                <path d="M1 5H21" className={`line ${s.cls}`} />
              </svg>
              {s.name}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="chart__plot">
        <svg
          width={width}
          height={H}
          className="chart__svg"
          role="img"
          aria-label={`${series.map((s) => s.name).join(" and ")} in metres over ${Math.round(xMax)} seconds. Use the left and right arrow keys to read values.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHoverT(null)}
          onKeyDown={onKey}
          onBlur={() => setHoverT(null)}
        >
          <g className="chart__grid">
            {yTicks.map((z) => (
              <line key={z} x1={M.l} x2={width - M.r} y1={sy(z)} y2={sy(z)} />
            ))}
          </g>
          <g className="chart__axis">
            {yTicks.map((z) => (
              <text key={z} x={M.l - 10} y={sy(z)} dy="0.32em" textAnchor="end">
                {z} m
              </text>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={sx(t)} y={H - M.b + 20} textAnchor="middle">
                {Math.round(t)}
              </text>
            ))}
            <text x={width - M.r} y={H - 4} textAnchor="end" className="chart__unit">
              Time (s)
            </text>
          </g>

          {series.map((s) => (
            <path key={s.id} d={pathOf(s.points)} className={`line ${s.cls}`} />
          ))}

          {ends.map(({ s, p }) => (
            <circle key={s.id} cx={sx(p[0])} cy={sy(p[1])} r="4" className={`dot ${s.cls}`} />
          ))}

          {hoverT !== null ? (
            <g className="chart__hover">
              <line x1={sx(hoverT)} x2={sx(hoverT)} y1={M.t} y2={M.t + ih} />
              {readings.map(({ s, p }) => (
                <circle key={s.id} cx={sx(p[0])} cy={sy(p[1])} r="4.5" className={`dot ${s.cls}`} />
              ))}
            </g>
          ) : null}
        </svg>

        {hoverT !== null ? (
          <div className={`chart__tip${tipFlip ? " is-flipped" : ""}`} style={{ left: `${tipLeft}px`, top: `${M.t}px` }} aria-hidden="true">
            {readings.map(({ s, p }) => (
              <div key={s.id} className="chart__tip-row">
                <svg width="14" height="8" aria-hidden="true">
                  <path d="M1 4H13" className={`line ${s.cls}`} />
                </svg>
                <strong>{p[1].toFixed(2)} m</strong>
                <span>{s.short}</span>
              </div>
            ))}
            <div className="chart__tip-meta">
              {hoverT.toFixed(1)} s{hoverStep >= 0 ? `, step ${hoverStep + 1}: ${stepLabel(timeline.segs[hoverStep].step)}` : ""}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
