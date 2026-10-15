"use client";
// Climbing days: blue when every route is logged, orange when some still need grades.
import { useEffect, useState } from "react";
import MonthCalendar, { monthIndex } from "@/components/charts/MonthCalendar";
import { byDate, dayState, label, sessHardest } from "@/lib/climbing";
import { fmtLong, pad } from "@/lib/dates";

export default function ClimbCalendar({ sessions, scale, today, selected, onSelect }) {
  const start = selected || today;
  const [view, setView] = useState({ y: +start.slice(0, 4), m: +start.slice(5, 7) - 1 });
  // A day picked elsewhere (e.g. a session just added) brings the calendar to its month.
  useEffect(() => {
    if (selected) setView({ y: +selected.slice(0, 4), m: +selected.slice(5, 7) - 1 });
  }, [selected]);
  const map = byDate(sessions);
  const prefix = `${view.y}-${pad(view.m + 1)}`;
  const days = Object.keys(map).filter((d) => d.startsWith(prefix));
  const routes = days.reduce((t, d) => t + map[d].reduce((u, s) => u + (s.routes || []).length, 0), 0);

  return (
    <MonthCalendar
      view={view}
      setView={setView}
      first={monthIndex(sessions[0]?.date || today)}
      last={monthIndex(today)}
      sub={days.length ? `${days.length} climbing day${days.length > 1 ? "s" : ""} · ${routes} routes` : "No climbing this month"}
      today={today}
      label="Climbing days"
      renderDay={(key, n, isToday) => {
        const list = map[key];
        if (!list) return null;
        const g = Math.max(...list.map(sessHardest));
        const st = dayState(list);
        return (
          <button
            type="button"
            key={key}
            className={`day ${st}${isToday ? " today" : ""}`}
            aria-pressed={key === selected}
            aria-label={`${fmtLong(key)}, hardest ${g >= 0 ? label(g, scale) : "unknown"}, ${st === "done" ? "all routes logged" : "needs grades"}`}
            onClick={() => onSelect(key)}
          >
            <span>{n}</span>
            {g >= 0 && <span className="gr">{label(g, scale)}</span>}
            {list.length > 1 && <span className="cdots">{list.map((s) => <i key={s.id} />)}</span>}
          </button>
        );
      }}
    />
  );
}
