"use client";

import { useState } from "react";
import { FlaskConical, X } from "lucide-react";

/**
 * Demo catalogue notice.
 *
 * The seeded catalogue is sample data: the products, prices, merchants and
 * reviews are illustrative, not real listings. Shipping that silently would
 * mean the site makes claims it cannot support, so while `NEXT_PUBLIC_DEMO_MODE`
 * is on, every visitor is told plainly at the top of the page.
 *
 * Turn it off (unset the variable) only once the catalogue holds real
 * merchant data and real affiliate links.
 */
export default function DemoNotice() {
  const [dismissed, setDismissed] = useState(false);

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "1" || dismissed) return null;

  return (
    <div role="status" className="relative z-[60] bg-amber-500/12 border-b border-amber-500/25 text-amber-900 dark:text-amber-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-2 flex items-center gap-3">
        <FlaskConical size={14} className="shrink-0" aria-hidden="true" />
        <p className="text-xs leading-relaxed flex-1">
          <span className="font-bold">Demo catalogue.</span>{" "}
          Products, prices, merchants and reviews shown here are sample data for demonstration only — they
          are not live listings and no purchase can be completed.
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss demo notice"
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-500/15 transition shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
