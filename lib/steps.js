// Daily steps against the goal. data/steps.json is { goal, syncedAt, days: [{ d, steps }] }.
// "Done" days are the full days before today; today is still in progress.
import { dt } from "./dates.js";
import { sum } from "./activities.js";

export function stepStats(steps, today) {
  if (!steps || !(steps.days || []).length) return null;
  const goal = steps.goal || 10000;
  const days = [...steps.days].sort((a, b) => (a.d < b.d ? -1 : 1));
  const todayRow = days.find((x) => x.d === today) || null;
  const done = days.filter((x) => x.d < today);
  const last28 = done.slice(-28);
  const prev28 = done.slice(-56, -28);

  // Current streak: goal days counting back from yesterday, plus today once it's reached.
  let streak = 0;
  for (let i = done.length - 1; i >= 0 && done[i].steps >= goal; i--) streak++;
  if (todayRow && todayRow.steps >= goal) streak++;

  let best = 0, bestEnd = null, run = 0;
  done.forEach((x) => {
    run = x.steps >= goal ? run + 1 : 0;
    if (run > best) {
      best = run;
      bestEnd = x.d;
    }
  });

  // Days below the goal, per month, newest month first.
  const byMonth = {};
  done.forEach((x) => (byMonth[x.d.slice(0, 7)] = byMonth[x.d.slice(0, 7)] || []).push(x));
  const months = Object.keys(byMonth).sort().reverse().map((k) => {
    const ds = byMonth[k];
    const d0 = dt(k + "-01");
    const daysInMonth = new Date(d0.getFullYear(), d0.getMonth() + 1, 0).getDate();
    return {
      key: k,
      month: d0.getMonth(),
      days: ds,
      below: ds.filter((x) => x.steps < goal).length,
      soFar: ds.length < daysInMonth && k === today.slice(0, 7),
    };
  });

  return {
    goal,
    today: todayRow,
    done,
    history: [...done, ...(todayRow ? [todayRow] : [])],
    hit28: last28.filter((x) => x.steps >= goal).length,
    days28: last28.length,
    avg: sum(last28, (x) => x.steps) / Math.max(1, last28.length),
    prevAvg: prev28.length ? sum(prev28, (x) => x.steps) / prev28.length : 0,
    streak,
    best,
    bestEnd,
    hitAll: done.filter((x) => x.steps >= goal).length,
    top: [...done].sort((a, b) => b.steps - a.steps)[0] || null,
    months,
  };
}
