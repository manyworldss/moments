# Data review

Imported from Notion (MOMENTS (MOVIES) and its MOMENTS subpage) on 2026-11-23.
Delete items as they're resolved.

## Needs a decision

- [ ] **The Harder They Fall**: `location_thesis` is empty and `year_set` is `null` (the film never gives a year). The primary city is set to Redwood, one of the film's two invented towns (the other is Maysville). Coordinates point at Santa Fe, where it was shot. Confirm or change.
- [ ] **Sinners**: `cultural_moment` calls it Coogler's follow-up to Creed III. He produced Creed III but didn't direct it; the last film he directed before Sinners was Black Panther: Wakanda Forever (2022).
- [ ] **Sinners**: `historical_context` says "colored groups". Worth rewording before this is public.
- [ ] **Sinners**: the seed still ends with "this is a Western film that takes Asian and Black culture seriously", adapted from the Kill Bill seed.
- [ ] **Beasts of No Nation**: `year_set` is 2015, the release year, because the film never dates itself.
- [ ] **Connections that look copied**: Sinners and Drive My Car both list `oldboy-2003` as a contemporary (from Kill Bill). Beasts lists `12-years-a-slave-2013` under `influenced`, but that film came out two years earlier.
- [ ] **Connections to things that aren't films**: Drive My Car's `chekhov-plays` and Beasts' `beasts-of-no-nation-novel-2005`. Decide whether connections can point at books and plays.
- [ ] **In the Mood for Love**: country is "China". In 1962 Hong Kong was a British colony, as the entry's own `historical_context` says.

## Changed from the Notion copy

Fixes from the build doc's list:

- A Clockwork Orange: London coordinates (they were Tokyo's). Rewrote the seed's cultural line, which was copied from Kill Bill.
- The Harder They Fall: rewrote the seed (it described Sinners). The location and id were also copied from Sinners (Natchez, Mississippi, 1932) and are replaced.
- Sinners: `year_set` 1932, `year_released` 2025.
- Beasts of No Nation: city `(Unnamed)`, country `West Africa`, thesis and `historical_context` no longer tie it to one country, seed no longer says "Ghana 2003". Coordinates kept as Ghana but the longitude sign was flipped (the old point was in Togo).
- Drive My Car: `hidden_gem` to `cultural_classic`. Seed trimmed from prose back to instructions.
- Kill Bill: four copies down to one. Friday: two copies down to one.
- Ids normalized to `title-place-year`. `year` split into `year_set` and `year_released` on every moment.
- Poster and still links cleared.

Other fixes:

- Sinners: runtime 123 to 137, aspect ratio 2.35:1 to 2.76:1 (Ultra Panavision 70; IMAX sections are 1.43:1). Clarksdale coordinates moved about 24 km to the city center.
- Beasts of No Nation: language "English/French/Bammer" to "English / Twi".
- A Clockwork Orange: "Alexander" to "Alex" in the thesis. Alexander is the writer whose home they break into.
- Connections: empty strings removed, free text turned into ids (for example "Menace to society-1993" to `menace-ii-society-1993`).
- Spelling and punctuation only, no rewording: heinous, prevalent, tumultuous, "Chris Tucker's delivery", "Ice Cube's delivery", "one of the first", Americans, "so is drug and gang violence", "heat up", Asian, "Jim Crow era", "all the cards", "Coogler shows", Miles Caton, From Dusk Till Dawn.
- Drive My Car: removed a stray "Avoid Wikipedia tone." from `curator_notes`.
