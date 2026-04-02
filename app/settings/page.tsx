"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { updateCurrentUserProfile } from "@/lib/db/service";
import type { Locale } from "@/lib/db/types";

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { user, updateUser } = useAuth();
  const { push } = useNotifications();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.full_name, user?.phone]);

  const isProfileChanged = useMemo(() => {
    if (!user) return false;
    return fullName.trim() !== (user.full_name ?? "") || phone.trim() !== (user.phone ?? "");
  }, [fullName, phone, user]);

  function handleLanguageChange(newLocale: Locale) {
    setLocale(newLocale);
    updateUser({ locale: newLocale });
    push("success", t("settings.title"), t("settings.saved"));
  }

  async function handleProfileSave() {
    if (!user || !isProfileChanged) return;
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      push("error", t("settings.profile"), t("auth.fullName"));
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedUser = await updateCurrentUserProfile(user.id, {
        full_name: trimmedName,
        phone: trimmedPhone || null,
      });
      updateUser(updatedUser);
      push("success", t("settings.profile"), t("settings.profileSaved"));
    } catch {
      push("error", t("settings.profile"), t("settings.profileSaveFailed"));
    } finally {
      setIsSavingProfile(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card padding="lg">
        <CardHeader title={t("settings.title")} />
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader title={t("settings.profile")} />
        <div className="mt-4 space-y-4">
          <Input
            label={t("auth.fullName")}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <Input label={t("auth.email")} type="email" value={user?.email ?? ""} readOnly />
          <Input
            label={t("auth.phone")}
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-ink/80">{t("admin.role")}:</span>
            <span className="text-sm text-ink/60">
              {user ? ROLE_LABELS[user.role][locale] : ""}
            </span>
          </div>
          <div className="pt-2">
            <Button
              onClick={handleProfileSave}
              disabled={!user || !isProfileChanged || isSavingProfile}
            >
              {isSavingProfile ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader
          title={t("settings.language")}
          subtitle={t("settings.languageDescription")}
        />
        <div className="mt-4 flex gap-3">
          <Button
            variant={locale === "de" ? "primary" : "secondary"}
            onClick={() => handleLanguageChange("de")}
          >
            🇩🇪 {t("common.german")}
          </Button>
          <Button
            variant={locale === "en" ? "primary" : "secondary"}
            onClick={() => handleLanguageChange("en")}
          >
            🇬🇧 {t("common.english")}
          </Button>
        </div>
      </Card>
    </div>
  );
}
