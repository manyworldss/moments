# Moments web app

Static, mobile-first web app. React, Vite, TypeScript. No backend, no analytics, no third-party requests.

## Run it

```
npm install
npm run dev
```

Open the printed URL. `npm run dev` also prints a network URL you can open on your phone (same Wi-Fi).

- `/` is the app.
- `/design.html` is the design baseline: tokens, type, frames and components, plus the Today screen in light and dark side by side.

## Where things are

- `src/styles/tokens.css`: colors (light and dark), fonts, type scale. Start here for any design change.
- `src/styles/components.css`: labels, header, film frame, field rows, pill buttons, tab bar.
- `src/Today.tsx`: the Today screen.
- `src/data.ts`: loads `../data/moments.json` and picks the day's moment from `../data/rotation.json`.
- `src/fonts/`: the self-hosted mono font (see below).

## Daily rotation

`data/rotation.json` lists moment ids in editorial order. Day 0 is `start_date`; each day moves one step and wraps around. Everyone sees the same moment on the same date. Another steps forward through the same order. Moments missing `year_set` or `location_thesis` are skipped.

## City maps

Each moment's map is drawn from OpenStreetMap data at build time, not loaded from a map service, so the app still makes no outside requests.

- `npm run maps` builds every map listed in `MAPS` at the top of `scripts/build-maps.mjs`. `npm run maps -- <moment-id>` builds one.
- Add a moment to `MAPS` to give it a map. `center` and `span` (km) set the framing; the red dot always sits on the moment's real coordinates. `lite: true` leaves out residential streets for very dense cities (London) to keep the file small.
- Output goes to `src/maps/<moment-id>.json` (committed). Raw downloads are cached in `scripts/.osm-cache/` (not committed).
- Moments without a map show a blank grid that says so.
- Map data is © OpenStreetMap contributors (ODbL). The credit shows under every map and must stay.

Preview any moment with `?moment=<id>`, e.g. `/?moment=in-the-mood-for-love-hong-kong-2000`.

## Welcome

First visit shows the welcome (`src/Welcome.tsx`): a title card over a drifting dotted world, four short steps, then a film-leader countdown into today's moment. Seen-once is stored in localStorage on the device.

- `?welcome` shows it again; `?welcome=3` opens at step 3.
- The world is built from Natural Earth (public domain) by `npm run world` into `src/world.json`.

## Fonts

- Mono: DejaVu Sans Mono, the open font Apple's Menlo is based on. `npm run fonts` rebuilds the trimmed woff2 files in `src/fonts/` from the `dejavu-fonts-ttf` package. Its license is in `src/fonts/DEJAVU-LICENSE.txt`.
- Sans: Inter, bundled from `@fontsource/inter`.
