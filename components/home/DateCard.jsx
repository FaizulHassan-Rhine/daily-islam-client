"use client";

import { Card } from "@/components/ui/Card";
import { gregorianLong } from "@/lib/cn";
import { formatBanglaCalendar } from "@/lib/banglaCalendar";
import { useLocale } from "@/contexts/LocaleContext";

function dateFromIso(iso) {
  if (!iso) return null;
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function DateCard({ prayer }) {
  const { locale, t } = useLocale();
  const date = dateFromIso(prayer?.date);
  return (
    <Card className="mx-4 mt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.hijri")}</p>
      <p className="font-medium text-primary">{prayer?.hijri?.formatted || "—"}</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.gregorian")}</p>
      <p className="time-text text-sm">{date ? gregorianLong(date, locale) : "—"}</p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.bangla")}</p>
      <p className="font-bn time-text text-sm">{date ? formatBanglaCalendar(date, "bn") : "—"}</p>
    </Card>
  );
}
