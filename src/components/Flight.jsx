import { useMemo } from "react";
import { flight, site } from "../content.js";
import { Say, useMode } from "../lib/mode.jsx";
import { Rich } from "../lib/text.jsx";
import { inFolder, readAltitudeLog } from "../lib/photos.js";
import FlightPath, { buildTimeline, stepLabel } from "./FlightPath.jsx";
import AltitudeChart from "./AltitudeChart.jsx";
import { useLightbox } from "./Lightbox.jsx";
import { Thumb } from "./Media.jsx";
import { Glyph } from "./Glyphs.jsx";

function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function Flight() {
  const { mode } = useMode();
  const timeline = useMemo(() => buildTimeline(flight.test), []);
  const log = useMemo(() => readAltitudeLog(), []);
  const gallery = inFolder("flight");
  const shots = inFolder("logs");
  const video = youtubeId(flight.videoUrl);

  return (
    <section id="flight" className="section surface-ink" data-surface="ink">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2">{flight.title}</h2>
          <Say v={flight.lead} as="p" className="lead" />
        </div>

        <FlightPath test={flight.test} />

        <div className="subsection">
          <h3 className="h3">{flight.modesTitle}</h3>
          <ul className="modes-list">
            {flight.modes.map((m) => (
              <li key={m.name}>
                <h4 className="modes-list__name">{m.name}</h4>
                <Say v={{ simple: m.simple, tech: m.tech }} as="p" />
              </li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <h3 className="h3">{flight.galleryTitle}</h3>
          {video ? (
            <div className="video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video}`}
                title="Video of our flight"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          ) : null}
          <Gallery items={gallery} />
        </div>

        <div className="subsection logs">
          <div className="logs__intro">
            <h3 className="h3">{flight.logs.title}</h3>
            <Say v={log ? flight.logs.measured : flight.logs.planned} as="p" className="measure" />
          </div>
          <AltitudeChart timeline={timeline} log={log} stepLabel={stepLabel} />
          {!log && site.showPhotoHints ? (
            <p className="media__hint logs__hint">
              To compare with your real flight, export the CTUN messages of your DataFlash log as a CSV into <code>src/flight-log/</code> (see README).
            </p>
          ) : null}
          {log ? <LogSummary log={log} /> : <PlanTable timeline={timeline} />}
          {flight.logs.findings ? (
            <div className="logs__findings">
              <h4 className="h4">{mode === "tech" ? "Findings" : "What we found"}</h4>
              <p className="measure">
                <Rich text={flight.logs.findings} />
              </p>
            </div>
          ) : null}
          <LogShots items={shots} />
        </div>
      </div>
    </section>
  );
}

function Gallery({ items }) {
  const { open } = useLightbox();
  if (!items.length) {
    if (!site.showPhotoHints) return null;
    return (
      <div className="gallery gallery--empty">
        {["tall", "wide", "square"].map((shape) => (
          <div key={shape} className={`gallery__slot gallery__slot--${shape}`}>
            <Glyph name="flight" size={56} />
          </div>
        ))}
        <p className="media__hint gallery__hint">
          Add flight photos and short <code>.mp4</code> videos to <code>src/photos/flight/</code>. They appear here automatically.
        </p>
      </div>
    );
  }
  const lb = items.map((it) => ({ ...it, alt: it.caption || "Photo from our flight" }));
  return (
    <ul className="gallery">
      {items.map((it, i) => (
        <li key={it.url}>
          <button type="button" className="media__open" onClick={() => open(lb, i)} aria-label={`Open: ${it.caption || "photo from our flight"}`}>
            <Thumb item={it} alt={it.caption || "Photo from our flight"} />
          </button>
          {it.caption ? <p className="gallery__caption">{it.caption}</p> : null}
        </li>
      ))}
    </ul>
  );
}

function PlanTable({ timeline }) {
  return (
    <details className="data-table">
      <summary>Show the planned profile as a table</summary>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Step</th>
              <th scope="col">Move</th>
              <th scope="col" className="num">
                Starts at
              </th>
              <th scope="col" className="num">
                Height after
              </th>
            </tr>
          </thead>
          <tbody>
            {timeline.segs.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{stepLabel(s.step)}</td>
                <td className="num">{s.t0.toFixed(1)} s</td>
                <td className="num">{s.end.z.toFixed(1)} m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function LogSummary({ log }) {
  const withTarget = log.filter((r) => r.dalt !== null);
  const errors = withTarget.map((r) => r.alt - r.dalt);
  const maxErr = errors.length ? Math.max(...errors.map(Math.abs)) : null;
  const rms = errors.length ? Math.sqrt(errors.reduce((a, e) => a + e * e, 0) / errors.length) : null;
  const rows = [
    ["Log duration", `${log[log.length - 1].t.toFixed(1)} s`],
    ["Highest measured altitude", `${Math.max(...log.map((r) => r.alt)).toFixed(2)} m`],
    maxErr !== null ? ["Largest gap between target and measured", `${maxErr.toFixed(2)} m`] : null,
    rms !== null ? ["RMS altitude error", `${rms.toFixed(2)} m`] : null,
    ["Samples", `${log.length}`],
  ].filter(Boolean);
  return (
    <details className="data-table" open>
      <summary>Numbers from our log</summary>
      <div className="table-scroll">
        <table>
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <th scope="row">{k}</th>
                <td className="num">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function LogShots({ items }) {
  const { open } = useLightbox();
  if (!items.length) {
    if (!site.showPhotoHints) return null;
    return (
      <p className="media__hint logs__hint">
        Add screenshots of your Mission Planner graphs to <code>src/photos/logs/</code> to show them here.
      </p>
    );
  }
  const lb = items.map((it) => ({ ...it, alt: it.caption || "Graph from our flight log" }));
  return (
    <ul className="logs__shots">
      {items.map((it, i) => (
        <li key={it.url}>
          <figure>
            <button type="button" className="media__open" onClick={() => open(lb, i)} aria-label={`Open: ${it.caption || "graph from our flight log"}`}>
              <Thumb item={it} alt={it.caption || "Graph from our flight log"} />
            </button>
            {it.caption ? <figcaption className="gallery__caption">{it.caption}</figcaption> : null}
          </figure>
        </li>
      ))}
    </ul>
  );
}
