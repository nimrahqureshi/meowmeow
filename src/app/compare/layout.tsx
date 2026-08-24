import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare products",
  description:
    "Put up to four products side by side — price, rating, specifications, pros and cons — and see which one actually wins before you buy.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare products · MeowMeow",
    description: "Side-by-side specs, pros and cons from real editor testing.",
    url: "/compare",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
