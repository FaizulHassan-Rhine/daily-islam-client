"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useLocationStore } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";

function readPrayerCache() {
  try {
    const cached = JSON.parse(localStorage.getItem("di.prayers.cache") || "null");
    return cached?.payload || undefined;
  } catch {
    return undefined;
  }
}

export function usePrayerTimes(date) {
  const { location, ready } = useLocationStore();
  const { user } = useAuth();
  const method = user?.prayerSettings?.calculationMethod;
  const madhab = user?.prayerSettings?.madhab;
  const [offlineCache, setOfflineCache] = useState(undefined);

  useEffect(() => {
    setOfflineCache(readPrayerCache());
  }, []);

  return useQuery({
    queryKey: queryKeys.prayersToday({
      lat: location.latitude,
      lng: location.longitude,
      date,
      method,
      madhab,
    }),
    enabled: ready && Number.isFinite(location.latitude),
    refetchInterval: 30 * 1000,
    placeholderData: offlineCache,
    queryFn: async () => {
      const { data } = await api.get("/prayers/today", {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          date,
          method,
          madhab,
        },
      });
      try {
        localStorage.setItem("di.prayers.cache", JSON.stringify({ at: Date.now(), payload: data.data }));
      } catch {
        /* ignore */
      }
      return data.data;
    },
  });
}

export function useDailyContent() {
  return useQuery({
    queryKey: queryKeys.daily,
    queryFn: async () => {
      const { data } = await api.get("/daily");
      return data.data;
    },
  });
}
