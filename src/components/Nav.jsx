import { useEffect, useRef, useState } from "react";
import { site, ui } from "../content.js";
import { routeHash } from "../lib/route.js";
import { Rich } from "../lib/text.jsx";
import { Icon } from "./Icons.jsx";
import Glossary from "./Glossary.jsx";
import { inV2Folder } from "../lib/photos.js";

const SAMPLE_X = [0.5, 0.25, 0.75, 0.1, 0.9];

const brandPhoto = () => inV2Folder("home/home_title").find((x) => x.type === "image");

export function BrandMark({ size = 22 }) {
  const photo = brandPhoto();
  if (!photo) return null;
  const width = Math.round(size * (1086 / 1449));
  return (
    <img
      src={photo.url}
      alt=""
      aria-hidden="true"
      width={width}
      height={size}
      decoding="async"
      style={{ width, height: size, objectFit: "contain", flex: "none", display: "block" }}
    />
  );
}

export default function Nav({ route }) {
  const LINKS = Object.entries(ui.nav.links[route] ?? {});
  const ref = useRef(null);
  const [surface, setSurface] = useState("paper");
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const menuBtn = useRef(null);
  const [gloss, setGloss] = useState(false);
  const glossOpener = useRef(null);

  useEffect(() => {
    let frame = 0;
    let surfaces = document.querySelectorAll("[data-surface]");
    const refresh = () => {
      surfaces = document.querySelectorAll("[data-surface]");
    };
    const update = () => {
      frame = 0;
      const bar = ref.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const y = rect.bottom + 2;
      const sy = rect.top + rect.height / 2; /* sample mid-bar: the 12px frame margin must not decide */
      /* geometry, not elementFromPoint: the sticky nav itself would be hit. Innermost (last in DOM order) wins. */
      let holder = null;
      for (const f of SAMPLE_X) {
        const x = window.innerWidth * f;
        for (let i = surfaces.length - 1; i >= 0; i--) {
          const r = surfaces[i].getBoundingClientRect();
          if (r.top <= sy && sy < r.bottom && r.left <= x && x < r.right) {
            holder = surfaces[i];
            break;
          }
        }
        if (holder) break;
      }
      if (holder) {
        setSurface(holder.dataset.surface);
      }
      let current = "";
      for (const [id] of LINKS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= y + 80) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", refresh);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  useEffect(() => {
    setOpen(false);
  }, [route]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuBtn.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const openGloss = () => {
    glossOpener.current = document.activeElement;
    setGloss(true);
    setOpen(false);
  };
  const closeGloss = () => {
    setGloss(false);
    /* The mobile sheet is hidden by now: return focus to the menu button instead. */
    const op = glossOpener.current;
    const target = op && op.isConnected && op.getClientRects().length ? op : menuBtn.current;
    target?.focus({ preventScroll: true });
  };
  const glossBtn = (extra) => (
    <button type="button" className={`nav__link nav__link--btn${extra}`} aria-haspopup="dialog" onClick={openGloss}>
      {ui.glossary.button}
    </button>
  );
  const pages = ui.nav.pageLinks.map((p) => (
    <a key={p.path} href={`#${p.path}`} className="nav__link" aria-current={route === p.path ? "page" : undefined} onClick={close}>
      {p.label}
    </a>
  ));
  const links = LINKS.map(([id, label]) => (
    <a key={id} href={routeHash(route, id)} className="nav__link nav__link--sub" aria-current={active === id ? "true" : undefined} onClick={close}>
      {label}
    </a>
  ));
  const sub = links.length ? (
    <nav className="nav__sub" aria-label={ui.nav.sections}>
      <div className="wrap nav__sub-inner">{links}</div>
    </nav>
  ) : null;

  return (
    <header ref={ref} className={`nav surface-${surface}`}>
      <div className="wrap nav__bar">
        <a href="#/" className="nav__brand" onClick={close}>
          <BrandMark />
          <span className="nav__team">
            <Rich text={site.teamName} />
          </span>
        </a>
        <nav className="nav__links" aria-label={ui.nav.pages}>
          {pages}
          {glossBtn("")}
        </nav>
        <div className="nav__end">
          <button
            type="button"
            ref={menuBtn}
            className="nav__menu"
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
            <span className="sr-only">{ui.nav.sections}</span>
          </button>
        </div>
      </div>
      {sub}
      <nav id="nav-sheet" className="nav__sheet" hidden={!open} aria-label={ui.nav.sheet}>
        <div className="wrap nav__sheet-inner">
          {pages}
          {glossBtn("")}
          {links.length ? <hr className="nav__rule" /> : null}
          {links}
        </div>
      </nav>
      {gloss ? <Glossary onClose={closeGloss} /> : null}
    </header>
  );
}
