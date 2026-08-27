"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { registerFcmToken } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocationStore } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";

const ADJUST_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export default function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const { configured, isSignedIn, user, signInGoogle, logout, refreshUser } = useAuth();
  const { persist, requestBrowserLocation } = useLocationStore();
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const methods = useQuery({
    queryKey: ["methods"],
    queryFn: async () => (await api.get("/prayers/methods")).data.data,
  });
  const cities = useQuery({
    queryKey: ["cities", q],
    enabled: q.length >= 2,
    queryFn: async () => (await api.get("/prayers/cities", { params: { q } })).data.data,
  });
  const notify = useQuery({
    queryKey: ["notify"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/notifications")).data.data,
  });

  async function saveProfile(payload) {
    if (!isSignedIn) return;
    setBusy(true);
    try {
      await api.patch("/users/me", payload);
      await refreshUser();
    } finally {
      setBusy(false);
    }
  }

  async function savePrayer(payload) {
    if (!isSignedIn) return;
    await api.patch("/users/me/prayer-settings", payload);
    await refreshUser();
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-semibold">{t("nav.settings")}</h1>

      <Card>
        <h2 className="font-medium">{t("settings.account")}</h2>
        {isSignedIn ? (
          <div className="mt-3">
            <p>{user.displayName}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <Button className="mt-3" variant="secondary" onClick={logout}>
              {t("auth.signOut")}
            </Button>
          </div>
        ) : configured ? (
          <Button className="mt-3" onClick={() => signInGoogle()}>
            {t("auth.signIn")}
          </Button>
        ) : (
          <p className="mt-2 text-sm text-muted">{t("auth.unconfigured")}</p>
        )}
      </Card>

      <Card>
        <h2 className="font-medium">{t("settings.language")}</h2>
        <div className="mt-3 flex gap-2">
          {["en", "bn"].map((code) => (
            <Button
              key={code}
              size="sm"
              variant={locale === code ? "primary" : "secondary"}
              onClick={() => {
                setLocale(code);
                saveProfile({ language: code });
              }}
            >
              {code === "en" ? "English" : "বাংলা"}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium">{t("settings.theme")}</h2>
        <div className="mt-3 flex gap-2">
          {["light", "dark", "system"].map((id) => (
            <Button
              key={id}
              size="sm"
              variant={theme === id ? "primary" : "secondary"}
              onClick={() => {
                setTheme(id);
                saveProfile({ theme: id });
              }}
            >
              {t(`settings.${id}`)}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="font-medium">{t("settings.location")}</h2>
        <Button className="mt-3" variant="secondary" onClick={() => requestBrowserLocation()}>
          {t("home.useLocation")}
        </Button>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("home.searchCity")}
          className="mt-3 h-12 w-full rounded-2xl border border-border bg-background px-3 text-sm"
        />
        {(cities.data || []).map((p) => (
          <button
            key={p.displayName}
            type="button"
            className="mt-2 block w-full rounded-xl px-2 py-2 text-left text-sm hover:bg-primary-soft"
            onClick={() => persist({ ...p, source: "manual" })}
          >
            {p.city}, {p.country}
          </button>
        ))}
      </Card>

      <Card>
        <h2 className="font-medium">{t("settings.prayer")}</h2>
        <label className="mt-3 block text-sm">
          {t("prayer.method")}
          <Select
            className="mt-1"
            value={user?.prayerSettings?.calculationMethod ?? 1}
            onChange={(value) => savePrayer({ calculationMethod: Number(value) })}
            options={(methods.data || []).map((m) => ({ value: m.id, label: m.name }))}
            aria-label={t("prayer.method")}
          />
        </label>
        <label className="mt-3 block text-sm">
          {t("prayer.madhab")}
          <Select
            className="mt-1"
            value={user?.prayerSettings?.madhab || "hanafi"}
            onChange={(value) => savePrayer({ madhab: value })}
            options={[
              { value: "hanafi", label: t("prayer.hanafi") },
              { value: "shafi", label: t("prayer.shafi") },
            ]}
            aria-label={t("prayer.madhab")}
          />
        </label>
        <p className="mt-4 text-sm">{t("prayer.adjustments")}</p>
        {ADJUST_KEYS.map((key) => (
          <label key={key} className="mt-2 flex items-center justify-between text-sm">
            {t(`prayer.${key}`)}
            <input
              type="number"
              min="-30"
              max="30"
              className="h-10 w-20 rounded-xl border border-border bg-background px-2"
              defaultValue={user?.prayerSettings?.adjustments?.[key] || 0}
              onBlur={(e) =>
                savePrayer({
                  adjustments: { [key]: Number(e.target.value) },
                })
              }
            />
          </label>
        ))}
        <p className="mt-3 text-xs text-muted">{t("prayer.disclaimer")}</p>
      </Card>

      <Card>
        <h2 className="font-medium">{t("settings.notifications")}</h2>
        <p className="mt-2 text-sm text-muted">{t("notify.explain")}</p>
        <Button
          className="mt-3"
          variant="secondary"
          onClick={async () => {
            if (!("Notification" in window)) return;
            const perm = await Notification.requestPermission();
            if (perm !== "granted") return;
            const token = await registerFcmToken().catch(() => null);
            if (isSignedIn && token) {
              await api.post("/notifications/token", { token, platform: "web" });
            }
            if (isSignedIn) {
              await api.patch("/notifications", {
                prayers: {
                  fajr: { enabled: true, offsetMinutes: 0 },
                  dhuhr: { enabled: true, offsetMinutes: 0 },
                  asr: { enabled: true, offsetMinutes: 0 },
                  maghrib: { enabled: true, offsetMinutes: 0 },
                  isha: { enabled: true, offsetMinutes: 0 },
                },
              });
            }
          }}
        >
          {t("notify.allow")}
        </Button>
        {isSignedIn && notify.data?.prayers ? (
          <div className="mt-4 space-y-2">
            {ADJUST_KEYS.map((key) => (
              <label key={key} className="flex items-center justify-between gap-3 text-sm">
                <span>{t(`prayer.${key}`)}</span>
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked={notify.data.prayers[key]?.enabled}
                    onChange={(e) =>
                      api.patch("/notifications", {
                        [`prayers.${key}.enabled`]: e.target.checked,
                      })
                    }
                  />
                  <Select
                    className="w-[7.75rem]"
                    size="sm"
                    value={notify.data.prayers[key]?.offsetMinutes ?? 0}
                    onChange={(value) =>
                      api.patch("/notifications", {
                        [`prayers.${key}.offsetMinutes`]: Number(value),
                      })
                    }
                    options={[
                      { value: 0, label: "At time" },
                      { value: 5, label: "5 min" },
                      { value: 10, label: "10 min" },
                      { value: 15, label: "15 min" },
                      { value: 30, label: "30 min" },
                    ]}
                    aria-label={`${t(`prayer.${key}`)} reminder`}
                  />
                </span>
              </label>
            ))}
            {[
              ["morningAdhkar.enabled", "notify.morning"],
              ["eveningAdhkar.enabled", "notify.evening"],
              ["fridayKahf.enabled", "notify.friday"],
              ["dailyQuran.enabled", "notify.dailyQuran"],
              ["dailyAyah.enabled", "notify.dailyAyah"],
              ["ramadanSehri.enabled", "notify.sehri"],
              ["ramadanIftar.enabled", "notify.iftar"],
            ].map(([path, label]) => (
              <label key={path} className="flex items-center justify-between gap-3 text-sm">
                <span>{t(label)}</span>
                <input
                  type="checkbox"
                  defaultChecked={Boolean(path.split(".").reduce((obj, key) => obj?.[key], notify.data))}
                  onChange={(e) => api.patch("/notifications", { [path]: e.target.checked })}
                />
              </label>
            ))}
          </div>
        ) : null}
        <p className="mt-2 text-xs text-muted">Browser notifications are approximate, not exact native alarms.</p>
      </Card>

      {isSignedIn ? (
        <Card>
          <h2 className="font-medium">{t("settings.privacy")}</h2>
          <Button
            className="mt-3"
            variant="secondary"
            disabled={busy}
            onClick={async () => {
              const { data } = await api.get("/users/me/export");
              const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "daily-islam-export.json";
              a.click();
            }}
          >
            {t("settings.export")}
          </Button>
          <Button
            className="mt-3 ml-2"
            variant="ghost"
            onClick={async () => {
              if (!confirm("Delete this account and its saved logs?")) return;
              await api.delete("/users/me");
              await logout();
            }}
          >
            {t("settings.delete")}
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
