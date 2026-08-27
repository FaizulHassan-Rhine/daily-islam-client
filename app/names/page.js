"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

export default function NamesPage() {
  const { t, locale } = useLocale();
  const { isSignedIn } = useAuth();
  const [q, setQ] = useState("");
  const query = useQuery({
    queryKey: ["names", q],
    queryFn: async () => (await api.get("/names", { params: { q } })).data.data,
  });
  if (query.isLoading) return <ListSkeleton />;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.names")}</h1>
      <p className="mt-2 text-xs text-muted">
        Meanings are brief educational glosses. Scholars differ on the famous enumerated list of ninety-nine names.
      </p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("common.search")}
        className="mt-4 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm"
      />
      <ul className="mt-4 space-y-2">
        {(query.data || []).map((n) => (
          <li key={n.number}>
            <Card className="flex items-center gap-3">
              <span className="w-8 text-sm text-muted">{n.number}</span>
              <div className="flex-1">
                <p className="arabic-text text-2xl">{n.arabic}</p>
                <p className="text-sm font-medium">{n.transliteration}</p>
                <p className="text-xs text-muted">{locale === "bn" ? n.meaning.bn : n.meaning.en}</p>
              </div>
              {isSignedIn ? (
                <button
                  type="button"
                  className="text-xs text-primary"
                  onClick={() => api.post("/bookmarks/names", { number: n.number })}
                >
                  Save
                </button>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
