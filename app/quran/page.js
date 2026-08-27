"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useLocale } from "@/contexts/LocaleContext";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";

export default function QuranPage() {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState("surahs");
  const [q, setQ] = useState("");
  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    try {
      setLastRead(JSON.parse(localStorage.getItem("di.lastRead") || "null"));
    } catch {
      setLastRead(null);
    }
  }, []);

  const surahs = useQuery({
    queryKey: queryKeys.surahs(locale),
    queryFn: async () => (await api.get("/quran/surahs", { params: { lang: locale } })).data.data,
  });
  const juz = useQuery({
    queryKey: queryKeys.juz,
    enabled: tab === "juz",
    queryFn: async () => (await api.get("/quran/juz")).data.data,
  });
  const search = useQuery({
    queryKey: ["quran-search", q, locale],
    enabled: q.trim().length >= 2,
    queryFn: async () => (await api.get("/quran/search", { params: { q, lang: locale } })).data.data,
  });

  const filtered = useMemo(() => {
    const list = surahs.data || [];
    if (!q.trim()) return list;
    const n = q.toLowerCase();
    return list.filter(
      (s) =>
        s.nameSimple.toLowerCase().includes(n) ||
        String(s.id) === q ||
        s.nameArabic.includes(q) ||
        (s.translatedName || "").toLowerCase().includes(n)
    );
  }, [surahs.data, q]);

  if (surahs.isLoading) return <ListSkeleton />;
  if (surahs.isError) {
    return (
      <div className="p-4">
        <ErrorState title={t("errors.api")} body={surahs.error.message} onRetry={() => surahs.refetch()} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.quran")}</h1>
      {lastRead ? (
        <Link href={`/quran/${lastRead.surah}#ayah-${lastRead.ayah}`} className="mt-3 block rounded-card border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          {t("quran.lastRead")}: {lastRead.surah}:{lastRead.ayah}
        </Link>
      ) : null}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("quran.search")}
        className="mt-4 h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm"
      />
      <div className="mt-3 flex gap-2">
        {["surahs", "juz"].map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-sm ${tab === id ? "bg-primary text-white dark:text-background" : "bg-primary-soft text-primary"}`}
          >
            {t(`quran.${id}`)}
          </button>
        ))}
      </div>
      {search.data?.results?.length ? (
        <ul className="mt-4 space-y-2">
          {search.data.results.map((r) => (
            <li key={r.verseKey} className="rounded-card border border-border bg-surface p-3">
              <Link href={`/quran/${r.verseKey.split(":")[0]}`} className="text-sm font-medium text-primary">
                {r.verseKey}
              </Link>
              <p className="mt-1 text-sm text-muted">{r.translations?.[0]?.text || r.text}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "surahs" ? (
        <ul className="mt-4 space-y-2">
          {filtered.map((s) => (
            <li key={s.id}>
              <Link href={`/quran/${s.id}`} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-sm font-semibold text-primary">
                  {s.id}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{s.nameSimple}</span>
                  <span className="text-xs text-muted">
                    {s.translatedName} · {s.versesCount}
                  </span>
                </span>
                <span className="arabic-text text-xl">{s.nameArabic}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {(juz.data || []).map((j) => (
            <li key={j.juzNumber}>
              <Link href={`/quran/juz/${j.juzNumber}`} className="flex h-20 items-center justify-center rounded-card border border-border bg-surface font-medium">
                {j.juzNumber}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
