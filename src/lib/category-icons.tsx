import { createElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BadgeDollarSign,
  BookOpen,
  Car,
  ChefHat,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  Gamepad2,
  Gem,
  Gift,
  Home,
  Leaf,
  Monitor,
  PawPrint,
  Plane,
  Puzzle,
  Shirt,
  ShoppingBag,
  Smartphone,
  Snowflake,
  Sparkles,
  Star,
  Tag,
  Watch,
} from "lucide-react";

/**
 * Category iconography — one Lucide icon per catalog slug so every surface
 * (hero chips, mega menu, category grid, filters, mobile nav) renders the
 * same professional mark instead of platform-dependent emoji. The emoji
 * stays in the database untouched; this is purely a presentation map.
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "womens-fashion": Flower2,
  "mens-fashion": Shirt,
  "baby-kids": Baby,
  shoes: Footprints,
  jewelry: Gem,
  bags: ShoppingBag,
  watches: Watch,
  beauty: Sparkles,
  "home-kitchen": Home,
  electronics: Smartphone,
  gaming: Gamepad2,
  computers: Monitor,
  books: BookOpen,
  toys: Puzzle,
  automotive: Car,
  fitness: Dumbbell,
  kitchen: ChefHat,
  garden: Leaf,
  "pet-supplies": PawPrint,
  gifts: Gift,
  travel: Plane,
  // collections
  trending: Flame,
  "best-sellers": Star,
  "premium-picks": Gem,
  deals: BadgeDollarSign,
  seasonal: Snowflake,
};

/** Render the icon for a slug — createElement keeps the React Compiler happy
 *  (no component-typed locals created during render). */
export function CategoryIcon({ slug, size = 16, className }: { slug: string; size?: number; className?: string }) {
  return createElement(CATEGORY_ICONS[slug] ?? Tag, { size, className, "aria-hidden": true });
}

/** "🔥 Trending Products" → "Trending Products" (DB names keep their emoji). */
export function stripEmoji(name: string) {
  return name.replace(/^[^\p{L}\p{N}]+\s*/u, "").trim();
}
