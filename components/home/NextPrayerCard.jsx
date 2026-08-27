"use client";

import { formatCountdown, formatTime } from "@/lib/cn";
import { formatBanglaCalendar } from "@/lib/banglaCalendar";
import { usePrayerWindow } from "@/hooks/usePrayerWindow";
import { useLocale } from "@/contexts/LocaleContext";
import { timeOnArc } from "@/lib/sunPath";
import { SunPathViz } from "@/components/home/SunPathViz";

function dateFromIso(iso) {
  if (!iso) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function NextPrayerCard({ prayer, locale }) {
  const { t } = useLocale();
  const current = prayer?.currentPrayer;
  const next = prayer?.nextPrayer;
  const { remaining, progress } = usePrayerWindow(current, prayer?.timezone);
  const period = prayer?.sun?.period || "day";
  const ongoing = Boolean(current?.isOngoing);
  const name = t(`prayer.${(ongoing ? current?.key : next?.key) || "dhuhr"}`);
  const timings = prayer?.timings || {};
  const sunrise = timings.sunrise;
  const sunset = timings.sunset || timings.maghrib;
  const markers = [
    timings.dhuhr ? { key: "dhuhr", ...timeOnArc(timings.dhuhr, sunrise, sunset) } : null,
    timings.asr ? { key: "asr", ...timeOnArc(timings.asr, sunrise, sunset) } : null,
  ].filter(Boolean);
  const date = dateFromIso(prayer?.date);

  return (
    <section className="relative mx-4 mt-4 overflow-hidden rounded-card-lg border border-border/80 bg-surface/90 p-5 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      <div className="relative">
        {date ? (
          <p className="mb-3 text-[11px] leading-relaxed text-muted">
            {prayer?.hijri?.formatted}
            <span className="mx-1.5 text-border">·</span>
            {formatBanglaCalendar(date, locale)}
          </p>
        ) : null}

        <SunPathViz
          progress={prayer?.sun?.progress ?? 0}
          isDaytime={Boolean(prayer?.sun?.isDaytime)}
          period={period}
          markers={markers}
        />

        <div className="mt-0.5 flex items-center justify-between text-[11px] tracking-wide text-muted">
          <span className="time-text">{formatTime(sunrise, locale)}</span>
          <span className="time-text">{formatTime(sunset, locale)}</span>
        </div>
        {markers.length ? (
          <p className="mt-2 text-center text-[11px] tracking-wide text-muted">
            {markers
              .map((m) => `${t(`prayer.${m.key}`)} ${formatTime(timings[m.key], locale)}`)
              .join("   ·   ")}
          </p>
        ) : null}

        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
              {ongoing ? t("home.currentPrayer") : t("home.nextPrayer")}
              {next?.isTomorrow && !ongoing ? ` · ${t("home.tomorrow")}` : ""}
            </p>
            <h2 className="mt-1.5 font-semibold tracking-tight text-foreground" style={{ fontSize: "1.85rem" }}>
              {name}
            </h2>
          </div>
          <p className="time-text pb-1 text-sm text-muted">
            {ongoing
              ? `${formatTime(current.start, locale)} – ${formatTime(current.end, locale)}`
              : formatTime(next?.time, locale)}
          </p>
        </div>

        <div className="mt-4 h-px overflow-hidden bg-border">
          <div
            className="h-full bg-primary/70 transition-[width] duration-500"
            style={{ width: `${Math.min(100, Math.max(2, progress * 100))}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-muted">{ongoing ? t("home.ongoing") : t("home.nextPrayer")}</p>
          <p className="time-text font-medium tracking-wide">
            <span className="mr-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
              {t("home.remaining")}
            </span>
            {formatCountdown(remaining)}
          </p>
        </div>
      </div>
    </section>
  );
}
