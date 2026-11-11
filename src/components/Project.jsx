import { GhostWord, SplitWords } from "./Reveal.jsx";
import { ghosts, ui, projectV2 as project } from "../content.js";
import { Rich, fill } from "../lib/text.jsx";

const STATUS = ui.project.status;

export default function Project() {
  return (
    <section id="project" className="section project wave surface-paper" data-surface="paper" data-wave>
      <GhostWord text={ghosts.project} />
      <div className="wrap">
        <div className="section-head">
          <SplitWords as="h2" className="h2" text={project.title} />
          <p className="lead"><Rich text={project.lead} /></p>
        </div>

        <ol className="phases">
          {project.phases.map((ph, i) => (
            <li key={ph.title} className={`phase phase--${ph.status}`}>
              <div className="phase__marker" aria-hidden="true">
                <span>{i + 1}</span>
              </div>
              <p className="phase__meta">
                <span className="sr-only">{fill(ui.project.phase, { n: i + 1 })}</span>
                {STATUS[ph.status] ? <span className="phase__status">{STATUS[ph.status]}</span> : null}
              </p>
              <h3 className="phase__title">{ph.title}</h3>
              <p className="phase__text"><Rich text={ph.text} /></p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
