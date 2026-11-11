import { GhostWord, SplitWords } from "./Reveal.jsx";
import { ghosts, ui } from "../content.js";

const t = ui.difficulties;

export default function Difficulties() {
  return (
    <section id="difficulties" className="section opinion surface-paper" data-surface="paper" data-wave aria-labelledby="difficulties-title">
      <GhostWord text={ghosts.difficulties} />
      <div className="wrap">
        <div className="section-head">
          <SplitWords as="h2" id="difficulties-title" className="h2" text={t.title} />
        </div>
        <ul className="opinion__list">
          {t.items.map((it) => (
            <li key={it.title} className="opinion__item">
              <h3 className="opinion__title">{it.title}</h3>
              <p className="opinion__text">{it.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
