"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";

function getRedirectTarget(redirectTo: string | null) {
  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/dashboard";
  }

  return redirectTo;
}

export default function LoginPage() {
  const { t, locale } = useI18n();
  const { login, user, isLoading } = useAuth();
  const { push } = useNotifications();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const showDemoCredentials = process.env.NODE_ENV !== "production";
  const redirectTarget = getRedirectTarget(searchParams.get("redirectTo"));

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    window.location.assign(redirectTarget);
  }, [isLoading, redirectTarget, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      push("success", t("auth.loginTitle"), t("dashboard.welcome", { name: email }));
    } catch {
      setError(
        locale === "de"
          ? "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Zugangsdaten."
          : "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <div className="mb-4 flex items-center gap-3">
          <BrandMark className="h-10 w-10 shrink-0" withContainer />
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-rust">Kompetenzkompass</p>
          </div>
        </div>
        <h1 className="font-heading text-2xl text-ink sm:text-4xl">{t("auth.loginTitle")}</h1>
        <p className="mt-2 text-sm text-ink/70">{t("auth.loginSubtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label={t("auth.email")}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={locale === "de" ? "name@firma.de" : "name@company.com"}
          />
          <Input
            label={t("auth.password")}
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-rust">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? t("common.loading") : t("common.login")}
          </Button>
        </form>

        {showDemoCredentials && (
          <div className="mt-4 rounded-xl border border-ink/10 bg-fog/40 p-4 text-sm text-ink/75">
            <p className="font-semibold text-ink">Testzugang</p>
            <p className="mt-1">admin@kompetenzkompass.de / ChangeMe!12345</p>
          </div>
        )}

        <div className="mt-6 space-y-2 text-center text-sm text-ink/60">
          <p>
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-semibold text-moss hover:underline">
              {t("common.register")}
            </Link>
          </p>
          <p>
            <Link href="/login" className="text-ink/50 hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
