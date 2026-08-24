"use client";

import { Cookie } from "lucide-react";
import { useStorageValue, writeStorage } from "@/lib/client-store";

export default function CookieConsent() {
  // Server & hydration render "pending" (hidden); the banner appears right
  // after mount only when consent has never been given — no hydration diff.
  const consent = useStorageValue("mm-cookies", "pending");
  if (consent !== null) return null;

  const accept = (value: string) => writeStorage("mm-cookies", value);

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-sm z-[90] pop-in" role="dialog" aria-label="Cookie consent">
      <div className="glass-strong rounded-2xl p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Cookie size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm">We value your privacy</p>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              MeowMeow uses cookies to remember your wishlist, cart and preferences — and to keep our affiliate links honest. No creepy tracking, promise.
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => accept("all")}
            className="flex-1 rounded-xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-semibold py-2.5 btn-shine hover:opacity-95 transition"
          >
            Accept all
          </button>
          <button
            onClick={() => accept("essential")}
            className="rounded-xl border border-line px-4 text-sm font-medium py-2.5 hover:bg-soft transition"
          >
            Essentials only
          </button>
        </div>
      </div>
    </div>
  );
}
