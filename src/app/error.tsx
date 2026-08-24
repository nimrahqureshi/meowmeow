"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
      <div>
        <span className="w-20 h-20 rounded-3xl bg-danger/10 text-danger flex items-center justify-center mx-auto"><AlertTriangle size={40} /></span>
        <h1 className="font-display text-3xl font-extrabold mt-4">Something knocked over the display case</h1>
        <p className="text-muted mt-3">An unexpected error occurred. Our engineers have been notified — try again?</p>
        <button onClick={reset} className="mt-7 px-6 h-11 rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine">
          Try again
        </button>
      </div>
    </div>
  );
}
