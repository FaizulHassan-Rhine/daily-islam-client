"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Calculator,
  CalendarDays,
  Compass,
  Home,
  MoonStar,
  Settings,
  Sparkles,
  Star,
  Target,
  CircleDot,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/quran", key: "nav.quran", icon: BookOpen },
  { href: "/prayer", key: "nav.prayer", icon: Compass },
  { href: "/tracker", key: "nav.tracker", icon: Target },
  { href: "/dua", key: "nav.dua", icon: Sparkles },
  { href: "/hadith", key: "nav.hadith", icon: BookOpen },
  { href: "/tasbih", key: "nav.tasbih", icon: CircleDot },
  { href: "/qibla", key: "nav.qibla", icon: Compass },
  { href: "/names", key: "nav.names", icon: Star },
  { href: "/calendar", key: "nav.calendar", icon: CalendarDays },
  { href: "/zakat", key: "nav.zakat", icon: Calculator },
  { href: "/ramadan", key: "nav.ramadan", icon: MoonStar },
  { href: "/bookmarks", key: "nav.bookmarks", icon: Bookmark },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-border bg-surface p-4 lg:block">
      <Link href="/" className="mb-6 block px-2">
        <p className="font-semibold tracking-tight text-primary">{t("app.name")}</p>
        <p className="text-xs text-muted">{t("app.tagline")}</p>
      </Link>
      <nav aria-label="Sidebar">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm",
                    active ? "bg-primary-soft text-primary" : "text-muted hover:bg-primary-soft/50"
                  )}
                >
                  <Icon size={18} />
                  {t(item.key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
