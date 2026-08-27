"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { todayInZone } from "@/lib/cn";
import { useLocationStore } from "@/contexts/LocationContext";

const KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function SalahTrackerCard() {
  const { t } = useLocale();
  const { isSignedIn } = useAuth();
  const { location } = useLocationStore();
  const date = todayInZone(location.timezone);
  const qc = useQueryClient();

  const logQuery = useQuery({
    queryKey: queryKeys.prayerLog(date),
    enabled: isSignedIn,
    queryFn: async () => {
      const { data } = await api.get("/prayer-logs", { params: { date } });
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ prayer, status }) => {
      const { data } = await api.post("/prayer-logs", {
        date,
        prayer,
        status,
        timezone: location.timezone,
      });
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.prayerLog(date) });
      qc.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });

  const prayers = logQuery.data?.prayers || {};
  const done = KEYS.filter((k) => {
    const s = prayers[k]?.status;
    return s && s !== "none" && s !== "missed";
  }).length;

  return (
    <Card className="mx-4 mt-4">
      <CardHeader
        title={t("nav.tracker")}
        action={
          <Link href="/tracker" className="text-sm text-primary">
            {t("common.seeAll")}
          </Link>
        }
      />
      {!isSignedIn ? (
        <p className="text-sm text-muted">{t("auth.needed")}</p>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted">
            {t("tracker.today")}: {done}/5
          </p>
          <div className="grid grid-cols-5 gap-2">
            {KEYS.map((key) => {
              const status = prayers[key]?.status || "none";
              const active = status !== "none" && status !== "missed";
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    mutation.mutate({
                      prayer: key,
                      status: active ? "none" : "performed",
                    })
                  }
                  className={`rounded-2xl border py-3 text-[11px] font-medium ${
                    active ? "border-primary bg-primary-soft text-primary" : "border-border"
                  }`}
                >
                  {t(`prayer.${key}`)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
