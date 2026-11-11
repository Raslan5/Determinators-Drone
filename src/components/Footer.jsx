import { Rich } from "../lib/text.jsx";
import { site, ui } from "../content.js";
import { BrandMark } from "./Nav.jsx";

const safeUrl = (u) => (typeof u === "string" && u.startsWith("https://") ? u : null);

export default function Footer() {
  const c = site.course;
  const courseUrl = safeUrl(c.url);
  const t = ui.footer;
  return (
    <footer className="footer surface-ink" data-surface="ink" data-wave>
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <h2 className="footer__head">{t.course}</h2>
            <p>
              {courseUrl ? (
                <a href={courseUrl} target="_blank" rel="noopener noreferrer">
                  {c.name}
                </a>
              ) : (
                c.name
              )}
            </p>
            <p className="footer__muted">
              {c.school}, {c.university}
            </p>
          </div>
          <div>
            <h2 className="footer__head">{t.where}</h2>
            <p className="footer__muted">
              {c.address.map((line) => (
                <span key={line} className="footer__line">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <div>
            <h2 className="footer__head">{t.contact}</h2>
            <p>
              <Rich text={site.contactEmail} />
            </p>
          </div>
        </div>

        <div className="footer__base">
          <span className="footer__brand">
            <BrandMark size={18} />
            <span>
              © {site.year} <Rich text={site.teamName} />. {t.credit}
            </span>
          </span>
          <a href="#top" className="footer__top">
            {t.top}
          </a>
        </div>
      </div>
    </footer>
  );
}
