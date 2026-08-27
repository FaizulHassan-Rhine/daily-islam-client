export const ARC = { x0: 22, y0: 88, cx: 100, cy: 12, x1: 178, y1: 88 };

export function quadAt(t, a = ARC) {
  const clamped = Math.min(1, Math.max(0, t));
  const u = 1 - clamped;
  return {
    x: u * u * a.x0 + 2 * u * clamped * a.cx + clamped * clamped * a.x1,
    y: u * u * a.y0 + 2 * u * clamped * a.cy + clamped * clamped * a.y1,
  };
}

export function arcPath(a = ARC) {
  return `M${a.x0} ${a.y0} Q${a.cx} ${a.cy} ${a.x1} ${a.y1}`;
}

export function skyPath(a = ARC) {
  return `${arcPath(a)} L${a.x1} ${a.y0} L${a.x0} ${a.y0} Z`;
}

export function hmToMin(hhmm) {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function daylightSpanMinutes(sunrise, sunset) {
  return Math.max(hmToMin(sunset) - hmToMin(sunrise), 1);
}

export function timeOnArc(hhmm, sunrise, sunset) {
  const span = daylightSpanMinutes(sunrise, sunset);
  const t = (hmToMin(hhmm) - hmToMin(sunrise)) / span;
  return { t: Math.min(1, Math.max(0, t)), ...quadAt(Math.min(1, Math.max(0, t))) };
}

export function remainingDaylightLabel(progress, sunrise, sunset, isDaytime) {
  if (!isDaytime) return null;
  const left = Math.max(0, 1 - progress);
  const mins = Math.round(left * daylightSpanMinutes(sunrise, sunset));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}
