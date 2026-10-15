"use client";
// Overview tab: the last 4 weeks at a glance, the activity calendar, weekly hours and per-sport cards.
import { SPORTS, allActs, dayFill, presentGroups, ranges, sum, group, weeksFrom } from "@/lib/activities";
import { addDays, fmtShort } from "@/lib/dates";
import useToday from "@/components/useToday";
import useStored from "@/components/useStored";
import Delta from "@/components/Delta";
import ActivityMix from "@/components/overview/ActivityMix";
import ActivityCalendar from "@/components/overview/ActivityCalendar";
import WeeklyBars from "@/components/charts/WeeklyBars";
import CategoryCards from "@/components/CategoryCards";

export default function OverviewScreen({ acts, sessions }) {
  const today = useToday();
  const [scale] = useStored("gradeScale", "uiaa");
  const all = allActs(acts, sessions);
  if (!all.length) return <div className="panel empty">No activities yet.</div>;

  const { from, pFrom, pTo } = ranges(today);
  const cur = all.filter((a) => a.d >= from && a.d <= today);
  const prev = all.filter((a) => a.d >= pFrom && a.d <= pTo);
  const activeDays = new Set(cur.map((a) => a.d)).size;
  const present = presentGroups(all);
  const weeks = weeksFrom(all, today);

  return (
    <div className="tab">
      <section>
        <div><h2>Last 4 weeks</h2><p className="sub">{fmtShort(from)} – {fmtShort(today)}</p></div>
        <div className="ovsum">
          <ActiveDays cur={cur} today={today} from={from} days={activeDays} prevDays={new Set(prev.map((a) => a.d)).size} />
          <ActivityMix list={cur} />
        </div>
      </section>

      <section>
        <div><h2>Activity calendar</h2><p className="sub">Days are colored by what you did. Tap a day to see the details.</p></div>
        <div className="legend">
          {present.map((g) => <span key={g}><i className="sw" style={{ background: SPORTS[g].col }} />{SPORTS[g].name}</span>)}
        </div>
        <ActivityCalendar all={all} today={today} scale={scale} />
      </section>

      <section>
        <div><h2>Active time per week</h2><p className="sub">Hours by activity, Monday to Sunday.</p></div>
        <div className="panel chart">
          <WeeklyBars
            weeks={weeks}
            series={present.map((g) => ({ key: g, ...SPORTS[g] }))}
            valueOf={(w, g) => sum(w.items.filter((a) => group(a.s) === g), (a) => a.sec) / 3600}
            unit="h"
            label="Weekly active hours by activity"
          />
        </div>
      </section>

      <section>
        <div><h2>By activity</h2><p className="sub">Totals for the last 4 weeks. Tap one for a week-by-week breakdown.</p></div>
        <CategoryCards items={cur} groups={present} weeks={weeks.slice(-4)} period="last 4 weeks" scale={scale} emptyText="Nothing recorded in the last 4 weeks." />
      </section>
    </div>
  );
}

// "18 of 28 days", with a strip of the 28 days colored by sport.
function ActiveDays({ cur, today, from, days, prevDays }) {
  const byDay = {};
  cur.forEach((a) => (byDay[a.d] = byDay[a.d] || new Set()).add(group(a.s)));
  const strip = [];
  for (let i = 27; i >= 0; i--) {
    const key = addDays(today, -i);
    strip.push({ key, gs: byDay[key] ? [...byDay[key]] : [] });
  }
  return (
    <div className="panel ovdays">
      <div className="eyebrow">Active days</div>
      <div className="ovd-n num">{days}<small>of 28 days</small></div>
      <div className="delta"><Delta now={days} before={prevDays} /></div>
      <div className="ovd-strip" aria-hidden="true">
        {strip.map(({ key, gs }) => (
          <i
            key={key}
            className={gs.length ? "on" : ""}
            style={gs.length ? { background: dayFill(gs) } : undefined}
            title={`${fmtShort(key)}${gs.length ? ": " + gs.map((g) => SPORTS[g].name).join(", ") : ""}`}
          />
        ))}
      </div>
      <div className="ovd-cap"><span>{fmtShort(from)}</span><span>today</span></div>
    </div>
  );
}
