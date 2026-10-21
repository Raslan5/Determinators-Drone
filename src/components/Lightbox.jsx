import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";
import { ui } from "../content.js";
import { fill } from "../lib/text.jsx";
import { lockScroll } from "../lib/motion.js";

const t = ui.lightbox;
const FOCUSABLE = 'button:not([disabled]), [href], video[controls], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* Full-screen photo viewer. Any component can open it with useLightbox(). */

const LightboxContext = createContext({ open: () => {} });
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }) {
  const [state, setState] = useState(null); // { items, index }
  const open = useCallback((items, index = 0) => setState({ items, index }), []);
  // Stable callbacks: the viewer's mount effect must not re-run when the index changes.
  const onIndex = useCallback((i) => setState((s) => (s ? { ...s, index: i } : s)), []);
  const onClose = useCallback(() => setState(null), []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <LightboxContext.Provider value={value}>
      {children}
      {state ? <Viewer {...state} onIndex={onIndex} onClose={onClose} /> : null}
    </LightboxContext.Provider>
  );
}

function Viewer({ items, index, onIndex, onClose }) {
  const closeRef = useRef(null);
  // Captured on first render, before focus moves into the dialog (safe under StrictMode).
  const [opener] = useState(() => document.activeElement);
  const dialogRef = useRef(null);
  const count = items.length;
  const item = items[index];
  const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex]);

  // Latest handlers, read by the key listener without re-running the mount effect.
  const keys = useRef({ go, onClose, count });
  keys.current = { go, onClose, count };

  // Mount only: lock the page (body overflow and Lenis), focus the close button,
  // and on close restore scroll and return focus to whatever opened the viewer.
  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll(true);

    const onKey = (e) => {
      const k = keys.current;
      if (e.key === "Escape") k.onClose();
      else if (e.key === "ArrowRight" && k.count > 1) k.go(1);
      else if (e.key === "ArrowLeft" && k.count > 1) k.go(-1);
      else if (e.key === "Tab") {
        // Focus trap: Tab and Shift+Tab cycle inside the dialog.
        const root = dialogRef.current;
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
      if (opener && typeof opener.focus === "function") opener.focus({ preventScroll: true });
    };
  }, [opener]);

  return (
    <div ref={dialogRef} className="lightbox" role="dialog" aria-modal="true" aria-label={t.label} onClick={onClose}>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        {item.type === "video" ? (
          <video src={item.url} controls autoPlay playsInline className="lightbox__media" />
        ) : (
          <img src={item.url} alt={item.alt || item.caption || ""} className="lightbox__media" />
        )}
        <figcaption className="lightbox__caption">
          <span>{item.caption}</span>
          {count > 1 ? (
            <span className="lightbox__count">{fill(t.count, { i: index + 1, n: count })}</span>
          ) : null}
        </figcaption>
      </figure>
      <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label={t.close}>
        <Icon name="close" size={22} />
      </button>
      {count > 1 ? (
        <>
          <button type="button" className="lightbox__btn lightbox__prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label={t.prev}>
            <Icon name="prev" size={24} />
          </button>
          <button type="button" className="lightbox__btn lightbox__next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label={t.next}>
            <Icon name="next" size={24} />
          </button>
        </>
      ) : null}
    </div>
  );
}
