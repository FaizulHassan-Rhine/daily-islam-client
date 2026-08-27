"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Compass, Sparkles, CircleDot, Library } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const actions = [
  { href: "/qibla", key: "nav.qibla", icon: Compass },
  { href: "/tasbih", key: "nav.tasbih", icon: CircleDot },
  { href: "/quran", key: "nav.quran", icon: BookOpen },
  { href: "/dua", key: "nav.dua", icon: Sparkles },
  { href: "/hadith", key: "nav.hadith", icon: Library },
  { href: "/calendar", key: "nav.calendar", icon: CalendarDays },
];

export function QuickActions() {
  const { t } = useLocale();
  return (
    <section className="mx-4 mt-4">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-muted">{t("home.quickActions")}</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-card border border-border bg-surface text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Icon size={18} />
              </span>
              <span className="text-xs font-medium">{t(item.key)}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
