// The summary at the top of the Climbing tab.
import { heroStats, label } from "@/lib/climbing";
import { fmtShort } from "@/lib/dates";

export default function ClimbHero({ sessions, scale }) {
  const h = heroStats(sessions);
  return (
    <dl className="hero panel">
      <div className="big">
        <div><dt>Hardest grade</dt><dd>{label(h.top, scale)}</dd></div>
        <div className="note">{h.firstTop ? `First reached ${fmtShort(h.firstTop.date)}` : "From your watch"}</div>
      </div>
      <div><dt>Hardest lead</dt><dd className="lead">{label(h.lead, scale)}</dd></div>
      <div><dt>Hardest top rope</dt><dd className="tr">{label(h.toprope, scale)}</dd></div>
      <div><dt>Most climbed</dt><dd>{label(h.most, scale)}</dd></div>
      <div>
        <dt>Routes logged</dt>
        <dd className="num">{h.logged}<small>/ {h.routes}</small></dd>
        <div className="progress"><i style={{ width: `${h.routes ? (h.logged / h.routes) * 100 : 0}%` }} /></div>
      </div>
    </dl>
  );
}
