"use client";

import { Sunrise, Sunset } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatTime } from "@/lib/cn";
import { useLocale } from "@/contexts/LocaleContext";
import { remainingDaylightLabel } from "@/lib/sunPath";
import { SunPathViz } from "@/components/home/SunPathViz";

export function SunProgressCard({ prayer, locale }) {
  const { t } = useLocale();
  const sun = prayer?.sun;
  const progress = sun?.progress ?? 0;
  const leftover = remainingDaylightLabel(progress, sun?.sunrise, sun?.sunset, sun?.isDaytime);
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <Card className="mx-4 mt-4 overflow-hidden bg-gradient-to-b from-surface-warm/80 to-surface">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t("sun.title")}</h2>
          <p className="mt-1 text-sm text-foreground">
            {sun?.isDaytime
              ? leftover
                ? `${leftover} ${t("home.remaining")}`
                : t("sun.title")
              : t("sun.night")}
          </p>
        </div>
        <p className="time-text text-sm font-semibold text-gold">{percent}%</p>
      </div>
      <SunPathViz
        progress={progress}
        isDaytime={Boolean(sun?.isDaytime)}
        period={sun?.period || "day"}
      />
      <div className="mt-1 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-background/70 px-3 py-2">
          <Sunrise size={16} className="text-gold" aria-hidden />
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">{t("sun.sunrise")}</p>
            <p className="time-text text-sm font-semibold">{formatTime(sun?.sunrise, locale)}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 rounded-2xl bg-background/70 px-3 py-2 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">{t("sun.sunset")}</p>
            <p className="time-text text-sm font-semibold">{formatTime(sun?.sunset, locale)}</p>
          </div>
          <Sunset size={16} className="text-gold" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
