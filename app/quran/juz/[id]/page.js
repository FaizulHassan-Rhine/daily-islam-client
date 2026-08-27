"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ReaderSkeleton } from "@/components/ui/Skeleton";
import { useLocale } from "@/contexts/LocaleContext";

export default function JuzPage() {
  const { id } = useParams();
  const { locale } = useLocale();
  const query = useQuery({
    queryKey: ["juz-verses", id],
    queryFn: async () => (await api.get(`/quran/juz/${id}`)).data.data,
  });
  if (query.isLoading) return <ReaderSkeleton />;
  const verses = query.data || [];
  return (
    <div className="mx-auto max-w-reader p-4">
      <h1 className="mb-4 text-2xl font-semibold">Juz {id}</h1>
      <div className="space-y-4">
        {verses.map((v) => (
          <section key={v.verseKey} className="rounded-card border border-border bg-surface p-4">
            <Link href={`/quran/${v.chapterId}`} className="text-xs text-primary">
              {v.verseKey}
            </Link>
            <p className="quran-text mt-2 text-2xl">{v.textUthmani}</p>
            <p className="mt-2 text-sm text-muted">
              {locale === "bn" ? v.translations?.bn || v.translations?.en : v.translations?.en}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
