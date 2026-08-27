"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatTime } from "@/lib/cn";
import { useLocale } from "@/contexts/LocaleContext";
import { useCountdown } from "@/hooks/useCountdown";
import { formatCountdown } from "@/lib/cn";

function remainingUntil(hhmm, timezone) {
  if (!hhmm) return 0;
  const now = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone || "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(now.find((p) => p.type === "hour")?.value);
  const minute = Number(now.find((p) => p.type === "minute")?.value);
  const [th, tm] = hhmm.split(":").map(Number);
  let diff = th * 60 + tm - (hour * 60 + minute);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export function RamadanCard({ prayer, locale }) {
  const { t } = useLocale();
  if (!prayer?.ramadan) return null;
  const sehriMins = remainingUntil(prayer.ramadan.sehriEnd, prayer.timezone);
  const iftarMins = remainingUntil(prayer.ramadan.iftar, prayer.timezone);
  const sehri = useCountdown(sehriMins);
  const iftar = useCountdown(iftarMins);

  return (
    <Card className="mx-4 mt-4 bg-surface-warm">
      <CardHeader
        title={`${t("ramadan.day")} ${prayer.ramadan.day}`}
        action={
          <Link href="/ramadan" className="text-sm text-primary">
            {t("common.seeAll")}
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted">{t("ramadan.sehri")}</p>
          <p className="time-text text-lg font-semibold">{formatTime(prayer.ramadan.sehriEnd, locale)}</p>
          <p className="font-mono text-xs text-primary">{formatCountdown(sehri)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{t("ramadan.iftar")}</p>
          <p className="time-text text-lg font-semibold">{formatTime(prayer.ramadan.iftar, locale)}</p>
          <p className="font-mono text-xs text-primary">{formatCountdown(iftar)}</p>
        </div>
      </div>
    </Card>
  );
}
