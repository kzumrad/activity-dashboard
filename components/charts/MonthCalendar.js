"use client";
// A month grid, Monday first, with ‹ › to change month.
// renderDay(dateKey, dayNumber, isToday) returns a button for an active day, or null for a plain day.
import { DOW, MONTHS, ymd } from "@/lib/dates";

export default function MonthCalendar({ view, setView, first, last, sub, renderDay, today, label }) {
  const { y, m } = view;
  const at = y * 12 + m;
  const move = (n) => {
    const v = at + n;
    setView({ y: Math.floor(v / 12), m: v % 12 });
  };
  const lead = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();

  return (
    <div className="panel cal">
      <div className="cal-head">
        <div>
          <div className="cal-title">{MONTHS[m]} {y}</div>
          <div className="cal-sub">{sub}</div>
        </div>
        <div className="nav">
          <button type="button" aria-label="Previous month" disabled={at <= first} onClick={() => move(-1)}>‹</button>
          <button type="button" aria-label="Next month" disabled={at >= last} onClick={() => move(1)}>›</button>
        </div>
      </div>
      <div className="grid" role="grid" aria-label={label}>
        {DOW.map((d) => <div className="dow" key={d}>{d}</div>)}
        {Array.from({ length: lead }, (_, i) => <div className="day out" key={"o" + i} />)}
        {Array.from({ length: days }, (_, i) => {
          const key = ymd(y, m, i + 1);
          const isToday = key === today;
          return renderDay(key, i + 1, isToday) || <div className={`day${isToday ? " today" : ""}`} key={key}>{i + 1}</div>;
        })}
      </div>
    </div>
  );
}

// Month number (year * 12 + month) of a "YYYY-MM-DD" date, for first/last.
export const monthIndex = (d) => +d.slice(0, 4) * 12 + +d.slice(5, 7) - 1;
