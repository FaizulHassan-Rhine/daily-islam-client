"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Clock3, Flame, Minus, Trophy, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocationStore } from "@/contexts/LocationContext";
import { cn, todayInZone } from "@/lib/cn";
import { dateFromParts, formatBanglaCalendar, gregorianToBangla, toBnDigits } from "@/lib/banglaCalendar";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useHydrated } from "@/hooks/useHydrated";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const STATUSES = [
  { id: "performed", icon: Check, tone: "primary" },
  { id: "jamaah", icon: Users, tone: "gold" },
  { id: "late", icon: Clock3, tone: "warm" },
  { id: "missed", icon: X, tone: "missed" },
  { id: "none", icon: Minus, tone: "none" },
];

function isKept(status) {
  return Boolean(status) && status !== "none" && status !== "missed";
}

function shiftIso(iso, days) {
  const [y, m, d] = String(iso).split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days, 12));
  return next.toISOString().slice(0, 10);
}

function weekday(iso) {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

function digits(value, locale) {
  return locale === "bn" ? toBnDigits(value) : String(value);
}

export default function TrackerPage() {
  const { t, locale } = useLocale();
  const { isSignedIn, loading } = useAuth();
  const { location } = useLocationStore();
  const hydrated = useHydrated();
  const today = todayInZone(location.timezone);
  const [selectedDate, setSelectedDate] = useState(today);
  const qc = useQueryClient();
  const prayersToday = usePrayerTimes();

  const logQuery = useQuery({
    queryKey: queryKeys.prayerLog(selectedDate),
    enabled: isSignedIn && hydrated,
    queryFn: async () => (await api.get("/prayer-logs", { params: { date: selectedDate } })).data.data,
  });
  const rangeQuery = useQuery({
    queryKey: ["prayer-range"],
    enabled: isSignedIn && hydrated,
    queryFn: async () => (await api.get("/prayer-logs/range")).data.data,
  });
  const statsQuery = useQuery({
    queryKey: queryKeys.stats,
    enabled: isSignedIn && hydrated,
    queryFn: async () => (await api.get("/stats")).data.data,
  });

  const mutate = useMutation({
    mutationFn: (payload) =>
      api.post("/prayer-logs", { ...payload, date: selectedDate, timezone: location.timezone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.prayerLog(selectedDate) });
      qc.invalidateQueries({ queryKey: queryKeys.stats });
      qc.invalidateQueries({ queryKey: ["prayer-range"] });
    },
  });

  const prayers = logQuery.data?.prayers || {};
  const done = KEYS.filter((key) => isKept(prayers[key]?.status)).length;
  const remaining = 5 - done;
  const isToday = selectedDate === today;
  const currentKey = isToday ? prayersToday.data?.currentPrayer?.key : null;
  const selectedParts = selectedDate.split("-");
  const selectedAsDate = dateFromParts(selectedParts[0], selectedParts[1], selectedParts[2]);
  const banglaLine = selectedAsDate ? formatBanglaCalendar(selectedAsDate, "bn") : "";
  const gregorianLine = selectedAsDate
    ? new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(selectedAsDate)
    : selectedDate;

  const dailyMap = useMemo(() => {
    const map = new Map();
    for (const row of rangeQuery.data?.summary?.daily || []) map.set(row.date, row.completed);
    for (const row of statsQuery.data?.year?.daily || []) map.set(row.date, row.completed);
    return map;
  }, [rangeQuery.data, statsQuery.data]);

  const weekDays = useMemo(() => lastDays(today, 7, dailyMap, locale), [today, dailyMap, locale]);
  const monthDays = useMemo(() => lastDays(today, 28, dailyMap, locale), [today, dailyMap, locale]);
  const perPrayer = statsQuery.data?.month?.perPrayer || {};

  async function markRemaining() {
    const pending = KEYS.filter((key) => !isKept(prayers[key]?.status));
    await Promise.all(pending.map((prayer) => mutate.mutateAsync({ prayer, status: "performed" })));
  }

  if (!hydrated || loading) return <HomeSkeleton />;
  if (!isSignedIn) {
    return (
      <div className="p-4">
        <EmptyState title={t("nav.tracker")} body={t("auth.needed")} />
      </div>
    );
  }
  if (logQuery.isLoading) return <HomeSkeleton />;

  const stats = statsQuery.data;

  return (
    <div className="p-4 pb-8">
      <h1 className="text-2xl font-semibold">{t("nav.tracker")}</h1>

      <section className="mt-4 overflow-hidden rounded-card-lg border border-border/80 bg-surface p-5">
        <div className="flex items-center gap-5">
          <TodayRing done={done} locale={locale} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              {isToday ? t("tracker.today") : t("tracker.logged")}
            </p>
            <p className="mt-1 text-sm text-foreground">{gregorianLine}</p>
            <p className="font-bn time-text mt-0.5 truncate text-[12px] text-muted">{banglaLine}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg"
                onClick={() => setSelectedDate(shiftIso(selectedDate, -1))}
                aria-label="Previous day"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={isToday}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg disabled:opacity-30"
                onClick={() => setSelectedDate(shiftIso(selectedDate, 1))}
                aria-label="Next day"
              >
                ›
              </button>
              {!isToday ? (
                <button
                  type="button"
                  className="h-9 rounded-full border border-border px-3 text-xs font-medium"
                  onClick={() => setSelectedDate(today)}
                >
                  {t("tracker.today")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
        {remaining > 0 ? (
          <Button className="mt-4 w-full" variant="secondary" size="sm" onClick={markRemaining} disabled={mutate.isPending}>
            {t("tracker.markPerformed")}
          </Button>
        ) : (
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-primary">
            <Check size={16} />
            {t("tracker.allLogged")}
          </p>
        )}
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatCard
          icon={CalendarDays}
          label={t("tracker.today")}
          value={`${digits(stats?.today?.completed ?? done, locale)}/${digits(5, locale)}`}
          ratio={(stats?.today?.completed ?? done) / 5}
        />
        <StatCard
          icon={CalendarDays}
          label={t("tracker.week")}
          value={`${digits(stats?.week?.completed ?? 0, locale)}/${digits(35, locale)}`}
          ratio={(stats?.week?.completed ?? 0) / 35}
        />
        <StatCard
          icon={Flame}
          label={t("tracker.streak")}
          value={digits(stats?.streaks?.current ?? 0, locale)}
          hint={t("tracker.daysUnit")}
          ratio={Math.min((stats?.streaks?.current ?? 0) / 7, 1)}
        />
        <StatCard
          icon={Trophy}
          label={t("tracker.best")}
          value={digits(stats?.streaks?.best ?? 0, locale)}
          hint={t("tracker.daysUnit")}
          ratio={stats?.streaks?.best ? Math.min((stats?.streaks?.current ?? 0) / stats.streaks.best, 1) : 0}
        />
        <StatCard
          label={t("tracker.month")}
          value={`${digits(stats?.month?.percent ?? 0, locale)}%`}
          ratio={(stats?.month?.percent ?? 0) / 100}
        />
        <StatCard
          label={t("tracker.consistent")}
          value={stats?.mostConsistent ? t(`prayer.${stats.mostConsistent}`) : "—"}
          ratio={1}
        />
      </div>

      <div className="mt-4 space-y-3">
        {KEYS.map((key) => (
          <Card key={key} className={cn(currentKey === key && "border-gold/70 bg-surface-warm/80")}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="font-medium">{t(`prayer.${key}`)}</p>
              {currentKey === key ? (
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  {t("tracker.now")}
                </span>
              ) : null}
            </div>
            <StatusPicker
              value={prayers[key]?.status || "none"}
              onChange={(status) => mutate.mutate({ prayer: key, status })}
              t={t}
            />
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <p className="text-sm font-medium">{t("tracker.week")}</p>
        <p className="mt-0.5 text-[11px] text-muted">{t("tracker.weekHint")}</p>
        <WeekBars days={weekDays} locale={locale} />
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-medium">{t("tracker.byPrayer")}</p>
        <div className="mt-3 space-y-2">
          {KEYS.map((key) => {
            const count = perPrayer[key] || 0;
            const max = Math.max(28, ...KEYS.map((k) => perPrayer[k] || 0), 1);
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-muted">{t(`prayer.${key}`)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="time-text w-6 text-right text-xs">{digits(count, locale)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-medium">{t("tracker.month")}</p>
        <p className="mt-0.5 text-[11px] text-muted">{t("tracker.monthHint")}</p>
        <MonthGrid days={monthDays} />
      </Card>

      <Card className="mt-4">
        <p className="text-sm font-medium">{t("tracker.year")}</p>
        <p className="mt-0.5 text-[11px] text-muted">{t("tracker.yearHint")}</p>
        <HeatMap today={today} values={dailyMap} locale={locale} />
        <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-muted">
          <span>{t("tracker.legendNone")}</span>
          {[0, 1, 2, 3, 5].map((n) => (
            <span key={n} className="h-3 w-3 rounded-sm" style={{ background: heatColor(n) }} />
          ))}
          <span>{t("tracker.legendAll")}</span>
        </div>
      </Card>
    </div>
  );
}

function StatusPicker({ value, onChange, t }) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {STATUSES.map((status) => {
        const Icon = status.icon;
        const active = value === status.id;
        return (
          <button
            key={status.id}
            type="button"
            onClick={() => onChange(status.id)}
            className={cn(
              "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border px-1 py-2 text-[10px] font-medium transition",
              active ? toneClass(status.tone) : "border-border bg-background text-muted hover:border-primary/40"
            )}
          >
            <Icon size={15} strokeWidth={2.2} />
            <span className="leading-tight">{t(`tracker.${status.id}`)}</span>
          </button>
        );
      })}
    </div>
  );
}

function toneClass(tone) {
  if (tone === "gold") return "border-gold bg-gold text-background";
  if (tone === "warm") return "border-secondary bg-secondary text-white dark:text-background";
  if (tone === "missed") return "border-foreground/40 bg-foreground/80 text-background";
  if (tone === "none") return "border-border bg-surface text-muted";
  return "border-primary bg-primary text-white dark:text-background";
}

function TodayRing({ done, locale }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, done / 5));
  return (
    <div className="relative h-[108px] w-[108px] shrink-0">
      <svg viewBox="0 0 108 108" className="h-full w-full -rotate-90">
        <circle cx="54" cy="54" r={r} fill="none" stroke="currentColor" className="text-border" strokeWidth="7" />
        <circle
          cx="54"
          cy="54"
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="time-text text-2xl font-semibold leading-none">{digits(done, locale)}</p>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted">{digits(5, locale)}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, ratio = 0 }) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] text-muted">{label}</p>
        {Icon ? <Icon size={14} className="text-primary/70" aria-hidden /> : null}
      </div>
      <p className="time-text mt-1 text-xl font-semibold">{value}</p>
      {hint ? <p className="text-[10px] text-muted">{hint}</p> : null}
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary/80" style={{ width: `${Math.min(100, Math.max(4, ratio * 100))}%` }} />
      </div>
    </Card>
  );
}

function lastDays(today, count, dailyMap, locale) {
  const names = locale === "bn" ? ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"] : ["S", "M", "T", "W", "T", "F", "S"];
  return Array.from({ length: count }, (_, i) => {
    const iso = shiftIso(today, -(count - 1 - i));
    return { iso, completed: dailyMap.get(iso) || 0, label: names[weekday(iso)] };
  });
}

function WeekBars({ days, locale }) {
  const max = 5;
  return (
    <div className="mt-4 flex h-28 items-end gap-2">
      {days.map((day) => (
        <div key={day.iso} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-20 w-full items-end rounded-lg bg-border/70">
            <div
              className="w-full rounded-lg bg-primary transition-[height]"
              style={{ height: `${Math.max(6, (day.completed / max) * 100)}%` }}
              title={`${day.iso}: ${day.completed}/5`}
            />
          </div>
          <span className={cn("text-[10px] text-muted", locale === "bn" && "font-bn")}>{day.label}</span>
        </div>
      ))}
    </div>
  );
}

function MonthGrid({ days }) {
  return (
    <div className="mt-3 grid grid-cols-7 gap-1">
      {days.map((day) => (
        <div
          key={day.iso}
          title={`${day.iso}: ${day.completed}/5`}
          className="aspect-square rounded-md"
          style={{ background: heatColor(day.completed) }}
        />
      ))}
    </div>
  );
}

function HeatMap({ today, values, locale }) {
  let start = shiftIso(today, -83);
  while (weekday(start) !== 0) start = shiftIso(start, -1);
  const cells = [];
  for (let cursor = start; cursor <= today; cursor = shiftIso(cursor, 1)) {
    const completed = values.get(cursor) || 0;
    const [y, m, d] = cursor.split("-").map(Number);
    const bangla = gregorianToBangla(dateFromParts(y, m, d));
    const banglaLabel = bangla ? `${toBnDigits(bangla.day)} ${bangla.month.bn}` : "";
    cells.push({ iso: cursor, completed, banglaLabel });
  }
  const weekdays = locale === "bn" ? ["র", "সো", "ম", "বু", "বৃ", "শু", "শ"] : ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="mt-3 flex gap-2">
      <div className="flex flex-col justify-between py-0.5 text-[9px] text-muted">
        {weekdays.map((d, i) => (
          <span key={i} className={locale === "bn" ? "font-bn" : undefined}>
            {d}
          </span>
        ))}
      </div>
      <div className="grid flex-1 grid-flow-col grid-rows-7 gap-1">
        {cells.map((cell) => (
          <div
            key={cell.iso}
            title={`${cell.iso}${cell.banglaLabel ? ` · ${cell.banglaLabel}` : ""} · ${cell.completed}/5`}
            className="aspect-square min-h-3 rounded-sm"
            style={{ background: heatColor(cell.completed) }}
          />
        ))}
      </div>
    </div>
  );
}

function heatColor(value) {
  if (!value) return "rgb(var(--color-border) / 0.7)";
  const alpha = 0.22 + (value / 5) * 0.78;
  return `rgb(var(--color-primary) / ${alpha})`;
}
