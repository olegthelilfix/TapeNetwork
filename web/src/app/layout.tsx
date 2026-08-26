import type { Metadata } from "next";
import { IBM_Plex_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Ticker } from "@/components/Ticker";
import { Footer } from "@/components/Footer";
import { api } from "@/lib/api/client";
import type { TickerItem } from "@/lib/api/types";

const serif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif-loaded",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-loaded",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Tape Network — free financial video, live and on demand",
    template: "%s · Tape Network",
  },
  description:
    "Every hour of Tape Network — live and on demand — is open. Markets, macro, options and long-form interviews. Free, always. No account, no paywall.",
  openGraph: { siteName: "Tape Network", type: "website" },
  twitter: { card: "summary_large_image" },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Tape Network",
      url: SITE_URL,
    },
    {
      "@type": "WebSite",
      name: "Tape Network",
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let ticker: TickerItem[] = [];
  try {
    ticker = await api.ticker();
  } catch {
    // Backend unreachable — render without the ticker rather than failing the whole page.
  }

  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <Header />
        <Ticker items={ticker} />
        <div className="page">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
