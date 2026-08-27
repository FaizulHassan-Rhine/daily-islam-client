"use client";

import { useEffect, useState } from "react";

function zonedSeconds(timezone) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value || 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value || 0);
  const second = Number(parts.find((p) => p.type === "second")?.value || 0);
  return hour * 3600 + minute * 60 + second;
}

function hmToSeconds(hhmm) {
  const [h, m] = String(hhmm || "0:0").split(":").map(Number);
  return (h || 0) * 3600 + (m || 0) * 60;
}

export function usePrayerWindow(current, timezone) {
  const [state, setState] = useState({ remaining: 0, progress: 0 });

  useEffect(() => {
    if (!current?.start || !current?.end) return undefined;

    const tick = () => {
      let start = hmToSeconds(current.start);
      let end = hmToSeconds(current.end);
      let now = zonedSeconds(timezone);
      if (end <= start) end += 24 * 3600;
      if (now < start) now += 24 * 3600;
      const duration = Math.max(end - start, 1);
      const remaining = Math.max(0, end - now);
      const elapsed = Math.min(duration, Math.max(0, now - start));
      setState({
        remaining,
        progress: elapsed / duration,
      });
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [current?.start, current?.end, timezone]);

  return state;
}
