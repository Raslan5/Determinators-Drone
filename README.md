npm# Our drone, from a box of parts to the sky

The website of our team for the **Transversal Project** of the Master's degree in
Applications and Technologies for Unmanned Aircraft Systems (Drones), EETAC, UPC.

It tells the story of Phase 1 (assembly, setup and first flight).

Built with React and Vite. There is no server: GitHub Pages hosts it for free.

---

## 1. Put your own content in

You only need to touch two places.

| What | Where |
| --- | --- |
| All the text: team name, names, steps, parts, prices, reflections | `src/content.js` |
| Your photos and videos | the folders in `src/photos/` |

**Text.** Open `src/content.js`. Anything in `[square brackets]` is a placeholder.
Replace it, brackets included. Until you do, it shows on the site with a dashed
orange underline, so you can spot the ones you missed.

**Photos.** Drop them in the folders below, one per section; the site finds them on its own:

- `src/photos/home/<section>/`: `home_title`, `home_intro`, `home_prwph1`,
  `home_team`.
- `src/photos/phase-1/<section>/`: `ph1_step01` to `ph1_step06`,
  `ph1_hif_fly`, `ph1_hif_calibration`, `ph1_hif_planner`, `ph1_flight`.

File naming and per-folder details are in `src/photos/HOW-TO.txt`.

Use `.jpg`, `.png` or `.webp` (iPhone `.heic` photos don't work in most browsers;
export them as JPG), and resize big phone photos to about 2000 pixels wide.

When all your photos are in, set `showPhotoHints: false` in `src/content.js`
to hide the empty photo frames.

**Flight video (optional).** Upload it to YouTube and paste the link in
`flight.videoUrl` in `src/content.js`.

**Colours and fonts.** The first block of `src/styles.css`.

---

## 2. Publish it on GitHub Pages (free)

You do this once. [Publishing steps pending]

1. **Create a repository.** On github.com, click **New repository**. Give it a
   short name such as `drone-team` and make it **Public**. Don't add a README.
   Your site will live at `https://YOUR-USERNAME.github.io/drone-team/`.

2. **Upload this folder.** Pick one way:

   - **GitHub Desktop (easiest).** Install [GitHub Desktop](https://desktop.github.com) and sign in.
     *File > Add local repository*, choose this folder, accept "create a
     repository", then click **Publish repository** (untick "Keep this code
     private").
   - **Command line.**
     ```bash
     git init
     git add .
     git commit -m "Our drone website"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/drone-team.git
     git push -u origin main
     ```
   - **In the browser.** On the empty repository page, click **uploading an
     existing file** and drag in only these items: `src/`, `public/`,
     `scripts/`, `index.html`, `package.json`, `package-lock.json`,
     `vite.config.js`, `.gitignore`, `.gitattributes`, `.editorconfig`,
     `.nvmrc`, `LICENSE` and `README.md`.
     **Never upload** `Team_info.md`, `PROJECT_STATE.md`, `.env`, `CLAUDE*.md`,
     `.claude/`, `node_modules/` or `dist/`.

3. **Publish the site.** [Publishing steps pending]

4. **Open your site** at `https://YOUR-USERNAME.github.io/drone-team/`.

**Editing later.** On github.com, open `src/content.js`, click the pencil, edit,
and click **Commit changes**. To add photos, open the right folder in
`src/photos/` and use **Add file > Upload files**. [Publishing steps pending]

---

## 3. See it on your computer (optional)

Install [Node.js](https://nodejs.org) (version 24.22.3 or newer; see `.nvmrc`), then in this folder:

```bash
npm install
npm run dev
```

and open the address it prints (usually http://127.0.0.1:5173). The page reloads
as you edit. `npm run build` makes the final version in `dist/`.

---

## Questions

**Why is there no backend (Flask)?** GitHub Pages can only host static files,
and this site doesn't need a server: the text, photos, drawings and the
interactive parts all run in the visitor's browser. If you later want a contact
form, a service like Formspree works without a server; anything that needs
Python (for example live telemetry) would need hosting elsewhere.

**Can I use my own domain?** Yes: Settings > Pages > Custom domain.

**What is in the project?**

```
src/content.js        all the text of the site
src/photos/           your photos (read HOW-TO.txt inside)
src/styles.css        colours, fonts and layout
src/v2.css            additional styles
src/journey.css       styles for the journey sections
src/components/       the sections of the page (React)
```
