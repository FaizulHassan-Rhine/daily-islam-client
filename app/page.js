"use client";

import { MobileHeader } from "@/components/home/MobileHeader";
import { LocationDisplay } from "@/components/home/LocationDisplay";
import { NextPrayerCard } from "@/components/home/NextPrayerCard";
import { ExtraTimesRow, PrayerTimesRow } from "@/components/home/PrayerTimesRow";
import { DateCard } from "@/components/home/DateCard";
import { SunProgressCard } from "@/components/home/SunProgressCard";
import { HijriMoonCard } from "@/components/home/HijriMoonCard";
import { SalahTrackerCard } from "@/components/home/SalahTrackerCard";
import { QuickActions } from "@/components/home/QuickActions";
import { RamadanCard } from "@/components/home/RamadanCard";
import { DailyAyahCard, DailyDuaCard, DailyHadithCard, DailyNameCard } from "@/components/home/DailyCards";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { useDailyContent, usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useHydrated } from "@/hooks/useHydrated";
import { useLocale } from "@/contexts/LocaleContext";

export default function HomePage() {
  const { locale, t } = useLocale();
  const prayers = usePrayerTimes();
  const daily = useDailyContent();
  const hydrated = useHydrated();

  if (!hydrated || !prayers.data) {
    if (hydrated && prayers.isError) {
      return (
        <div className="p-4">
          <ErrorState title={t("errors.api")} body={prayers.error.message} onRetry={() => prayers.refetch()} retryLabel={t("errors.retry")} />
        </div>
      );
    }
    return <HomeSkeleton />;
  }

  const prayer = prayers.data;

  return (
    <div className="pb-6">
      <MobileHeader period={prayer?.sun?.period} />
      <LocationDisplay />
      <NextPrayerCard prayer={prayer} locale={locale} />
      <PrayerTimesRow prayer={prayer} locale={locale} />
      <ExtraTimesRow prayer={prayer} locale={locale} />
      <p className="mx-4 mt-2 text-[11px] text-muted">{t("prayer.disclaimer")}</p>
      <DateCard prayer={prayer} />
      <RamadanCard prayer={prayer} locale={locale} />
      <QuickActions />
      <div className="lg:grid lg:grid-cols-2 lg:gap-0">
        <SunProgressCard prayer={prayer} locale={locale} />
        <HijriMoonCard prayer={prayer} />
      </div>
      <SalahTrackerCard />
      <DailyAyahCard ayah={daily.data?.ayah} />
      <DailyHadithCard hadith={daily.data?.hadith} />
      <DailyDuaCard dua={daily.data?.dua} />
      <DailyNameCard name={daily.data?.name} />
    </div>
  );
}
