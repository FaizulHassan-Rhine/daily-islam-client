"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocationStore } from "@/contexts/LocationContext";
import { todayInZone } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { HomeSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";

const KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
const STATUSES = ["performed", "jamaah", "late", "missed", "none"];

export default function TrackerPage() {
  const { t } = useLocale();
  const { isSignedIn } = useAuth();
  const { location } = useLocationStore();
  const date = todayInZone(location.timezone);
  const qc = useQueryClient();

  const logQuery = useQuery({
    queryKey: ["prayer-log", date],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/prayer-logs", { params: { date } })).data.data,
  });
  const rangeQuery = useQuery({
    queryKey: ["prayer-range"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/prayer-logs/range")).data.data,
  });
  const statsQuery = useQuery({
    queryKey: ["stats"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/stats")).data.data,
  });

  const mutate = useMutation({
    mutationFn: (payload) => api.post("/prayer-logs", { ...payload, date, timezone: location.timezone }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prayer-log", date] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["prayer-range"] });
    },
  });

  if (!isSignedIn) {
    return (
      <div className="p-4">
        <EmptyState title={t("nav.tracker")} body={t("auth.needed")} />
      </div>
    );
  }
  if (logQuery.isLoading) return <HomeSkeleton />;

  const prayers = logQuery.data?.prayers || {};
  const daily = rangeQuery.data?.summary?.daily || [];
  const year = statsQuery.data?.year?.daily || [];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.tracker")}</h1>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Stat label={t("tracker.today")} value={`${statsQuery.data?.today?.completed ?? 0}/5`} />
        <Stat label={t("tracker.week")} value={`${statsQuery.data?.week?.completed ?? 0}/35`} />
        <Stat label={t("tracker.month")} value={`${statsQuery.data?.month?.percent ?? 0}%`} />
        <Stat label={t("tracker.streak")} value={statsQuery.data?.streaks?.current ?? 0} />
        <Stat label={t("tracker.best")} value={statsQuery.data?.streaks?.best ?? 0} />
        <Stat
          label={t("tracker.consistent")}
          value={statsQuery.data?.mostConsistent ? t(`prayer.${statsQuery.data.mostConsistent}`) : "—"}
        />
      </div>
      <div className="mt-4 space-y-3">
        {KEYS.map((key) => (
          <Card key={key}>
            <p className="mb-2 font-medium">{t(`prayer.${key}`)}</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => {
                const active = prayers[key]?.status === status;
                return (
                  <Button
                    key={status}
                    size="sm"
                    variant={active ? "primary" : "secondary"}
                    onClick={() => mutate.mutate({ prayer: key, status })}
                  >
                    {t(`tracker.${status}`)}
                  </Button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-4 h-56">
        <p className="mb-2 text-sm text-muted">{t("tracker.week")}</p>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={daily.slice(-7)}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="completed" fill="#315E4B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="mt-4 h-56">
        <p className="mb-2 text-sm text-muted">{t("tracker.month")}</p>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={daily.slice(-14)}>
            <XAxis dataKey="date" hide />
            <YAxis hide domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="completed" fill="#315E4B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="mt-4">
        <p className="mb-3 text-sm text-muted">Year</p>
        <HeatMap days={year} />
      </Card>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <Card>
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </Card>
  );
}

function HeatMap({ days }) {
  const map = new Map((days || []).map((d) => [d.date, d.completed]));
  const cells = Array.from({ length: 84 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (83 - i));
    const iso = date.toISOString().slice(0, 10);
    return { iso, value: map.get(iso) || 0 };
  });
  return (
    <div className="grid grid-cols-12 gap-1">
      {cells.map((c) => (
        <div
          key={c.iso}
          title={`${c.iso}: ${c.value}/5`}
          className="h-4 rounded-sm"
          style={{ background: `rgba(49, 94, 75, ${0.12 + (c.value / 5) * 0.88})` }}
        />
      ))}
    </div>
  );
}
