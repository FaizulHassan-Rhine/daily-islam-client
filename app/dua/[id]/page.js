"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { shareOrCopy } from "@/lib/cn";
import { useAuth } from "@/contexts/AuthContext";
import { ReaderSkeleton } from "@/components/ui/Skeleton";

export default function DuaDetailPage() {
  const { id } = useParams();
  const { t, locale } = useLocale();
  const { isSignedIn } = useAuth();
  const query = useQuery({
    queryKey: ["dua", id],
    queryFn: async () => (await api.get(`/duas/${id}`)).data.data,
  });
  if (query.isLoading) return <ReaderSkeleton />;
  const dua = query.data;
  if (!dua) return null;
  const meaning = locale === "bn" ? dua.meaning.bn : dua.meaning.en;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">{locale === "bn" ? dua.title.bn : dua.title.en}</h1>
      <Card className="mt-4">
        <p className="arabic-text text-2xl">{dua.arabic}</p>
        <p className="mt-4 text-sm italic text-muted">{dua.transliteration}</p>
        <p className="mt-4 leading-relaxed">{meaning}</p>
        <p className="mt-4 text-xs text-muted">
          {t("dua.source")}: {dua.source?.text}
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => shareOrCopy(dua.title.en, `${dua.arabic}\n${meaning}\n${dua.source?.text}`)}
          >
            {t("dua.share")}
          </Button>
          {isSignedIn ? (
            <Button variant="ghost" onClick={() => api.post("/bookmarks/duas", { duaId: dua.id })}>
              {t("quran.bookmark")}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
