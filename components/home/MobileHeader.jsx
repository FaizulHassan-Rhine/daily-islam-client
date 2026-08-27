"use client";

import Link from "next/link";
import { Bell, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocationStore } from "@/contexts/LocationContext";

const GREETINGS = {
  morning: "home.greetingMorning",
  day: "home.greetingDay",
  evening: "home.greetingEvening",
  night: "home.greetingNight",
};

export function MobileHeader({ period = "day" }) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { location } = useLocationStore();
  const name = user?.firstName;

  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-4">
      <div className="min-w-0">
        <p className="text-sm text-muted">{t(GREETINGS[period] || GREETINGS.day)}</p>
        <h1 className="truncate text-xl font-semibold tracking-tight">
          {name || t("app.name")}
        </h1>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <MapPin size={12} />
          {[location.city, location.country].filter(Boolean).join(", ") || "—"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          aria-label={t("nav.settings")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
        >
          <Bell size={18} />
        </Link>
        <Link href="/settings" aria-label={t("settings.account")}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
              {(name || "G").slice(0, 1)}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
