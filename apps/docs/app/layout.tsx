import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "@/components/providers";
import { SITE } from "@/lib/site";
import "./globals.css";

const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-plex-mono" });

const description = "Layout, data tables, charts, and sign-in screens for React dashboards. Works on phones and desktops, in light and dark.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "kora-ui: React components for dashboards", template: "%s | kora-ui" },
  description,
  applicationName: "kora-ui",
  openGraph: { type: "website", siteName: "kora-ui", locale: "en_US", title: "kora-ui: React components for dashboards", description, url: "/" },
  twitter: { card: "summary_large_image", title: "kora-ui", description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "kora-ui",
  description,
  url: SITE,
  programmingLanguage: "TypeScript",
  runtimePlatform: "React",
  author: { "@type": "Organization", name: "Istmo Code", url: "https://www.istmocode.com" },
};

/* Applies the saved theme before paint, and keeps preview iframes in step with the page. */
const themeScript = `(function(){var a=function(){var t=localStorage.getItem("kora-theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)};a();addEventListener("storage",a)})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}

