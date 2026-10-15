// Hardest grade per session (the line) and every logged route (dots, colored by rope style).
import { GRADES, gi, label, sessHardest } from "@/lib/climbing";
import { fmtShort } from "@/lib/dates";

const W = 680, H = 300, L = 52, R = 18, T = 16, B = 40;
const ROPE_COL = { lead: "var(--accent)", toprope: "var(--rope)" };

export default function GradeChart({ sessions, scale }) {
  const n = sessions.length;
  if (!n) return null;
  const idxs = [];
  sessions.forEach((s) => {
    const h = sessHardest(s);
    if (h >= 0) idxs.push(h);
    (s.routes || []).forEach((r) => r.grade && idxs.push(gi(r.grade)));
  });
  const lo = Math.max(0, (idxs.length ? Math.min(...idxs) : gi("V")) - 1);
  const hi = Math.min(GRADES.length - 1, (idxs.length ? Math.max(...idxs) : gi("VI+")) + 1);
  const x = (k) => (n === 1 ? (L + W - R) / 2 : L + (W - L - R) * (k / (n - 1)));
  const y = (i) => T + (H - T - B) * (1 - (i - lo) / (hi - lo));

  // A step line through each session's hardest grade.
  let d = "";
  sessions.forEach((s, k) => {
    const g = sessHardest(s);
    if (g < 0) return;
    d += d ? ` H${x(k)} V${y(g)}` : `M${x(k)},${y(g)}`;
  });

  const ticks = new Set([0, n - 1]);
  if (n > 4) {
    ticks.add(Math.round((n - 1) / 3));
    ticks.add(Math.round((2 * (n - 1)) / 3));
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hardest grade per session with logged routes">
      {Array.from({ length: hi - lo + 1 }, (_, j) => lo + j).map((i) => (
        <g key={i}>
          <line x1={L} x2={W - R} y1={y(i)} y2={y(i)} stroke="var(--line)" />
          <text x={L - 10} y={y(i) + 4} textAnchor="end" className="axis">{label(i, scale)}</text>
        </g>
      ))}
      {d && <path d={d} fill="none" stroke="var(--fg)" strokeWidth="2" strokeOpacity=".55" strokeLinejoin="round" />}
      {sessions.map((s, k) => {
        const byGrade = {};
        (s.routes || []).filter((r) => r.grade).forEach((r) => (byGrade[r.grade] = byGrade[r.grade] || []).push(r));
        const g = sessHardest(s);
        return (
          <g key={s.id}>
            {Object.entries(byGrade).flatMap(([grade, rs]) =>
              rs.map((r, j) => {
                const col = ROPE_COL[r.rope] || "var(--none)";
                return (
                  <circle key={grade + j} cx={x(k) + (j - (rs.length - 1) / 2) * 9} cy={y(gi(grade))} r="5" fill={r.rope ? col : "var(--surface)"} stroke={col} strokeWidth="2">
                    <title>{`${fmtShort(s.date)}: ${label(grade, scale)}${r.rope ? ", " + (r.rope === "lead" ? "lead" : "top rope") : ""}`}</title>
                  </circle>
                );
              })
            )}
            {g >= 0 && !(s.routes || []).some((r) => r.grade) && (
              <circle cx={x(k)} cy={y(g)} r="3" fill="var(--fg)" fillOpacity=".55"><title>{`${fmtShort(s.date)}: hardest ${label(g, scale)}`}</title></circle>
            )}
          </g>
        );
      })}
      {[...ticks].map((k) => (
        <text key={k} x={x(k)} y={H - B + 22} textAnchor={k === 0 && n > 1 ? "start" : k === n - 1 && n > 1 ? "end" : "middle"} className="axis">
          {fmtShort(sessions[k].date)}
        </text>
      ))}
    </svg>
  );
}
