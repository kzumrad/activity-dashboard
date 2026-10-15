// Stacked bars, one per week (e.g. active hours by sport). Drawn as SVG; no chart library.
import { fmtShort } from "@/lib/dates";
import { niceScale } from "@/components/charts/scale";

const W = 680, L = 44, R = 12, T = 14, B = 34;

// weeks: [{ start, ... }]; series: [{ key, name, col }]; valueOf(week, key) -> number
export default function WeeklyBars({ weeks, series, valueOf, unit, height = 260, label }) {
  if (!weeks.length) return null;
  const H = height;
  const totals = weeks.map((w) => series.reduce((t, s) => t + valueOf(w, s.key), 0));
  const { top, ticks } = niceScale(Math.max(1, ...totals));
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const bw = (W - L - R) / weeks.length;
  const barW = Math.min(34, bw * 0.62);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--line)" />
          <text x={L - 8} y={y(v) + 4} textAnchor="end" className="axis">{v}{v === top ? " " + unit : ""}</text>
        </g>
      ))}
      {weeks.map((w, i) => {
        const cx = L + bw * i + bw / 2;
        let acc = 0;
        return (
          <g key={w.start}>
            {series.map((s) => {
              const v = valueOf(w, s.key);
              if (!v) return null;
              const rect = (
                <rect key={s.key} x={cx - barW / 2} y={y(acc + v)} width={barW} height={Math.max(0, y(acc) - y(acc + v))} fill={s.col}>
                  <title>{`Week of ${fmtShort(w.start)}: ${s.name} ${v.toFixed(1)} ${unit}`}</title>
                </rect>
              );
              acc += v;
              return rect;
            })}
            {(i % 2 === 0 || weeks.length <= 8) && (
              <text x={cx} y={H - B + 18} textAnchor="middle" className="axis small">{fmtShort(w.start)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
