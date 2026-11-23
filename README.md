# Moments

A trip through cinema, one moment at a time.

Each moment is one film, in one city, in one year.

## What's here

- `data/moments.json`: every moment. This is the source of truth and is edited by hand.
- `data/REVIEW.md`: open questions about the data.
- `scripts/validate-moments.mjs`: checks the data against the schema.

## Check the data

```
node scripts/validate-moments.mjs
```

Needs Node 18 or newer. Nothing to install.

## Data rules

- Ids are `title-place-year`, using the release year: `drive-my-car-hiroshima-2021`.
- `year_set` is when the film takes place. `year_released` is when it came out.
- `poster_url` stays `null` and `still_urls` stays empty. The app shows aspect-ratio frames instead of film stills.
- `connections` hold ids, not titles, so they can be linked later.
- `llm_narrative_seed` is instructions and facts for the model, written for that moment only. It isn't finished prose.
- `curator_notes` is internal and never shown in the app.
