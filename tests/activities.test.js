import { test } from "node:test";
import assert from "node:assert/strict";
import { allActs, changePct, mix, ranges, trips, weeksFrom } from "../lib/activities.js";
import { stepStats } from "../lib/steps.js";
import { addDays, dur, monday, toSecs } from "../lib/dates.js";

test("date helpers", () => {
  assert.equal(addDays("2026-02-28", 1), "2026-03-01");
  assert.equal(monday("2026-10-15"), "2026-10-12"); // a Thursday
  assert.equal(monday("2026-10-12"), "2026-10-12");
  assert.equal(toSecs("28:29"), 1709);
  assert.equal(toSecs("1:02:03"), 3723);
  assert.equal(dur(3900), "1h 05m");
  assert.equal(dur(600), "10 min");
});

test("the last 4 weeks are today and the 27 days before", () => {
  assert.deepEqual(ranges("2026-10-15"), { from: "2026-09-18", to: "2026-10-15", pFrom: "2026-08-21", pTo: "2026-09-17" });
  assert.equal(changePct(12, 10), 20);
  assert.equal(changePct(5, 0), null);
});

test("climbing sessions join the other activities, sorted by time", () => {
  const acts = [{ d: "2026-09-02", t: 200, s: "walk", sec: 60 }];
  const sessions = [{ id: "c", date: "2026-09-01", start: 100, duration: "30:00", routes: [{}, {}], hardest: "VI" }];
  const all = allActs(acts, sessions);
  assert.deepEqual(all.map((a) => a.s), ["climb", "walk"]);
  assert.equal(all[0].sec, 1800);
  assert.equal(all[0].routes, 2);
});

test("weeks run Monday to Sunday up to this week, even with no recent activity", () => {
  const ws = weeksFrom([{ d: "2026-09-30" }, { d: "2026-10-01" }], "2026-10-15");
  assert.deepEqual(ws.map((w) => w.start), ["2026-09-28", "2026-10-05", "2026-10-12"]);
  assert.equal(ws[0].items.length, 2);
  assert.equal(ws[2].items.length, 0);
});

test("activity mix percentages add up to exactly 100", () => {
  const list = [{ s: "walk", sec: 1 }, { s: "walk", sec: 1 }, { s: "hike", sec: 1 }, { s: "bike", sec: 1 }, { s: "padel", sec: 1 }, { s: "pilates", sec: 1 }];
  const m = mix(list, "count");
  assert.equal(m.rows.reduce((a, r) => a + r.pct, 0), 100);
  assert.equal(m.rows[0].g, "walk");
  assert.equal(m.rows.find((r) => r.g === "other").v, 2);
});

test("hikes on consecutive days make one trip; short ones are ignored", () => {
  const h = (d, t, up, sec = 3600) => ({ d, t, s: "hike", p: "Alps", km: 10, up, sec });
  const ts = trips([h("2026-08-10", 1, 500), h("2026-08-11", 2, 700), h("2026-08-11", 3, 100), h("2026-08-20", 4, 300), h("2026-08-21", 5, 50, 100)]);
  assert.equal(ts.length, 2);
  assert.equal(ts[0].up, 1300);
  assert.equal(ts[0].days.length, 2);
  assert.equal(ts[0].days[1].n, 2);
  assert.equal(ts[1].items.length, 1, "a 100-second 'hike' doesn't count");
});

test("steps: streaks, today and days below the goal", () => {
  const days = [
    { d: "2026-10-10", steps: 12000 },
    { d: "2026-10-11", steps: 8000 },
    { d: "2026-10-12", steps: 11000 },
    { d: "2026-10-13", steps: 10000 },
    { d: "2026-10-14", steps: 15000 },
    { d: "2026-10-15", steps: 4000 },
  ];
  const s = stepStats({ goal: 10000, days }, "2026-10-15");
  assert.equal(s.today.steps, 4000);
  assert.equal(s.streak, 3, "today isn't over, so it doesn't break the streak");
  assert.equal(s.best, 3);
  assert.equal(s.bestEnd, "2026-10-14");
  assert.equal(s.months[0].below, 1);
  assert.equal(s.months[0].soFar, true);
  assert.equal(s.top.steps, 15000);
  assert.equal(stepStats({ days: [] }, "2026-10-15"), null);
});
