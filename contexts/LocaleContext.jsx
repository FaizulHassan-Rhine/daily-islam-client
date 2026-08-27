"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "@/locales/en.json";
import bn from "@/locales/bn.json";

const dictionaries = { en, bn };
const LocaleContext = createContext(null);

function lookup(dict, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], dict);
}

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const stored = localStorage.getItem("di.locale");
    if (stored === "en" || stored === "bn") setLocale(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("di.locale", locale);
    document.documentElement.lang = locale === "bn" ? "bn" : "en";
    document.documentElement.classList.toggle("locale-bn", locale === "bn");
  }, [locale]);

  const value = useMemo(() => {
    const dict = dictionaries[locale] || en;
    const t = (key) => lookup(dict, key) || lookup(en, key) || key;
    return { locale, setLocale, t, dir: "ltr" };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
