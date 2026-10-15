# Activity Dashboard

A personal activity dashboard built from COROS watch data (APEX 4).

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 20 or later).

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

- `npm test` checks the calculations (weeks, trips, steps streaks, grades) and the data files.
- `npm run build` runs the tests and builds the app.

## Tabs
- **Overview**: last 4 weeks summary with comparisons, activity calendar colored by sport, weekly active hours, per-activity totals with weekly breakdowns.
- **Climbing**: hardest grade from the watch, per-route log (grade + lead / top rope), grade chart, climbing calendar, grade scale switch (UIAA / French / US).
- **Hiking**: trips (hikes on consecutive days grouped), biggest days by height climbed.
- **Walking**: daily steps vs the 10,000 goal (streaks, scrollable history, days below goal by month) and recorded walks.
- **Cycling**: rides, weekly distance (scrollable), where you ride.

## Where the data lives
In the JSON files in `data/`, in this repository. Nothing is sent to a server.

- New activities come in when you ask Claude to **sync your activities**: it reads your watch through the COROS connector and updates the files. See [docs/sync-workflow.md](docs/sync-workflow.md).
- Grades you log on the Climbing tab are saved into that session's file in `data/climbing-sessions/`. Commit them to keep them.

The app is meant to run on your own computer: the data includes places and heart rate, so it isn't published online.
The older one-page version is still at https://claude.ai/artifact/UUhT8epo8bSEZUvUMwhe35 (private), but it no longer receives syncs.

## How the code is organised

| Path | What it is |
| --- | --- |
| `app/` | One page per tab (`page.js` is Overview; `climbing/`, `hiking/`, `walking/`, `cycling/`), the shared layout, `globals.css` (the only style file) and `actions.js` (saving the climbing log). |
| `components/` | The screens: a folder per tab, plus `charts/` (bar charts, scrollable history, month calendar) and shared parts. |
| `lib/` | Calculations with no screen code, so they can be tested: `activities.js`, `steps.js`, `climbing.js`, `dates.js`, and `data-files.js` (reading and writing `data/`). |
| `data/` | The dashboard's data (see above). |
| `tests/` | Checks for everything in `lib/`. |
| `docs/sync-workflow.md` | How syncing from COROS works, including the training-note convention for climbing grades. |
| `CHANGELOG.md` | What changed in each version. |
