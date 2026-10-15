// Reading and writing the JSON files in data/. Runs on the server only (it uses the file system).
//
//   data/activities.json             { syncedAt, items: [...] }   everything except climbing
//   data/steps.json                  { goal, syncedAt, days: [...] }
//   data/climbing-sessions/<id>.json one climbing session and its route log
//
// "Sync my activities" (see docs/sync-workflow.md) updates these files; the Climbing tab
// writes route grades back into the session files.
import fs from "node:fs";
import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");
const sessionsDir = (dir) => path.join(dir, "climbing-sessions");

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

// Same layout as the files already in the repo: one-space indent, keys sorted, no final newline.
function writeJSON(file, value) {
  const sorted = (v) =>
    Array.isArray(v) ? v.map(sorted)
      : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, sorted(v[k])]))
        : v;
  fs.writeFileSync(file, JSON.stringify(sorted(value), null, 1));
}

export function loadActivities(dir = DATA_DIR) {
  const d = readJSON(path.join(dir, "activities.json"), {});
  return { syncedAt: d.syncedAt || null, items: (d.items || []).slice().sort((a, b) => a.t - b.t) };
}

export function loadSteps(dir = DATA_DIR) {
  return readJSON(path.join(dir, "steps.json"), null);
}

// All climbing sessions, oldest first, each with its id (the file name).
export function loadSessions(dir = DATA_DIR) {
  const d = sessionsDir(dir);
  if (!fs.existsSync(d)) return [];
  return fs
    .readdirSync(d)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ id: f.slice(0, -5), ...readJSON(path.join(d, f), {}) }))
    .filter((s) => s.date)
    .sort((a, b) => a.start - b.start);
}

// Save one session. The caller checks the id first (see validId in lib/climbing.js).
export function saveSession(session, dir = DATA_DIR) {
  const { id, ...rest } = session;
  fs.mkdirSync(sessionsDir(dir), { recursive: true });
  writeJSON(path.join(sessionsDir(dir), id + ".json"), rest);
}

export function readSession(id, dir = DATA_DIR) {
  const s = readJSON(path.join(sessionsDir(dir), id + ".json"), null);
  return s ? { id, ...s } : null;
}

export function deleteSessionFile(id, dir = DATA_DIR) {
  fs.rmSync(path.join(sessionsDir(dir), id + ".json"), { force: true });
}
