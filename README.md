# Rudiment GTM Map — landing page

Vite static site. Deploys to Vercel with the **Vite** framework preset.

    index.html            the page (Vite entry)
    public/support.js     runtime the page loads — copied to dist/ as-is
    public/assets/        Rudiment logo + mark (favicon)
    vite.config.js
    vercel.json           pins framework / install / build / output

## Deploy to Vercel

Push this folder to GitHub and import it at vercel.com.

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Root Directory: the folder containing `package.json`

No environment variables.

### If the build fails with `vite: command not found`

Vercel skipped the install. Two things to check: `package.json` must sit at the
Root Directory Vercel points at, and the build log must show an
"Installing dependencies" step before `vite build`. `vite` is listed under
`dependencies` (not `devDependencies`) so a production-only install still has it.

## Run locally

    npm install
    npm run dev

## Editing

Copy is inline in `index.html`. Pricing tiers, FAQ entries and the service cards
are arrays in the `<script data-dc-script>` block near the bottom of the file.

Booking CTAs point at the HubSpot meeting link; the "other work" cards point at
getrudiment.com.
