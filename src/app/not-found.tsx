import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 text-center">
      <div>
        <span className="w-20 h-20 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
          <PawPrint size={40} />
        </span>
        <h1 className="font-display text-4xl font-extrabold mt-4">404 — lost in the aisles</h1>
        <p className="text-muted mt-3 max-w-md mx-auto">This page doesn&apos;t exist or has moved. Here&apos;s the way back.</p>
        <div className="flex gap-3 justify-center mt-7">
          <Link href="/" className="px-6 h-11 leading-[44px] rounded-2xl bg-gradient-to-r from-brand to-brand-2 text-white text-sm font-bold btn-shine">Back home</Link>
          <Link href="/products" className="px-6 h-11 leading-[44px] rounded-2xl glass text-sm font-bold hover:border-brand/40 transition">Browse products</Link>
        </div>
      </div>
    </div>
  );
}
