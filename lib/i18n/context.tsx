"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/db/types";
import { t, type TranslationKey } from "@/lib/i18n/translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = "skillmapper-locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "de";
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "de" || stored === "en") return stored;
  return "de";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
    document.documentElement.lang = newLocale;
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
