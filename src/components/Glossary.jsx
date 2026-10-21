import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icons.jsx";
import { ui } from "../content.js";
import { lockScroll } from "../lib/motion.js";

const t = ui.glossary;
const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/* Glossary and references dialog. Opened from the Nav button; not a page section. */
export default function Glossary({ onClose }) {
  const closeRef = useRef(null);
  const boxRef = useRef(null);
  const closeNow = useRef(onClose);
  closeNow.current = onClose;

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll(true);
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeNow.current();
      } else if (e.key === "Tab") {
        const root = boxRef.current;
        if (!root) return;
        const list = Array.from(root.querySelectorAll(FOCUSABLE));
        if (!list.length) return;
        const first = list[0];
        const last = list[list.length - 1];
        const inside = root.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lockScroll(false);
    };
  }, []);

  return createPortal(
    <div className="glossary" onClick={onClose}>
      <div
        ref={boxRef}
        className="glossary__box surface-paper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="glossary__close" aria-label={t.close} onClick={onClose}>
          <Icon name="close" size={20} />
        </button>
        <div className="glossary__scroll" tabIndex={0} data-lenis-prevent>
          <h2 id="glossary-title" className="glossary__title">
            {t.title}
          </h2>
          <h3 className="glossary__sub">{t.glossaryTitle}</h3>
          <dl className="glossary__list">
            {t.items.map(([term, text]) => (
              <div key={term} className="glossary__item">
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
          <h3 className="glossary__sub">{t.referencesTitle}</h3>
          <ul className="glossary__refs">
            {t.references.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
}
