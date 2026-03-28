"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card } from "@/components/ui/card";
import { Input, Select, Checkbox } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { VerificationMethod } from "@/lib/db/types";
import { BrandMark } from "@/components/layout/brand-mark";

function getRedirectTarget(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/dashboard";
  }

  return redirectTo;
}

export default function RegisterPage() {
  const { t, locale } = useI18n();
  const { register, user, isLoading } = useAuth();
  const { push } = useNotifications();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phone: "",
    verificationMethod: "whatsapp" as VerificationMethod,
    verificationCode: "",
    acceptTerms: false,
    acceptPrivacy: false,
    acceptMarketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const redirectTarget = getRedirectTarget(searchParams.get("redirectTo"));

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    window.location.assign(redirectTarget);
  }, [isLoading, redirectTarget, user]);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = locale === "de" ? "Name ist erforderlich" : "Name is required";
    if (!form.email.trim()) newErrors.email = locale === "de" ? "E-Mail ist erforderlich" : "Email is required";
    if (form.password.length < 8) newErrors.password = locale === "de" ? "Mindestens 8 Zeichen" : "At least 8 characters";
    if (form.password !== form.passwordConfirm) newErrors.passwordConfirm = locale === "de" ? "Passwörter stimmen nicht überein" : "Passwords do not match";
    if (!form.phone.trim()) newErrors.phone = locale === "de" ? "Telefonnummer ist erforderlich" : "Phone number is required";
    if (!phoneVerified) newErrors.verificationCode = locale === "de" ? "Telefon muss verifiziert werden" : "Phone must be verified";
    if (!form.acceptTerms) newErrors.acceptTerms = t("auth.termsRequired");
    if (!form.acceptPrivacy) newErrors.acceptPrivacy = t("auth.privacyRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSendCode() {
    if (!form.phone.trim()) {
      setErrors((prev) => ({ ...prev, phone: locale === "de" ? "Telefonnummer ist erforderlich" : "Phone number is required" }));
      return;
    }
    // In production: call API to send verification code via WhatsApp/SMS
    setCodeSent(true);
    push(
      "info",
      t("auth.verifyPhone"),
      locale === "de" ? `Code gesendet via ${form.verificationMethod}` : `Code sent via ${form.verificationMethod}`,
    );
  }

  function handleVerifyCode() {
    // In production: validate code against server
    if (form.verificationCode.length >= 4) {
      setPhoneVerified(true);
      push("success", t("auth.verifyPhone"), locale === "de" ? "Telefonnummer erfolgreich verifiziert" : "Phone number verified successfully");
    } else {
      setErrors((prev) => ({ ...prev, verificationCode: locale === "de" ? "Ungültiger Code" : "Invalid code" }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        acceptedTerms: form.acceptTerms,
        acceptedPrivacy: form.acceptPrivacy,
      });
      push("success", t("auth.registerTitle"), locale === "de" ? "Konto erfolgreich erstellt" : "Account created successfully");
    } catch {
      push("error", t("auth.registerTitle"), locale === "de" ? "Registrierung fehlgeschlagen" : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-8">
      <Card className="w-full max-w-lg">
        <div className="mb-4 flex items-center gap-3">
          <BrandMark className="h-10 w-10 shrink-0" withContainer />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-rust">Kompetenzkompass</p>
          </div>
        </div>
        <h1 className="font-heading text-2xl text-ink sm:text-4xl">{t("auth.registerTitle")}</h1>
        <p className="mt-2 text-sm text-ink/70">{t("auth.registerSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name & Email */}
          <Input
            label={t("auth.fullName")}
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            error={errors.fullName}
          />
          <Input
            label={t("auth.email")}
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            error={errors.email}
          />

          {/* Password */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t("auth.password")}
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              error={errors.password}
            />
            <Input
              label={t("auth.passwordConfirm")}
              type="password"
              required
              autoComplete="new-password"
              value={form.passwordConfirm}
              onChange={(e) => update("passwordConfirm", e.target.value)}
              error={errors.passwordConfirm}
            />
          </div>

          {/* Phone verification */}
          <div className="space-y-3 rounded-xl border border-ink/10 bg-fog/30 p-4">
            <p className="text-sm font-semibold text-ink/80">{t("auth.verifyPhone")}</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                label={t("auth.phone")}
                type="tel"
                placeholder={t("auth.phonePlaceholder")}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                error={errors.phone}
                disabled={phoneVerified}
              />
              <div className="flex items-end">
                <Select
                  label={t("auth.verificationMethod")}
                  value={form.verificationMethod}
                  onChange={(e) => update("verificationMethod", e.target.value)}
                  disabled={phoneVerified}
                >
                  <option value="whatsapp">{t("auth.whatsapp")}</option>
                  <option value="sms">{t("auth.sms")}</option>
                </Select>
              </div>
            </div>

            {!phoneVerified && !codeSent && (
              <Button type="button" variant="secondary" size="sm" onClick={handleSendCode}>
                {t("auth.sendCode")}
              </Button>
            )}

            {codeSent && !phoneVerified && (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <Input
                  label={t("auth.verificationCode")}
                  placeholder="123456"
                  value={form.verificationCode}
                  onChange={(e) => update("verificationCode", e.target.value)}
                  error={errors.verificationCode}
                />
                <div className="flex items-end">
                  <Button type="button" variant="secondary" size="sm" onClick={handleVerifyCode}>
                    {t("auth.verifyCode")}
                  </Button>
                </div>
              </div>
            )}

            {phoneVerified && (
              <p className="text-sm font-semibold text-moss">✓ {locale === "de" ? "Telefon verifiziert" : "Phone verified"}</p>
            )}
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <Checkbox
              label={
                <span>
                  {locale === "de" ? "Ich akzeptiere die " : "I accept the "}
                  <Link href="/legal/agb" className="font-semibold text-moss hover:underline" target="_blank">
                    {locale === "de" ? "AGB" : "Terms of Service"}
                  </Link>
                </span>
              }
              checked={form.acceptTerms}
              onChange={(e) => update("acceptTerms", e.target.checked)}
              error={errors.acceptTerms}
            />
            <Checkbox
              label={
                <span>
                  {locale === "de" ? "Ich habe die " : "I have read the "}
                  <Link href="/legal/datenschutz" className="font-semibold text-moss hover:underline" target="_blank">
                    {locale === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
                  </Link>{" "}
                  {locale === "de" ? "gelesen und akzeptiert" : "and accept it"}
                </span>
              }
              checked={form.acceptPrivacy}
              onChange={(e) => update("acceptPrivacy", e.target.checked)}
              error={errors.acceptPrivacy}
            />
            <Checkbox
              label={t("auth.acceptMarketing")}
              checked={form.acceptMarketing}
              onChange={(e) => update("acceptMarketing", e.target.checked)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t("common.loading") : t("common.register")}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          {t("auth.hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-moss hover:underline">
            {t("common.login")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
