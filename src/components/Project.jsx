import { project } from "../content.js";
import { Say } from "../lib/mode.jsx";
import { Rich } from "../lib/text.jsx";

const STATUS = { done: "Done", current: "In progress", upcoming: "" };

export default function Project() {
  return (
    <section id="project" className="section surface-ink" data-surface="ink">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2">{project.title}</h2>
          <Say v={project.lead} as="p" className="lead" />
        </div>

        <ol className="phases">
          {project.phases.map((ph, i) => (
            <li key={ph.title} className={`phase phase--${ph.status}`}>
              <div className="phase__marker" aria-hidden="true">
                <span>{i + 1}</span>
              </div>
              <p className="phase__meta">
                <span className="sr-only">Phase {i + 1}. </span>
                <Rich text={ph.when} />
                {STATUS[ph.status] ? <span className="phase__status">{STATUS[ph.status]}</span> : null}
              </p>
              <h3 className="phase__title">{ph.title}</h3>
              <Say v={{ simple: ph.simple, tech: ph.tech }} as="p" className="phase__text" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
