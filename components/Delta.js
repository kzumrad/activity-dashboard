// "▲ 20% vs prev. 4 wks": how a number compares with the 4 weeks before.
import { changePct } from "@/lib/activities";

export default function Delta({ now, before }) {
  if (!before) {
    return now ? <span className="dl up"><b>▲</b>new</span> : null;
  }
  const p = changePct(now, before);
  if (p === 0) {
    return <><span className="dl flat"><b>=</b>same</span><span className="dl-c">vs prev. 4 wks</span></>;
  }
  return (
    <>
      <span className={`dl ${p > 0 ? "up" : "down"}`} aria-label={`${p > 0 ? "up" : "down"} ${Math.abs(p)} percent`}>
        <b>{p > 0 ? "▲" : "▼"}</b>{Math.abs(p)}%
      </span>
      <span className="dl-c">vs prev. 4 wks</span>
    </>
  );
}
