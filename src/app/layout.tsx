import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider, ThemeScript } from "@/components/providers";
import { StoreProvider } from "@/components/store";
import { JsonLd } from "@/components/JsonLd";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import Assistant from "@/components/Assistant";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";
import DemoNotice from "@/components/DemoNotice";
import { SITE_URL } from "@/lib/utils";
import { getConfiguredSocialProfiles } from "@/lib/social";
import { isDemoMode } from "@/lib/integrations";

const manrope = localFont({
  src: "../fonts/Manrope-var.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});
const sora = localFont({
  src: "../fonts/Sora-var.woff2",
  weight: "100 800",
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  title: {
    default: "MeowMeow — Find Better Deals, Faster",
    template: "%s · MeowMeow",
  },
  description:
    "MeowMeow is a Pakistan-first shopping discovery platform. Compare products and merchant offers, track prices, and follow verified affiliate links to the merchant.",
  keywords: ["shopping", "affiliate", "product reviews", "deals", "premium picks", "buying guides", "price tracker"],
  authors: [{ name: "MeowMeow" }],
  openGraph: {
    url: "/",
    type: "website",
    siteName: "MeowMeow",
    title: "MeowMeow — Premium Affiliate Shopping",
    description: "Curated products across fashion, tech, beauty and home. Compare, then buy from the merchant.",
    images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: "MeowMeow — premium affiliate shopping, tested by humans" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MeowMeow — Premium Affiliate Shopping",
    description: "Curated products. Compare, then buy from the merchant.",
    images: ["/images/og.jpg"],
  },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0812" },
  ],
  width: "device-width",
  initialScale: 1,
};

const configuredSocial = getConfiguredSocialProfiles();
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MeowMeow",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  ...(configuredSocial.length ? { sameAs: configuredSocial.map((profile) => profile.href) } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production" && isDemoMode() && process.env.ALLOW_PRODUCTION_DEMO !== "1") {
    throw new Error("Production catalog is configured for demo mode. Set NEXT_PUBLIC_DEMO_MODE=false before launch.");
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <JsonLd data={organizationJsonLd} />
      </head>
      <body className={`${manrope.variable} ${sora.variable} font-sans noise`}>
        <Analytics />
        <ThemeProvider>
          <StoreProvider>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-brand focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:text-sm">
              Skip to content
            </a>
            <DemoNotice />
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <MobileNav />
            <Assistant />
            <CookieConsent />
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
