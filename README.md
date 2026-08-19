# Vice Charters — Website

A static site (plain HTML/CSS/JS, no build step, no framework) for Vice Charters. Deploys free on GitHub Pages or Vercel.

## What's in here

- `index.html` — the main public site: hero, fleet, rates, availability, live tide chart, contact.
- `brokers.html` — public broker page: availability, fleet specs/photos, starting rates only. No client info, no inquiry form, no login (linked from the main nav as "For Brokers").
- `internal.html` — a **soft** internal quick-links page (see security note below). Not linked from the main nav; bookmark it directly.
- `css/style.css` — all styling, using your real brand palette (charcoal / teal / pink-lavender sunset gradient) pulled from your logo.
- `js/tides.js` — pulls **live, real** tide data for Biscayne Bay from NOAA's public API (station 8723214, Virginia Key) and draws the chart. No API key needed, nothing to configure.
- `js/main.js` — mobile nav toggle + photo lightbox.
- `assets/` — your real logo and boat photos (compressed for web) for Aqua, Mistral and Sea Ray.

## Important: read this about "private vs public"

You asked for the site to be public-facing for brokers while keeping the real business info private. A **static site has no server**, so it cannot have real login security — any file in this folder is downloadable by anyone who has the URL, even if it's not linked in the menu.

So the design here is:

- `index.html` and `brokers.html` **only ever contain information that's fine to be public** (fleet photos/specs, starting rates, availability).
- Actual private data — leads, full internal rate card with margins, client details, financials — is **not stored in this website at all**. It stays in your existing Google Sheet(s) / Google Calendar, which have real Google-account-based access control. `internal.html` is just a bookmark page linking out to those tools.
- `internal.html` has a passphrase box, but it's a soft deterrent, not real security — anyone who views the page source can read the passphrase (`vicecharters` by default — change it by editing the `checkGate()` function near the bottom of `internal.html`). **Never put anything on that page you wouldn't want a stranger to see.**

If you later want a real login-protected private dashboard (not just a public site), that needs an actual backend/auth — that's what the Lovable build was for. This static version trades that off for free hosting and zero moving parts.

## Deploying — GitHub Pages (free)

1. Create a new GitHub repo (e.g. `vice-charters-site`) and push this folder's contents to it.
2. In the repo: **Settings → Pages → Source** → select the `main` branch, root folder → Save.
3. GitHub gives you a URL like `https://yourusername.github.io/vice-charters-site/`. To use `vicecharters.com` instead, add a `CNAME` file in the repo root containing just your domain, and point your domain's DNS at GitHub Pages (GitHub's docs: "Managing a custom domain for your GitHub Pages site").

## Deploying — Vercel (free)

1. Push this folder to a GitHub repo (same as above).
2. Go to vercel.com → **Add New Project** → import the repo. Framework preset: "Other" (it's static, no build command needed).
3. Deploy. Vercel gives you a free `*.vercel.app` URL immediately; add your own domain under Project → Settings → Domains.

Either option is genuinely free for a site this size.

## Things to fill in before it's fully live

1. **Real specs & rates** — search `index.html` and `brokers.html` for `[add ft]`, `[add capacity]`, and "Contact for rate" / "Contact us" and replace with real numbers once finalized. The rate table under `<section id="rates">` in `index.html` also needs real prices.

2. **Connecting the availability calendar** (per boat, or one shared calendar):
   - In Google Calendar, create/open the calendar you want public.
   - Settings → **Access permissions** → check "Make available to public," set to **"See only free/busy (hide details)"** — this is what lets brokers see open/booked without seeing client names.
   - Settings → **Integrate calendar** → copy the **Embed code** iframe `src` URL.
   - In `index.html` and `brokers.html`, replace each `<div class="calendar-placeholder">...</div>` with the commented-out `<iframe class="calendar-embed-frame" src="...">` line right above it (there's one per boat) — paste your real `src` URL in.

3. **Connecting the contact form** (GitHub Pages/Vercel can't process form submissions on their own):
   - Sign up free at [formspree.io](https://formspree.io), create a form, copy your form ID.
   - In `index.html`, replace `https://formspree.io/f/YOUR_FORM_ID` in the `<form action="...">` tag with your real endpoint.
   - Free tier covers a small charter business's inquiry volume comfortably.

4. **WhatsApp link** — in `index.html`, find `https://wa.me/1XXXXXXXXXX` and replace the digits with your real number in international format, no symbols (e.g. `https://wa.me/13055551234`).

5. **Email address** — replace `info@vicecharters.com` in `index.html` if that's not the final address (see the Email Options in your Action Plan doc — this assumes you went with `info@`).

6. **Internal page links** — in `internal.html`, paste your real Google Sheet / Photos / Broker-list URLs into the `href="#"` placeholders.

## Adding the 4th yacht (or any future boat)

In `index.html`, copy one whole `<article class="boat-card">...</article>` block inside `<div class="fleet-grid">`, update the name/photos/specs. Do the same in `brokers.html`'s fleet grid, and add a matching `<div class="calendar-card">` in both availability sections.

## Replacing/adding photos

Drop new images into `assets/aqua/`, `assets/mistral/`, `assets/sea-ray/` (or a new folder for a 4th boat) and update the `src="assets/..."` paths in the HTML. Keep images under ~500KB each (resize to ~1600px wide, JPEG quality ~80) so the site stays fast — the photos already in here are pre-compressed for you.

## Tide chart

`js/tides.js` calls NOAA's public CO-OPS API directly from the browser — no key, no cost, no rate-limit concerns for this traffic level. It's already pointed at Station 8723214 (Virginia Key, Biscayne Bay), which is the standard reference station for Miami-area tides. If you'd rather reference a different NOAA station, change the `NOAA_STATION` constant at the top of `js/tides.js` (find station IDs at tidesandcurrents.noaa.gov).
