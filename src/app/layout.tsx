import type { Metadata, Viewport } from "next";
import "./globals.css";
import { referentielTitle } from "@/data/competences";

export const metadata: Metadata = {
  title: referentielTitle,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f3f5f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="antialiased">
      <body className="font-sans">{children}</body>
    </html>
  );
}
