import { useEffect, useRef, useState } from "react";
import { journey } from "../content.js";
import { Rich } from "../lib/text.jsx";
import { fill } from "../lib/text.jsx";
import { useReducedMotion } from "../lib/hooks.js";
import { inV2Folder } from "../lib/photos.js";
import { safeHref } from "../lib/url.js";
import PhotoRoller from "./PhotoRoller.jsx";
import "../journey.css";

/*
  Phase 1 journey: steps 1-6 (steps 7 and 8 live in "Previous to flight" and "First flight").
  Step 1 sits on the right, then they alternate.
  Props:
    id          section id (anchor target)
    renderStep2 optional node or ({ n }) => node, shown inside step 2 (the components breakdown)
*/
export default function Journey({ id = "journey", renderStep2 = null, className = "" }) {
  return (
    <section id={id} className={`section journey surface-paper ${className}`.trim()} data-surface="paper" aria-labelledby={`${id}-title`}>
      <div className="wrap">
        <div className="section-head">
          <h2 id={`${id}-title`} className="h2">
            {journey.title}
          </h2>
          <p className="lead">
            <Lead parts={journey.lead} />
          </p>
        </div>
        <ol role="list" className="journey__list journey__list--js" aria-label={journey.listLabel}>
          {journey.steps.map((s, i) => (
            <Step key={s.title} n={i + 1} step={s} side={i % 2 === 0 ? "right" : "left"}>
              {i === 1 ? (typeof renderStep2 === "function" ? renderStep2({ n: 2 }) : renderStep2) : null}
            </Step>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Step({ n, step, side, children }) {
  const title = step.title;
  const photos = n >= 3 && n <= 6 ? inV2Folder(`phase-1/ph1_step${String(n).padStart(2, "0")}`).filter((x) => x.type === "image") : [];
  const reduced = useReducedMotion();
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reduced || !ref.current || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { rootMargin: "0px 0px -12% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [reduced]);
  return (
    <li ref={ref} className="journey__item" data-side={side} data-seen={seen ? "true" : "false"}>
      <div className="journey__box">
        <span className="journey__num">
          <span className="sr-only">{fill(journey.step, { n })}: </span>
          <span aria-hidden="true">{n}</span>
        </span>
        <div className={`journey__card${n === 2 ? " journey__card--bare" : ""}`}>
          <h3 className="journey__title">{title}</h3>
          <Body body={step.body} />
          {step.link ? (
            <p className="journey__text">
              {(() => {
                const safe = safeHref(step.link.href);
                return safe ? (
                  <a
                    className="journey__link"
                    href={safe.href}
                    {...(safe.external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
                  >
                    {step.link.label}
                  </a>
                ) : (
                  step.link.label
                );
              })()}
            </p>
          ) : null}
          {n === 2 ? (
            <div className="journey__slot">{children || <p className="journey__hole">{journey.slotHint}</p>}</div>
          ) : null}
          {n >= 3 && n <= 6 ? (
            <PhotoRoller items={photos} label={fill(journey.photosLabel, { n, title })} className="photoroll--journey" />
          ) : null}
        </div>
      </div>
    </li>
  );
}

/* Lead paragraph: strings plus links, every href checked by safeHref. */
function Lead({ parts }) {
  return parts.map((p, i) => {
    if (typeof p === "string") return <Rich key={i} text={p} />;
    const safe = safeHref(p.href);
    return safe ? (
      <a key={i} className="journey__link" href={safe.href}>
        {p.label}
      </a>
    ) : (
      p.label
    );
  });
}

/* **bold** marks become <strong>; [brackets] stay as placeholders. */
function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Rich key={i} text={part} />,
  );
}

function Body({ body }) {
  return body.map((b, i) =>
    typeof b === "string" ? (
      <p key={i} className="journey__text">
        <Inline text={b} />
      </p>
    ) : (
      <ol key={i} className="journey__steps">
        {b.list.map((li) => (
          <li key={li}>
            <Inline text={li} />
          </li>
        ))}
      </ol>
    ),
  );
}
