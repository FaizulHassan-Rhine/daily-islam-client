"use client";

import { formatCountdown, formatTime } from "@/lib/cn";
import { banglaCalendarParts } from "@/lib/banglaCalendar";
import { specialDayFor } from "@/lib/specialDays";
import { usePrayerWindow } from "@/hooks/usePrayerWindow";
import { useLocale } from "@/contexts/LocaleContext";
import { remainingDaylightLabel, timeOnArc } from "@/lib/sunPath";
import { SunPathViz } from "@/components/home/SunPathViz";

function dateFromIso(iso) {
  if (!iso) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function toLocaleDigits(value, locale) {
  const str = String(value ?? "");
  if (locale !== "bn") return str;
  return str.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
}

export function NextPrayerCard({ prayer, locale }) {
  const { t } = useLocale();
  const current = prayer?.currentPrayer;
  const next = prayer?.nextPrayer;
  const { remaining, progress } = usePrayerWindow(current, prayer?.timezone);
  const period = prayer?.sun?.period || "day";
  const ongoing = Boolean(current?.isOngoing);
  const name = t(`prayer.${(ongoing ? current?.key : next?.key) || "dhuhr"}`);
  const untilKey = ongoing ? current?.endKey : next?.key;
  const timings = prayer?.timings || {};
  const sunrise = timings.sunrise;
  const sunset = timings.sunset || timings.maghrib;
  const markers = [
    timings.dhuhr ? { key: "dhuhr", ...timeOnArc(timings.dhuhr, sunrise, sunset) } : null,
    timings.asr ? { key: "asr", ...timeOnArc(timings.asr, sunrise, sunset) } : null,
  ].filter(Boolean);
  const date = dateFromIso(prayer?.date);
  const bangla = date ? banglaCalendarParts(date, "bn") : null;
  const hijri = prayer?.hijri;
  const special = specialDayFor({ hijri, date, locale });
  const englishWeekday = date
    ? new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }).format(date)
    : "—";
  const englishDate = date
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date)
    : "";
  const daylightLeft = remainingDaylightLabel(
    prayer?.sun?.progress ?? 0,
    sunrise,
    sunset,
    Boolean(prayer?.sun?.isDaytime)
  );

  return (
    <section className="relative mx-4 mt-4 overflow-hidden rounded-card-lg border border-border/80 bg-surface/90 p-5 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      <div className="relative">
        <div className="grid grid-cols-3 gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.hijri")}</p>
            <p className="mt-1 truncate text-sm font-medium leading-snug text-foreground">
              {hijri ? `${toLocaleDigits(hijri.day, locale)} ${hijri.month?.en || ""}` : "—"}
            </p>
            <p className="time-text mt-0.5 text-[11px] text-muted">
              {hijri ? `${toLocaleDigits(hijri.year, locale)} ${hijri.designation || "AH"}` : ""}
            </p>
          </div>
          <div className="min-w-0 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{t("home.englishDate")}</p>
            <p className="mt-1 truncate text-sm font-medium leading-snug text-foreground">{englishWeekday}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{englishDate}</p>
          </div>
          <div className="min-w-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.bangla")}</p>
            <p className="font-bn time-text mt-1 truncate text-sm font-medium leading-snug text-foreground">{bangla?.weekday || "—"}</p>
            <p className="font-bn time-text mt-0.5 truncate text-[11px] text-muted">{bangla?.dateLine || ""}</p>
          </div>
        </div>

        {special ? (
          <div className="mt-3 rounded-2xl bg-gold/10 px-3 py-2 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{t("home.specialToday")}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{special.title}</p>
            {special.note ? <p className="mt-0.5 text-[11px] text-muted">{special.note}</p> : null}
          </div>
        ) : null}

        <div className="relative mt-3">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2">
            <div className="max-w-[42%]">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                {ongoing ? t("home.currentPrayer") : t("home.nextPrayer")}
              </p>
              <p className="mt-1 text-[1.35rem] font-semibold leading-none tracking-tight text-foreground">{name}</p>
              <p className="time-text mt-1.5 text-[11px] text-muted">
                {ongoing
                  ? `${formatTime(current.start, locale)} – ${formatTime(current.end, locale)}`
                  : formatTime(next?.time, locale)}
              </p>
            </div>
            <div className="max-w-[42%] text-right">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">{t("home.remaining")}</p>
              <p className="time-text mt-1 text-[1.35rem] font-semibold leading-none tracking-tight text-gold">
                {toLocaleDigits(formatCountdown(remaining), locale)}
              </p>
              <p className="mt-1.5 truncate text-[11px] text-muted">
                {untilKey ? `${t("home.until")} ${t(`prayer.${untilKey}`)}` : daylightLeft || t("sun.night")}
              </p>
            </div>
          </div>

          <SunPathViz
            progress={prayer?.sun?.progress ?? 0}
            isDaytime={Boolean(prayer?.sun?.isDaytime)}
            period={period}
            markers={markers}
            height={108}
          />
        </div>

        <div className="mt-0.5 flex items-end justify-between text-[11px] tracking-wide text-muted">
          <span>
            <span className="block text-[10px] uppercase tracking-[0.14em]">{t("sun.sunrise")}</span>
            <span className="time-text text-foreground">{formatTime(sunrise, locale)}</span>
          </span>
          <span className="pb-0.5 text-center">
            {markers
              .map((m) => `${t(`prayer.${m.key}`)} ${formatTime(timings[m.key], locale)}`)
              .join("  ·  ")}
          </span>
          <span className="text-right">
            <span className="block text-[10px] uppercase tracking-[0.14em]">{t("sun.sunset")}</span>
            <span className="time-text text-foreground">{formatTime(sunset, locale)}</span>
          </span>
        </div>

        <div className="mt-5 h-px overflow-hidden bg-border">
          <div
            className="h-full bg-primary/70 transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(2, progress * 100))}%` }}
          />
        </div>
      </div>
    </section>
  );
}
