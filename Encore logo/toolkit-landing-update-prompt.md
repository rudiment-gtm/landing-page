# Update the Toolkit landing page

The landing page in this repo is out of date. Replace it with the new version.
Everything you need is in the folder I'm handing you alongside this prompt
(`vite-landing/`). This is a plain static Vite site — one HTML file, no
framework, no components.

## What changed

The page was rebranded and repositioned. Summary, so you know what to expect
when you diff:

- **Product is now called Toolkit**, not "Rudiment GTM Map". New inline-SVG
  bracketed-T logo in the nav and footer; the `assets/rudiment-logo.png`
  `<img>` tags are gone. Footer reads "A Rudiment product".
- **Positioning changed from agency to product.** All "we build it for you",
  "build-out fee", "retainer" and "working session" language is gone. Every CTA
  now says "Book a demo".
- **New pricing:** four tiers — $149 Base, $299 Standard (featured), $599
  Growth, and Custom (billed annually). No build-out fee anywhere.
- **New product section:** three feature rows with hand-built UI mockups (Map,
  Chat, Prospect) replacing the old four abstract cards.
- **Removed:** the four-week build timeline section and the "The rest of what
  Rudiment does" section.
- Colors are unchanged (black `#0A0A0A` / green `#2FE3A8`).

## What to do

1. Find the existing landing page in this repo. It should be a Vite project
   whose `index.html` contains an `<x-dc>` element and loads `/support.js`.
   Note its exact location — that is the directory you are replacing files in.

2. Copy these files from `vite-landing/` into that same directory, overwriting:

   - `index.html`            (the whole page — markup + logic)
   - `public/support.js`     (runtime; refresh it even if it looks unchanged)
   - `public/favicon.svg`    (new file — the Toolkit mark)
   - `package.json`          (only change: package name → `toolkit-landing`)

   Leave `vite.config.js`, `vercel.json`, `.gitignore` and `.nvmrc` alone if
   they already exist — they are unchanged. If any are missing, copy them too.

3. Delete `public/assets/` from the repo if it exists. The new page has no
   `<img>` tags — the logo is inline SVG and the favicon is `/favicon.svg` — so
   `rudiment-logo.png` and `rudiment-mark.png` are dead. Grep for
   `rudiment-logo` and `rudiment-mark` first; if something outside the landing
   page still references them, leave the directory and tell me.

4. Do not reformat, prettify or reindent `index.html`. It contains a
   `<script type="text/x-dc">` block whose contents are parsed at runtime;
   reformatting can break it. Copy it byte for byte.

5. Verify locally before committing:

   ```
   npm install
   npm run build
   npm run preview
   ```

   Open the preview URL and confirm:
   - Nav shows the bracketed-T mark + "Toolkit"
   - Hero headline renders and the green radius graphic animates
   - Three product rows show their UI mockups, nothing clipped
   - Pricing shows four cards: $149 / $299 / $599 / Get pricing
   - The FAQ accordion opens on click
   - No console errors, and no 404 for `/support.js` or `/favicon.svg`

6. Commit with a message like `Rebrand landing page to Toolkit, new pricing`
   and push to the branch Vercel deploys from.

## Vercel notes

No dashboard changes needed — framework preset stays **Vite**, build command
`npm run build`, output directory `dist`. If the build fails with
`vite: command not found`, the Root Directory setting is pointing at the repo
root instead of the project folder; fix it in Settings → General → Root
Directory rather than moving files.

## Constraints

- Do not rewrite any copy. The text in `index.html` is final and approved.
- Do not convert the page to React, add a framework, or split it into
  components. It is intentionally one static file.
- Do not add dependencies. `vite` is the only one.
