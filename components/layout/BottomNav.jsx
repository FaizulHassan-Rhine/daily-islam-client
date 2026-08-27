"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Compass, Home, MoreHorizontal, Sparkles } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { cn } from "@/lib/cn";

const items = [
  { href: "/", key: "nav.home", icon: Home },
  { href: "/quran", key: "nav.quran", icon: BookOpen },
  { href: "/prayer", key: "nav.prayer", icon: Compass },
  { href: "/dua", key: "nav.dua", icon: Sparkles },
  { href: "/more", key: "nav.more", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                {t(item.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
