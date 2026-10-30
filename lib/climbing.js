// Climbing grades and the route log. Grades are stored in UIAA and shown in the chosen scale.
//
// A session (data/climbing-sessions/<id>.json) looks like:
//   { date, start, duration: "28:29", hardest: "VI+", source: "coros" | "manual",
//     routes: [{ grade: "VI" | null, rope: "lead" | "toprope" | null, height?, secs?, hr? }] }

export const GRADES = ["IV", "IV+", "V-", "V", "V+", "VI-", "VI", "VI+", "VII-", "VII", "VII+", "VIII-", "VIII", "VIII+"];
export const ROPES = ["lead", "toprope"];

// French and US equivalents of each UIAA grade, from Wikipedia's free-climbing comparison table
// (which cites the American Alpine Journal, Alpinist and theCrag):
// https://en.wikipedia.org/wiki/Grade_(climbing)#Free_climbing_comparison
// Wikipedia lists IV+ and V− as one row (4b, 5.5), and VIII− as French 6c/6c+.
// Conversions between scales are approximate; the climbing log itself is stored in UIAA.
export const SCALES = {
  uiaa: { name: "UIAA", labels: GRADES },
  french: { name: "French", labels: ["4a", "4b", "4b", "4c", "5a", "5b", "5c", "6a", "6a+", "6b", "6b+", "6c/6c+", "7a", "7a+"] },
  yds: { name: "US (YDS)", labels: ["5.4", "5.5", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10a", "5.10b", "5.10c", "5.10d", "5.11b", "5.11d", "5.12a"] },
};

// Position of a grade on the scale (-1 when unknown).
export const gi = (g) => GRADES.indexOf(g);

// A grade (or its position) in the chosen scale.
export function label(g, scale = "uiaa") {
  const i = typeof g === "number" ? g : gi(g);
  return i < 0 ? "–" : SCALES[scale].labels[i];
}

// Hardest grade in a session: the watch's, or a harder logged route.
export function sessHardest(s) {
  const xs = [];
  if (s.hardest) xs.push(gi(s.hardest));
  (s.routes || []).forEach((r) => r.grade && xs.push(gi(r.grade)));
  return xs.length ? Math.max(...xs) : -1;
}

export function byDate(sessions) {
  const m = {};
  sessions.forEach((s) => (m[s.date] = m[s.date] || []).push(s));
  return m;
}

// "done" when every route on the day has a grade and a rope style.
export function dayState(list) {
  const rs = list.flatMap((s) => s.routes || []);
  return rs.length && rs.every((r) => r.grade && r.rope) ? "done" : "todo";
}

// The numbers in the Climbing tab's summary.
export function heroStats(sessions) {
  const routes = sessions.flatMap((s) => s.routes || []);
  const logged = routes.filter((r) => r.grade);
  let top = -1;
  sessions.forEach((s) => (top = Math.max(top, sessHardest(s))));
  const count = {};
  logged.forEach((r) => (count[r.grade] = (count[r.grade] || 0) + 1));
  const most = Object.entries(count).sort((a, b) => b[1] - a[1] || gi(b[0]) - gi(a[0]))[0];
  const hardestWith = (rope) => {
    const xs = logged.filter((r) => r.rope === rope);
    return xs.length ? Math.max(...xs.map((r) => gi(r.grade))) : -1;
  };
  return {
    top,
    firstTop: sessions.find((s) => sessHardest(s) === top) || null,
    routes: routes.length,
    logged: logged.length,
    most: most ? gi(most[0]) : -1,
    lead: hardestWith("lead"),
    toprope: hardestWith("toprope"),
  };
}

/* ---------- checking what the page sends before it's saved ---------- */

// Session ids are the watch's number, or "manual-YYYYMMDD-xxxxx" for sessions added by hand.
export const validId = (id) => typeof id === "string" && /^[A-Za-z0-9-]{1,64}$/.test(id);
export const validDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));

// Keep only the fields a route may have, with allowed values. Returns null if the list is unusable.
export function cleanRoutes(routes) {
  if (!Array.isArray(routes) || routes.length > 100) return null;
  const num = (v) => (typeof v === "number" && isFinite(v) ? v : undefined);
  return routes.map((r) => {
    const out = {
      grade: GRADES.includes(r && r.grade) ? r.grade : null,
      rope: ROPES.includes(r && r.rope) ? r.rope : null,
    };
    for (const k of ["height", "secs", "hr"]) if (num(r && r[k]) !== undefined) out[k] = r[k];
    return out;
  });
}

export function manualSession(date, rand = Math.random().toString(36).slice(2, 7)) {
  return {
    id: "manual-" + date.replace(/-/g, "") + "-" + rand,
    date,
    start: Date.parse(date + "T18:00:00Z") / 1000,
    source: "manual",
    routes: [{ grade: null, rope: null }],
  };
}
