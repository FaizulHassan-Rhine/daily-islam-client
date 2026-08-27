"use client";

import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { useLocale } from "@/contexts/LocaleContext";

export function DailyAyahCard({ ayah }) {
  const { t, locale } = useLocale();
  if (!ayah) return null;
  return (
    <Card className="mx-4 mt-4">
      <CardHeader
        title={t("home.ayahOfDay")}
        action={
          <Link href={`/quran/${ayah.chapterId}`} className="text-sm text-primary">
            {ayah.verseKey}
          </Link>
        }
      />
      <p className="quran-text text-2xl text-foreground">{ayah.textUthmani}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {locale === "bn" ? ayah.translations?.bn || ayah.translations?.en : ayah.translations?.en}
      </p>
    </Card>
  );
}

export function DailyHadithCard({ hadith }) {
  const { t, locale } = useLocale();
  if (!hadith) return null;
  return (
    <Card className="mx-4 mt-4">
      <CardHeader
        title={t("home.hadithOfDay")}
        action={
          <Link href={`/hadith/${hadith.collectionId}/${hadith.hadithNumber}`} className="text-sm text-primary">
            {hadith.collectionName}
          </Link>
        }
      />
      {hadith.text?.ar ? <p className="arabic-text text-xl">{hadith.text.ar}</p> : null}
      <p className="mt-3 text-sm leading-relaxed">
        {locale === "bn" && hadith.text?.bn ? hadith.text.bn : hadith.text?.en}
      </p>
      {locale === "bn" && !hadith.text?.bn ? (
        <p className="mt-2 text-xs text-muted">{t("hadith.bnUnavailable")}</p>
      ) : null}
    </Card>
  );
}

export function DailyDuaCard({ dua }) {
  const { t, locale } = useLocale();
  if (!dua) return null;
  return (
    <Card className="mx-4 mt-4">
      <CardHeader
        title={t("home.duaOfDay")}
        action={
          <Link href={`/dua/${dua.id}`} className="text-sm text-primary">
            {locale === "bn" ? dua.title.bn : dua.title.en}
          </Link>
        }
      />
      <p className="arabic-text text-xl">{dua.arabic}</p>
      <p className="mt-3 text-sm text-muted">{locale === "bn" ? dua.meaning.bn : dua.meaning.en}</p>
    </Card>
  );
}

export function DailyNameCard({ name }) {
  const { t, locale } = useLocale();
  if (!name) return null;
  return (
    <Card className="mx-4 mt-4 mb-2">
      <CardHeader
        title={t("home.nameOfDay")}
        action={
          <Link href="/names" className="text-sm text-primary">
            {t("common.seeAll")}
          </Link>
        }
      />
      <p className="arabic-text text-3xl">{name.arabic}</p>
      <p className="mt-1 font-medium">{name.transliteration}</p>
      <p className="text-sm text-muted">{locale === "bn" ? name.meaning.bn : name.meaning.en}</p>
    </Card>
  );
}
