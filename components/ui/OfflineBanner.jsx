"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { api } from "@/lib/api";
import { flushQueue, queuedCount } from "@/lib/offlineQueue";

export function OfflineBanner() {
  const { t } = useLocale();
  const [offline, setOffline] = useState(false);
  const [queued, setQueued] = useState(0);

  useEffect(() => {
    const go = () => setOffline(!navigator.onLine);
    go();
    window.addEventListener("online", go);
    window.addEventListener("offline", go);
    return () => {
      window.removeEventListener("online", go);
      window.removeEventListener("offline", go);
    };
  }, []);

  useEffect(() => {
    setQueued(queuedCount());
    if (offline) return undefined;
    flushQueue(api).then(() => setQueued(queuedCount()));
    return undefined;
  }, [offline]);

  if (!offline && !queued) return null;
  return (
    <div role="status" className="bg-gold/20 px-4 py-2 text-center text-sm text-foreground">
      {offline ? t("app.offline") : t("app.syncing")}
    </div>
  );
}
