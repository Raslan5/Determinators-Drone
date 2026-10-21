import { GhostWord, SplitWords } from "./Reveal.jsx";
import { flight, flightDid, flightLead, ghosts, ui } from "../content.js";
import { Rich } from "../lib/text.jsx";
import { inV2Folder } from "../lib/photos.js";
import FlightStage from "./FlightStage.jsx";
import PhotoRoller from "./PhotoRoller.jsx";

const t = ui.flight;

function youtubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function Flight() {
  const gallery = inV2Folder("phase-1/ph1_flight");
  const video = youtubeId(flight.videoUrl);

  return (
    <section id="flight" className="section surface-ink" data-surface="ink" data-wave>
      <GhostWord text={ghosts.flight} />
      <div className="wrap">
        <div className="section-head">
          <SplitWords as="h2" className="h2" text={flight.title} />
          <p className="lead"><Rich text={flightLead} /></p>
        </div>

        <p className="flight__did">
          <Rich text={flightDid} />
        </p>

        <FlightStage />

        <div className="subsection">
          <h3 className="h3">{flight.galleryTitle}</h3>
          {video ? (
            <div className="video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video}`}
                title={t.video}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="wrap wrap--wide">
        <PhotoRoller items={gallery} />
      </div>
    </section>
  );
}
