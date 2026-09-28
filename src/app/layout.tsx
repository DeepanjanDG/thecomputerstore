import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { THEME_SCRIPT } from "@/components/layout/theme";
import { getEngineConfig } from "@/server/config";
import { SITE } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono", display: "swap", weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "The Computer Store", template: "%s | The Computer Store" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["custom PC", "PC builder", "gaming PC", "computer store Shillong", "Meghalaya", "graphics cards", "laptops", "North East India"],
  openGraph: { type: "website", siteName: SITE.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getEngineConfig();
  return (
    <html lang="en-IN" data-theme="light" data-scroll-behavior="smooth" className={`${jakarta.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <Providers config={config}>{children}</Providers>
      </body>
    </html>
  );
}
