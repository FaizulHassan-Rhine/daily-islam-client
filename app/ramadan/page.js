"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationStore } from "@/contexts/LocationContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTime, todayInZone } from "@/lib/cn";
import { RamadanCard } from "@/components/home/RamadanCard";
import { EmptyState } from "@/components/ui/EmptyState";

const TYPES = ["ramadan", "monday", "thursday", "ayyam_al_beed", "shawwal", "arafah", "ashura", "qada", "nafl", "other"];

export default function RamadanPage() {
  const { t, locale } = useLocale();
  const prayers = usePrayerTimes();
  const { isSignedIn } = useAuth();
  const { location } = useLocationStore();
  const date = todayInZone(location.timezone);
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const qc = useQueryClient();

  const fasts = useQuery({
    queryKey: ["fasting"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/fasting")).data.data,
  });
  const progress = useQuery({
    queryKey: ["ramadan-progress"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/ramadan/progress")).data.data,
  });
  const duas = useQuery({
    queryKey: ["ramadan-duas"],
    queryFn: async () => (await api.get("/duas", { params: { category: "ramadan" } })).data.data,
  });
  const save = useMutation({
    mutationFn: (payload) => api.post("/fasting", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fasting"] }),
  });
  const remove = useMutation({
    mutationFn: ({ date: d, type }) => api.delete("/fasting", { params: { date: d, type } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fasting"] }),
  });
  const saveProgress = useMutation({
    mutationFn: (payload) => api.patch("/ramadan/progress", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ramadan-progress"] }),
  });

  const fastDates = new Set(
    (fasts.data?.items || []).filter((item) => item.completed && item.type === "ramadan").map((item) => item.date)
  );
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = new Date(year, month - 1, 1).getDay();
  const tarawihToday = progress.data?.tarawihDates?.includes(date);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.ramadan")}</h1>
      {prayers.data?.ramadan ? (
        <div className="-mx-4">
          <RamadanCard prayer={prayers.data} locale={locale} />
        </div>
      ) : (
        <EmptyState title={t("nav.ramadan")} body="Ramadan is detected automatically from the Hijri date." />
      )}
      <p className="mt-4 text-sm text-muted">{t("ramadan.kadrNote")}</p>

      <Card className="mt-4">
        <p className="mb-3 font-medium">{t("ramadan.calendar")}</p>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={`${d}-${i}`}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: startWeekday }).map((_, i) => (
            <span key={`pad-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const marked = fastDates.has(iso);
            return (
              <button
                key={iso}
                type="button"
                disabled={!isSignedIn}
                onClick={() =>
                  marked
                    ? remove.mutate({ date: iso, type: "ramadan" })
                    : save.mutate({ date: iso, type: "ramadan", completed: true })
                }
                className={`min-h-11 rounded-xl text-sm ${
                  marked ? "bg-primary text-white dark:text-background" : "bg-primary-soft text-primary"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">
          {t("nav.fasting")}: {fasts.data?.stats?.total ?? 0}
          {fasts.data?.stats?.streak ? ` · ${t("tracker.streak")} ${fasts.data.stats.streak}` : ""}
        </p>
      </Card>

      <Card className="mt-4">
        <p className="mb-2 font-medium">{t("nav.fasting")}</p>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <button
              key={type}
              type="button"
              disabled={!isSignedIn}
              onClick={() => save.mutate({ date, type, completed: true })}
              className="rounded-full bg-primary-soft px-3 py-2 text-xs text-primary"
            >
              {type.replaceAll("_", " ")}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4">
        <p className="mb-3 font-medium">{t("ramadan.tarawih")}</p>
        <Button
          variant={tarawihToday ? "primary" : "secondary"}
          disabled={!isSignedIn}
          onClick={() => saveProgress.mutate({ tarawihDate: date })}
        >
          {tarawihToday ? t("ramadan.marked") : t("ramadan.tarawih")} · {progress.data?.tarawihDates?.length || 0}
        </Button>
        <p className="mt-4 text-sm font-medium">{t("ramadan.khatm")}</p>
        <div className="mt-2 grid grid-cols-6 gap-1">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
            <button
              key={juz}
              type="button"
              disabled={!isSignedIn}
              onClick={() => saveProgress.mutate({ khatmJuz: juz })}
              className={`min-h-11 rounded-xl text-xs ${
                (progress.data?.khatmJuz || 0) >= juz
                  ? "bg-primary text-white dark:text-background"
                  : "bg-primary-soft text-primary"
              }`}
            >
              {juz}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm">
          {t("ramadan.goal")}
          <input
            type="number"
            min="1"
            max="100"
            disabled={!isSignedIn}
            key={progress.data?.dailyTarget || "goal"}
            defaultValue={progress.data?.dailyTarget || 10}
            onBlur={(e) => saveProgress.mutate({ dailyTarget: Number(e.target.value) })}
            className="mt-1 h-11 w-full rounded-2xl border border-border bg-background px-3"
          />
        </label>
      </Card>

      <div className="mt-4 space-y-2">
        {(duas.data || []).map((d) => (
          <Card key={d.id}>
            <p className="text-sm font-medium">{locale === "bn" ? d.title.bn : d.title.en}</p>
            <p className="arabic-text mt-2 text-xl">{d.arabic}</p>
          </Card>
        ))}
      </div>
      {prayers.data?.ramadan ? (
        <p className="time-text mt-3 text-xs text-muted">
          {t("prayer.fajr")} {formatTime(prayers.data.ramadan.fajr, locale)}
        </p>
      ) : null}
    </div>
  );
}
