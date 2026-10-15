# Activity Dashboard: sync workflow

Dashboard: a Next.js app in this repository, run on your computer with `npm run dev` (tabs: Overview, Climbing, Hiking,
Walking (steps goal + walks), Cycling). The older one-page version is still published at
https://claude.ai/artifact/UUhT8epo8bSEZUvUMwhe35, but it no longer receives syncs.

Repository: https://github.com/kzumrad/activity-dashboard (private). Every dashboard change and every sync is committed there.

## Data
- Source: COROS watch (APEX 4) via the COROS connector. History starts 5 Aug 2026.
- The files in `data/` **are** the dashboard's data (not a backup any more):
  - `data/activities.json`: all non-climbing activities (`items` array) and `syncedAt`.
  - `data/climbing-sessions/<labelId>.json`: one climbing session with per-route height, time, HR, grade and rope style.
  - `data/steps.json`: daily steps (`days` array of {d, steps}), the step `goal` (10,000) and `syncedAt`.
- Files are written with keys sorted, a one-space indent, non-ASCII characters escaped (`Unterf\u00f6hring`) and no final newline, so diffs stay small. Python's `json.dumps(obj, sort_keys=True, indent=1)` gives exactly this.
- Climbing grades are stored in UIAA; the page converts to French or US for display.
- Grades and rope styles logged on the Climbing tab are written straight into the session files.

## Climbing grades: the workaround
COROS does not pass per-route grades or lead vs top rope through the connector or FIT files (only the session's hardest grade). But the session's **training note** does come through (getActivityDetail → "Workout Note").

Convention:
- One route per line, in the order climbed, e.g. `6+ top rope`, `6- lead`, `5 lead`.
- Arabic numerals map to UIAA (6+ = VI+, 6- = VI-, 5 = V).
- Grades already logged on the dashboard are never overwritten; if a note disagrees with the dashboard or the route count doesn't match the watch, ask.

## On "sync my activities"
Work in this repository, in a Claude Code session with the COROS connector on.
1. querySportRecords from 3 days before `syncedAt` in `data/activities.json` to today (all sports); skip labelIds already stored. The watch sometimes uploads late, so the overlap catches activities that arrived after the last sync.
2. New climbs (800): getActivityDetail (hardest grade, note) + queryActivityLapData (routes = laps with elevation gain ≥ 3 m); create `data/climbing-sessions/<labelId>.json` with `source: "coros"`; fill grades from the note where present.
3. New hikes: getActivityDetail for elevation gain/loss.
4. Add everything else to `items` in `data/activities.json` and update `syncedAt`.
5. queryDailyHealthData for the days since the last sync plus 3; update `data/steps.json` (replace earlier partial values) and its `syncedAt`. Never store a day with 0 steps or a missing day: the watch hasn't uploaded it yet.
6. Run `npm test`, check the dashboard, and commit the data changes.

## Daily sync
A scheduled task in the Claude desktop app ("Activity dashboard: daily COROS sync") does these steps every morning at about 7:00, commits the data to `main` and pushes it. It runs while the Claude app is open on this computer; if the app was closed, it runs the next time the app opens. Nothing is lost when a run is missed, because each sync fetches everything since the last one. Manage it under "Scheduled" in the app's sidebar.

## Later
- Recovery tab (sleep, resting HR, HRV, training load).
- Mobility is currently recorded as Pilates; possibly a custom "Mobility" sport mode later.
- The step goal can't be set on the watch: COROS daily goals are only active calories and exercise time.
- Supabase (login and a database) if logging grades from a phone becomes important; see Pocket Plan's ROADMAP.md for the same plan.
