"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ShoppingBag, Bot } from "lucide-react";
import { useStore } from "@/components/store";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/cart", label: "Cart", icon: ShoppingBag },
  { href: "/products", label: "Shop", icon: Bot },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { cartCount, wishlistIds } = useStore();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-[75] glass-strong border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)]" aria-label="Mobile navigation">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const badge = item.href === "/cart" ? cartCount : item.href === "/wishlist" ? wishlistIds.length : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition",
                active ? "text-brand" : "text-muted"
              )}
            >
              <span className="relative">
                <item.icon size={20} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 rounded-full bg-gradient-to-r from-brand to-brand-2 text-white text-[9px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
