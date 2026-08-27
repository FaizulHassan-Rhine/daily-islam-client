"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocationStore } from "@/contexts/LocationContext";

export function LocationDisplay() {
  const { t } = useLocale();
  const { location, persist, requestBrowserLocation, permission } = useLocationStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!location.city) setOpen(true);
  }, [location.city]);

  const search = useQuery({
    queryKey: queryKeys.cities(q),
    enabled: q.trim().length >= 2,
    queryFn: async () => {
      const { data } = await api.get("/prayers/cities", { params: { q } });
      return data.data;
    },
  });

  async function useGeo() {
    try {
      const coords = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((p) => resolve(p.coords), reject, {
          timeout: 8000,
        });
      });
      const { data } = await api.get("/prayers/reverse", {
        params: { latitude: coords.latitude, longitude: coords.longitude },
      });
      await persist({ ...data.data, source: "geo" });
      setOpen(false);
    } catch {
      await requestBrowserLocation().catch(() => {});
    }
  }

  if (!open) return null;

  return (
    <Card className="mx-4 mt-4">
      <p className="text-sm font-medium">{t("home.locationNeeded")}</p>
      {permission === "denied" ? (
        <p className="mt-1 text-xs text-muted">{t("home.locationDenied")}</p>
      ) : null}
      <div className="mt-3 flex flex-col gap-2">
        <Button onClick={useGeo}>{t("home.useLocation")}</Button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("home.searchCity")}
          className="h-12 rounded-2xl border border-border bg-background px-3 text-sm"
        />
        {search.data?.length ? (
          <ul className="max-h-48 overflow-auto rounded-2xl border border-border">
            {search.data.map((place) => (
              <li key={`${place.latitude}-${place.longitude}-${place.displayName}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-primary-soft/60"
                  onClick={async () => {
                    await persist({ ...place, source: "manual" });
                    setOpen(false);
                  }}
                >
                  {place.city}, {place.country}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
