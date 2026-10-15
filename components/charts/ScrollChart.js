"use client";
// A bar chart you can scroll sideways through history (daily steps, weekly cycling km).
// It opens on the latest bar; tap a bar (or use the arrow keys) to read its value above the chart.
import { useEffect, useRef, useState } from "react";
import { MONTHS, dt } from "@/lib/dates";

const H = 230, T = 14, B = 34;

// bars:  [{ key, value, fill, dashed?, tick?, title, read }]  oldest first
//        tick: the small label under the bar; a new month is labelled automatically
// axis:  [{ v, text, strong? }]  y-axis labels; top: the value at the top of the chart
// extra: (y, width) => SVG drawn over the bars (e.g. the goal line)
export default function ScrollChart({ id, bars, axis, top, colW, barW, extra, label, hint, step = 4 }) {
  const scroller = useRef(null);
  const [sel, setSel] = useState(bars.length - 1);
  const y = (v) => T + (H - T - B) * (1 - v / top);
  const W = bars.length * colW + 12;
  const current = bars[Math.min(sel, bars.length - 1)];

  // Start scrolled to the newest bar.
  useEffect(() => {
    const sc = scroller.current;
    if (!sc) return;
    sc.style.scrollBehavior = "auto";
    sc.scrollLeft = sc.scrollWidth;
    sc.style.scrollBehavior = "";
  }, [bars.length]);

  function select(i) {
    if (i < 0 || i >= bars.length) return;
    setSel(i);
    const sc = scroller.current;
    const x = i * colW;
    if (sc && (x < sc.scrollLeft || x > sc.scrollLeft + sc.clientWidth - colW)) sc.scrollLeft = x - sc.clientWidth / 2;
  }

  let lastMonth = -1;
  return (
    <div className="panel stp">
      <div className="stp-head">
        <div className="stp-read" aria-live="polite">{current ? current.read : hint}</div>
        <div className="nav">
          <button type="button" aria-label="Scroll back" onClick={() => (scroller.current.scrollLeft -= colW * step)}>‹</button>
          <button type="button" aria-label="Scroll forward" onClick={() => (scroller.current.scrollLeft += colW * step)}>›</button>
        </div>
      </div>
      <div className="stp-body">
        <svg className="stp-axis" width="40" height={H} aria-hidden="true">
          {axis.map((a) => (
            <text key={`${a.v}${a.strong ? "-goal" : ""}`} x="34" y={y(a.v) + 4} textAnchor="end" className={`axis small${a.strong ? " strong" : ""}`}>{a.text}</text>
          ))}
        </svg>
        <div
          className="stp-scroll"
          ref={scroller}
          tabIndex={0}
          aria-label={`${label}, scroll sideways`}
          onKeyDown={(e) => {
            if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
            e.preventDefault();
            select(sel + (e.key === "ArrowRight" ? 1 : -1));
          }}
        >
          <svg id={id} width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
            {axis.filter((a) => !a.strong).map((a) => (
              <line key={a.v} x1="0" x2={W} y1={y(a.v)} y2={y(a.v)} stroke="var(--line)" />
            ))}
            {current && (
              <rect x={sel * colW} y={T - 6} width={colW} height={H - B - T + 8} rx="6" fill="var(--fg)" fillOpacity=".07" pointerEvents="none" />
            )}
            {bars.map((b, i) => {
              const cx = i * colW + colW / 2;
              const d = dt(b.monthOf || b.key);
              const newMonth = d.getMonth() !== lastMonth;
              lastMonth = d.getMonth();
              return (
                <g key={b.key} onClick={() => select(i)} className="col">
                  <rect x={i * colW} y={T} width={colW} height={H - B - T} fill="transparent" />
                  {newMonth && (
                    <>
                      {i > 0 && <line x1={i * colW} x2={i * colW} y1={T} y2={H - B + 24} stroke="var(--muted)" strokeOpacity=".5" />}
                      <text x={i * colW + 4} y={H - 4} className="axis month">{MONTHS[d.getMonth()].slice(0, 3)}</text>
                    </>
                  )}
                  {b.value > 0 && (
                    <rect
                      className="bar"
                      x={cx - barW / 2}
                      y={y(b.value)}
                      width={barW}
                      height={Math.max(1, y(0) - y(b.value))}
                      rx={barW > 16 ? 4 : 3}
                      fill={b.fill}
                      {...(b.dashed ? { stroke: b.dashed, strokeWidth: 1.5, strokeDasharray: "3 2" } : {})}
                    >
                      <title>{b.title}</title>
                    </rect>
                  )}
                  {b.tick && <text x={cx} y={H - B + 15} textAnchor="middle" className="axis tiny">{b.tick}</text>}
                </g>
              );
            })}
            {extra && extra(y, W)}
          </svg>
        </div>
      </div>
      <div className="stp-hint">Swipe or use the arrows to go back in time</div>
    </div>
  );
}
