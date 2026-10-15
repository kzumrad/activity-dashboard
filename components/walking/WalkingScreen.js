"use client";
// Walking tab: daily steps against the goal, then recorded walks.
import useToday from "@/components/useToday";
import Delta from "@/components/Delta";
import StepsSection from "@/components/walking/StepsSection";
import WeeklyBars from "@/components/charts/WeeklyBars";
import CategoryCards from "@/components/CategoryCards";
import { SPORTS, inRange, median, ranges, sum, weeksFrom } from "@/lib/activities";
import { fmtShort, mmss } from "@/lib/dates";

export default function WalkingScreen({ acts, steps }) {
  const today = useToday();
  const walks = acts.filter((a) => a.s === "walk");
  return (
    <div className="tab">
      <StepsSection steps={steps} today={today} />
      {walks.length ? <Walks walks={walks} today={today} /> : <div className="panel empty">No recorded walks yet.</div>}
    </div>
  );
}

function Walks({ walks, today }) {
  const { from, pFrom, pTo } = ranges(today);
  const cur = walks.filter((a) => inRange(a, from, today));
  const prev = walks.filter((a) => inRange(a, pFrom, pTo));
  const weeks = weeksFrom(walks, today);
  const real = walks.filter((a) => a.sec >= 300); // walks of 5+ minutes count for the averages
  const typicalTime = median(real.map((a) => a.sec));
  const km = (xs) => sum(xs, (a) => a.km);

  return (
    <>
      <section>
        <div><h2>Walks</h2><p className="sub">Recorded walks in the last 4 weeks, compared with the 4 weeks before.</p></div>
        <dl className="stats panel">
          <div><dt>Walked</dt><dd className="num">{km(cur).toFixed(1)}<small>km</small></dd><div className="delta"><Delta now={km(cur)} before={km(prev)} /></div></div>
          <div><dt>Walks</dt><dd className="num">{cur.length}</dd><div className="delta"><Delta now={cur.length} before={prev.length} /></div></div>
          <div><dt>Typical walk</dt><dd className="num">{median(real.map((a) => a.km)).toFixed(1)}<small>km</small></dd><div className="delta">{typicalTime ? `about ${Math.round(typicalTime / 60)} min` : ""}</div></div>
          <div><dt>Walking pace</dt><dd className="num">{mmss(sum(real, (a) => a.sec) / Math.max(0.01, km(real)))}<small>/km</small></dd><div className="delta">{(walks.length / Math.max(1, weeks.length)).toFixed(1)} walks a week</div></div>
        </dl>
      </section>
      <section>
        <div><h2>Kilometers walked per week</h2><p className="sub">Recorded walks only, Monday to Sunday.</p></div>
        <div className="panel chart">
          <WeeklyBars weeks={weeks} series={[{ key: "walk", ...SPORTS.walk }]} valueOf={(w) => km(w.items)} unit="km" height={240} label="Weekly walking distance" />
        </div>
      </section>
      <section>
        <div><h2>All walks</h2><p className="sub">Totals since your watch started recording. Tap for a week-by-week breakdown.</p></div>
        <CategoryCards items={walks} groups={["walk"]} weeks={weeks} period={`since ${fmtShort(walks[0].d)}`} emptyText="No recorded walks yet." />
      </section>
    </>
  );
}
