# Changelog

## Version 2 — 2026-10-15
- **Rebuilt as a Next.js app** instead of one HTML page published as a Claude artifact. Each tab is its own page (`/`, `/climbing`, `/hiking`, `/walking`, `/cycling`), and the code is split into small files: calculations in `lib/`, screens in `components/`.
- **Data lives in the `data/` files**, which used to be backups of the artifact's database. "Sync my activities" now updates these files directly (see docs/sync-workflow.md).
- **Logging climbing routes** (grade, lead / top rope, adding or deleting a hand-added session) saves into the session's file in `data/climbing-sessions/`.
- **Tests** for the calculations and the data files (`npm test`).
- Runs on your computer with `npm run dev`.

## Version 1 — 2026-10-07
- Activity dashboard published as a Claude artifact: Overview, Climbing, Hiking, Walking and Cycling tabs, with the data backed up to `data/`.
- Overview: active days and activity mix replaced the summary tiles.
