import { build } from "../content.js";
import { Say, useMode } from "../lib/mode.jsx";
import { Rich } from "../lib/text.jsx";
import { pad2 } from "../lib/hooks.js";
import { startingWith } from "../lib/photos.js";
import Media from "./Media.jsx";

export default function Build() {
  return (
    <section id="build" className="section surface-paper" data-surface="paper">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2">{build.title}</h2>
          <Say v={build.lead} as="p" className="lead" />
        </div>
        <ol className="steps">
          {build.steps.map((step, i) => (
            <Step key={step.title} n={i + 1} step={step} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({ n, step }) {
  const { mode } = useMode();
  const photos = startingWith("steps", n);
  const num = pad2(n);
  return (
    <li className="step">
      <div className="step__head">
        <span className="step__num" aria-hidden="true">
          {num}
        </span>
        <div className="step__titles">
          <h3 className="step__title">
            <span className="sr-only">Step {n}: </span>
            {step.title}
          </h3>
          {step.date ? (
            <p className="step__date">
              <Rich text={step.date} />
            </p>
          ) : null}
        </div>
      </div>
      <div className="step__body">
        <Media
          items={photos}
          glyph={step.glyph}
          label={step.title}
          hint={
            <>
              Photo slot for step {n}. Add files named <code>{num}-description.jpg</code> to <code>src/photos/steps/</code>
            </>
          }
        />
        <div className="step__copy">
          <Say v={{ simple: step.simple, tech: step.tech }} as="p" className="step__text" />
          {mode === "tech" && step.details?.length ? (
            <ul className="chips swap" aria-label="Technical details">
              {step.details.map((d) => (
                <li key={d} className="chip">
                  {d}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}
