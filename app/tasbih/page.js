"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { todayInZone } from "@/lib/cn";
import { useLocationStore } from "@/contexts/LocationContext";

const PRESETS = [
  { id: "subhanallah", ar: "سُبْحَانَ اللَّه", en: "SubhanAllah" },
  { id: "alhamdulillah", ar: "الْحَمْدُ لِلَّه", en: "Alhamdulillah" },
  { id: "allahuakbar", ar: "اللَّهُ أَكْبَر", en: "Allahu Akbar" },
  { id: "tahlil", ar: "لَا إِلٰهَ إِلَّا اللَّه", en: "La ilaha illallah" },
  { id: "istighfar", ar: "أَسْتَغْفِرُ اللَّه", en: "Astaghfirullah" },
  { id: "salawat", ar: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّد", en: "Salawat" },
];

export default function TasbihPage() {
  const { t } = useLocale();
  const { isSignedIn } = useAuth();
  const { location } = useLocationStore();
  const [preset, setPreset] = useState(PRESETS[0]);
  const [custom, setCustom] = useState("");
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(33);
  const qc = useQueryClient();
  const date = todayInZone(location.timezone);
  const dhikr = custom.trim() || preset.en;

  const stats = useQuery({
    queryKey: ["tasbih-stats", date],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/tasbih/stats", { params: { date } })).data.data,
  });

  const save = useMutation({
    mutationFn: () => api.post("/tasbih", { dhikr, count, target, date }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasbih-stats"] }),
  });

  const progress = useMemo(() => Math.min(1, count / target), [count, target]);

  function tap() {
    setCount((n) => n + 1);
    if (navigator.vibrate) navigator.vibrate(12);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.tasbih")}</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setPreset(p);
              setCustom("");
            }}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-xs ${preset.id === p.id && !custom ? "bg-primary text-white dark:text-background" : "bg-primary-soft text-primary"}`}
          >
            {p.en}
          </button>
        ))}
      </div>
      <input
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder={t("tasbih.custom")}
        className="mt-2 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm"
      />
      <Card className="mt-4 flex flex-col items-center py-8">
        <p className="arabic-text text-3xl">{custom || preset.ar}</p>
        <button
          type="button"
          onClick={tap}
          className="mt-6 flex h-44 w-44 items-center justify-center rounded-full bg-primary text-4xl font-semibold text-white shadow-glow dark:text-background"
          aria-label="Count"
        >
          {count}
        </button>
        <div className="mt-4 h-2 w-48 overflow-hidden rounded-full bg-primary-soft">
          <div className="h-full bg-gold" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="mt-4 flex gap-2">
          {[33, 100].map((n) => (
            <Button key={n} size="sm" variant={target === n ? "primary" : "secondary"} onClick={() => setTarget(n)}>
              {n}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setCount(0)}>
            {t("tasbih.reset")}
          </Button>
        </div>
        {isSignedIn ? (
          <Button className="mt-4" variant="secondary" disabled={!count} onClick={() => save.mutate()}>
            {t("tasbih.save")}
          </Button>
        ) : null}
        {stats.data ? (
          <p className="mt-3 text-sm text-muted">
            {t("tasbih.today")}: {stats.data.todayTotal} · {t("tracker.streak")}: {stats.data.streak}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
