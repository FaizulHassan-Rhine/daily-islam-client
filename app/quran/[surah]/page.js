"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Copy, Pause, Play, Share2, Type } from "lucide-react";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { ReaderSkeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { shareOrCopy } from "@/lib/cn";

export default function SurahReaderPage() {
  const params = useParams();
  const id = params.surah;
  const { t, locale } = useLocale();
  const { isSignedIn } = useAuth();
  const [arabicOnly, setArabicOnly] = useState(false);
  const [showTr, setShowTr] = useState(true);
  const [showTl, setShowTl] = useState(false);
  const [font, setFont] = useState(32);
  const [playing, setPlaying] = useState(false);
  const [verseIndex, setVerseIndex] = useState(0);
  const [tafsirKey, setTafsirKey] = useState(null);
  const audioRef = useRef(null);
  const lastSaved = useRef(null);

  const surah = useQuery({
    queryKey: queryKeys.surah(id, { locale, showTl }),
    queryFn: async () =>
      (
        await api.get(`/quran/surahs/${id}`, {
          params: { lang: locale, transliteration: showTl ? "1" : undefined },
        })
      ).data.data,
  });
  const reciters = useQuery({
    queryKey: queryKeys.reciters,
    queryFn: async () => (await api.get("/quran/reciters")).data.data,
  });
  const tafsirs = useQuery({
    queryKey: queryKeys.tafsirs,
    queryFn: async () => (await api.get("/quran/tafsirs", { params: { lang: "en" } })).data.data,
  });
  const [reciter, setReciter] = useState(7);
  const verseAudio = useQuery({
    queryKey: ["verse-audio", id, reciter],
    queryFn: async () => (await api.get(`/quran/surahs/${id}/verse-audio`, { params: { reciter } })).data.data,
  });

  const tafsirRef =
    tafsirs.data?.find((item) => /ibn kathir/i.test(`${item.name} ${item.slug || ""}`))?.slug ||
    tafsirs.data?.find((item) => String(item.languageName).toLowerCase() === "english")?.slug ||
    tafsirs.data?.find((item) => /ibn kathir/i.test(`${item.name} ${item.slug || ""}`))?.id ||
    tafsirs.data?.[0]?.slug ||
    tafsirs.data?.[0]?.id;

  const tafsir = useQuery({
    queryKey: ["tafsir", tafsirRef, tafsirKey],
    enabled: Boolean(tafsirRef && tafsirKey),
    queryFn: async () =>
      (await api.get("/quran/tafsir", { params: { tafsirId: tafsirRef, verseKey: tafsirKey } })).data.data,
  });

  useEffect(() => {
    if (!surah.data) return;
    try {
      const last = JSON.parse(localStorage.getItem("di.lastRead") || "null");
      if (last?.surah === Number(id) && last?.ayah) return;
    } catch {
      /* ignore */
    }
    const payload = { surah: Number(id), ayah: 1 };
    try {
      localStorage.setItem("di.lastRead", JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    if (isSignedIn) api.post("/quran/progress", payload).catch(() => {});
  }, [id, isSignedIn, surah.data]);

  async function togglePlay(index = verseIndex) {
    const files = verseAudio.data || [];
    const file = files[index];
    if (!file?.url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    const src = file.url.startsWith("http") ? file.url : `https://verses.quran.com/${file.url}`;
    if (playing && audio.src === src) {
      audio.pause();
      setPlaying(false);
      return;
    }
    audio.src = src;
    audio.onended = () => {
      const next = index + 1;
      if (next < files.length) {
        setVerseIndex(next);
        rememberAyah(next + 1);
        togglePlay(next);
      } else setPlaying(false);
    };
    await audio.play();
    setPlaying(true);
    setVerseIndex(index);
    rememberAyah(index + 1);
  }

  function rememberAyah(ayah) {
    if (lastSaved.current === ayah) return;
    lastSaved.current = ayah;
    const payload = { surah: Number(id), ayah };
    try {
      localStorage.setItem("di.lastRead", JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    if (isSignedIn) api.post("/quran/progress", payload).catch(() => {});
  }

  useEffect(() => {
    const verses = surah.data?.verses || [];
    if (!verses.length) return;
    let ayah = null;
    if (typeof window !== "undefined" && window.location.hash.startsWith("#ayah-")) {
      ayah = Number(window.location.hash.replace("#ayah-", ""));
    } else {
      try {
        const last = JSON.parse(localStorage.getItem("di.lastRead") || "null");
        if (last?.surah === Number(id)) ayah = last.ayah;
      } catch {
        ayah = null;
      }
    }
    if (!ayah) return;
    const el = document.getElementById(`ayah-${ayah}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [id, surah.data]);

  if (surah.isLoading) return <ReaderSkeleton />;
  const chapter = surah.data?.chapter;
  const verses = surah.data?.verses || [];

  return (
    <div className="mx-auto max-w-reader p-4">
      <header className="mb-4">
        <p className="text-sm text-muted">{chapter?.revelationPlace}</p>
        <h1 className="text-2xl font-semibold">{chapter?.nameSimple}</h1>
        <p className="arabic-text text-3xl">{chapter?.nameArabic}</p>
      </header>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => togglePlay(verseIndex)}>
          {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? t("quran.pause") : t("quran.play")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setArabicOnly((v) => !v)}>
          {t("quran.arabicOnly")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowTr((v) => !v)}>
          {t("quran.translation")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowTl((v) => !v)}>
          {t("quran.transliteration")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setFont((n) => Math.max(22, n - 2))} aria-label="Decrease font">
          <Type size={16} /> −
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setFont((n) => Math.min(48, n + 2))} aria-label="Increase font">
          <Type size={16} /> +
        </Button>
        <Select
          className="min-w-[12rem]"
          size="sm"
          value={reciter}
          onChange={(value) => setReciter(Number(value))}
          aria-label="Reciter"
          options={(reciters.data || []).slice(0, 20).map((r) => ({ value: r.id, label: r.reciterName }))}
        />
      </div>
      <article className="space-y-5">
        {verses.map((v, index) => (
          <Ayah
            key={v.verseKey}
            verse={v}
            onVisible={() => rememberAyah(v.verseNumber)}
            arabicOnly={arabicOnly}
            showTr={showTr}
            showTl={showTl}
            font={font}
            locale={locale}
            t={t}
            tafsirOpen={tafsirKey === v.verseKey}
            tafsirText={tafsirKey === v.verseKey ? tafsir.data : null}
            tafsirLoading={tafsirKey === v.verseKey && tafsir.isFetching}
            onPlay={() => togglePlay(index)}
            onTafsir={() => setTafsirKey((k) => (k === v.verseKey ? null : v.verseKey))}
            onCopy={() =>
              shareOrCopy(v.verseKey, `${v.textUthmani}\n${v.translations?.en || ""}\n(${v.verseKey})`)
            }
            onBookmark={() =>
              isSignedIn
                ? api.post("/bookmarks/quran", { surah: Number(id), ayah: v.verseNumber })
                : saveGuestBookmark(Number(id), v.verseNumber)
            }
          />
        ))}
      </article>
    </div>
  );
}

function Ayah({
  verse,
  arabicOnly,
  showTr,
  showTl,
  font,
  locale,
  t,
  tafsirOpen,
  tafsirText,
  tafsirLoading,
  onPlay,
  onTafsir,
  onCopy,
  onBookmark,
  onVisible,
}) {
  const translation = locale === "bn" ? verse.translations?.bn || verse.translations?.en : verse.translations?.en;
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !onVisible) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onVisible();
      },
      { threshold: 0.6 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onVisible]);
  return (
    <section id={`ayah-${verse.verseNumber}`} ref={ref} className="rounded-card border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-muted">
        <span>{verse.verseKey}</span>
        <div className="flex gap-1">
          <IconBtn label={t("quran.play")} onClick={onPlay}>
            <Play size={14} />
          </IconBtn>
          <IconBtn label={t("quran.copy")} onClick={onCopy}>
            <Copy size={14} />
          </IconBtn>
          <IconBtn label={t("quran.share")} onClick={onCopy}>
            <Share2 size={14} />
          </IconBtn>
          <IconBtn label={t("quran.bookmark")} onClick={onBookmark}>
            <Bookmark size={14} />
          </IconBtn>
          <IconBtn label={t("quran.tafsir")} onClick={onTafsir}>
            T
          </IconBtn>
        </div>
      </div>
      <p className="quran-text" style={{ fontSize: font }}>
        {verse.textUthmani}
      </p>
      {!arabicOnly && showTl && verse.transliteration ? (
        <p className="mt-3 text-sm italic text-muted">{verse.transliteration}</p>
      ) : null}
      {!arabicOnly && showTr ? <p className="mt-3 text-sm leading-relaxed text-muted">{translation}</p> : null}
      {tafsirOpen ? (
        <div className="mt-3 rounded-2xl bg-primary-soft/60 p-3 text-sm leading-relaxed">
          <p className="mb-1 font-medium text-primary">{t("quran.tafsir")}</p>
          {tafsirLoading ? t("common.loading") : tafsirText?.text || t("errors.api")}
        </div>
      ) : null}
    </section>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-primary-soft"
    >
      {children}
    </button>
  );
}

function saveGuestBookmark(surah, ayah) {
  const key = "di.quran.bookmarks";
  const current = JSON.parse(localStorage.getItem(key) || "[]");
  localStorage.setItem(
    key,
    JSON.stringify([...current.filter((b) => !(b.surah === surah && b.ayah === ayah)), { surah, ayah }])
  );
}
