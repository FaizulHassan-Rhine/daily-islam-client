"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocationStore } from "@/contexts/LocationContext";

export default function QiblaPage() {
  const { t } = useLocale();
  const { location } = useLocationStore();
  const [heading, setHeading] = useState(null);
  const [compassError, setCompassError] = useState("");

  const query = useQuery({
    queryKey: ["qibla", location.latitude, location.longitude],
    queryFn: async () =>
      (
        await api.get("/qibla", {
          params: { latitude: location.latitude, longitude: location.longitude },
        })
      ).data.data,
    enabled: Number.isFinite(location.latitude),
  });

  useEffect(() => {
    function onOrient(event) {
      const value = event.webkitCompassHeading ?? event.alpha;
      if (value != null) setHeading(360 - value);
    }
    window.addEventListener("deviceorientationabsolute", onOrient, true);
    window.addEventListener("deviceorientation", onOrient, true);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrient, true);
      window.removeEventListener("deviceorientation", onOrient, true);
    };
  }, []);

  async function enableCompass() {
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && DeviceOrientationEvent.requestPermission) {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== "granted") setCompassError(t("qibla.permission"));
      }
    } catch {
      setCompassError(t("qibla.noCompass"));
    }
  }

  const bearing = query.data?.bearing || 0;
  const rotation = heading == null ? bearing : bearing - heading;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.qibla")}</h1>
      <Card className="mt-4 flex flex-col items-center py-8">
        <div className="relative h-56 w-56">
          <div className="absolute inset-0 rounded-full border border-border" />
          <div
            className="absolute inset-6 rounded-full border border-primary/30 transition-transform duration-200"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute left-1/2 top-0 h-10 w-1 -translate-x-1/2 rounded-full bg-gold" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Kaaba</div>
        </div>
        <p className="mt-4 text-3xl font-semibold tabular-nums">{Math.round(bearing)}°</p>
        <p className="text-sm text-muted">{t("qibla.bearing")}</p>
        <p className="mt-2 text-sm">
          {t("qibla.distance")}: {query.data?.distanceKm ?? "—"} km
        </p>
        {heading == null ? <p className="mt-3 px-4 text-center text-xs text-muted">{compassError || t("qibla.noCompass")}</p> : null}
        <Button className="mt-4" variant="secondary" onClick={enableCompass}>
          {t("qibla.permission")}
        </Button>
      </Card>
    </div>
  );
}
