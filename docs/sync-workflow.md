# Activity Dashboard: sync workflow

Dashboard: https://claude.ai/artifact/UUhT8epo8bSEZUvUMwhe35 (tabs: Overview, Climbing, Hiking, Walking (steps goal + walks), Cycling)

## Data
- Source: COROS watch (APEX 4) via the COROS connector. History starts 5 Aug 2026.
- Page database: `feeds/activities` holds all non-climbing activities (one doc, `items` array); `sessions/<labelId>` holds each climbing session with per-route height, time, HR, grade and rope style; `feeds/steps` holds daily steps (`days` array of {d, steps}) and the step `goal` (10,000).
- Climbing grades are stored in UIAA; the page converts to French or US for display.

## Climbing grades: the workaround
COROS does not pass per-route grades or lead vs top rope through the connector or FIT files (only the session's hardest grade). But the session's **training note** does come through (getActivityDetail → "Workout Note").

Convention:
- One route per line, in the order climbed, e.g. `6+ top rope`, `6- lead`, `5 lead`.
- Arabic numerals map to UIAA (6+ = VI+, 6- = VI-, 5 = V).
- Grades already logged on the dashboard are never overwritten; if a note disagrees with the dashboard or the route count doesn't match the watch, ask.

## On "sync my activities"
1. querySportRecords from the last synced date to today (all sports).
2. New climbs (800): getActivityDetail (hardest grade, note) + queryActivityLapData (routes = laps with elevation gain ≥ 3 m); create `sessions/<labelId>`; fill grades from the note where present.
3. New hikes: getActivityDetail for elevation gain/loss.
4. Append everything else to `feeds/activities` and update `syncedAt`.
5. queryDailyHealthData for the days since the last sync; update `feeds/steps` (replace today's partial value).
6. Export the database to `data/` and commit with the code.

## Later
- Recovery tab (sleep, resting HR, HRV, training load).
- Mobility is currently recorded as Pilates; possibly a custom "Mobility" sport mode later.
- The step goal can't be set on the watch: COROS daily goals are only active calories and exercise time.
