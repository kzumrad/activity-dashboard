// Dates are stored as "YYYY-MM-DD" strings, which sort in date order.
// Times on the watch are seconds; `t` / `start` are Unix timestamps.

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const pad = (n) => String(n).padStart(2, "0");
export const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`; // m is 0-11
// Noon avoids daylight-saving surprises when adding days.
export const dt = (d) => new Date(d + "T12:00");

export function todayStr(now = new Date()) {
  return ymd(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(d, n) {
  const x = dt(d);
  x.setDate(x.getDate() + n);
  return ymd(x.getFullYear(), x.getMonth(), x.getDate());
}

// The Monday of d's week.
export function monday(d) {
  const x = dt(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return ymd(x.getFullYear(), x.getMonth(), x.getDate());
}

export const fmtLong = (d) => dt(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
export const fmtShort = (d) => dt(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
export const fmtDay = (d) => dt(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

// 125 -> "2:05"
export function mmss(s) {
  s = Math.round(s);
  return Math.floor(s / 60) + ":" + pad(s % 60);
}

// 3900 -> "1h 05m", 600 -> "10 min"
export function dur(s) {
  s = Math.round(s);
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h}h ${pad(m)}m` : `${m} min`;
}

export const hrs = (s) => (s / 3600).toFixed(s >= 36000 ? 0 : 1) + " h";

// "28:29" or "1:02:03" -> seconds
export function toSecs(t) {
  if (!t) return 0;
  const p = t.split(":").map(Number);
  return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
}

export const fmtN = (n) => Math.round(n).toLocaleString("en-GB");
