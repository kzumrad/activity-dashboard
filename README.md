# Activity Dashboard

A personal activity dashboard built from COROS watch data (APEX 4), published as a claude.ai artifact.

Live page: https://claude.ai/artifact/UUhT8epo8bSEZUvUMwhe35 (private)

## Tabs
- **Overview**: last 4 weeks summary with comparisons, activity calendar colored by sport, weekly active hours, per-activity totals with weekly breakdowns.
- **Climbing**: hardest grade from the watch, per-route log (grade + lead / top rope), grade chart, climbing calendar, grade scale switch (UIAA / French / US).
- **Hiking**: trips (hikes on consecutive days grouped), biggest days by height climbed.
- **Walking**: daily steps vs the 10,000 goal (streaks, scrollable history, days below goal by month) and recorded walks.
- **Cycling**: rides, weekly distance (scrollable), where you ride.

## Repository layout
| Path | What it is |
| --- | --- |
| `index.html` | The dashboard page, exactly as published. |
| `data/activities.json` | Backup of all non-climbing activities (page database doc `feeds/activities`). |
| `data/steps.json` | Backup of daily steps and the step goal (`feeds/steps`). |
| `data/climbing-sessions/<id>.json` | Backup of each climbing session with its route log (`sessions/<id>`). |
| `docs/sync-workflow.md` | How syncing from COROS works, including the training-note convention for climbing grades. |

## How it runs
The page stores its data in the artifact's own database, not in this repo. The files in `data/` are backups taken at each commit, so the history of the route log and activities is kept here too.

The page only renders inside claude.ai (it reads its data through the artifact runtime). Opening `index.html` locally shows the layout with a "data isn't available" message.
