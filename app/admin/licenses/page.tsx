"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { useNotifications } from "@/lib/notifications/context";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LICENSE_PLANS, formatPrice } from "@/lib/licensing/plans";

export default function AdminLicensesPage() {
  const { t, locale } = useI18n();
  const { push } = useNotifications();

  // Mock current plan
  const currentPlan = "starter";

  function handleUpgrade(planType: string) {
    push(
      "info",
      t("licensing.upgrade"),
      locale === "de"
        ? `Upgrade auf ${planType} - In Produktion wird hier der Zahlungsprozess gestartet`
        : `Upgrade to ${planType} - in production the payment flow will start here`,
    );
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <CardHeader
          title={t("licensing.title")}
          subtitle={`${t("licensing.currentPlan")}: ${t(`licensing.${currentPlan}` as "licensing.free")}`}
          action={<Badge variant="success">{currentPlan}</Badge>}
        />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LICENSE_PLANS.map((plan) => {
          const isCurrent = plan.type === currentPlan;
          return (
            <Card
              key={plan.type}
              className={isCurrent ? "ring-2 ring-moss" : ""}
            >
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-2xl text-ink">
                    {t(plan.nameKey as "licensing.free")}
                  </h3>
                  <p className="mt-1 text-2xl font-bold text-moss">
                    {formatPrice(plan.priceMonthly, locale)}
                    {plan.priceMonthly > 0 && <span className="text-sm font-normal text-ink/50">{locale === "de" ? " / Monat" : " / month"}</span>}
                  </p>
                </div>

                <div className="space-y-1 text-sm text-ink/70">
                  <p>{plan.maxUsers === -1 ? (locale === "de" ? "Unbegrenzte Benutzer" : "Unlimited users") : t("licensing.usersIncluded", { count: plan.maxUsers })}</p>
                  <p>{plan.maxProjects === -1 ? (locale === "de" ? "Unbegrenzte Projekte" : "Unlimited projects") : t("licensing.projectsIncluded", { count: plan.maxProjects })}</p>
                </div>

                <ul className="space-y-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-ink/70">
                      <Check className="h-4 w-4 text-moss" />
                      {feature.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Badge variant="success" className="w-full justify-center py-2">
                    {locale === "de" ? "Aktueller Plan" : "Current plan"}
                  </Badge>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleUpgrade(plan.type)}
                  >
                    {t("licensing.upgrade")}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
