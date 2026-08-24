import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Questions about a product, a price, or a partnership? Reach the MeowMeow editors directly — we answer every message.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact MeowMeow",
    description: "Reach the editors directly — we answer every message.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
