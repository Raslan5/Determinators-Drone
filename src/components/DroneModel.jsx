import { useEffect, useRef, useState } from "react";
import { ui, droneModelSteps } from "../content.js";
import { useReducedMotion } from "../lib/hooks.js";

/*
  Phase 1 preview: 3D drone that follows the active step. three.js is loaded
  with a dynamic import the first time the slot scrolls into view, and the loop
  pauses while it is off screen. The yaw follows `turn` (a { current, subscribe } store, 0..1, scroll based).
*/
export function createTurn() {
  const subs = new Set();
  return {
    current: 0,
    set(v) {
      if (v === this.current) return;
      this.current = v;
      subs.forEach((f) => f());
    },
    subscribe(f) {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}

export default function DroneModel({ step = 0, turn }) {
  const reduced = useReducedMotion();
  const box = useRef(null);
  const canvas = useRef(null);
  const api = useRef(null);
  const latest = useRef({ step, reduced });
  const [failed, setFailed] = useState(false);
  const cfg = droneModelSteps[step] || droneModelSteps[0];
  latest.current = { step, reduced };

  useEffect(() => {
    const el = box.current;
    if (!el) return undefined;
    let dead = false;
    let loading = false;
    let visible = false;
    /* The yaw comes from a ref store, so scrolling never re-renders React. */
    const push = () => {
      if (visible && !latest.current.reduced) api.current?.setTurn(turn.current);
    };
    const load = () => {
      loading = true;
      import("../lib/droneModel.js")
        .then(({ createDroneModel }) => {
          if (dead) return;
          const outlineColor = getComputedStyle(el).getPropertyValue("--drone-outline").trim();
          const m = createDroneModel(canvas.current, { outlineColor, reduced: latest.current.reduced });
          api.current = m;
          m.setTurn(latest.current.reduced ? 0 : turn.current);
          m.setStep(droneModelSteps[latest.current.step]);
          m.setRunning(visible);
        })
        .catch(() => !dead && setFailed(true));
    };
    const unsub = turn.subscribe(push);
    let io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (api.current) {
          api.current.setRunning(visible);
          push();
        }
        else if (visible && !loading) load();
      });
      io.observe(el);
    } else {
      visible = true;
      load();
    }
    return () => {
      dead = true;
      unsub();
      io?.disconnect();
      api.current?.dispose();
      api.current = null;
    };
  }, []);

  useEffect(() => {
    api.current?.setStep(cfg);
  }, [cfg]);
  useEffect(() => {
    api.current?.setReduced(reduced);
    if (!reduced) api.current?.setTurn(turn.current);
  }, [reduced]);

  return (
    <div ref={box} className="drone-model" data-empty={cfg.show ? undefined : "true"}>
      {failed ? (
        <p className="drone-model__fallback">{ui.build.model.fallback}</p>
      ) : (
        <canvas
          ref={canvas}
          className="drone-model__canvas"
          role="img"
          aria-label={ui.build.model.label}
          aria-hidden={cfg.show ? undefined : "true"}
        />
      )}
    </div>
  );
}
