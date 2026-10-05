# Our drone, from a box of parts to the sky

The website of our team for the **Transversal Project** of the Master's degree in
Applications and Technologies for Unmanned Aircraft Systems (Drones), EETAC, UPC.

It tells the story of Phase 1 (assembly, setup and first flight) for two kinds of
readers. A switch at the top lets visitors read it in **Simple** words or in
**Technical** detail. To send someone straight to the technical version, add
`?mode=technical` to the address.

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
orange underline, so you can spot the ones you missed. Most texts have a `simple`
and a `tech` version.

**Photos.** Drop them in these folders; the site finds them on its own:

- `src/photos/steps/` build photos, named with the step number first:
  `01-the-box.jpg`, `03-arms-on-the-body.jpg`. The words after the number
  become the caption.
- `src/photos/flight/` flight photos and short `.mp4` videos for the gallery.
- `src/photos/team/` portraits named `1.jpg`, `2.jpg`, `3.jpg`.
- `src/photos/logs/` screenshots of your Mission Planner graphs.

Use `.jpg`, `.png` or `.webp` (iPhone `.heic` photos don't work in most browsers;
export them as JPG), and resize big phone photos to about 2000 pixels wide.

When all your photos are in, set `showPhotoHints: false` in `src/content.js`
to hide the empty photo frames.

**Flight video (optional).** Upload it to YouTube and paste the link in
`flight.videoUrl` in `src/content.js`.

**Real flight log (optional).** The "What the logs say" chart can compare the
altitude the autopilot was asked to hold with the altitude it actually flew at.
Export the `CTUN` messages of your DataFlash log (`.bin`) as a CSV and put it in
`src/flight-log/`:

```bash
pip install pymavlink
mavlogdump.py --types CTUN --format csv 00000042.BIN > src/flight-log/ctun.csv
```

Any CSV with the columns `TimeUS`, `Alt` and (optionally) `DAlt` works.

**Colours and fonts.** The first block of `src/styles.css`.

---

## 2. Publish it on GitHub Pages (free)

You do this once. After that, every change you save on GitHub goes live by
itself in about a minute.

1. **Create a repository.** On github.com, click **New repository**. Give it a
   short name such as `drone-team` and make it **Public**. Don't add a README.
   Your site will live at `https://YOUR-USERNAME.github.io/drone-team/`.

2. **Upload this folder.** Pick one way:

   - **GitHub Desktop (easiest).** Install it from desktop.github.com and sign in.
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
     existing file** and drag in everything in this folder except
     `node_modules` and `dist` (if you have them). Your computer may hide the
     `.github` folder and leave it out. If `.github/workflows/deploy.yml` is
     missing on GitHub afterwards, click **Add file > Create new file**, type
     `.github/workflows/deploy.yml` as the name, and paste in the contents of
     that file from this folder.

3. **Turn on Pages.** In the repository: **Settings > Pages > Build and
   deployment > Source: GitHub Actions**.

4. **Wait for the green tick.** Open the **Actions** tab. The run called
   "Deploy website to GitHub Pages" takes about a minute. If it failed because
   Pages wasn't on yet, open it and click **Re-run all jobs**.

5. **Open your site** at `https://YOUR-USERNAME.github.io/drone-team/`.

**Editing later.** On github.com, open `src/content.js`, click the pencil, edit,
and click **Commit changes**. To add photos, open the right folder in
`src/photos/` and use **Add file > Upload files**. The site updates itself.

---

## 3. See it on your computer (optional)

Install [Node.js](https://nodejs.org) (version 18 or newer; the LTS version is best), then in this folder:

```bash
npm install
npm run dev
```

and open the address it prints (usually http://localhost:5173). The page reloads
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
src/flight-log/       optional CSV from your flight log
src/styles.css        colours, fonts and layout
src/components/       the sections of the page (React)
.github/workflows/    publishes the site on every change
```
