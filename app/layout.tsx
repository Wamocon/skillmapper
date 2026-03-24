import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Navbar } from "@/components/layout/navbar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Footer } from "@/components/layout/footer";
import { NotificationToasts } from "@/components/layout/notification-toasts";

export const metadata: Metadata = {
  title: "Skillmapper",
  description: "Skillmapper – Skill-Matching-Plattform für Projekte und Kandidaten.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="flex min-h-screen flex-col">
        <div className="grain" aria-hidden="true" />
        <AppProviders>
          <Navbar />
          <div className="mx-auto w-full max-w-7xl px-4 py-3 md:px-6">
            <Breadcrumb />
          </div>
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 md:px-6">
            {children}
          </main>
          <Footer />
          <NotificationToasts />
        </AppProviders>
      </body>
    </html>
  );
}
