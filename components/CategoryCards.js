"use client";
// One card per sport with its totals; tap a card for a week-by-week breakdown.
import { SPORTS, group, otherName, sum, totals } from "@/lib/activities";
import { label as gradeLabel, gi } from "@/lib/climbing";
import { dur, fmtShort, hrs } from "@/lib/dates";

const WORD = { climb: "session", hike: "hike", walk: "walk", bike: "ride", other: "session" };
const byKm = (g) => g === "walk" || g === "bike" || g === "hike";

export default function CategoryCards({ items, groups, weeks, period, scale = "uiaa", emptyText }) {
  const cards = groups.map((g) => ({ g, its: items.filter((a) => group(a.s) === g) })).filter((c) => c.its.length);
  if (!cards.length) return <div className="panel empty">{emptyText}</div>;
  return (
    <div className="cats">
      {cards.map(({ g, its }) => <Card key={g} g={g} its={its} weeks={weeks} period={period} scale={scale} />)}
    </div>
  );
}

function Card({ g, its, weeks, period, scale }) {
  const t = totals(its);
  let summary = `${t.n} ${WORD[g]}${t.n === 1 ? "" : "s"} · ${dur(t.sec)}`;
  if (g === "climb") {
    const top = Math.max(...its.map((a) => gi(a.hardest || "")));
    if (top >= 0) summary += ` · hardest ${gradeLabel(top, scale)}`;
  }
  if (g === "other") {
    const types = {};
    its.forEach((a) => (types[a.s] = (types[a.s] || 0) + 1));
    summary = Object.entries(types).map(([k, v]) => `${otherName(k)} ×${v}`).join(", ") + ` · ${dur(t.sec)}`;
  }

  let main;
  if (g === "climb") main = <>{t.routes}<small>routes</small></>;
  else if (g === "hike") main = <>{t.km.toFixed(0)} km<small>↑ {t.up.toLocaleString("en-GB")} m</small></>;
  else if (byKm(g)) main = <>{t.km.toFixed(1)} km<small>avg {(t.km / Math.max(1, t.n)).toFixed(1)} km</small></>;
  else main = <>{hrs(t.sec)}<small>active</small></>;

  // Week-by-week breakdown, newest first.
  const metric = (xs) => (byKm(g) ? sum(xs, (a) => a.km) : g === "climb" ? sum(xs, (a) => a.routes) : sum(xs, (a) => a.sec) / 3600);
  const fmtM = (v) => (g === "climb" ? `${v} routes` : byKm(g) ? `${v.toFixed(1)} km` : `${v.toFixed(1)} h`);
  const rows = weeks.map((w) => {
    const xs = w.items.filter((a) => group(a.s) === g);
    return { w, xs, v: metric(xs) };
  });
  const max = Math.max(...rows.map((r) => r.v), 0.0001);

  return (
    <details className="cat">
      <summary>
        <span className="stripe" style={{ background: SPORTS[g].col }} />
        <div><div className="nm">{SPORTS[g].name}</div><div className="sm">{summary}</div></div>
        <div className="big num">{main}</div>
        <span className="chev" aria-hidden="true">›</span>
      </summary>
      <div className="brk">
        <div className="brk-h">Week starting · {period}</div>
        {[...rows].reverse().map((r) => (
          <div className="brow" key={r.w.start}>
            <span className="l">{fmtShort(r.w.start)}</span>
            <span className="bar"><i style={{ width: `${(r.v / max) * 100}%`, background: SPORTS[g].col }} /></span>
            <span className="v">{r.xs.length ? fmtM(r.v) : "–"}<small>{r.xs.length ? r.xs.length + "×" : ""}</small></span>
          </div>
        ))}
      </div>
    </details>
  );
}
