import { Suspense } from "react";
import MatchingPageClient from "./matching-client";

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="py-8 text-sm text-ink/60">Laden...</div>}>
      <MatchingPageClient />
    </Suspense>
  );
}
