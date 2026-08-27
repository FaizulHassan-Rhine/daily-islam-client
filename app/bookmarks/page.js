"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BookmarksPage() {
  const { t } = useLocale();
  const { isSignedIn } = useAuth();
  const quran = useQuery({
    queryKey: ["bm-quran"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/bookmarks/quran")).data.data,
  });
  const duas = useQuery({
    queryKey: ["bm-duas"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/bookmarks/duas")).data.data,
  });
  const hadith = useQuery({
    queryKey: ["bm-hadith"],
    enabled: isSignedIn,
    queryFn: async () => (await api.get("/bookmarks/hadith")).data.data,
  });

  if (!isSignedIn) {
    return (
      <div className="p-4">
        <EmptyState title={t("nav.bookmarks")} body={t("auth.needed")} />
      </div>
    );
  }

  const empty = !quran.data?.length && !duas.data?.length && !hadith.data?.length;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{t("nav.bookmarks")}</h1>
      {empty ? <EmptyState className="mt-4" title={t("nav.bookmarks")} body="Saved ayahs, duas and hadith will appear here." /> : null}
      <div className="mt-4 space-y-2">
        {(quran.data || []).map((b) => (
          <Link key={`${b.surah}-${b.ayah}`} href={`/quran/${b.surah}`}>
            <Card>
              Quran {b.surah}:{b.ayah}
            </Card>
          </Link>
        ))}
        {(duas.data || []).map((b) => (
          <Link key={b.duaId} href={`/dua/${b.duaId}`}>
            <Card>Dua {b.duaId}</Card>
          </Link>
        ))}
        {(hadith.data || []).map((b) => (
          <Link key={`${b.collectionId}-${b.hadithNumber}`} href={`/hadith/${b.collectionId}/${b.hadithNumber}`}>
            <Card>
              {b.collectionId} #{b.hadithNumber}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
