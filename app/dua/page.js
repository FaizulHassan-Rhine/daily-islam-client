"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

const CATEGORIES = [
  "all",
  "morning",
  "evening",
  "sleep",
  "wake",
  "food",
  "home",
  "mosque",
  "travel",
  "parents",
  "forgiveness",
  "protection",
  "hardship",
  "illness",
  "ramadan",
  "laylatul_qadr",
  "hajj",
  "umrah",
  "other",
];

export default function DuaPage() {
  const { t, locale } = useLocale();
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const query = useQuery({
    queryKey: ["duas", category, q],
    queryFn: async () =>
      (await api.get("/duas", { params: { category: category === "all" ? undefined : category, q } })).data.data,
  });

  if (query.isLoading) return <ListSkeleton />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.dua")}</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("common.search")}
        className="mt-4 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm"
      />
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`whitespace-nowrap rounded-full px-3 py-2 text-xs ${category === c ? "bg-primary text-white dark:text-background" : "bg-primary-soft text-primary"}`}
          >
            {c.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <ul className="mt-2 space-y-3">
        {(query.data || []).map((dua) => (
          <li key={dua.id}>
            <Link href={`/dua/${dua.id}`}>
              <Card>
                <p className="text-sm font-medium">{locale === "bn" ? dua.title.bn : dua.title.en}</p>
                <p className="arabic-text mt-2 text-xl">{dua.arabic}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
