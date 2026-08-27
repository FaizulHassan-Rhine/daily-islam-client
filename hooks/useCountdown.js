"use client";

import { useEffect, useState } from "react";

export function useCountdown(remainingMinutes, extraSeconds = 0) {
  const [seconds, setSeconds] = useState(() => Math.max(0, remainingMinutes * 60 + extraSeconds));

  useEffect(() => {
    setSeconds(Math.max(0, remainingMinutes * 60 + extraSeconds));
  }, [remainingMinutes, extraSeconds]);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return seconds;
}
