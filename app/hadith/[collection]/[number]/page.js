"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { shareOrCopy } from "@/lib/cn";
import { ReaderSkeleton } from "@/components/ui/Skeleton";

export default function HadithDetailPage() {
  const { collection, number } = useParams();
  const { t, locale } = useLocale();
  const { isSignedIn } = useAuth();
  const query = useQuery({
    queryKey: ["hadith", collection, number],
    queryFn: async () => (await api.get(`/hadith/${collection}/${number}`)).data.data,
  });
  if (query.isLoading) return <ReaderSkeleton />;
  const h = query.data;
  if (!h) return null;
  return (
    <div className="p-4">
      <p className="text-sm text-muted">{h.collectionName}</p>
      <h1 className="text-2xl font-semibold">#{h.hadithNumber}</h1>
      <Card className="mt-4">
        {h.text.ar ? <p className="arabic-text text-2xl">{h.text.ar}</p> : null}
        <p className="mt-4 leading-relaxed">{locale === "bn" && h.text.bn ? h.text.bn : h.text.en}</p>
        {locale === "bn" && !h.text.bn ? <p className="mt-2 text-xs text-muted">{t("hadith.bnUnavailable")}</p> : null}
        {h.grades?.length ? (
          <p className="mt-3 text-xs text-muted">
            {t("hadith.grade")}: {h.grades.map((g) => `${g.name}: ${g.grade}`).join(" · ")}
          </p>
        ) : null}
        {h.reference ? (
          <p className="mt-2 text-xs text-muted">
            {t("hadith.reference")}: book {h.reference.book}, hadith {h.reference.hadith}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted">{h.sourceNote}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={() => shareOrCopy(h.collectionName, `${h.text.ar || ""}\n${h.text.en}`)}>
            Share
          </Button>
          {isSignedIn ? (
            <Button
              variant="ghost"
              onClick={() =>
                api.post("/bookmarks/hadith", {
                  collectionId: h.collectionId,
                  hadithNumber: String(h.hadithNumber),
                })
              }
            >
              {t("quran.bookmark")}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
