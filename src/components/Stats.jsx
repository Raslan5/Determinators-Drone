import { flight, kit, phasesPreview, projectV2, stats } from "../content.js";
import { CountUp, Reveal } from "./Reveal.jsx";
import { inV2Folder } from "../lib/photos.js";

const heroPhoto = () => inV2Folder("home/home_title").find((x) => x.type === "image");

/* Numbers band. Every value is counted from content.js. */
const VALUES = {
  phases: projectV2.phases?.length ?? 0,
  steps: phasesPreview.steps?.length ?? 0,
  parts: kit.items.length ?? 0,
  moves: flight.test?.length ?? 0,
};

export default function Stats() {
  const photo = heroPhoto();
  return (
    <div className="stats-frame" data-surface="paper" data-wave>
    <section className="stats surface-cube" data-surface="cube" aria-labelledby="stats-title">
      {photo && <img className="stats__bg" src={photo.url} alt="" aria-hidden="true" />}
      <div className="wrap stats__wrap">
        <h2 id="stats-title" className="stats__title">
          {stats.title}
        </h2>
        <ul className="stats__list">
          {stats.items.map((it, i) => (
            <Reveal as="li" key={it.key} className="stats__item" delay={i * 90}>
              <span className="sr-only">
                {VALUES[it.key]} {it.label}
              </span>
              <span aria-hidden="true">
                <CountUp value={VALUES[it.key]} className="stats__num" />
              </span>
              <span className="stats__label" aria-hidden="true">
                {it.label}
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
    </div>
  );
}
