import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the MeowMeow catalogue by name, brand, category or colour — with voice and visual search built in.",
  alternates: { canonical: "/search" },
  // Query-string result pages shouldn't be indexed, but their links should be followed.
  robots: { index: false, follow: true },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
