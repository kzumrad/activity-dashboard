"use client";
// Cycling tab: last 4 weeks vs the 4 before, weekly distance (scrollable), where you ride, all rides.
import useToday from "@/components/useToday";
import Delta from "@/components/Delta";
import ScrollChart from "@/components/charts/ScrollChart";
import { niceScale } from "@/components/charts/scale";
import CategoryCards from "@/components/CategoryCards";
import { inRange, median, ranges, sum, weeksFrom } from "@/lib/activities";
import { dur, fmtShort } from "@/lib/dates";

export default function CyclingScreen({ acts }) {
  const today = useToday();
  const rides = acts.filter((a) => a.s === "bike");
  if (!rides.length) return <div className="tab"><div className="panel empty">No rides yet.</div></div>;

  const { from, pFrom, pTo } = ranges(today);
  const cur = rides.filter((a) => inRange(a, from, today));
  const prev = rides.filter((a) => inRange(a, pFrom, pTo));
  const km = (xs) => sum(xs, (a) => a.km);
  const speed = (xs) => km(xs) / Math.max(0.001, sum(xs, (a) => a.sec) / 3600);
  const weeks = weeksFrom(rides, today);

  return (
    <div className="tab">
      <section>
        <div><h2>Cycling</h2><p className="sub">Last 4 weeks, compared with the 4 weeks before.</p></div>
        <dl className="stats panel">
          <div><dt>Cycled</dt><dd className="num">{km(cur).toFixed(1)}<small>km</small></dd><div className="delta"><Delta now={km(cur)} before={km(prev)} /></div></div>
          <div><dt>Rides</dt><dd className="num">{cur.length}</dd><div className="delta"><Delta now={cur.length} before={prev.length} /></div></div>
          <div><dt>Typical ride</dt><dd className="num">{median(rides.map((a) => a.km)).toFixed(1)}<small>km</small></dd><div className="delta">about {Math.round(median(rides.map((a) => a.sec)) / 60)} min</div></div>
          <div><dt>Average speed</dt><dd className="num">{speed(rides).toFixed(1)}<small>km/h</small></dd><div className="delta">fastest ride {Math.max(...rides.map((a) => a.km / (a.sec / 3600))).toFixed(1)} km/h</div></div>
        </dl>
      </section>
      <section>
        <div><h2>Kilometers cycled per week</h2><p className="sub">Monday to Sunday.</p></div>
        <WeeklyKm weeks={weeks} today={today} />
      </section>
      <section>
        <div><h2>Where you ride</h2><p className="sub">Rides by starting area, as named by your watch.</p></div>
        <Places rides={rides} />
      </section>
      <section>
        <div><h2>All rides</h2><p className="sub">Totals since your watch started recording. Tap for a week-by-week breakdown.</p></div>
        <CategoryCards items={rides} groups={["bike"]} weeks={weeks} period={`since ${fmtShort(rides[0].d)}`} emptyText="No rides yet." />
      </section>
    </div>
  );
}

function WeeklyKm({ weeks, today }) {
  const values = weeks.map((w) => sum(w.items, (a) => a.km));
  const { top, ticks } = niceScale(Math.max(1, ...values));
  const bars = weeks.map((w, i) => {
    const n = w.items.length;
    const thisWeek = w.start <= today && w.end >= today;
    return {
      key: w.start,
      value: values[i],
      fill: "var(--c-bike)",
      tick: String(+w.start.slice(8)),
      title: `Week of ${fmtShort(w.start)}: ${values[i].toFixed(1)} km`,
      read: (
        <>
          Week of {fmtShort(w.start)}{thisWeek ? " (this week)" : ""}
          <b className="num">{values[i].toFixed(1)} km</b> · {n ? `${n} ride${n > 1 ? "s" : ""}, ${dur(sum(w.items, (a) => a.sec))}` : "no rides"}
        </>
      ),
    };
  });
  return (
    <ScrollChart
      id="bikeChart"
      bars={bars}
      axis={ticks.map((v) => ({ v, text: `${v}${v === top ? " km" : ""}` }))}
      top={top}
      colW={46}
      barW={26}
      label="Kilometers cycled per week"
      hint="Tap a bar to see that week"
    />
  );
}

function Places({ rides }) {
  const places = {};
  rides.forEach((a) => {
    const k = a.p || "Unknown";
    places[k] = places[k] || { n: 0, km: 0 };
    places[k].n++;
    places[k].km += a.km || 0;
  });
  const rows = Object.entries(places).sort((a, b) => b[1].n - a[1].n);
  const max = Math.max(...rows.map((r) => r[1].n));
  return (
    <div className="panel">
      <div className="brk" style={{ borderTop: 0 }}>
        {rows.map(([k, v]) => (
          <div className="brow" key={k}>
            <span className="l">{k}</span>
            <span className="bar"><i style={{ width: `${(v.n / max) * 100}%`, background: "var(--c-bike)" }} /></span>
            <span className="v">{v.n} ride{v.n > 1 ? "s" : ""}<small>{v.km.toFixed(1)} km</small></span>
          </div>
        ))}
      </div>
    </div>
  );
}
