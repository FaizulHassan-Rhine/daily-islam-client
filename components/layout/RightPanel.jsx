"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatTime } from "@/lib/cn";
import { useDailyContent, usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocale } from "@/contexts/LocaleContext";
import { Card } from "@/components/ui/Card";

export function RightPanel() {
  const { t, locale } = useLocale();
  const prayers = usePrayerTimes();
  const daily = useDailyContent();
  const [lastRead, setLastRead] = useState(null);
  const current = prayers.data?.currentPrayer;
  const next = prayers.data?.nextPrayer;
  const ongoing = Boolean(current?.isOngoing);
  const name = t(`prayer.${(ongoing ? current?.key : next?.key) || "dhuhr"}`);

  useEffect(() => {
    try {
      setLastRead(JSON.parse(localStorage.getItem("di.lastRead") || "null"));
    } catch {
      setLastRead(null);
    }
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto border-l border-border bg-surface p-5 xl:block">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {ongoing ? t("home.currentPrayer") : t("home.nextPrayer")}
      </p>
      <p className="mt-1 text-2xl font-semibold">{name}</p>
      <p className="time-text mt-1 text-sm text-muted">
        {ongoing ? `${formatTime(current.start, locale)} – ${formatTime(current.end, locale)}` : formatTime(next?.time, locale)}
      </p>
      {lastRead ? (
        <Card className="mt-5">
          <p className="text-xs text-muted">{t("quran.lastRead")}</p>
          <Link href={`/quran/${lastRead.surah}#ayah-${lastRead.ayah}`} className="mt-1 block font-medium text-primary">
            {lastRead.surah}:{lastRead.ayah}
          </Link>
        </Card>
      ) : null}
      {daily.data?.ayah ? (
        <Card className="mt-4">
          <p className="text-xs text-muted">{t("home.ayahOfDay")}</p>
          <p className="quran-text mt-2 text-xl">{daily.data.ayah.textUthmani}</p>
          <Link href={`/quran/${daily.data.ayah.chapterId}`} className="mt-2 block text-sm text-primary">
            {daily.data.ayah.verseKey}
          </Link>
        </Card>
      ) : null}
      {daily.data?.dua ? (
        <Card className="mt-4">
          <p className="text-xs text-muted">{t("home.duaOfDay")}</p>
          <p className="arabic-text mt-2 text-xl">{daily.data.dua.arabic}</p>
          <Link href={`/dua/${daily.data.dua.id}`} className="mt-2 block text-sm text-primary">
            {t("common.seeAll")}
          </Link>
        </Card>
      ) : null}
    </aside>
  );
}
