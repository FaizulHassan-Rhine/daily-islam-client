"use client";

import { Card } from "@/components/ui/Card";
import { useLocale } from "@/contexts/LocaleContext";
import { MoonPhase, moonPhaseKey } from "@/components/home/MoonPhase";

export function HijriMoonCard({ prayer }) {
  const { t, locale } = useLocale();
  const hijri = prayer?.hijri;
  const day = hijri?.day || 1;
  const progress = Math.min(1, day / 30);
  const phase = moonPhaseKey(day);
  const monthName = locale === "bn" ? hijri?.formatted : hijri?.month?.en;

  return (
    <Card className="mx-4 mt-4 overflow-hidden bg-gradient-to-b from-surface-warm/80 to-surface">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t("moon.title")}</h2>
          <p className="mt-1 text-sm text-foreground">{hijri ? `${hijri.month?.en} ${hijri.year}` : ""}</p>
        </div>
        <p className="time-text text-sm font-semibold text-gold">{Math.round(progress * 100)}%</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-full ring-1 ring-gold/25">
          <MoonPhase day={day} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="time-text text-3xl font-semibold leading-none">
            {locale === "bn" ? day.toLocaleString("bn-BD") : day}
          </p>
          <p className="mt-1.5 text-xs font-medium text-gold/90">{t(`moon.${phase}`)}</p>
          <p className="mt-0.5 text-xs text-muted">{t("moon.progress")}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/15">
            <div className="h-full rounded-full bg-gold" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
      {monthName ? <p className="sr-only">{monthName}</p> : null}
    </Card>
  );
}
