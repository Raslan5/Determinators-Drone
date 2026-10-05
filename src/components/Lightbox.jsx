import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "./Icons.jsx";

/* Full-screen photo viewer. Any component can open it with useLightbox(). */

const LightboxContext = createContext({ open: () => {} });
export const useLightbox = () => useContext(LightboxContext);

export function LightboxProvider({ children }) {
  const [state, setState] = useState(null); // { items, index }
  const open = useCallback((items, index = 0) => setState({ items, index }), []);
  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {state ? <Viewer {...state} onIndex={(i) => setState((s) => ({ ...s, index: i }))} onClose={() => setState(null)} /> : null}
    </LightboxContext.Provider>
  );
}

function Viewer({ items, index, onIndex, onClose }) {
  const closeRef = useRef(null);
  const count = items.length;
  const item = items[index];
  const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && count > 1) go(1);
      else if (e.key === "ArrowLeft" && count > 1) go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener && typeof opener.focus === "function") opener.focus();
    };
  }, [go, onClose, count]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" onClick={onClose}>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        {item.type === "video" ? (
          <video src={item.url} controls autoPlay playsInline className="lightbox__media" />
        ) : (
          <img src={item.url} alt={item.alt || item.caption || ""} className="lightbox__media" />
        )}
        <figcaption className="lightbox__caption">
          <span>{item.caption}</span>
          {count > 1 ? (
            <span className="lightbox__count">
              {index + 1} of {count}
            </span>
          ) : null}
        </figcaption>
      </figure>
      <button ref={closeRef} type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close">
        <Icon name="close" size={22} />
      </button>
      {count > 1 ? (
        <>
          <button type="button" className="lightbox__btn lightbox__prev" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo">
            <Icon name="prev" size={24} />
          </button>
          <button type="button" className="lightbox__btn lightbox__next" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo">
            <Icon name="next" size={24} />
          </button>
        </>
      ) : null}
    </div>
  );
}
