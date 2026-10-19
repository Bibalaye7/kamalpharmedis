import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import SiteChrome from "./SiteChrome";

// Police Inter (licence OFL) embarquée dans le projet : la compilation ne dépend plus du réseau.
const inter = localFont({ src: "./fonts/inter-latin-wght-normal.woff2", weight: "100 900", variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "KamalPharMédis — Matériel et consommables médicaux",
    template: "%s | KamalPharMédis",
  },
  description:
    "Vente de matériel et de consommables médicaux. Livraison à Dakar et partout au Sénégal, paiement à la livraison.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
