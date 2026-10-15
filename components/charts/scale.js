// Round axis steps for a chart whose largest value is `max`: 1, 2, 5, 10 or 20 per line.
export function niceScale(max) {
  const step = max <= 4 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : max <= 60 ? 10 : 20;
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);
  return { top, ticks };
}
