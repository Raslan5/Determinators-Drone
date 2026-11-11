import { ui } from "../content.js";

export default function Phase2() {
  return (
    <section id="phase-2" className="section phase2 surface-paper" data-surface="paper" data-wave aria-labelledby="phase2-title">
      <div className="wrap">
        <h2 id="phase2-title" className="h2">
          {ui.phase2.title}
        </h2>
        <p className="phase2__working">{ui.phase2.working}</p>
      </div>
    </section>
  );
}
