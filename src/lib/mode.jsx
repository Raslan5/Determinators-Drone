import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Rich } from "./text.jsx";

/*
  Reading mode: "simple" (everyone) or "tech" (engineers).
  Chosen with the switch in the header. It is remembered in this browser and
  can be shared as a link: add ?mode=technical to the address.
*/

const ModeContext = createContext({ mode: "simple", setMode: () => {} });
const STORAGE_KEY = "reading-mode";

function initialMode() {
  try {
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q === "technical" || q === "tech") return "tech";
    if (q === "simple") return "simple";
  } catch {
    /* ignore */
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "tech" || saved === "simple") return saved;
  } catch {
    /* storage can be blocked; the default is fine */
  }
  return "simple";
}

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(initialMode);

  const setMode = useCallback((next) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
    try {
      const url = new URL(window.location.href);
      if (next === "tech") url.searchParams.set("mode", "technical");
      else url.searchParams.delete("mode");
      window.history.replaceState(window.history.state, "", url);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);
  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export const useMode = () => useContext(ModeContext);

const isDual = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v) && ("simple" in v || "tech" in v);

/** Returns a function that picks the right version of a text for the current mode. */
export function usePick() {
  const { mode } = useMode();
  return useCallback(
    (v) => {
      if (!isDual(v)) return v;
      return mode === "tech" ? v.tech ?? v.simple : v.simple ?? v.tech;
    },
    [mode],
  );
}

/**
 * Renders a text that may have simple/tech versions. When both exist, the
 * text fades in again on every mode change so readers see what changed.
 */
export function Say({ v, as: Tag = "span", className, ...rest }) {
  const pick = usePick();
  const { mode } = useMode();
  const text = pick(v);
  if (text === undefined || text === null || text === "") return null;
  const changes = isDual(v) && v.simple && v.tech && v.simple !== v.tech;
  const cls = [className, changes ? "swap" : null].filter(Boolean).join(" ") || undefined;
  return (
    <Tag key={changes ? mode : "same"} className={cls} {...rest}>
      <Rich text={text} />
    </Tag>
  );
}

/** Two-button switch used in the header and in the hero. */
export function ModeSwitch({ size = "small", labels }) {
  const { mode, setMode } = useMode();
  const items = [
    { id: "simple", label: labels?.simple?.label ?? "Simple", hint: labels?.simple?.hint },
    { id: "tech", label: labels?.tech?.label ?? "Technical", hint: labels?.tech?.hint },
  ];
  return (
    <div className={`mode-switch mode-switch--${size}`} role="group" aria-label="Reading mode">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          className="mode-switch__btn"
          aria-pressed={mode === it.id}
          onClick={() => setMode(it.id)}
        >
          <span className="mode-switch__label">{it.label}</span>
          {size === "large" && it.hint ? <span className="mode-switch__hint">{it.hint}</span> : null}
        </button>
      ))}
    </div>
  );
}
