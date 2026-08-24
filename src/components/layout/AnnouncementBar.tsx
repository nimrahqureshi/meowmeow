"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { ANNOUNCEMENTS } from "@/lib/site-config";
import { useStorageValue, writeStorage } from "@/lib/client-store";

const DISMISS_KEY = "mm-announce-dismissed";

/**
 * Announcement bar.
 *
 * Replaces a continuously scrolling marquee, which was hard to read, could not
 * be dismissed, and moved regardless of the visitor's motion preference. This
 * shows one message at a time, cross-fading every eight seconds, holds still
 * for anyone who asked for reduced motion, and can be closed for good.
 */
export default function AnnouncementBar() {
  const dismissed = useStorageValue(DISMISS_KEY, "pending");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (ANNOUNCEMENTS.length < 2) return;

    const id = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 8000);
    return () => clearInterval(id);
  }, []);

  // "pending" is the server/hydration snapshot; render the bar until we know
  // the visitor dismissed it, so there is no flash of missing content.
  if (dismissed === "1") return null;

  const item = ANNOUNCEMENTS[index];
  const Icon = item.icon;

  const body = (
    <span key={item.id} className="inline-flex items-center gap-2 fade-in">
      <Icon size={13} className="shrink-0" aria-hidden="true" />
      <span>{item.text}</span>
    </span>
  );

  return (
    <div className="relative bg-fg text-bg dark:bg-[#17130f] dark:text-[#f2ede4] border-b border-line">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-9 flex items-center justify-center">
        <p className="text-[11px] md:text-xs font-medium tracking-wide text-center truncate" aria-live="polite">
          {item.href ? (
            <Link href={item.href} className="hover:opacity-80 transition-opacity">
              {body}
            </Link>
          ) : (
            body
          )}
        </p>
        <button
          type="button"
          onClick={() => writeStorage(DISMISS_KEY, "1")}
          aria-label="Dismiss announcement"
          className="absolute right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-white/10 transition"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
