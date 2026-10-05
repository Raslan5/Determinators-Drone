import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the site work at any address, including
// https://<your-user>.github.io/<your-repo>/ on GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
