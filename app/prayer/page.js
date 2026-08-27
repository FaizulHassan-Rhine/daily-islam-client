"use client";

import { formatTime } from "@/lib/cn";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useHydrated } from "@/hooks/useHydrated";
import { useLocale } from "@/contexts/LocaleContext";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { ExtraTimesRow, PrayerTimesRow } from "@/components/home/PrayerTimesRow";
import { NextPrayerCard } from "@/components/home/NextPrayerCard";
import { Card } from "@/components/ui/Card";

export default function PrayerPage() {
  const { t, locale } = useLocale();
  const { data, isLoading } = usePrayerTimes();
  const hydrated = useHydrated();
  if (!hydrated || (isLoading && !data)) return <HomeSkeleton />;
  const timings = data?.timings || {};
  const rows = ["imsak", "fajr", "sunrise", "dhuhr", "asr", "sunset", "maghrib", "isha", "midnight"];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.prayer")}</h1>
      <div className="-mx-4">
        <NextPrayerCard prayer={data} locale={locale} />
        <PrayerTimesRow prayer={data} locale={locale} />
        <ExtraTimesRow prayer={data} locale={locale} />
      </div>
      <Card className="mt-4">
        <ul className="divide-y divide-border">
          {rows.map((key) => (
            <li key={key} className="flex items-center justify-between py-3">
              <span>{t(`prayer.${key}`)}</span>
              <span className="time-text text-base font-semibold">{formatTime(timings[key], locale)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">{data?.meta?.disclaimer || t("prayer.disclaimer")}</p>
      </Card>
    </div>
  );
}
