# Changelog

## Version 3 — 2026-10-15
- **Climbing grade conversions corrected** to Wikipedia's free-climbing comparison table (American Alpine Journal, Alpinist, theCrag). The old table was one step too hard in French from VII− and one to two steps too hard in US (YDS). For example, UIAA VI+ now shows as 6a / 5.10a (was 6a+ / 5.10c). Logged grades are stored in UIAA, so none of your data changed.
- In French or US mode, the route grade menu also shows the UIAA grade, e.g. "6a (VI+)".
- A test pins every row of the table to the source.

## Version 2 — 2026-10-15
- **Rebuilt as a Next.js app** instead of one HTML page published as a Claude artifact. Each tab is its own page (`/`, `/climbing`, `/hiking`, `/walking`, `/cycling`), and the code is split into small files: calculations in `lib/`, screens in `components/`.
- **Data lives in the `data/` files**, which used to be backups of the artifact's database. "Sync my activities" now updates these files directly (see docs/sync-workflow.md).
- **Logging climbing routes** (grade, lead / top rope, adding or deleting a hand-added session) saves into the session's file in `data/climbing-sessions/`.
- **Tests** for the calculations and the data files (`npm test`).
- Runs on your computer with `npm run dev`.

## Version 1 — 2026-10-07
- Activity dashboard published as a Claude artifact: Overview, Climbing, Hiking, Walking and Cycling tabs, with the data backed up to `data/`.
- Overview: active days and activity mix replaced the summary tiles.
