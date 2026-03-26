import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { NotificationToasts } from "@/components/layout/notification-toasts";

const hydrationAttributeCleanupScript = `
(() => {
  const removableAttribute = (attributeName) => (
    attributeName === "bis_skin_checked"
      || attributeName === "bis_register"
      || attributeName.startsWith("__processed_")
  );

  const scrubElement = (element) => {
    if (!(element instanceof Element)) {
      return;
    }

    for (const attributeName of element.getAttributeNames()) {
      if (removableAttribute(attributeName)) {
        element.removeAttribute(attributeName);
      }
    }
  };

  const scrubTree = (root) => {
    if (root instanceof Element) {
      scrubElement(root);
    }

    if (!(root instanceof Element || root instanceof Document)) {
      return;
    }

    const nodes = root.querySelectorAll("*");
    for (const node of nodes) {
      scrubElement(node);
    }
  };

  scrubTree(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        scrubElement(mutation.target);
      }

      for (const node of mutation.addedNodes) {
        scrubTree(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
  });

  window.addEventListener("load", () => {
    scrubTree(document);
    window.setTimeout(() => observer.disconnect(), 4000);
  }, { once: true });
})();
`;

export const metadata: Metadata = {
  title: "Kompetenzkompass",
  description: "Kompetenzkompass – Skill-Matching-Plattform für Projekte und Kandidaten.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: hydrationAttributeCleanupScript }} />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <div className="grain" aria-hidden="true" />
        <AppProviders>
          <Navbar />
          <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6">
            <Breadcrumb />
          </div>
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 md:px-6" suppressHydrationWarning>
            {children}
          </main>
          <Footer />
          <NotificationToasts />
        </AppProviders>
      </body>
    </html>
  );
}
