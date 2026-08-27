import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatTime(hhmm, locale = "en") {
  if (!hhmm) return "—";
  const [hourRaw, minuteRaw] = String(hhmm).split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return "—";
  const hour12 = hour % 12 || 12;
  const suffix = hour < 12 ? "AM" : "PM";
  const pad = (n) => String(n).padStart(2, "0");
  if (locale === "bn") {
    const bnHour = hour12.toLocaleString("bn-BD");
    const bnMinute = minute.toLocaleString("bn-BD", { minimumIntegerDigits: 2 });
    return `${bnHour}:${bnMinute} ${suffix}`;
  }
  return `${hour12}:${pad(minute)} ${suffix}`;
}

export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function gregorianLong(date, locale) {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function banglaDate(date) {
  return new Intl.DateTimeFormat("bn-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function todayInZone(timezone) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function shareOrCopy(title, text) {
  if (navigator.share) {
    return navigator.share({ title, text });
  }
  return navigator.clipboard.writeText(text);
}
