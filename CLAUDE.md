# Activity Dashboard: Project Brief

A personal dashboard of COROS watch data (climbing, hiking, walking, cycling, steps). See README.md for the tabs and how
the code is organised, and docs/sync-workflow.md for how "sync my activities" works.

The person building this is not a professional developer and is using Claude to write the code. Prefer simple, readable
code and popular tools. Explain decisions briefly, and never add complexity that isn't needed.

## Tech stack
- Next.js (React), plain JavaScript, same setup as the darakhti-tut and pocket-plan projects. One plain CSS file
  (`app/globals.css`). Charts are hand-drawn SVG; no chart library.
- Data is the JSON files in `data/`, read by the pages on the server. The Climbing tab writes route grades back through
  the server actions in `app/actions.js`. No database, no login. Runs locally only (the data is personal).

## Rules for the code
- Calculations live in `lib/` with no React, and changes to them get a test in `tests/` (`npm test`).
- Only `lib/data-files.js` reads or writes `data/`. Keep its file format (sorted keys, one-space indent, no final newline).
- Check everything the page sends before writing it (`cleanRoutes`, `validId`, `validDate` in `lib/climbing.js`).
- Never overwrite route grades already logged when syncing (see docs/sync-workflow.md).

## Working agreements for Claude
- Work on one step at a time and say how to run and test it.
- Add an entry to CHANGELOG.md for each version, and commit to Git after each working step (code and data).
- Ask before adding a new library or changing the stack.
