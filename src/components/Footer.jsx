import { footer, site } from "../content.js";
import { Rich } from "../lib/text.jsx";
import { BrandMark } from "./Nav.jsx";

export default function Footer() {
  const c = site.course;
  return (
    <footer className="footer surface-ink" data-surface="ink">
      <div className="wrap">
        <p className="footer__next">{footer.next}</p>
        <p className="footer__next-text">{footer.nextText}</p>

        <div className="footer__grid">
          <div>
            <h2 className="footer__head">The course</h2>
            <p>
              <a href={c.url} target="_blank" rel="noreferrer">
                {c.name}
              </a>
            </p>
            <p className="footer__muted">
              {c.school}, {c.university}
            </p>
          </div>
          <div>
            <h2 className="footer__head">Where</h2>
            <p className="footer__muted">
              {c.address.map((line) => (
                <span key={line} className="footer__line">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div>
            <h2 className="footer__head">Contact</h2>
            <p>
              <Rich text={site.contactEmail} />
            </p>
          </div>
        </div>

        <div className="footer__base">
          <span className="footer__brand">
            <BrandMark size={18} />
            <span>
              © {site.year} <Rich text={site.teamName} />. Photos by the team.
            </span>
          </span>
          <a href="#top" className="footer__top">
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
