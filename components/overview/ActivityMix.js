"use client";
// Donut of the last 4 weeks by sport, counted by number of activities or by time.
import useStored from "@/components/useStored";
import { SPORTS, mix } from "@/lib/activities";
import { dur } from "@/lib/dates";

const R = 46, C = 2 * Math.PI * R;

export default function ActivityMix({ list }) {
  const [by, setBy] = useStored("mixBy", "count", ["count", "time"]);
  const { rows, total } = mix(list, by);
  let offset = 0;

  return (
    <div className="panel ovmix">
      <div className="ovmix-h">
        <div className="eyebrow">Activity mix</div>
        <div className="seg" role="group" aria-label="Measure the mix by">
          <button type="button" className="tr" aria-pressed={by === "count"} onClick={() => setBy("count")}>Activities</button>
          <button type="button" className="tr" aria-pressed={by === "time"} onClick={() => setBy("time")}>Time</button>
        </div>
      </div>
      <div className="ovmix-b">
        <svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label="Share of each activity type">
          <circle cx="60" cy="60" r={R} fill="none" stroke="var(--line)" strokeWidth="18" />
          {rows.map((r) => {
            const len = total ? (r.v / total) * C : 0;
            const arc = (
              <circle
                key={r.g} cx="60" cy="60" r={R} fill="none" stroke={SPORTS[r.g].col} strokeWidth="18"
                strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"
              >
                <title>{`${SPORTS[r.g].name}: ${r.pct}%`}</title>
              </circle>
            );
            offset += len;
            return arc;
          })}
          <text x="60" y="58" textAnchor="middle" className="donut-n">{by === "count" ? list.length : Math.round(total / 3600) + "h"}</text>
          <text x="60" y="74" textAnchor="middle" className="axis tiny">{by === "count" ? "activities" : "active"}</text>
        </svg>
        <ul className="mixleg">
          {rows.map((r) => (
            <li key={r.g}>
              <i style={{ background: SPORTS[r.g].col }} />
              <span>
                {SPORTS[r.g].name}
                <small>{by === "count" ? `${r.v} ${r.v === 1 ? "activity" : "activities"}` : dur(r.v)}</small>
              </span>
              <b>{r.pct}%</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
