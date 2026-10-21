import { GhostWord, SplitWords } from "./Reveal.jsx";
import { ghosts, team, ui } from "../content.js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Rich, fill, plain } from "../lib/text.jsx";
import { startingWithV2 } from "../lib/photos.js";
import { Glyph } from "./Glyphs.jsx";

/* Only real https links become links (SEC-005, SEC-006). */
const t = ui.team;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const safeUrl = (u) => (typeof u === "string" && u.startsWith("https://") ? u : null);

export default function Team() {
  const [open, setOpen] = useState(null);
  const openers = useRef([]);
  const list = useRef(null);
  const openRef = useRef(null);
  const lastH = useRef(null);
  const pendingFocus = useRef(null);
  const rects = useRef([]);
  /* Current rendered height (mid-transition included), read right before each state change. */
  const snap = () => {
    lastH.current = list.current ? list.current.getBoundingClientRect().height : null;
  };
  const close = useCallback((restore = true) => {
    snap();
    const cur = openRef.current;
    openRef.current = null;
    setOpen(null);
    pendingFocus.current = restore && cur !== null ? cur : null;
  }, []);
  /* Focus returns only after React drops aria-hidden and tabIndex=-1 from the photo. */
  useEffect(() => {
    if (open !== null || pendingFocus.current === null) return;
    openers.current[pendingFocus.current]?.focus({ preventScroll: true });
    pendingFocus.current = null;
  }, [open]);
  const show = (i) => {
    snap();
    /* Cell boxes measured while still in the grid, so cards leaving the flow fade in place (FLIP). */
    rects.current = [...(list.current?.children || [])].map((c) => ({ top: c.offsetTop, left: c.offsetLeft, width: c.offsetWidth, height: c.offsetHeight }));
    openRef.current = i;
    setOpen(i);
  };

  /* Cell rects go stale on a width change: close the panel so the grid re-flows cleanly. */
  useEffect(() => {
    if (open === null) return undefined;
    let w = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      const had = document.activeElement?.closest?.(".team-panel");
      close(Boolean(had));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, close]);

  /* Height eases between the grid and the panel, like the S8 track (no layout jump). */
  useLayoutEffect(() => {
    const el = list.current;
    if (!el) return undefined;
    const prev = lastH.current;
    lastH.current = null;
    el.style.height = "auto";
    const target = el.getBoundingClientRect().height;
    if (prev === null || Math.abs(prev - target) < 1 || reduced()) {
      el.style.height = "";
      return undefined;
    }
    el.style.height = `${prev}px`;
    void el.offsetHeight;
    el.style.height = `${target}px`;
    const done = (e) => {
      if (e.target !== el || e.propertyName !== "height") return;
      el.style.height = "";
    };
    el.addEventListener("transitionend", done);
    return () => el.removeEventListener("transitionend", done);
  }, [open]);

  return (
    <section id="team" className="section surface-paper" data-surface="paper" data-wave>
      <GhostWord text={ghosts.team} />
      <div className="wrap">
        <div className="section-head">
          <SplitWords as="h2" className="h2" text={team.title} />
        </div>

        <div className="people" ref={list} data-open={open !== null ? "true" : undefined}>
          {team.members.map((m, i) => {
            const isOpen = open === i;
            const other = open !== null && !isOpen;
            const photo = startingWithV2("home/home_team", i + 1).find((x) => x.type === "image");
            return (
              <div key={i} className="person" data-state={isOpen ? "open" : other ? "away" : undefined} inert={other} style={other && rects.current[i] ? rects.current[i] : undefined}>
                <button type="button" className="person__photo" ref={(el) => (openers.current[i] = el)} aria-label={fill(t.more, { name: plain(m.name) })} aria-expanded={isOpen} aria-controls={isOpen ? `team-panel-${i + 1}` : undefined} aria-hidden={isOpen ? "true" : undefined} tabIndex={isOpen ? -1 : undefined} onClick={() => show(i)}>
                  {photo ? <img src={photo.url} alt="" loading="lazy" decoding="async" /> : <span className="person__hint">{fill(t.photoHint, { n: i + 1, ext: t.hintExt })}</span>}
                </button>
                <h3 className="person__name" aria-hidden={isOpen ? "true" : undefined}>
                  <Rich text={m.name} />
                </h3>
                {isOpen ? <Panel member={m} id={`team-panel-${i + 1}`} photo={photo} onClose={close} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Panel({ member, id, photo, onClose }) {
  const box = useRef(null);
  const closeBtn = useRef(null);
  const name = plain(member.name);
  const { linkedin, github } = member.links || {};
  const links = [
    { href: safeUrl(linkedin), label: t.linkedin },
    { href: safeUrl(github), label: t.github },
  ].filter((l) => l.href);
  const education = [member.background].filter(Boolean);

  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 899px)").matches) {
      box.current?.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
    }
    const onKey = (e) => {
      if (e.key === "Escape") onClose(true);
    };
    const onDown = (e) => {
      if (!box.current?.contains(e.target)) onClose(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);
  return (
    <div className="team-panel" id={id} ref={box} role="region" aria-labelledby={`${id}-name`}>
      <button type="button" className="team-panel__close" ref={closeBtn} aria-label={t.close} onClick={() => onClose(true)}>
        <span aria-hidden="true">{t.closeMark}</span>
      </button>
      <div className="team-panel__text">
        <h3 className="team-panel__name" id={`${id}-name`}>
          <Rich text={member.name} />
        </h3>
        <dl className="team-panel__facts">
          <dt>{t.role}</dt>
          <dd>
            <Rich text={member.role} />
          </dd>
          <dt>{t.education}</dt>
          <dd>
            {education.map((e, i) => (
              <span key={i} className="team-panel__line">
                <Rich text={e} />
              </span>
            ))}
          </dd>
          <dt>{t.links}</dt>
          <dd>
            {links.length ? (
              links.map((l) => (
                <a key={l.label} className="team-panel__link" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <span className="sr-only">{t.newTab}</span>
                </a>
              ))
            ) : (
              <Rich text={t.linksGap} />
            )}
          </dd>
        </dl>
        <h4 className="team-panel__sub">{t.reflections}</h4>
        <dl className="team-panel__facts team-panel__facts--stack">
          {team.reflections.map((r) => (
            <div key={r.title}>
              <dt>{r.title}</dt>
              <dd>
                <Rich text={t.reflectionGap} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="team-panel__media">
        {photo ? <img src={photo.url} alt={fill(t.portrait, { name })} decoding="async" /> : <Glyph name="person" size={120} />}
      </div>
    </div>
  );
}
