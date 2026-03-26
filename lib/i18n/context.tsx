"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Locale } from "@/lib/db/types";
import { t, type TranslationKey } from "@/lib/i18n/translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = "kompetenzkompass-locale";
const LOCALE_CHANGE_EVENT = "kompetenzkompass-locale-change";

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "de";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "de" || stored === "en" ? stored : "de";
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => callback();
  window.addEventListener("storage", handleChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, handleChange);
  };
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore<Locale>(subscribe, getStoredLocale, () => "de");

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

  const translate = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => t(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t: translate }),
    [locale, setLocale, translate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
