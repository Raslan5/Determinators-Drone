import { useEffect } from "react";
import { site } from "./content.js";
import { ModeProvider } from "./lib/mode.jsx";
import { hasPlaceholder, plain } from "./lib/text.jsx";
import { LightboxProvider } from "./components/Lightbox.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import Project from "./components/Project.jsx";
import Build from "./components/Build.jsx";
import Parts from "./components/Parts.jsx";
import HowItFlies from "./components/HowItFlies.jsx";
import Flight from "./components/Flight.jsx";
import Team from "./components/Team.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  useEffect(() => {
    const team = hasPlaceholder(site.teamName) ? "" : plain(site.teamName);
    document.title = site.pageTitle || (team ? `${team} | Drone Transversal Project, UPC` : "Drone Transversal Project, UPC");
    const meta = document.querySelector('meta[name="description"]');
    if (meta && site.description) meta.setAttribute("content", site.description);
  }, []);

  return (
    <ModeProvider>
      <LightboxProvider>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">
          <Hero />
          <Project />
          <Build />
          <Parts />
          <HowItFlies />
          <Flight />
          <Team />
        </main>
        <Footer />
      </LightboxProvider>
    </ModeProvider>
  );
}
