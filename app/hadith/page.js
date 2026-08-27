"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";

export default function HadithPage() {
  const { t, locale } = useLocale();
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState("nawawi40");
  const query = useQuery({
    queryKey: ["hadith-collections"],
    queryFn: async () => (await api.get("/hadith/collections")).data.data,
  });
  const search = useQuery({
    queryKey: ["hadith-search", q, collection],
    enabled: q.trim().length >= 3,
    queryFn: async () => (await api.get("/hadith/search", { params: { q, collection } })).data.data,
  });
  if (query.isLoading) return <ListSkeleton rows={8} />;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.hadith")}</h1>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("hadith.search")}
        className="mt-4 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm"
      />
      <Select
        className="mt-2"
        value={collection}
        onChange={setCollection}
        aria-label={t("hadith.collections")}
        options={(query.data || []).map((c) => ({ value: c.id, label: c.name }))}
      />
      {search.data?.items?.length ? (
        <ul className="mt-4 space-y-2">
          {search.data.items.map((h) => (
            <li key={`${h.collectionId}-${h.hadithNumber}`}>
              <Link href={`/hadith/${h.collectionId}/${h.hadithNumber}`}>
                <Card>
                  <p className="text-xs text-muted">
                    {h.collectionName} #{h.hadithNumber}
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm">
                    {locale === "bn" && h.text?.bn ? h.text.bn : h.text?.en}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      ) : q.trim().length >= 3 && search.isFetched ? (
        <p className="mt-4 text-sm text-muted">{t("hadith.empty")}</p>
      ) : null}
      <p className="mt-6 text-sm text-muted">{t("hadith.collections")}</p>
      <ul className="mt-2 space-y-2">
        {(query.data || []).map((c) => (
          <li key={c.id}>
            <Link href={`/hadith/${c.id}`}>
              <Card className="flex items-center justify-between">
                <span className="font-medium">{c.name}</span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
