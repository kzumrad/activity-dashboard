// Activity maths shared by the tabs. No screens here, so it can be tested with `npm test`.
//
// An activity (from data/activities.json) looks like:
//   { id, d: "2026-08-05", t: <unix seconds>, s: "walk", p: "Munich", sec, km?, up?, down?, hr?, kcal? }
// `s` is the sport: walk, hike, bike, pilates, padel...; climbing sessions live in their own files.
import { addDays, monday, toSecs } from "./dates.js";

export const SPORTS = {
  climb: { name: "Climbing", col: "var(--c-climb)" },
  hike: { name: "Hiking", col: "var(--c-hike)" },
  walk: { name: "Walking", col: "var(--c-walk)" },
  bike: { name: "Cycling", col: "var(--c-bike)" },
  other: { name: "Other", col: "var(--c-other)" },
};
export const SPORT_ORDER = ["climb", "hike", "walk", "bike", "other"];
const OTHER_NAMES = { pilates: "Pilates", padel: "Padel", badminton: "Badminton" };

// The colour group an activity belongs to.
export const group = (s) => (SPORTS[s] ? s : "other");
export const otherName = (s) => OTHER_NAMES[s] || s;

export function actName(a) {
  if (a.s === "climb") return "Indoor climbing";
  if (a.s === "hike") return `Hike · ${a.p}`;
  if (a.s === "walk") return "Walk";
  if (a.s === "bike") return "Ride";
  return otherName(a.s);
}

// Background for a day: one sport's colour, or diagonal stripes of each sport.
export function dayFill(groups) {
  if (groups.length === 1) return SPORTS[groups[0]].col;
  const n = groups.length;
  return `linear-gradient(135deg,${groups.map((g, i) => `${SPORTS[g].col} ${(i / n) * 100}% ${((i + 1) / n) * 100}%`).join(",")})`;
}

export const sum = (xs, f) => xs.reduce((t, x) => t + (f(x) || 0), 0);

export function median(xs) {
  const v = [...xs].sort((a, b) => a - b);
  return v.length ? v[Math.floor(v.length / 2)] : 0;
}

// Climbing sessions turned into activities, so they show up in the overview.
export function climbActs(sessions) {
  return sessions.map((s) => ({
    id: s.id, d: s.date, t: s.start, s: "climb", p: "Indoor climb",
    sec: toSecs(s.duration), routes: (s.routes || []).length, hardest: s.hardest,
  }));
}

export function allActs(acts, sessions) {
  return [...acts, ...climbActs(sessions)].sort((a, b) => a.t - b.t);
}

// The last 4 weeks (today and the 27 days before) and the 4 weeks before that.
export function ranges(today) {
  return { from: addDays(today, -27), to: today, pFrom: addDays(today, -55), pTo: addDays(today, -28) };
}
export const inRange = (a, from, to) => a.d >= from && a.d <= to;

// Percent change from b to a, or null when there's nothing to compare with.
export function changePct(a, b) {
  if (!b) return null;
  return Math.round(((a - b) / b) * 100);
}

// Monday-to-Sunday weeks from the first activity to this week, each with its activities.
export function weeksFrom(list, today) {
  if (!list.length) return [];
  const sorted = [...list].sort((a, b) => (a.d < b.d ? -1 : 1));
  const lastDay = today > sorted[sorted.length - 1].d ? today : sorted[sorted.length - 1].d;
  const weeks = [];
  for (let w = monday(sorted[0].d); w <= monday(lastDay); w = addDays(w, 7)) {
    weeks.push({ start: w, end: addDays(w, 6), items: [] });
  }
  sorted.forEach((a) => {
    const w = weeks.find((x) => a.d >= x.start && a.d <= x.end);
    if (w) w.items.push(a);
  });
  return weeks;
}

// Sports present, in the usual order.
export function presentGroups(list) {
  return SPORT_ORDER.filter((g) => list.some((a) => group(a.s) === g));
}

// Activity mix: one row per group, sorted largest first, with whole percentages
// that add up to exactly 100 (largest-remainder rounding).
export function mix(list, by) {
  const val = (a) => (by === "count" ? 1 : a.sec);
  const tot = {};
  list.forEach((a) => {
    tot[group(a.s)] = (tot[group(a.s)] || 0) + val(a);
  });
  const total = Object.values(tot).reduce((a, b) => a + b, 0);
  const rows = Object.entries(tot)
    .sort((a, b) => b[1] - a[1])
    .map(([g, v]) => ({ g, v, raw: total ? (v / total) * 100 : 0 }));
  rows.forEach((r) => (r.pct = Math.floor(r.raw)));
  let rest = total ? 100 - sum(rows, (r) => r.pct) : 0;
  [...rows].sort((a, b) => b.raw - b.pct - (a.raw - a.pct)).forEach((r) => {
    if (rest > 0) {
      r.pct++;
      rest--;
    }
  });
  return { rows, total };
}

// Hikes on consecutive days grouped into trips, each with per-day totals.
export function trips(acts) {
  const hikes = acts.filter((a) => a.s === "hike" && a.sec >= 300).sort((a, b) => a.t - b.t);
  const out = [];
  hikes.forEach((h) => {
    const t = out[out.length - 1];
    if (t && h.d <= addDays(t.end, 1)) {
      t.items.push(h);
      t.end = h.d;
    } else out.push({ start: h.d, end: h.d, items: [h] });
  });
  return out.map((t) => {
    const byDay = {};
    t.items.forEach((h) => {
      const d = (byDay[h.d] = byDay[h.d] || { d: h.d, km: 0, up: 0, down: 0, sec: 0, n: 0, p: h.p });
      d.km += h.km || 0;
      d.up += h.up || 0;
      d.down += h.down || 0;
      d.sec += h.sec;
      d.n++;
    });
    return {
      ...t,
      places: [...new Set(t.items.map((h) => h.p))],
      km: sum(t.items, (h) => h.km),
      up: sum(t.items, (h) => h.up),
      sec: sum(t.items, (h) => h.sec),
      days: Object.values(byDay).sort((a, b) => (a.d < b.d ? -1 : 1)),
    };
  });
}

// Totals for one group's activities, used by the activity cards.
export function totals(items) {
  return {
    n: items.length,
    sec: sum(items, (a) => a.sec),
    km: sum(items, (a) => a.km),
    up: sum(items, (a) => a.up),
    routes: sum(items, (a) => a.routes),
  };
}
