import { useEffect, useRef, useState } from "react";
import { site } from "../content.js";
import { ModeSwitch } from "../lib/mode.jsx";
import { Rich } from "../lib/text.jsx";
import { Icon } from "./Icons.jsx";

const LINKS = [
  ["project", "Project"],
  ["build", "Build"],
  ["parts", "Parts"],
  ["physics", "How it flies"],
  ["flight", "Flight"],
  ["team", "Team"],
];

export function BrandMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M7 7l10 10M17 7L7 17" />
      <circle cx="6" cy="6" r="3.4" />
      <circle cx="18" cy="6" r="3.4" />
      <circle cx="6" cy="18" r="3.4" />
      <circle cx="18" cy="18" r="3.4" />
      <rect x="9.6" y="9.6" width="4.8" height="4.8" rx="0.8" fill="var(--cube)" stroke="none" />
    </svg>
  );
}

export default function Nav() {
  const ref = useRef(null);
  const [surface, setSurface] = useState("paper");
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const bar = ref.current;
      if (!bar) return;
      const y = bar.getBoundingClientRect().bottom + 2;
      const under = document.elementFromPoint(window.innerWidth / 2, y);
      const holder = under?.closest?.("[data-surface]");
      if (holder) setSurface(holder.dataset.surface);
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
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = LINKS.map(([id, label]) => (
    <a key={id} href={`#${id}`} className="nav__link" aria-current={active === id ? "true" : undefined} onClick={() => setOpen(false)}>
      {label}
    </a>
  ));

  return (
    <header ref={ref} className={`nav surface-${surface}`}>
      <div className="wrap nav__bar">
        <a href="#top" className="nav__brand">
          <BrandMark />
          <span className="nav__team">
            <Rich text={site.teamName} />
          </span>
        </a>
        <nav className="nav__links" aria-label="Sections">
          {links}
        </nav>
        <div className="nav__end">
          <ModeSwitch />
          <button
            type="button"
            className="nav__menu"
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
            <span className="sr-only">Sections</span>
          </button>
        </div>
      </div>
      <nav id="nav-sheet" className="nav__sheet" hidden={!open} aria-label="Sections">
        <div className="wrap nav__sheet-inner">{links}</div>
      </nav>
    </header>
  );
}
