# Rudiment GTM Map — landing page

Static site. No build step, no dependencies.

    index.html      the page
    support.js      runtime the page loads
    assets/         Rudiment logo + mark (favicon)
    vercel.json     clean URLs

## Deploy to Vercel

Push this folder to GitHub and import it at vercel.com:

- Framework preset: **Other**
- Build command: leave empty
- Output directory: leave empty (or `.`)
- Root Directory: the folder containing `index.html`

No environment variables.

## Run locally

Open `index.html` in a browser, or serve the folder:

    npx serve .

## Editing

Copy is inline in `index.html`. Pricing tiers, FAQ entries and the service cards
are defined in the `<script data-dc-script>` block near the bottom of the file —
edit the `FAQS` array and the `tiers` / `services` arrays there.

Booking CTAs point at the HubSpot meeting link; the "other work" cards point at
getrudiment.com.
