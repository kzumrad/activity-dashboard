// Hiking tab: totals, the biggest days by height climbed, and each trip (hikes on consecutive days).
import { sum, trips } from "@/lib/activities";
import { dur, fmtDay, fmtLong, fmtShort } from "@/lib/dates";

export default function HikingScreen({ acts }) {
  const ts = trips(acts);
  if (!ts.length) return <div className="tab"><div className="panel empty">No hikes yet.</div></div>;

  return (
    <div className="tab">
      <section>
        <div><h2>Hiking</h2><p className="sub">Hikes on consecutive days are grouped into one trip.</p></div>
        <dl className="stats panel">
          <div><dt>Trips</dt><dd className="num">{ts.length}</dd></div>
          <div><dt>Distance</dt><dd className="num">{sum(ts, (t) => t.km).toFixed(0)}<small>km</small></dd></div>
          <div><dt>Climbed</dt><dd className="num">{sum(ts, (t) => t.up).toLocaleString("en-GB")}<small>m</small></dd></div>
          <div><dt>On the trail</dt><dd className="num">{Math.round(sum(ts, (t) => t.sec) / 3600)}<small>h</small></dd></div>
        </dl>
      </section>
      <section>
        <div><h2>Biggest days</h2><p className="sub">Hiking days ranked by height climbed.</p></div>
        <div className="panel chart"><BiggestDays days={ts.flatMap((t) => t.days).sort((a, b) => b.up - a.up).slice(0, 6)} /></div>
      </section>
      <section>
        <h2>Trips</h2>
        <div className="trips">
          {[...ts].reverse().map((t) => <Trip key={t.start} t={t} />)}
        </div>
      </section>
    </div>
  );
}

function BiggestDays({ days }) {
  const W = 680, L = 150, R = 70, rowH = 32, T = 8;
  const H = T + days.length * rowH + 4;
  const max = Math.max(...days.map((d) => d.up), 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hiking days with the most elevation gain">
      {days.map((d, i) => {
        const yy = T + i * rowH;
        const w = ((W - L - R) * d.up) / max;
        return (
          <g key={d.d}>
            <text x="0" y={yy + 15} className="axis label">{fmtShort(d.d)}</text>
            <text x="0" y={yy + 28} className="axis small">{d.p}</text>
            <rect x={L} y={yy + 6} width={w} height="16" rx="4" fill="var(--c-hike)" />
            <text x={L + w + 8} y={yy + 19} className="axis value">{d.up.toLocaleString("en-GB")} m</text>
          </g>
        );
      })}
    </svg>
  );
}

function Trip({ t }) {
  const n = t.days.length;
  const range = t.start === t.end ? fmtLong(t.start) : `${fmtShort(t.start)} – ${fmtShort(t.end)}`;
  const maxUp = Math.max(...t.days.map((d) => d.up), 1);
  return (
    <div className="panel trip">
      <div className="trip-h">
        <div>
          <b>{t.places.join(" – ")}</b>
          <div className="m">{range} · {n} day{n > 1 ? "s" : ""} · {t.km.toFixed(1)} km · {dur(t.sec)}</div>
        </div>
        <div className="gain">↑ {t.up.toLocaleString("en-GB")} m<small>climbed</small></div>
      </div>
      {n > 1 && (
        <div className="prof" aria-hidden="true">
          {t.days.map((d) => <i key={d.d} style={{ height: `${Math.max(6, (d.up / maxUp) * 100)}%` }} title={`${fmtShort(d.d)}: ${d.up} m`} />)}
        </div>
      )}
      {t.days.map((d) => (
        <div className="hrow" key={d.d}>
          <div>{fmtDay(d.d)}<div className="m">{d.p}{d.n > 1 ? ` · ${d.n} parts` : ""}</div></div>
          <span className="num">{d.km.toFixed(1)} km</span>
          <span className="num">↑ {d.up} m</span>
          <span className="num hide-s">{dur(d.sec)}</span>
        </div>
      ))}
    </div>
  );
}
