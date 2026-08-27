"use client";

import { formatTime, cn } from "@/lib/cn";
import { useLocale } from "@/contexts/LocaleContext";

const KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function PrayerTimesRow({ prayer, locale }) {
  const { t } = useLocale();
  const activeKey = prayer?.currentPrayer?.key || prayer?.nextPrayer?.key;
  const timings = prayer?.timings || {};
  const activeIndex = KEYS.indexOf(activeKey);

  return (
    <div className="mx-4 mt-4 grid grid-cols-5 gap-1.5">
      {KEYS.map((key, index) => {
        const active = key === activeKey;
        const past = activeIndex >= 0 && index < activeIndex;
        return (
          <div
            key={key}
            className={cn(
              "relative overflow-hidden rounded-2xl border px-1 py-3 text-center shadow-card dark:shadow-none",
              active
                ? "border-primary bg-primary-soft"
                : past
                  ? "border-transparent bg-surface/70 text-muted"
                  : "border-border/80 bg-surface"
            )}
          >
            {active ? <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-gold" /> : null}
            <p className={cn("text-[11px] font-medium", active ? "text-primary" : "text-muted")}>
              {t(`prayer.${key}`)}
            </p>
            <p className={cn("time-text mt-1.5 text-[13px] font-semibold leading-tight", active && "text-primary")}>
              {formatTime(timings[key], locale)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function ExtraTimesRow({ prayer, locale }) {
  const { t } = useLocale();
  const timings = prayer?.timings || {};
  const extras = [
    ["imsak", timings.imsak],
    ["sunrise", timings.sunrise],
    ["sunset", timings.sunset],
    ["midnight", timings.midnight],
  ];
  return (
    <div className="mx-4 mt-3 flex gap-2 overflow-x-auto pb-1">
      {extras.map(([key, time]) => (
        <div key={key} className="min-w-[96px] rounded-2xl border border-border/80 bg-surface px-3 py-2">
          <p className="text-[11px] text-muted">{t(`prayer.${key}`)}</p>
          <p className="time-text text-sm font-semibold">{formatTime(time, locale)}</p>
        </div>
      ))}
    </div>
  );
}
