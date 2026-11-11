import { useEffect, useState } from "react";

/*
  Tiny hash router, no dependencies.
  Page routes: "#/", "#/phase-1", "#/phase-2".
  Page + section: "#/phase-1/build", "#/home/team" (Home is "home" when a section follows).
  Bare section anchors ("#build") never start with "#/", so they are ignored
  here and keep working as plain in-page links.
*/
export const ROUTES = ["/", "/phase-1", "/phase-2"];

const slug = (path) => (path === "/" ? "home" : path.slice(1));

/** "#/phase-1/build" -> { path: "/phase-1", section: "build" }; null if not a page route. */
export function parseHash(hash) {
  if (!hash.startsWith("#/")) return null;
  const [page = "", ...rest] = hash.slice(2).split("/");
  const path = page === "" || page === "home" ? "/" : `/${page}`;
  let section = rest.join("/");
  try {
    section = decodeURIComponent(section);
  } catch {
    /* keep raw */
  }
  return ROUTES.includes(path) ? { path, section } : { path: "/", section: "" };
}

/** Hash for a section of a page; no section gives the plain page hash. */
export const routeHash = (path, section = "") => (section ? `#/${slug(path)}/${section}` : path === "/" ? "#/" : `#${path}`);

export const isRouteHash = (hash) => hash.startsWith("#/");

export function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash)?.path ?? "/");
  useEffect(() => {
    const on = () => {
      const next = parseHash(window.location.hash);
      if (next) setRoute(next.path);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
