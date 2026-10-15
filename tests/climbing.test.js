import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { cleanRoutes, dayState, heroStats, label, manualSession, sessHardest, validId } from "../lib/climbing.js";
import { deleteSessionFile, loadSessions, readSession, saveSession } from "../lib/data-files.js";

test("grades convert between scales", () => {
  assert.equal(label("VI+", "uiaa"), "VI+");
  assert.equal(label("VI+", "french"), "6a+");
  assert.equal(label("VI+", "yds"), "5.10c");
  assert.equal(label("", "french"), "–");
});

test("a session's hardest grade is the watch's or a harder logged route", () => {
  assert.equal(label(sessHardest({ hardest: "VI", routes: [{ grade: "VI+" }] })), "VI+");
  assert.equal(label(sessHardest({ hardest: "VII", routes: [{ grade: "VI+" }] })), "VII");
  assert.equal(sessHardest({ routes: [] }), -1);
});

test("a day is done when every route has a grade and a rope style", () => {
  assert.equal(dayState([{ routes: [{ grade: "V", rope: "lead" }] }]), "done");
  assert.equal(dayState([{ routes: [{ grade: "V", rope: null }] }]), "todo");
  assert.equal(dayState([{ routes: [] }]), "todo");
});

test("summary: hardest lead and top rope, most climbed", () => {
  const h = heroStats([
    { date: "2026-09-01", hardest: "VI", routes: [{ grade: "V", rope: "lead" }, { grade: "VI", rope: "toprope" }, { grade: null, rope: null }] },
    { date: "2026-09-08", hardest: "VI+", routes: [{ grade: "V", rope: "lead" }] },
  ]);
  assert.equal(label(h.top), "VI+");
  assert.equal(h.firstTop.date, "2026-09-08");
  assert.equal(h.routes, 4);
  assert.equal(h.logged, 3);
  assert.equal(label(h.most), "V");
  assert.equal(label(h.lead), "V");
  assert.equal(label(h.toprope), "VI");
});

test("only allowed values are saved for a route", () => {
  assert.deepEqual(cleanRoutes([{ grade: "VI", rope: "lead", height: 15.2, extra: "x" }, { grade: "9a", rope: "solo" }]), [
    { grade: "VI", rope: "lead", height: 15.2 },
    { grade: null, rope: null },
  ]);
  assert.equal(cleanRoutes("nope"), null);
  assert.equal(validId("479414117868797957"), true);
  assert.equal(validId("../steps"), false);
});

test("sessions are saved to and read back from their files, in the repo's format", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "climb-"));
  const s = manualSession("2026-10-15", "abcde");
  assert.equal(s.id, "manual-20261015-abcde");
  saveSession(s, dir);
  const file = fs.readFileSync(path.join(dir, "climbing-sessions", s.id + ".json"), "utf8");
  assert.match(file, /^\{\n "date": "2026-10-15",\n "routes"/, "keys sorted, one-space indent");
  assert.deepEqual(readSession(s.id, dir), s);
  assert.equal(loadSessions(dir).length, 1);
  deleteSessionFile(s.id, dir);
  assert.equal(loadSessions(dir).length, 0);
});

test("the real data files load", () => {
  const sessions = loadSessions();
  assert.ok(sessions.length > 0);
  assert.ok(sessions.every((s) => s.id && s.date && Array.isArray(s.routes)));
});
