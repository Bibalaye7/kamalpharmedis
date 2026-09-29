"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import BackButton, { useTrackNavigation } from "@/components/ui/BackButton";

/**
 * Le panel /admin a son propre shell (sidebar + topbar) qui reprend toute la
 * hauteur de l'écran : on masque le Navbar/Footer public sur ces pages.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  useTrackNavigation();

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {pathname !== "/" && (
        <div className="container-page w-full pt-4">
          <BackButton />
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
