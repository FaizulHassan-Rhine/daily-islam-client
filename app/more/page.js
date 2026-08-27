"use client";

import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  Calculator,
  CalendarDays,
  CircleDot,
  Compass,
  MoonStar,
  Settings,
  Star,
  Target,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const links = [
  { href: "/hadith", key: "nav.hadith", icon: BookOpen },
  { href: "/tracker", key: "nav.tracker", icon: Target },
  { href: "/tasbih", key: "nav.tasbih", icon: CircleDot },
  { href: "/qibla", key: "nav.qibla", icon: Compass },
  { href: "/names", key: "nav.names", icon: Star },
  { href: "/calendar", key: "nav.calendar", icon: CalendarDays },
  { href: "/zakat", key: "nav.zakat", icon: Calculator },
  { href: "/ramadan", key: "nav.ramadan", icon: MoonStar },
  { href: "/bookmarks", key: "nav.bookmarks", icon: Bookmark },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

export default function MorePage() {
  const { t } = useLocale();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.more")}</h1>
      <ul className="mt-4 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-card border border-border bg-surface px-4 py-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <Icon size={18} />
                </span>
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
