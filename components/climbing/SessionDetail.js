"use client";
// The routes of the selected climbing day: pick a grade and lead / top rope for each.
import { useState } from "react";
import { GRADES, byDate, label } from "@/lib/climbing";
import { fmtLong, mmss } from "@/lib/dates";

export default function SessionDetail({ sessions, date, scale, onRoutes, onDelete }) {
  if (!sessions.length) {
    return <div className="panel empty">No climbing sessions yet. Ask Claude to sync your climbs, or add one below.</div>;
  }
  const list = date ? byDate(sessions)[date] : null;
  if (!list) return <div className="panel empty">Tap a colored day in the calendar to see and log its routes.</div>;
  const total = list.reduce((t, s) => t + (s.routes || []).length, 0);

  return (
    <div className="detail">
      <div className="dhead">
        <b>{fmtLong(date)}</b>
        <span className="s-meta">{list.length > 1 ? list.length + " sessions · " : ""}{total} route{total === 1 ? "" : "s"}</span>
      </div>
      {list.map((s) => <Session key={s.id} s={s} scale={scale} onRoutes={onRoutes} onDelete={onDelete} />)}
    </div>
  );
}

function Session({ s, scale, onRoutes, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const routes = s.routes || [];
  const done = routes.filter((r) => r.grade && r.rope).length;
  const meta = [s.source === "coros" && s.hardest ? `Watch hardest ${label(s.hardest, scale)}` : s.source === "manual" ? "Added by hand" : "", s.duration || ""]
    .filter(Boolean)
    .join(" · ");
  const update = (i, change) => onRoutes(s.id, routes.map((r, j) => (j === i ? { ...r, ...change } : r)));

  return (
    <div className="panel sess">
      <div className="sess-h">
        <span className="s-meta">{meta}</span>
        {routes.length && done === routes.length
          ? <span className="chip done">Logged</span>
          : <span className="chip">{done} of {routes.length} logged</span>}
      </div>
      {routes.length === 0 && <div className="empty">No routes in this session.</div>}
      {routes.map((r, i) => {
        const info = [r.height ? r.height.toFixed(1) + " m" : "", r.secs ? mmss(r.secs) : "", r.hr ? r.hr + " bpm" : ""].filter(Boolean).join(" · ");
        return (
          <div className="route" key={i}>
            <div className="r-info"><b>Route {i + 1}</b><div>{info || "added by hand"}</div></div>
            <select aria-label={`Grade of route ${i + 1}`} value={r.grade || ""} onChange={(e) => update(i, { grade: e.target.value || null })}>
              <option value="">Grade</option>
              {/* Outside UIAA, show the UIAA grade too: it's what's saved, and two UIAA grades can share a French one. */}
              {GRADES.map((g) => <option key={g} value={g}>{scale === "uiaa" ? g : `${label(g, scale)} (${g})`}</option>)}
            </select>
            <span className="seg" role="group" aria-label={`Rope style of route ${i + 1}`}>
              {[["lead", "Lead", "lead"], ["toprope", "Top rope", "tr"]].map(([v, text, cls]) => (
                <button
                  key={v}
                  type="button"
                  className={cls}
                  aria-pressed={r.rope === v}
                  onClick={() => update(i, { rope: r.rope === v ? null : v })}
                >
                  {text}
                </button>
              ))}
            </span>
            <button
              type="button"
              className="x"
              aria-label={`Remove route ${i + 1}`}
              title="Not a route"
              onClick={() => onRoutes(s.id, routes.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        );
      })}
      <div className="s-foot">
        <button type="button" className="btn" onClick={() => onRoutes(s.id, [...routes, { grade: null, rope: null }])}>+ Add a route</button>
        {s.source === "manual" &&
          (confirmDelete ? (
            <span className="confirm">
              Delete this session?{" "}
              <button type="button" className="btn danger" onClick={() => onDelete(s.id)}>Delete</button>
              <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Keep</button>
            </span>
          ) : (
            <button type="button" className="btn danger" onClick={() => setConfirmDelete(true)}>Delete session</button>
          ))}
      </div>
    </div>
  );
}
