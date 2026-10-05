import { useState } from "react";
import { parts, site } from "../content.js";
import { Say, usePick } from "../lib/mode.jsx";
import { Rich, isPlaceholder } from "../lib/text.jsx";
import { ASSEMBLED, DroneDefs, Part } from "./DroneArt.jsx";

/* Where the numbered markers sit on the drawing, for the parts you can see from above. */
const MARKERS = {
  frame: [228, 300],
  motor: [470, 128],
  esc: [400, 364],
  prop: [200, 537],
  cube: [338, 268],
  gps: [300, 360],
  rx: [252, 226],
  telem: [348, 226],
  battery: [340, 398],
};

const euro = (n) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);

export default function Parts() {
  const pick = usePick();
  const [active, setActive] = useState(null); // highlighted part key
  const [pinned, setPinned] = useState(null);
  const shown = active ?? pinned;

  const numbered = parts.items.map((item, i) => ({ ...item, n: i + 1 }));
  const byKey = Object.fromEntries(numbered.map((it) => [it.key, it]));

  const priced = numbered.filter((it) => typeof it.price === "number");
  const total = priced.reduce((sum, it) => sum + it.price * (it.qty || 1), 0);
  const missing = numbered.length - priced.length;

  const select = (key) => setPinned((cur) => (cur === key ? null : key));

  const onArtClick = (e) => {
    const g = e.target.closest?.("[class*='k-']");
    if (!g) return;
    const key = [...g.classList].find((c) => c.startsWith("k-"))?.slice(2);
    if (key && byKey[key]) select(key);
  };

  return (
    <section id="parts" className="section surface-ink" data-surface="ink">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2">{parts.title}</h2>
          <Say v={parts.lead} as="p" className="lead" />
        </div>

        <div className="parts">
          <figure className="parts__art">
            <svg
              viewBox="30 30 540 540"
              className="anatomy"
              data-hl={shown && MARKERS[shown] ? shown : undefined}
              role="img"
              aria-label="Top view of our drone with numbered markers for the parts listed in the table."
              onClick={onArtClick}
            >
              <DroneDefs prefix="ana" />
              {ASSEMBLED.map((p) => (
                <Part key={p.id} {...p} />
              ))}
              {Object.entries(MARKERS).map(([key, [x, y]]) =>
                byKey[key] ? (
                  <g key={key} className={`marker${shown === key ? " is-on" : ""}`} transform={`translate(${x} ${y})`}>
                    <circle r="13" />
                    <text dy="0.36em" textAnchor="middle">
                      {byKey[key].n}
                    </text>
                  </g>
                ) : null,
              )}
              <text x="300" y="58" textAnchor="middle" className="anatomy__front">
                Front
              </text>
            </svg>
          </figure>

          <div className="parts__table-wrap">
            <table className="parts__table">
              <caption className="sr-only">Components of our drone, what they do, where to buy them and their price</caption>
              <thead>
                <tr>
                  <th scope="col" className="col-n">
                    <span className="sr-only">Number</span>
                  </th>
                  <th scope="col">Part</th>
                  <th scope="col">What it does</th>
                  <th scope="col">Where to buy</th>
                  <th scope="col" className="col-price">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {numbered.map((it) => (
                  <tr
                    key={it.key}
                    className={shown === it.key ? "is-on" : undefined}
                    onMouseEnter={() => setActive(it.key)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <td className="col-n">{it.n}</td>
                    <td data-label="Part">
                      <button
                        type="button"
                        className="parts__name"
                        aria-pressed={pinned === it.key}
                        onClick={() => select(it.key)}
                        onFocus={() => setActive(it.key)}
                        onBlur={() => setActive(null)}
                      >
                        {it.name}
                        {it.qty > 1 ? <span className="parts__qty"> ×{it.qty}</span> : null}
                      </button>
                      <span className="parts__model">
                        <Rich text={it.model} />
                      </span>
                    </td>
                    <td data-label="What it does">
                      <Say v={{ simple: it.simple, tech: it.tech }} />
                    </td>
                    <td data-label="Where to buy">
                      {it.store?.url ? (
                        <a href={it.store.url} target="_blank" rel="noreferrer">
                          <Rich text={it.store.name} />
                        </a>
                      ) : (
                        <Rich text={it.store?.name ?? ""} />
                      )}
                    </td>
                    <td data-label="Price" className="col-price">
                      {typeof it.price === "number" ? (
                        <>
                          {euro(it.price)}
                          {it.qty > 1 ? <span className="parts__each"> each</span> : null}
                        </>
                      ) : (
                        <Rich text={String(it.price ?? "")} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {priced.length || site.showPhotoHints ? (
                <tfoot>
                  <tr>
                    <td className="col-n" />
                    <th scope="row" colSpan={3}>
                      {priced.length === 0 ? (
                        <span className="ph">Fill in the prices in src/content.js to see the total</span>
                      ) : missing > 0 ? (
                        `Total so far (${missing} ${missing === 1 ? "part" : "parts"} without a price)`
                      ) : (
                        "Total"
                      )}
                    </th>
                    <td className="col-price">{priced.length ? euro(total) : null}</td>
                  </tr>
                </tfoot>
              ) : null}
            </table>
            {parts.priceNote && !(isPlaceholder(parts.priceNote) && !site.showPhotoHints) ? (
              <p className="parts__note">
                <Rich text={pick(parts.priceNote)} />
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
