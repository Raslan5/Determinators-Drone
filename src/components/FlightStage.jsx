import { ui } from "../content.js";
import { useReducedMotion } from "../lib/hooks.js";

const t = ui.flight;

/*
  A netted flight cage on a plaza (the DroneLab at EETAC).
  Coordinates are in a 1000 x 440 viewBox. Colours come from CSS (.flightstage__*) tokens.
*/
const W = 1000;
const H = 440;
const LF = { tl: [60, 110], tr: [800, 62], br: [800, 336], bl: [60, 292] }; // long face
const EF = { tr: [950, 104], br: [950, 304] }; // far end of the short face
const ROOF_BACK = { tl: [215, 150], tr: EF.tr };
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const pts = (...p) => p.map((q) => q.join(",")).join(" ");
const BAYS = 6;

const ROUTE = "M150 282 L150 196 L400 168 L640 140 L700 214 L460 256 L240 262 L150 282";
const PARKED = [400, 168]; // where the drone stays still with reduced motion

/* Single point to swap for a real PNG/SVG: a Quad-X silhouette centred on (0,0). */
function DroneMark() {
  const arm = 26;
  const rotor = [
    [-arm, -arm * 0.6],
    [arm, -arm * 0.6],
    [-arm, arm * 0.6],
    [arm, arm * 0.6],
  ];
  return (
    <g className="flightstage__drone">
      {rotor.map(([x, y]) => (
        <line key={`a${x}${y}`} className="flightstage__arm" x1="0" y1="0" x2={x} y2={y} />
      ))}
      {rotor.map(([x, y], i) => (
        <ellipse key={`r${i}`} className="flightstage__rotor" cx={x} cy={y} rx="15" ry="6" />
      ))}
      <ellipse className="flightstage__body" cx="0" cy="0" rx="9" ry="6" />
      <circle className="flightstage__nose" cx="0" cy="-5" r="2.2" />
    </g>
  );
}

function Cage() {
  const top = (k) => lerp(LF.tl, LF.tr, k);
  const bot = (k) => lerp(LF.bl, LF.br, k);
  const xs = Array.from({ length: BAYS + 1 }, (_, i) => i / BAYS);
  return (
    <g className="flightstage__cage">
      <polygon className="flightstage__grass" points={pts(LF.bl, LF.br, EF.br, [230, 276])} />
      <polygon className="flightstage__net" points={pts(LF.tl, LF.tr, LF.br, LF.bl)} />
      <polygon className="flightstage__net flightstage__net--side" points={pts(LF.tr, EF.tr, EF.br, LF.br)} />
      <polygon className="flightstage__net flightstage__net--roof" points={pts(LF.tl, LF.tr, ROOF_BACK.tr, ROOF_BACK.tl)} />
      {xs.slice(0, -1).map((k, i) => {
        const k2 = xs[i + 1];
        return (
          <g key={k} className="flightstage__x">
            <line x1={top(k)[0]} y1={top(k)[1]} x2={bot(k2)[0]} y2={bot(k2)[1]} />
            <line x1={bot(k)[0]} y1={bot(k)[1]} x2={top(k2)[0]} y2={top(k2)[1]} />
          </g>
        );
      })}
      {[LF.tl, LF.tr, EF.tr].map((p, i) => {
        const b = [LF.bl, LF.br, EF.br][i];
        return <line key={i} className="flightstage__post" x1={p[0]} y1={p[1]} x2={b[0]} y2={b[1]} />;
      })}
      <polyline className="flightstage__edge" points={pts(LF.tl, LF.tr, EF.tr)} />
      <line className="flightstage__edge" x1={LF.tl[0]} y1={LF.tl[1]} x2={ROOF_BACK.tl[0]} y2={ROOF_BACK.tl[1]} />
      <line className="flightstage__edge" x1={ROOF_BACK.tl[0]} y1={ROOF_BACK.tl[1]} x2={ROOF_BACK.tr[0]} y2={ROOF_BACK.tr[1]} />
    </g>
  );
}

/* Lamp posts and bollards along the front of the plaza, as in the reference. */
function Plaza() {
  const lamps = [90, 300, 520, 740, 930];
  return (
    <g className="flightstage__plaza">
      <polygon className="flightstage__ground" points={pts([0, H], [W, H], [W, 330], [0, 300])} />
      {lamps.map((x, i) => {
        const y = 318 + (x / W) * 40;
        return (
          <g key={x}>
            <line className="flightstage__lamp" x1={x} y1={y} x2={x} y2={y - 54 + i * 2} />
            <circle className="flightstage__bulb" cx={x} cy={y - 56 + i * 2} r="4" />
          </g>
        );
      })}
      {Array.from({ length: 22 }, (_, i) => {
        const x = 30 + i * 44;
        const y = 340 + (x / W) * 46;
        return <rect key={i} className="flightstage__bollard" x={x} y={y} width="5" height="13" />;
      })}
    </g>
  );
}

export default function FlightStage() {
  const reduced = useReducedMotion();
  return (
    <figure className="flightstage">
      <svg className="flightstage__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="flightstage-title" preserveAspectRatio="xMidYMid meet">
        <title id="flightstage-title">{t.stageTitle}</title>
        <polygon className="flightstage__hill" points={pts([0, 300], [40, 270], [110, 285], [160, 240], [160, 300])} />
        <polygon className="flightstage__hill" points={pts([950, 300], [960, 230], [1000, 210], [1000, 300])} />
        <Plaza />
        <Cage />
        <path className="flightstage__route" d={ROUTE} />
        <g transform={reduced ? `translate(${PARKED[0]} ${PARKED[1]})` : undefined}>
          {reduced ? null : <animateMotion dur="18s" repeatCount="indefinite" path={ROUTE} />}
          <DroneMark />
        </g>
      </svg>
      <figcaption className="flightstage__note">{t.stageNote}</figcaption>
    </figure>
  );
}
