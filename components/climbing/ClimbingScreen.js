"use client";
// Climbing tab: hardest grades, the grade chart, and the calendar where you log each route.
// Changes are shown straight away and saved to the session's file in data/climbing-sessions/.
import { useEffect, useState } from "react";
import useStored from "@/components/useStored";
import useToday from "@/components/useToday";
import ClimbHero from "@/components/climbing/ClimbHero";
import GradeChart from "@/components/climbing/GradeChart";
import ClimbCalendar from "@/components/climbing/ClimbCalendar";
import SessionDetail from "@/components/climbing/SessionDetail";
import { SCALES } from "@/lib/climbing";
import { addSession, deleteSession, saveRoutes } from "@/app/actions";

export default function ClimbingScreen({ sessions: saved }) {
  const today = useToday();
  const [scale, setScale] = useStored("gradeScale", "uiaa", Object.keys(SCALES));
  const [sessions, setSessions] = useState(saved);
  const [selected, setSelected] = useState(saved.length ? saved[saved.length - 1].date : null);
  const [status, setStatus] = useState("");
  const [newDate, setNewDate] = useState(today);

  // When the saved files change (a save finished, or a sync), show them.
  useEffect(() => setSessions(saved), [saved]);

  async function run(action, working) {
    setStatus(working);
    const result = await action();
    setStatus(result.error || "Saved");
    return result;
  }

  function changeRoutes(id, routes) {
    setSessions((list) => list.map((s) => (s.id === id ? { ...s, routes } : s)));
    run(() => saveRoutes(id, routes), "Saving…");
  }

  async function add(e) {
    e.preventDefault();
    if (!newDate) return;
    setSelected(newDate);
    await run(() => addSession(newDate), "Adding session…");
  }

  return (
    <div className="tab">
      <div className="top">
        <div className="titles">
          <div className="eyebrow">Indoor rope climbing · {SCALES[scale].name} scale</div>
          <h2>Climbing grade progression</h2>
          <p className="sub">
            Your hardest grade comes straight from your watch. Log each route&apos;s grade and lead or top rope in the calendar
            to see the full picture.
          </p>
        </div>
        <div className="scalepick">
          <label htmlFor="scaleSel">Grade scale</label>
          <select id="scaleSel" value={scale} onChange={(e) => setScale(e.target.value)}>
            {Object.entries(SCALES).map(([k, s]) => <option key={k} value={k}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <ClimbHero sessions={sessions} scale={scale} />

      <section>
        <div>
          <h2>Every route, session by session</h2>
          <p className="sub">The line is the hardest grade your watch recorded each session, logged or not. Dots are the routes you&apos;ve logged.</p>
        </div>
        <div className="legend">
          <span><i className="sw" style={{ height: 3, background: "var(--fg)" }} />Hardest grade</span>
          <span><i className="sw" style={{ background: "var(--accent)", borderRadius: "50%" }} />Lead</span>
          <span><i className="sw" style={{ background: "var(--rope)", borderRadius: "50%" }} />Top rope</span>
          <span><i className="sw" style={{ border: "2px solid var(--none)", borderRadius: "50%" }} />Style not set</span>
        </div>
        <div className="panel chart"><GradeChart sessions={sessions} scale={scale} /></div>
      </section>

      <section>
        <div>
          <h2>Climbing calendar</h2>
          <p className="sub">
            Tap a climbing day to log its routes. Or write them in the session&apos;s training note in the COROS app, one route
            per line in the order you climbed (e.g. &quot;6+ top rope&quot;), and Claude fills them in when you sync.
          </p>
        </div>
        <div className="legend">
          <span><i className="sw" style={{ background: "var(--rope)" }} />All routes logged</span>
          <span><i className="sw" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)" }} />Needs grades</span>
        </div>
        <ClimbCalendar sessions={sessions} scale={scale} today={today} selected={selected} onSelect={setSelected} />
        <div className="status" role="status" aria-live="polite">{status}</div>
        <SessionDetail
          sessions={sessions}
          date={selected}
          scale={scale}
          onRoutes={changeRoutes}
          onDelete={(id) => run(() => deleteSession(id), "Deleting…")}
        />
        <div className="panel">
          <form className="addsess" onSubmit={add}>
            <label htmlFor="newDate" className="s-meta">Climbed without the watch?</label>
            <input type="date" id="newDate" required value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            <button className="btn" type="submit">Add session</button>
          </form>
        </div>
        <p className="foot">
          Grade conversions between scales are approximate. COROS doesn&apos;t share per-route grades or lead vs top rope yet,
          so those come from your log.
        </p>
      </section>
    </div>
  );
}
