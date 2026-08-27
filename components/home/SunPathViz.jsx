"use client";

import { useId } from "react";
import { ARC, arcPath, quadAt, skyPath } from "@/lib/sunPath";

const SKY = {
  morning: "#E8D9B8",
  day: "#C8A96B",
  evening: "#C48A62",
  night: "#8A9BB0",
};

export function SunPathViz({
  progress = 0,
  isDaytime = true,
  period = "day",
  markers = [],
  height = 92,
}) {
  const uid = useId().replace(/:/g, "");
  const t = isDaytime ? Math.min(1, Math.max(0, progress)) : progress >= 1 ? 1 : 0;
  const sun = quadAt(t);
  const sky = SKY[period] || SKY.day;
  const night = period === "night" || !isDaytime;

  return (
    <svg viewBox={`0 0 200 ${height}`} className="w-full" aria-hidden>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky} stopOpacity="0.16" />
          <stop offset="100%" stopColor={sky} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sky} stopOpacity="0.35" />
          <stop offset="100%" stopColor={sky} stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d={skyPath()} fill={`url(#sky-${uid})`} />
      <path
        d={arcPath()}
        fill="none"
        stroke="currentColor"
        className="text-border"
        strokeWidth="0.9"
        strokeDasharray="2.2 2.6"
        strokeLinecap="round"
      />
      <path
        d={arcPath()}
        fill="none"
        stroke={sky}
        strokeWidth="1.15"
        strokeLinecap="round"
        pathLength="1000"
        strokeDasharray={`${t * 1000} 1000`}
        opacity="0.9"
      />
      <line
        x1={ARC.x0 - 4}
        y1={ARC.y0}
        x2={ARC.x1 + 4}
        y2={ARC.y1}
        stroke="currentColor"
        className="text-border"
        strokeWidth="0.6"
      />

      {markers.map((m) => (
        <g key={m.key}>
          <line
            x1={m.x}
            y1={m.y - 3.4}
            x2={m.x}
            y2={m.y + 3.4}
            stroke="currentColor"
            className="text-primary"
            strokeWidth="0.9"
            strokeLinecap="round"
          />
        </g>
      ))}

      <circle cx={ARC.x0} cy={ARC.y0} r="1.15" className="fill-muted" />
      <circle cx={ARC.x1} cy={ARC.y1} r="1.15" className="fill-muted" />

      {night && t === 0 ? (
        <g transform={`translate(${ARC.x0 - 5} ${ARC.y0 - 14})`} fill="none" stroke={sky} strokeWidth="1">
          <path d="M7 2.2a5.4 5.4 0 1 0 5.2 7.4 4.4 4.4 0 0 1-5.2-7.4z" />
        </g>
      ) : (
        <g>
          <circle cx={sun.x} cy={sun.y} r="7" fill={`url(#halo-${uid})`} />
          <circle cx={sun.x} cy={sun.y} r="2.15" fill={sky} />
        </g>
      )}
    </svg>
  );
}
