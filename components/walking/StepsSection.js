"use client";
// Daily steps: today, streaks, a scrollable history against the goal, and days below the goal by month.
import Delta from "@/components/Delta";
import ScrollChart from "@/components/charts/ScrollChart";
import { stepStats } from "@/lib/steps";
import { MONTHS, dt, fmtDay, fmtN, fmtShort } from "@/lib/dates";

export default function StepsSection({ steps, today }) {
  const s = stepStats(steps, today);
  if (!s) return <section><h2>Daily steps</h2><div className="panel empty">No step data yet.</div></section>;
  const t = s.today ? s.today.steps : 0;

  return (
    <>
      <section>
        <div><h2>Daily steps</h2><p className="sub">Goal: {fmtN(s.goal)} steps a day. Change it in the COROS app too, so your watch nudges you.</p></div>
        <div className="panel today">
          <div className="today-top">
            <div>
              <div className="eyebrow">Today</div>
              <div className="today-n num">{s.today ? <>{fmtN(t)}<small>/ {fmtN(s.goal)}</small></> : <>–<small>not synced yet</small></>}</div>
            </div>
            <div className="today-left">{s.today ? (t >= s.goal ? "Goal reached" : `${fmtN(s.goal - t)} to go · as of the last sync`) : ""}</div>
          </div>
          <div className="tbar"><i style={{ width: `${Math.min(100, (t / s.goal) * 100)}%` }} /></div>
        </div>
        <dl className="stats panel">
          <div><dt>Goal reached</dt><dd className="num">{s.hit28}<small>/ {s.days28} days</small></dd><div className="delta">last 4 weeks</div></div>
          <div><dt>Current streak</dt><dd className="num">{s.streak}<small>day{s.streak === 1 ? "" : "s"}</small></dd><div className="delta">{s.streak ? "keep it going" : "starts with the next 10k day"}</div></div>
          <div><dt>Daily average</dt><dd className="num">{fmtN(s.avg)}</dd><div className="delta">{s.prevAvg ? <Delta now={s.avg} before={s.prevAvg} /> : null}</div></div>
          <div><dt>Best streak</dt><dd className="num">{s.best}<small>days</small></dd><div className="delta">{s.bestEnd ? `ended ${fmtShort(s.bestEnd)}` : ""}</div></div>
        </dl>
        <div className="legend">
          <span><i className="sw" style={{ background: "var(--c-walk)" }} />Goal reached</span>
          <span><i className="sw" style={{ background: "var(--none)" }} />Below goal</span>
          <span><i className="sw" style={{ height: 0, borderTop: "2px dashed var(--fg)" }} />{fmtN(s.goal)}</span>
        </div>
        <StepsChart s={s} today={today} />
        {s.top && (
          <p className="foot">
            Since {fmtShort(s.done[0].d)} you reached the goal on {s.hitAll} of {s.done.length} days. Best day: {fmtN(s.top.steps)} steps on {fmtShort(s.top.d)}.
          </p>
        )}
      </section>
      <section>
        <div><h2>Days below the goal, by month</h2><p className="sub">Full days only; today isn&apos;t counted until it&apos;s over.</p></div>
        <div className="months">
          {s.months.map((m) => (
            <div className="panel mon" key={m.key}>
              <div className="mon-h"><b>{MONTHS[m.month]}</b><span>{m.days.length} day{m.days.length > 1 ? "s" : ""} tracked{m.soFar ? " so far" : ""}</span></div>
              <div className={`mon-n num${m.below ? "" : " zero"}`}>{m.below}<small>day{m.below === 1 ? "" : "s"} below 10k</small></div>
              <div className="mon-strip" aria-hidden="true">
                {m.days.map((x) => <i key={x.d} className={x.steps < s.goal ? "miss" : ""} title={`${fmtShort(x.d)}: ${fmtN(x.steps)}`} />)}
              </div>
              <div className="s-meta">
                Goal reached on {m.days.length - m.below} of {m.days.length} days ({Math.round(((m.days.length - m.below) / m.days.length) * 100)}%)
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function StepsChart({ s, today }) {
  const max = Math.max(s.goal * 1.2, ...s.history.map((x) => x.steps));
  const stepY = max > 30000 ? 10000 : 5000;
  const top = Math.ceil(max / stepY) * stepY;
  const axis = [];
  for (let v = 0; v <= top; v += stepY) axis.push({ v, text: v ? v / 1000 + "k" : "0" });
  axis.push({ v: s.goal, text: s.goal / 1000 + "k", strong: true });

  const bars = s.history.map((x) => {
    const isToday = x.d === today;
    const hit = x.steps >= s.goal;
    const d = dt(x.d);
    return {
      key: x.d,
      value: x.steps,
      fill: isToday ? "var(--surface)" : hit ? "var(--c-walk)" : "var(--none)",
      dashed: isToday ? "var(--c-walk)" : null,
      tick: isToday ? "Today" : d.getDay() === 1 ? String(d.getDate()) : null,
      title: `${fmtDay(x.d)}: ${fmtN(x.steps)} steps`,
      read: (
        <>
          {fmtDay(x.d)}{isToday ? " (so far)" : ""}
          <b className="num">{x.steps.toLocaleString("en-GB")}</b>{" "}
          {hit ? <span className="ok">✓ goal</span> : `· ${(s.goal - x.steps).toLocaleString("en-GB")} short`}
        </>
      ),
    };
  });

  return (
    <ScrollChart
      id="stepsChart"
      bars={bars}
      axis={axis}
      top={top}
      colW={22}
      barW={13}
      step={7}
      label="Daily steps against the goal"
      hint="Tap a bar to see that day"
      extra={(y, W) => <line x1="0" x2={W} y1={y(s.goal)} y2={y(s.goal)} stroke="var(--fg)" strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" />}
    />
  );
}
