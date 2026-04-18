import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Manrope } from "next/font/google";
import "./globals.css";

import { PWARegistry } from "@/components/pwa-registry";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const serviceWorkerResetScript = `
  (function () {
    if (!('serviceWorker' in navigator)) return;

    var reloadKey = 'wish2skill-sw-head-reset';
    Promise.resolve()
      .then(function () { return navigator.serviceWorker.getRegistrations(); })
      .then(function (registrations) {
        return Promise.all(registrations.map(function (registration) {
          return registration.unregister().catch(function () { return false; });
        })).then(function () { return registrations.length > 0; });
      })
      .then(function (hadRegistrations) {
        if (!('caches' in window)) return hadRegistrations;

        return caches.keys().then(function (keys) {
          return Promise.all(
            keys
              .filter(function (key) { return key.indexOf('wish2skill-') === 0; })
              .map(function (key) { return caches.delete(key).catch(function () { return false; }); })
          ).then(function () { return hadRegistrations; });
        });
      })
      .then(function (hadRegistrations) {
        if (hadRegistrations && !window.sessionStorage.getItem(reloadKey)) {
          window.sessionStorage.setItem(reloadKey, 'done');
          window.location.reload();
          return;
        }

        window.sessionStorage.removeItem(reloadKey);
      })
      .catch(function () {});
  })();
`;

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wish2Skill CampusOS | AI-Powered Institute Management",
  description: "Next-generation ERP and LMS for modern educational institutions.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#141c2d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${cormorant.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerResetScript }} />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-background text-foreground font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <PWARegistry />
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
