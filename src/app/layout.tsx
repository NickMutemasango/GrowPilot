import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { HideOnFocusedPages } from "@/components/navigation/HideOnFocusedPages";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GrowPilot Academy",
    template: "%s | GrowPilot Academy",
  },
  description:
    "Learn practical skills at your own pace with simple, friendly online courses from GrowPilot Academy.",
};

export const viewport: Viewport = {
  // Spelled out rather than left to the framework default: every page is laid
  // out at the device's own width, and people can still pinch to zoom.
  width: "device-width",
  initialScale: 1,
  themeColor: "#176B52",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-dvh flex-col [--header-height:4rem] lg:[--header-height:4.5rem]">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-xl bg-primary px-5 py-3 text-lg font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to main content
        </a>
        <HideOnFocusedPages>
          <SiteHeader />
        </HideOnFocusedPages>
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
      </body>
    </html>
  );
}
