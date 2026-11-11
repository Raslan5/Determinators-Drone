import { useCallback, useLayoutEffect, useState } from "react";
import { phasesPreview, site, ui } from "./content.js";
import { fill, hasPlaceholder, plain } from "./lib/text.jsx";
import { adaptiveRem, autoReveal, destroyLenis, handleAnchors, motionOK, scrollToId, scrollToTop, startLenis } from "./lib/motion.js";
import { parseHash, useRoute } from "./lib/route.js";
import { LightboxProvider } from "./components/Lightbox.jsx";
import { ReadyContext } from "./components/Reveal.jsx";
import Loader from "./components/Loader.jsx";
import Backdrop from "./components/Backdrop.jsx";
import FlyingDrones from "./components/FlyingDrones.jsx";
import Nav from "./components/Nav.jsx";
import Intro from "./components/Intro.jsx";
import Hero from "./components/Hero.jsx";
import Stats from "./components/Stats.jsx";
import Project from "./components/Project.jsx";
import Build from "./components/Build.jsx";
import BuildYourself, { ExplodedEmbed } from "./components/Inside.jsx";
import HowItFlies from "./components/HowItFlies.jsx";
import Flight from "./components/Flight.jsx";
import Team from "./components/Team.jsx";
import Difficulties from "./components/Difficulties.jsx";
import Journey from "./components/Journey.jsx";
import Phase2 from "./components/Phase2.jsx";
import Footer from "./components/Footer.jsx";

/* Blocks that spring in as they scroll into view (headlines rise word by word on their own). */
const REVEAL = [
  ".section-head > :not(h2)",
  ".phase",
  ".step",
  ".inside__build",
  ".moves",
  ".mixer",
  ".subsection",
  ".person",
  ".reflection",
  ".footer__grid",
].join(", ");

export default function App() {
  const route = useRoute();
  const [ready, setReady] = useState(() => !motionOK());
  const onReady = useCallback(() => setReady(true), []);

  useLayoutEffect(() => {
    const team = hasPlaceholder(site.teamName) ? "" : plain(site.teamName);
    document.title = team ? fill(ui.docTitleTeam, { team }) : ui.docTitle;
    const offAnchors = handleAnchors();
    const offRem = adaptiveRem();
    return () => {
      offAnchors();
      offRem();
    };
  }, []);

  /* Route flag on <html> so each page can set its own ground (Home is warm white). */
  useLayoutEffect(() => {
    document.documentElement.dataset.page = route === "/" ? "home" : route.slice(1);
  }, [route]);

  /* Every page change: back to the top, and smooth scroll + reveals restart on the new DOM. */
  useLayoutEffect(() => {
    startLenis();
    scrollToTop();
    const offReveal = autoReveal(REVEAL);
    /* "#/phase-1/build": open the page, then jump to the section (twice: layout settles late). */
    const toSection = (immediate) => {
      const h = parseHash(window.location.hash);
      if (h?.path === route && h.section) scrollToId(h.section, { focus: false, immediate });
    };
    let t1 = 0;
    const raf = requestAnimationFrame(() => {
      toSection(true);
      t1 = window.setTimeout(() => toSection(true), 400);
    });
    const onHash = () => toSection(false);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      window.removeEventListener("hashchange", onHash);
      offReveal();
      destroyLenis();
    };
  }, [route]);

  return (
      <LightboxProvider>
        <ReadyContext.Provider value={ready}>
          <Backdrop />
          {route === "/" || route === "/phase-1" ? <FlyingDrones inverted={route === "/phase-1"} /> : null}
          <Loader onReady={onReady} />
          <a className="skip" href="#main">
            {ui.skip}
          </a>
          <Nav route={route} />
          <main id="main">
            {route === "/" ? (
              <>
                <Intro />
                <Hero />
                <Project />
                <Build id="phases" data={phasesPreview} preview />
                <Team />
              </>
            ) : null}
            {route === "/phase-1" ? (
              <>
                <span id="top" />
                <Stats />
                <Journey id="route" renderStep2={<ExplodedEmbed />} />
                <BuildYourself />
                <HowItFlies />
                <Flight />
                <Difficulties />
              </>
            ) : null}
            {route === "/phase-2" ? (
              <>
                <span id="top" />
                <Phase2 />
              </>
            ) : null}
          </main>
          <Footer key={route} />
        </ReadyContext.Provider>
      </LightboxProvider>
  );
}
