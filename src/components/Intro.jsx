import { brand, ui } from "../content.js";
import { Reveal, SplitWords } from "./Reveal.jsx";
import { inV2Folder } from "../lib/photos.js";

/* Drop the drone photo in src/photos/home/home_title/ (PNG with transparent background; the first image is used) (e.g. hero-drone.png). */
const heroPhoto = () => inV2Folder("home/home_title").find((x) => x.type === "image");

/* Opening presentation: "Determinators presents [Drone name]". */
export default function Intro() {
  const photo = heroPhoto();
  return (
    <section id="intro" className="intro wave surface-paper" data-surface="paper" data-wave aria-labelledby="intro-title">
      <div className="wrap intro__layout">
      <div className="intro__inner">
        <h2 id="intro-title" className="intro__title">
          <SplitWords className="intro__brand" text={brand.name} gate delay={250} />
        </h2>
      </div>
        <Reveal as="figure" className="intro__photo" gate delay={700} y={30}>
          {photo ? (
            <img src={photo.url} alt={ui.intro.photoAlt} />
          ) : (
            <div className="intro__slot" role="img" aria-label={ui.intro.photoMissing}>
              <span>{ui.intro.photoMissing}</span>
            </div>
          )}
        </Reveal>
        <Reveal gate delay={1200}>
          <a className="intro__cue" href="#top">
            <span>{brand.scroll}</span>
            <span aria-hidden="true">↓</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
