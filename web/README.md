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

## Fonts

- Mono: DejaVu Sans Mono, the open font Apple's Menlo is based on. `npm run fonts` rebuilds the trimmed woff2 files in `src/fonts/` from the `dejavu-fonts-ttf` package. Its license is in `src/fonts/DEJAVU-LICENSE.txt`.
- Sans: Inter, bundled from `@fontsource/inter`.
