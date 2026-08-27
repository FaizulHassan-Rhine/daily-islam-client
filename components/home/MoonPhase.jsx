"use client";

import { useId } from "react";

const R = 28;
const CX = 50;
const CY = 50;

export function moonIllumination(day) {
  const t = Math.min(0.97, Math.max(0.04, Number(day || 1) / 29.5));
  const illumination = 0.5 - 0.5 * Math.cos(t * 2 * Math.PI);
  return { t, illumination, waxing: t <= 0.5 };
}

export function moonPhaseKey(day) {
  const { t } = moonIllumination(day);
  if (t < 0.08) return "crescent";
  if (t < 0.22) return "crescent";
  if (t < 0.32) return "firstQuarter";
  if (t < 0.44) return "gibbous";
  if (t < 0.56) return "full";
  if (t < 0.68) return "gibbous";
  if (t < 0.78) return "lastQuarter";
  return "crescent";
}

export function MoonPhase({ day = 1 }) {
  const uid = useId().replace(/:/g, "");
  const { illumination, waxing } = moonIllumination(day);
  const shadowX = CX + (waxing ? -2 : 2) * R * illumination;

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={`sky-${uid}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#2A3A48" />
          <stop offset="100%" stopColor="#121820" />
        </radialGradient>
        <radialGradient id={`lit-${uid}`} cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#F6E7C3" />
          <stop offset="42%" stopColor="#E2C889" />
          <stop offset="100%" stopColor="#B8954E" />
        </radialGradient>
        <radialGradient id={`dark-${uid}`} cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#4A5B66" />
          <stop offset="100%" stopColor="#1C272F" />
        </radialGradient>
        <radialGradient id={`glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(var(--color-gold))" stopOpacity="0.45" />
          <stop offset="70%" stopColor="rgb(var(--color-gold))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="rgb(var(--color-gold))" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`disc-${uid}`}>
          <circle cx={CX} cy={CY} r={R} />
        </clipPath>
      </defs>

      <circle cx={CX} cy={CY} r="48" fill={`url(#sky-${uid})`} />
      <circle cx="22" cy="24" r="0.9" fill="#F7FAF5" opacity="0.55" />
      <circle cx="74" cy="22" r="0.7" fill="#F7FAF5" opacity="0.4" />
      <circle cx="82" cy="48" r="0.8" fill="#F7FAF5" opacity="0.35" />
      <circle cx="18" cy="62" r="0.6" fill="#F7FAF5" opacity="0.45" />
      <circle cx="70" cy="78" r="0.7" fill="#F7FAF5" opacity="0.3" />

      <circle cx={CX} cy={CY} r="40" fill={`url(#glow-${uid})`} />
      <circle cx={CX} cy={CY} r={R} fill={`url(#dark-${uid})`} />
      <g clipPath={`url(#disc-${uid})`}>
        <circle cx={CX} cy={CY} r={R} fill={`url(#lit-${uid})`} />
        <circle cx="38" cy="40" r="4.2" fill="#C8A96B" opacity="0.28" />
        <circle cx="58" cy="36" r="3.1" fill="#C8A96B" opacity="0.22" />
        <circle cx="54" cy="58" r="5" fill="#C8A96B" opacity="0.2" />
        <circle cx="42" cy="62" r="2.4" fill="#C8A96B" opacity="0.25" />
        <circle cx={shadowX} cy={CY} r={R} fill={`url(#dark-${uid})`} />
        <circle cx={shadowX} cy={CY} r={R} fill="#121820" opacity="0.42" />
      </g>
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="rgb(var(--color-gold))"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />
      <circle cx="40" cy="38" r="6" fill="#fff" opacity="0.08" />
    </svg>
  );
}
