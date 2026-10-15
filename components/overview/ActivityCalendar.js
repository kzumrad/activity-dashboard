"use client";
// Calendar of active days, colored by sport. Tap a day to list its activities.
import { useState } from "react";
import MonthCalendar, { monthIndex } from "@/components/charts/MonthCalendar";
import { SPORTS, actName, dayFill, group } from "@/lib/activities";
import { label } from "@/lib/climbing";
import { dur, fmtDay, fmtLong, pad } from "@/lib/dates";

export default function ActivityCalendar({ all, today, scale }) {
  const lastDay = all[all.length - 1].d;
  const [view, setView] = useState({ y: +lastDay.slice(0, 4), m: +lastDay.slice(5, 7) - 1 });
  const [selected, setSelected] = useState(lastDay);
  const byDay = {};
  all.forEach((a) => (byDay[a.d] = byDay[a.d] || []).push(a));

  const prefix = `${view.y}-${pad(view.m + 1)}`;
  const monthDays = Object.keys(byDay).filter((d) => d.startsWith(prefix));
  const sub = monthDays.length
    ? `${monthDays.length} active days · ${monthDays.reduce((t, d) => t + byDay[d].length, 0)} activities`
    : "No activities this month";

  return (
    <>
      <MonthCalendar
        view={view}
        setView={setView}
        first={monthIndex(all[0].d)}
        last={monthIndex(today)}
        sub={sub}
        today={today}
        label="Activity days"
        renderDay={(key, n, isToday) => {
          const list = byDay[key];
          if (!list) return null;
          const gs = [...new Set(list.map((a) => group(a.s)))];
          return (
            <button
              type="button"
              key={key}
              className={`day act-day${isToday ? " today" : ""}`}
              style={{ background: dayFill(gs) }}
              aria-pressed={key === selected}
              aria-label={`${fmtLong(key)}: ${gs.map((g) => SPORTS[g].name).join(", ")}`}
              onClick={() => setSelected(key)}
            >
              <span>{n}</span>
            </button>
          );
        }}
      />
      {byDay[selected] && (
        <div className="panel acts">
          {byDay[selected].map((a) => <ActRow key={a.id} a={a} scale={scale} />)}
        </div>
      )}
    </>
  );
}

function ActRow({ a, scale }) {
  const meta = [fmtDay(a.d), dur(a.sec), a.hr ? a.hr + " bpm" : ""].filter(Boolean).join(" · ");
  let right;
  if (a.s === "climb") right = <>{a.routes} routes<small>{a.hardest ? "hardest " + label(a.hardest, scale) : ""}</small></>;
  else if (a.km != null) right = <>{a.km >= 10 ? a.km.toFixed(1) : a.km.toFixed(2)} km<small>{a.up ? "↑ " + a.up + " m" : ""}</small></>;
  else right = dur(a.sec);
  return (
    <div className="act">
      <i style={{ background: SPORTS[group(a.s)].col }} />
      <div><b>{actName(a)}</b><div className="m">{meta}</div></div>
      <div className="r">{right}</div>
    </div>
  );
}
