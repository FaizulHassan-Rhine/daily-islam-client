"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/contexts/LocaleContext";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocationStore } from "@/contexts/LocationContext";
import { ListSkeleton } from "@/components/ui/Skeleton";
import {
  dateFromParts,
  formatBanglaCalendar,
  gregorianToBangla,
  toBnDigits,
} from "@/lib/banglaCalendar";

const WEEKDAYS = {
  en: ["S", "M", "T", "W", "T", "F", "S"],
  bn: ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"],
};

function gregorianDate(g) {
  return dateFromParts(g?.year, g?.month?.number, g?.day);
}

function isSameDay(g, date) {
  return (
    Number(g?.year) === date.getFullYear() &&
    Number(g?.month?.number) === date.getMonth() + 1 &&
    Number(g?.day) === date.getDate()
  );
}

export default function CalendarPage() {
  const { t, locale } = useLocale();
  const prayers = usePrayerTimes();
  const { location } = useLocationStore();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const events = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => (await api.get("/calendar/events")).data.data,
  });
  const monthQuery = useQuery({
    queryKey: ["prayer-month", year, month, location.latitude, location.longitude],
    enabled: Number.isFinite(location.latitude),
    queryFn: async () =>
      (
        await api.get("/prayers/month", {
          params: {
            month,
            year,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        })
      ).data.data,
  });

  const eventMap = useMemo(() => {
    const map = new Map();
    for (const e of events.data || []) {
      map.set(`${e.hijriMonth}-${e.hijriDay}`, e);
    }
    return map;
  }, [events.data]);

  const monthLabel = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
  const banglaMonth = gregorianToBangla(dateFromParts(year, month, 15));
  const todayBangla = prayers.data?.date
    ? formatBanglaCalendar(dateFromParts(...String(prayers.data.date).split("-")), "bn")
    : null;

  if (events.isLoading) return <ListSkeleton />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.calendar")}</h1>
      <Card className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.hijri")}</p>
        <p className="font-medium text-primary">{prayers.data?.hijri?.formatted}</p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("dates.bangla")}</p>
        <p className="font-bn time-text text-sm">{todayBangla || "—"}</p>
        <p className="mt-2 text-xs text-muted">{t("calendar.note")}</p>
      </Card>
      <div className="mt-4 flex items-center justify-between">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (month === 1) {
              setMonth(12);
              setYear((y) => y - 1);
            } else setMonth((m) => m - 1);
          }}
        >
          ‹
        </Button>
        <div className="text-center">
          <p className="text-sm font-medium">{monthLabel}</p>
          {banglaMonth ? (
            <p className="font-bn time-text mt-0.5 text-[11px] text-muted">
              {banglaMonth.month.bn} {toBnDigits(banglaMonth.year)}
            </p>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            if (month === 12) {
              setMonth(1);
              setYear((y) => y + 1);
            } else setMonth((m) => m + 1);
          }}
        >
          ›
        </Button>
      </div>
      <div className="mt-3 flex items-center justify-center gap-3 text-[10px] uppercase tracking-wide text-muted">
        <span>{t("dates.gregorian")}</span>
        <span>·</span>
        <span>{t("dates.hijri")}</span>
        <span>·</span>
        <span className="font-bn normal-case tracking-normal">{t("dates.bangla")}</span>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {(WEEKDAYS[locale] || WEEKDAYS.en).map((d, i) => (
          <span key={`${d}-${i}`} className={locale === "bn" ? "font-bn" : undefined}>
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: new Date(year, month - 1, 1).getDay() }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {(monthQuery.data || []).map((day) => {
          const hijri = day.hijri;
          const gregorian = day.gregorian;
          const event = hijri ? eventMap.get(`${hijri.month?.number}-${hijri.day}`) : null;
          const bangla = gregorianToBangla(gregorianDate(gregorian));
          const today = isSameDay(gregorian, now);
          return (
            <div
              key={gregorian?.formatted || hijri?.formatted}
              className={`min-h-[72px] rounded-xl border p-1 text-center ${
                today
                  ? "border-gold bg-surface-warm"
                  : event
                    ? "border-primary/40 bg-primary-soft/50"
                    : "border-border bg-surface"
              }`}
            >
              <p className="time-text text-[11px] text-muted">{gregorian?.day}</p>
              <p className="time-text text-sm font-semibold leading-tight">{hijri?.day}</p>
              {bangla ? (
                <p className="font-bn time-text mt-0.5 text-[10px] leading-tight text-primary">
                  {toBnDigits(bangla.day)}
                  {bangla.day === 1 ? ` ${bangla.month.bn}` : ""}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {monthQuery.isLoading ? <p className="mt-3 text-sm text-muted">{t("common.loading")}</p> : null}
      <ul className="mt-4 space-y-2">
        {(events.data || []).map((e) => (
          <li key={e.id}>
            <Card>
              <p className="text-sm text-muted">
                {e.hijriDay} / {e.hijriMonth}
              </p>
              <p className="font-medium">{locale === "bn" ? e.name.bn : e.name.en}</p>
              <p className="mt-1 text-xs text-muted">{e.moonSightingNote}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
