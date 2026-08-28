import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Header } from "@/components/Header/Header";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: "TravelTrucks — camper rentals",
    template: "%s | TravelTrucks",
  },
  description: "Browse, compare and book campervans for your next journey.",
  applicationName: "TravelTrucks",
  icons: { icon: "/icons/logo.svg" },
  openGraph: {
    type: "website",
    siteName: "TravelTrucks",
    title: "TravelTrucks — camper rentals",
    description: "Browse, compare and book campervans for your next journey.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
