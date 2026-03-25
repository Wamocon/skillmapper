import { Suspense } from "react";
import { PostingsClientPage } from "./postings-client";

export default function PostingsPage() {
  return (
    <Suspense fallback={<div className="py-8 text-sm text-ink/60">Laden...</div>}>
      <PostingsClientPage />
    </Suspense>
  );
}
