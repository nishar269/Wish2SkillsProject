import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { PWARegistry } from "@/components/pwa-registry";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Wish2Skill CampusOS | AI-Powered Institute Management",
  description: "Next-generation ERP and LMS for modern educational institutions.",
  manifest: "/manifest.json",
  themeColor: "#0891b2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <PWARegistry />
          {children}
          <Toaster position="top-center" />
      </body>
    </html>
  );
}
