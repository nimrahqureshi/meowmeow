import { randomBytes } from "crypto";
// Load .env so `npm run db:seed` works from a clean checkout without
// requiring DATABASE_URL to be exported manually.
import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  categories,
  brands,
  products,
  reviews,
  blogPosts,
  coupons,
  notifications,
  priceHistory,
  clicks,
  newsletterSubscribers,
  affiliateNetworks,
  merchants,
  productOffers,
} from "./schema";
import { hashPassword } from "@/lib/auth";

const px = (id: number, w = 940, h = 650) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&dpr=2&fit=crop&w=${w}&h=${h}`;
const png = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.png?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`;
const portrait = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800`;

const IMG = {
  women: [portrait(32285111), portrait(16365089), portrait(36097129), png(27308642), portrait(16154682), portrait(15523369)],
  men: [portrait(31000073), portrait(30947677), portrait(25859034), portrait(8832162)],
  shoes: [px(11324518), px(11324548), px(7857501), px(28271086)],
  jewelry: [px(4155254), px(33569933), px(34372562), px(32797482)],
  watches: [px(16739804), px(28157826), px(8854152), px(8968349)],
  beauty: [px(8015790), px(8049841), px(7691162), px(12352170)],
  home: [px(33640979), px(259819), px(8700684), px(28057648), px(35223192), px(30386965)],
  tech: [px(10670819), px(3541365), px(19012055), px(17726845), px(32755791), px(5956086)],
  fitness: [px(19025674), px(35567437), px(4397838), px(32085423)],
  toys: [px(20665610), px(20692469), px(31122086), px(5801312)],
  pet: [px(10477176), px(33417506), px(27806129), px(32935579)],
  travel: [px(34629931), px(34629933), px(34629932), px(35711816)],
  gifts: [px(13975271), px(7984849), px(33629669), px(7984851)],
};

/**
 * Demo catalogue destination.
 *
 * These sample products do not exist at any retailer, so there is no honest
 * ASIN to link to and inventing one would present a dead Amazon page as a real
 * listing. Demo rows therefore point back at the product page on this site,
 * where the demo banner explains what they are. The click-tracking and
 * redirect architecture is unchanged and ready for real affiliate URLs — see
 * PRODUCTS_README in the repository for where to put them.
 */
const demoDestination = (slug: string) => `/products/${slug}?demo=1`;

const catData: Array<[string, string, string, string, boolean]> = [
  ["womens-fashion", "Women's Fashion", "", IMG.women[0], false],
  ["mens-fashion", "Men's Fashion", "", IMG.men[0], false],
  ["baby-kids", "Baby & Kids", "", IMG.toys[1], false],
  ["shoes", "Shoes", "", IMG.shoes[0], false],
  ["jewelry", "Jewelry", "", IMG.jewelry[0], false],
  ["bags", "Bags", "", IMG.women[4], false],
  ["watches", "Watches", "", IMG.watches[0], false],
  ["beauty", "Beauty", "", IMG.beauty[2], false],
  ["home-kitchen", "Home & Kitchen", "", IMG.home[0], false],
  ["electronics", "Electronics", "", IMG.tech[3], false],
  ["gaming", "Gaming", "", IMG.tech[0], false],
  ["computers", "Computers", "", IMG.tech[1], false],
  ["books", "Books", "", IMG.home[4], false],
  ["toys", "Toys", "", IMG.toys[2], false],
  ["automotive", "Automotive", "", IMG.women[2], false],
  ["fitness", "Fitness", "", IMG.fitness[0], false],
  ["kitchen", "Kitchen", "", IMG.home[1], false],
  ["garden", "Garden", "", IMG.home[2], false],
  ["pet-supplies", "Pet Supplies", "", IMG.pet[0], false],
  ["gifts", "Gifts", "", IMG.gifts[0], false],
  ["travel", "Travel", "", IMG.travel[0], false],
  ["trending", "🔥 Trending Products", "", IMG.tech[4], true],
  ["best-sellers", "⭐ Best Sellers", "", IMG.shoes[0], true],
  ["premium-picks", "💎 Premium Picks", "", IMG.jewelry[3], true],
  ["deals", "💰 Deals", "", IMG.home[3], true],
  ["seasonal", "🎄 Seasonal Collections", "", IMG.gifts[2], true],
];

const brandData: Array<[string, string, string]> = [
  ["maison-lumiere", "Maison Lumière", "French-inspired luxury essentials"],
  ["atlas-co", "Atlas & Co.", "Modern menswear with heritage tailoring"],
  ["velvet-sole", "Velvet Sole", "Sneakers engineered for everyday luxury"],
  ["aurum", "Aurum Atelier", "Fine jewelry, responsibly crafted"],
  ["chrono", "Chrono Haus", "Precision timepieces for the modern era"],
  ["petale", "Pétale", "Clean beauty, clinically proven"],
  ["domus", "Domus Living", "Objects that make home feel like a sanctuary"],
  ["nova-tech", "NovaTech", "Gadgets that outthink tomorrow"],
  ["apex-fit", "Apex Fit", "Training gear for serious progress"],
  ["petit-jouet", "Petit Jouet", "Heirloom-quality toys for little ones"],
  ["wanderlust", "Wanderlust", "Travel companions for the curious"],
  ["paw-kingdom", "Paw Kingdom", "Spoil your best friend royally"],
];

interface SeedProduct {
  name: string;
  cat: string;
  brand: string;
  price: number;
  compareAt?: number;
  images: string[];
  color: string;
  badges: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  desc: string;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  featured?: boolean;
  trending?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  premium?: boolean;
  store?: string;
}

const P: SeedProduct[] = [
  // Women's Fashion
  { name: "Aurora Silk Wrap Dress", cat: "womens-fashion", brand: "maison-lumiere", price: 189, compareAt: 260, images: [IMG.women[0], IMG.women[5]], color: "#f5f5f4", badges: ["Best Seller"], tags: ["premium", "seasonal"], rating: 4.8, reviewCount: 412, desc: "A liquid-silk wrap dress with a bias cut that drapes like water. Designed in Paris, finished by hand, and made to move from day to dinner without missing a beat.", specs: { Material: "100% mulberry silk", Fit: "True to size, bias cut", Care: "Dry clean only", Origin: "Made in France" }, pros: ["Drapes beautifully", "Wrinkle-resistant silk", "Flattering on all body types"], cons: ["Dry clean only", "Runs slightly long"], featured: true, bestSeller: true },
  { name: "Noir Sculpt Blazer", cat: "womens-fashion", brand: "atlas-co", price: 240, images: [IMG.women[5], IMG.women[1]], color: "#1c1917", badges: ["Premium Picks"], tags: ["premium"], rating: 4.7, reviewCount: 268, desc: "A sharply tailored oversized blazer in Italian wool-blend. Structured shoulders, a nipped waist, and deep pockets — the power piece your wardrobe has been missing.", specs: { Material: "72% wool, 28% viscose", Fit: "Oversized", Care: "Dry clean" }, pros: ["Premium tailoring", "Versatile styling", "Pockets that actually work"], cons: ["Pricey", "Warm for summer"], premium: true },
  { name: "Mira Cashmere Knit", cat: "womens-fashion", brand: "maison-lumiere", price: 145, compareAt: 195, images: [IMG.women[1], IMG.women[3]], color: "#d6d3d1", badges: ["New"], tags: ["seasonal", "new"], rating: 4.6, reviewCount: 189, desc: "Featherweight Grade-A cashmere knit with a relaxed crew neck. Layered or solo, it's the quiet luxury staple that gets reached for every single day.", specs: { Material: "100% Grade-A cashmere", Weight: "220gsm", Care: "Hand wash cold" }, pros: ["Buttery soft", "Holds shape", "Ethically sourced wool"], cons: ["Pills slightly with wear", "Hand wash only"], isNew: true },
  { name: "Élan Wide-Leg Trouser", cat: "womens-fashion", brand: "atlas-co", price: 128, compareAt: 165, images: [IMG.women[3], IMG.women[2]], color: "#292524", badges: ["Trending"], tags: ["trending"], rating: 4.5, reviewCount: 342, desc: "High-rise, wide-leg trousers in a fluid crepe that skims rather than clings. The 2026 silhouette, engineered with a hidden waistband for zero-dig comfort.", specs: { Material: "Poly-viscose crepe", Inseam: "31 in", Care: "Machine wash" }, pros: ["Flattering high rise", "No-iron fabric", "Hidden elastic waistband"], cons: ["Needs hemming for petites"], trending: true },
  { name: "Rosé Puff Shoulder Top", cat: "womens-fashion", brand: "petale", price: 68, images: [IMG.women[2], IMG.women[0]], color: "#f9a8d4", badges: ["New"], tags: ["new"], rating: 4.4, reviewCount: 96, desc: "A romantic puff-sleeve top in a blush double-gauze cotton. Feminine without trying too hard — pairs with denim or satin skirts alike.", specs: { Material: "100% cotton gauze", Care: "Machine wash cold" }, pros: ["Breathable cotton", "Puff sleeves hold shape", "Easy care"], cons: ["Slightly sheer"], isNew: true },
  { name: "Vogue Trench Coat", cat: "womens-fashion", brand: "maison-lumiere", price: 320, compareAt: 420, images: [IMG.women[4], IMG.women[3]], color: "#a8a29e", badges: ["Premium Picks"], tags: ["premium", "seasonal"], rating: 4.9, reviewCount: 521, desc: "A modern take on the classic trench — water-repellent cotton gabardine, gunmetal hardware, and a removable quilted liner for three-season wear.", specs: { Material: "Cotton gabardine", Lining: "Removable quilted", Water: "Repellent finish" }, pros: ["Heirloom quality", "Removable liner", "Rain-ready"], cons: ["Heavy to pack"], featured: true },
  // Men's Fashion
  { name: "Cobalt Tailored Blazer", cat: "mens-fashion", brand: "atlas-co", price: 265, compareAt: 340, images: [IMG.men[1], IMG.men[3]], color: "#1d4ed8", badges: ["Best Seller"], tags: ["premium"], rating: 4.7, reviewCount: 634, desc: "Half-canvassed blazer in a vivid cobalt Italian wool. Hand-finished lapels and a soft shoulder — the kind of jacket that upgrades everything beneath it.", specs: { Material: "Italian wool blend", Construction: "Half-canvassed", Fit: "Slim tailored" }, pros: ["Half-canvassed structure", "Striking color", "Soft shoulder drape"], cons: ["Dry clean only"], bestSeller: true, featured: true },
  { name: "Amber Statement Suit", cat: "mens-fashion", brand: "atlas-co", price: 480, compareAt: 620, images: [IMG.men[0], IMG.men[3]], color: "#ea580c", badges: ["Trending"], tags: ["trending", "premium"], rating: 4.6, reviewCount: 143, desc: "A head-turning burnt-orange two-piece in a tropical-weight wool. Cut with a modern slim block and flat-front trousers — confidence, tailored.", specs: { Material: "Tropical wool", Pieces: "Jacket + trousers", Fit: "Slim" }, pros: ["Show-stopping color", "Breathable wool", "Modern cut"], cons: ["Bold for some", "Trousers run slim"], trending: true },
  { name: "Indigo Raw Denim Jacket", cat: "mens-fashion", brand: "velvet-sole", price: 118, images: [IMG.men[2], IMG.men[1]], color: "#1e3a8a", badges: ["Deal"], tags: ["deal"], rating: 4.5, reviewCount: 287, desc: "14oz Japanese selvedge denim in a trucker cut that only gets better with age. Expect beautiful fades, sturdy hardware, and a lifetime of wear.", specs: { Material: "14oz selvedge denim", Wash: "Raw indigo", Hardware: "Brass" }, pros: ["Ages beautifully", "Selvedge quality", "Sturdy construction"], cons: ["Stiff initially", "Sizing shrinks slightly"] },
  { name: "Heritage Oxford Shirt", cat: "mens-fashion", brand: "atlas-co", price: 72, compareAt: 95, images: [IMG.men[3], IMG.men[1]], color: "#e7e5e4", badges: ["Best Seller"], tags: [], rating: 4.6, reviewCount: 918, desc: "A button-down Oxford in garment-washed cotton that's soft from the first wear. The universal uniform of good taste — from boardroom to weekend.", specs: { Material: "100% cotton oxford", Fit: "Regular", Care: "Machine wash" }, pros: ["Pre-softened fabric", "Reinforced collar", "Great value"], cons: ["Runs a touch big"], bestSeller: true },
  // Baby & Kids
  { name: "Cloud Soft Baby Onesie Set", cat: "baby-kids", brand: "petit-jouet", price: 34, images: [IMG.toys[1], IMG.toys[3]], color: "#fde68a", badges: ["Best Seller"], tags: [], rating: 4.9, reviewCount: 1102, desc: "Five-pack of organic cotton onesies with envelope necks and snap legs. GOTS-certified, hypoallergenic, and impossibly soft against newborn skin.", specs: { Material: "GOTS organic cotton", Pack: "5 pieces", Sizes: "0-24 months" }, pros: ["Organic certified", "Snap legs for changes", "No-shrink guarantee"], cons: ["Runs small", "White shows stains"], bestSeller: true },
  { name: "Tiny Explorer Plush Set", cat: "baby-kids", brand: "petit-jouet", price: 42, images: [IMG.toys[2], IMG.toys[0]], color: "#ef4444", badges: ["Seasonal"], tags: ["seasonal"], rating: 4.8, reviewCount: 356, desc: "A trio of heirloom plush friends in organic materials, each with a storybook. Designed to be loved hard and handed down.", specs: { Material: "Organic cotton + recycled fill", Set: "3 plush toys", Age: "0+" }, pros: ["Heirloom quality", "Sensory textures", "Storybook included"], cons: ["Hand wash only"], isNew: true },
  { name: "Mini Chef Play Kitchen", cat: "baby-kids", brand: "petit-jouet", price: 189, compareAt: 240, images: [IMG.toys[0], IMG.toys[2]], color: "#f472b6", badges: ["Trending"], tags: ["trending"], rating: 4.7, reviewCount: 274, desc: "A wooden play kitchen with working knobs, a fabric 'flame' hob, and 12 accessories. Montessori-inspired open-ended play for tiny gourmands.", specs: { Material: "FSC birch wood", Includes: "12 accessories", Age: "3+" }, pros: ["Solid wood build", "Open-ended play", "Easy assembly"], cons: ["Large footprint", "Accessories small"], trending: true },
  // Shoes
  { name: "Crimson Court Sneaker", cat: "shoes", brand: "velvet-sole", price: 139, compareAt: 185, images: [IMG.shoes[0], IMG.shoes[1]], color: "#ef4444", badges: ["Best Seller", "Deal"], tags: ["deal", "best"], rating: 4.7, reviewCount: 1243, desc: "A heritage-court silhouette in full-grain leather with a scarlet pop. Cushioned ortholite insole, gum rubber outsole, and timeless good looks.", specs: { Upper: "Full-grain leather", Sole: "Gum rubber", Insole: "Ortholite" }, pros: ["Premium leather", "All-day cushioning", "Classic silhouette"], cons: ["Narrow fit", "Scuffs visible on white"], bestSeller: true, featured: true },
  { name: "Alpine White Low-Top", cat: "shoes", brand: "velvet-sole", price: 124, images: [IMG.shoes[1], IMG.shoes[0]], color: "#fafafa", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 534, desc: "Minimal white low-tops in tumbled leather with tonal stitching. The cleanest canvas for every outfit — and machine-washable to stay that way.", specs: { Upper: "Tumbled leather", Care: "Machine washable", Sole: "Recycled rubber" }, pros: ["Machine washable", "Minimal aesthetic", "Recycled materials"], cons: ["Needs breaking in"], isNew: true },
  { name: "Timber High-Top", cat: "shoes", brand: "velvet-sole", price: 152, compareAt: 200, images: [IMG.shoes[2], IMG.shoes[3]], color: "#78350f", badges: ["Trending"], tags: ["trending"], rating: 4.5, reviewCount: 389, desc: "A rugged high-top with premium suede panels, padded collar, and a lug sole that grips everything from city streets to trailheads.", specs: { Upper: "Suede + mesh", Sole: "Lug rubber", Height: "High-top" }, pros: ["All-terrain grip", "Suede luxury feel", "Supportive collar"], cons: ["Warm in summer", "Suede needs care"], trending: true },
  { name: "Metro Retro Runner", cat: "shoes", brand: "velvet-sole", price: 98, images: [IMG.shoes[3], IMG.shoes[2]], color: "#fbbf24", badges: ["Deal"], tags: ["deal"], rating: 4.4, reviewCount: 742, desc: "A retro-futurist runner with a cloud-foam midsole and breathable mesh. Chunky where it counts, light where it matters.", specs: { Midsole: "Cloud-foam", Upper: "Engineered mesh", Drop: "8mm" }, pros: ["Plush cushioning", "Retro style", "Lightweight"], cons: ["Runs half size small"] },
  { name: "Velvet Sole Mule", cat: "shoes", brand: "velvet-sole", price: 110, images: [IMG.shoes[2], IMG.shoes[0]], color: "#1e293b", badges: ["Premium Picks"], tags: ["premium"], rating: 4.6, reviewCount: 154, desc: "A slip-on leather mule with a sculpted heel and padded footbed. Effortless polish for the commute-to-cocktail hour.", specs: { Upper: "Nappa leather", Heel: "35mm sculpted", Footbed: "Padded" }, pros: ["Slip-on ease", "Premium leather", "All-day comfort"], cons: ["Heel takes practice"], premium: true },
  // Jewelry
  { name: "Aurum Signet Ring", cat: "jewelry", brand: "aurum", price: 890, compareAt: 1100, images: [IMG.jewelry[3], IMG.jewelry[0]], color: "#f59e0b", badges: ["Premium Picks"], tags: ["premium", "luxury"], rating: 4.9, reviewCount: 212, desc: "An 18k gold signet ring with a hand-engraved face, cast in small batches. Weighty, warm, and forever.", specs: { Metal: "18k yellow gold", Weight: "9.2g", Engraving: "Hand-engraved" }, pros: ["Solid 18k gold", "Hand-finished", "Unisex design"], cons: ["Premium price", "Resizing takes time"], featured: true, premium: true },
  { name: "Pearl Cascade Necklace", cat: "jewelry", brand: "aurum", price: 240, images: [IMG.jewelry[2], IMG.jewelry[1]], color: "#e7e5e4", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 463, desc: "Freshwater pearls graduating down a 14k gold-filled chain. Each pearl is hand-knotted and one-of-one — nature's jewelry at its finest.", specs: { Pearls: "Freshwater 5-8mm", Chain: "14k gold-filled", Length: "18 in" }, pros: ["Genuine pearls", "Hand-knotted", "Unique iridescence"], cons: ["Pearls need care", "Delicate clasp"], bestSeller: true },
  { name: "Gilded Hoops — Set of 3", cat: "jewelry", brand: "aurum", price: 96, compareAt: 130, images: [IMG.jewelry[0], IMG.jewelry[3]], color: "#d97706", badges: ["Deal"], tags: ["deal"], rating: 4.6, reviewCount: 871, desc: "Three sizes of gold-vermeil hoops in one box — from barely-there to statement. Hypoallergenic posts included.", specs: { Metal: "Gold vermeil", Sizes: "15/25/40mm", Posts: "Hypoallergenic" }, pros: ["Three sizes included", "Vermeil quality", "Tarnish resistant"], cons: ["40mm is heavy"], bestSeller: true },
  { name: "Étoile Diamond Tennis Bracelet", cat: "jewelry", brand: "aurum", price: 1250, images: [IMG.jewelry[1], IMG.jewelry[2]], color: "#e2e8f0", badges: ["Premium Picks"], tags: ["premium", "luxury"], rating: 5.0, reviewCount: 88, desc: "Lab-grown diamonds in a 14k white gold tennis setting — identical brilliance to mined stones, with a clear conscience and a fairer price.", specs: { Stones: "3ct lab-grown diamonds", Metal: "14k white gold", Clarity: "VS1+" }, pros: ["Lab-grown brilliance", "Ethical sourcing", "Lifetime warranty"], cons: ["Investment piece"], premium: true },
  { name: "Lune Pendant Necklace", cat: "jewelry", brand: "aurum", price: 128, images: [IMG.jewelry[2], IMG.jewelry[0]], color: "#f8fafc", badges: ["New"], tags: ["new"], rating: 4.5, reviewCount: 134, desc: "A crescent moon in polished sterling silver with a tiny diamond star. Delicate enough for everyday, special enough for every day.", specs: { Metal: "Sterling silver", Accent: "0.02ct diamond", Chain: "16-18in adjustable" }, pros: ["Everyday delicate", "Adjustable chain", "Anti-tarnish coating"], cons: ["Small pendant"], isNew: true },
  // Bags
  { name: "Sac Lumière Leather Tote", cat: "bags", brand: "maison-lumiere", price: 340, compareAt: 450, images: [IMG.women[4], IMG.women[0]], color: "#a16207", badges: ["Premium Picks"], tags: ["premium", "luxury"], rating: 4.8, reviewCount: 657, desc: "A structured tote in vegetable-tanned leather that ages into a rich patina. Fits a 16-inch laptop, has a zippered interior pocket, and an optional crossbody strap.", specs: { Material: "Vegetable-tanned leather", Laptop: "Fits 16in", Straps: "Top handle + crossbody" }, pros: ["Develops beautiful patina", "Roomy and structured", "Versatile straps"], cons: ["Heavy when full", "Premium price"], featured: true },
  { name: "Micro Mini Crossbody", cat: "bags", brand: "maison-lumiere", price: 89, compareAt: 120, images: [IMG.women[1], IMG.women[5]], color: "#f472b6", badges: ["Trending"], tags: ["trending"], rating: 4.5, reviewCount: 823, desc: "The itty-bitty bag with big energy. Holds phone, cards, and lipstick — everything you actually need. Comes with a detachable chain strap.", specs: { Material: "Saffiano leather", Strap: "Detachable chain", Pockets: "2 card slots" }, pros: ["On-trend micro size", "Chain strap", "Surprisingly roomy"], cons: ["No room for extras"], trending: true, isNew: true },
  { name: "Weekender Duffle 45L", cat: "bags", brand: "wanderlust", price: 210, compareAt: 270, images: [IMG.travel[0], IMG.women[4]], color: "#334155", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 445, desc: "A waxed-canvas duffle with leather trim and a shoe compartment. Carry-on sized, TSA friendly, and built for a decade of weekends.", specs: { Material: "Waxed canvas + leather", Capacity: "45L", Compartments: "Shoe + wet pouch" }, pros: ["Carry-on compliant", "Waxed canvas durability", "Hidden shoe compartment"], cons: ["Canvas is heavy", "Wax needs refresh"], bestSeller: true },
  // Watches
  { name: "Chrono Noir Automatic", cat: "watches", brand: "chrono", price: 520, compareAt: 680, images: [IMG.watches[0], IMG.watches[3]], color: "#0f172a", badges: ["Premium Picks"], tags: ["premium", "luxury"], rating: 4.8, reviewCount: 367, desc: "A 41mm automatic with a matte-black dial, sapphire crystal, and a 42-hour power reserve. Swiss movement, tool-free micro-adjust bracelet.", specs: { Movement: "Swiss automatic", Case: "41mm steel", Crystal: "Sapphire", Water: "100m" }, pros: ["Swiss movement", "Sapphire crystal", "Micro-adjust clasp"], cons: ["No date window", "Wears large"], featured: true },
  { name: "Heritage Field Watch", cat: "watches", brand: "chrono", price: 210, compareAt: 260, images: [IMG.watches[1], IMG.watches[3]], color: "#92400e", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 589, desc: "A vintage-inspired field watch with a honey leather strap, luminous numerals, and a domed crystal. Rugged enough for trails, sharp enough for the office.", specs: { Movement: "Japanese quartz", Case: "38mm", Strap: "Italian leather", Water: "50m" }, pros: ["Legible lume", "Classic proportions", "Quality strap"], cons: ["Quartz (not auto)", "Strap stiff at first"], bestSeller: true },
  { name: "Or Gold-Tone Automatic", cat: "watches", brand: "chrono", price: 780, images: [IMG.watches[2], IMG.watches[0]], color: "#b45309", badges: ["Premium Picks"], tags: ["premium", "luxury"], rating: 4.9, reviewCount: 143, desc: "A gold-tone dress watch with a champagne dial and a 21-jewel automatic movement. Slim profile slips under any cuff.", specs: { Movement: "21-jewel automatic", Case: "39mm gold-tone", Crystal: "Domed sapphire", Water: "50m" }, pros: ["Elegant dress piece", "Automatic movement", "Slim 9mm case"], cons: ["Gold-tone not solid", "No lume"], premium: true },
  { name: "Série Silver Chronograph", cat: "watches", brand: "chrono", price: 340, compareAt: 430, images: [IMG.watches[3], IMG.watches[1]], color: "#cbd5e1", badges: ["Deal"], tags: ["deal"], rating: 4.6, reviewCount: 276, desc: "A racing-inspired chronograph in brushed silver with three sub-dials and a tachymeter bezel. Motorsport heritage at a sensible price.", specs: { Movement: "Quartz chronograph", Case: "42mm", Bezel: "Tachymeter", Water: "100m" }, pros: ["Striking dial", "Accurate quartz", "Screw-down crown"], cons: ["Heavy bracelet"], trending: true },
  // Beauty
  { name: "Éclat Vitamin-C Serum", cat: "beauty", brand: "petale", price: 58, compareAt: 75, images: [IMG.beauty[3], IMG.beauty[2]], color: "#fbbf24", badges: ["Best Seller"], tags: [], rating: 4.8, reviewCount: 2134, desc: "A 15% stabilized vitamin-C serum with ferulic acid and hyaluronic acid. Brightens, firms, and fades dark spots in four weeks — dermatologist tested.", specs: { Key: "15% Vit-C + ferulic acid", Size: "30ml", Skin: "All types", Tested: "Dermatologist" }, pros: ["Visible brightening", "Stable formulation", "Plays well with SPF"], cons: ["Slight citrus scent", "Pricey per ml"], bestSeller: true, featured: true },
  { name: "Hydra Veil Moisturizer", cat: "beauty", brand: "petale", price: 46, images: [IMG.beauty[2], IMG.beauty[0]], color: "#a5f3fc", badges: ["New"], tags: ["new"], rating: 4.7, reviewCount: 987, desc: "A gel-cream with five ceramides and squalane that quenches dry skin without heaviness. 72-hour hydration, fragrance-free.", specs: { Key: "5 ceramides + squalane", Size: "50ml", Finish: "Dewy matte" }, pros: ["72h hydration", "Fragrance-free", "Sinks in fast"], cons: ["Not rich enough for very dry skin"], isNew: true },
  { name: "Velvet Matte Lip Duo", cat: "beauty", brand: "petale", price: 32, compareAt: 44, images: [IMG.beauty[0], IMG.beauty[3]], color: "#be123c", badges: ["Deal"], tags: ["deal"], rating: 4.6, reviewCount: 1543, desc: "Two weightless matte liquid lips with a comfort-mousse finish — no drying, no cracking, no transfer. Shades: Rosé Nude & Scarlet Siren.", specs: { Finish: "Velvet matte", Set: "2 shades", Wear: "12 hours" }, pros: ["Comfortable matte", "Transfer resistant", "Two iconic shades"], cons: ["Needs lip balm base"], bestSeller: true },
  { name: "Clean Ritual Set — Skincare Trio", cat: "beauty", brand: "petale", price: 98, compareAt: 132, images: [IMG.beauty[1], IMG.beauty[2]], color: "#e2e8f0", badges: ["Premium Picks"], tags: ["premium"], rating: 4.7, reviewCount: 764, desc: "Cleanser, serum, and moisturizer in refillable glass. A complete clean-beauty ritual in one gift-ready box.", specs: { Includes: "3 full-size", Packaging: "Refillable glass", Cruelty: "Leaping Bunny" }, pros: ["Complete routine", "Refillable packaging", "Cruelty-free"], cons: ["Glass bottles heavy"], premium: true, isNew: true },
  { name: "L'Oréal-esque Glow Face Oil", cat: "beauty", brand: "petale", price: 52, images: [IMG.beauty[3], IMG.beauty[1]], color: "#fde68a", badges: ["Trending"], tags: ["trending"], rating: 4.5, reviewCount: 421, desc: "A dry-touch botanical oil with rosehip, squalane, and vitamin E. Three drops for lit-from-within glow — day or night.", specs: { Key: "Rosehip + squalane", Size: "30ml", Finish: "Dry-touch" }, pros: ["Instant glow", "Non-greasy", "Clean ingredients"], cons: ["Scent may not suit all"], trending: true },
  // Home & Kitchen
  { name: "Aria Smart Espresso Machine", cat: "home-kitchen", brand: "domus", price: 449, compareAt: 599, images: [IMG.home[3], IMG.home[0]], color: "#57534e", badges: ["Best Seller", "Deal"], tags: ["deal", "premium"], rating: 4.7, reviewCount: 1287, desc: "A barista-grade espresso machine with a 15-bar pump, PID temperature control, and a built-in conical grinder. Café-quality shots at home, every morning.", specs: { Pump: "15-bar", Grinder: "Built-in conical", Boiler: "PID-controlled", Milk: "Steam wand" }, pros: ["Grinder included", "PID temp stability", "Compact footprint"], cons: ["Heavy (11kg)", "Needs descaling"], bestSeller: true, featured: true },
  { name: "Maison Ceramic Dinner Set", cat: "home-kitchen", brand: "domus", price: 120, compareAt: 160, images: [IMG.home[1], IMG.home[3]], color: "#d6d3d1", badges: ["New"], tags: ["new"], rating: 4.8, reviewCount: 432, desc: "A 16-piece stoneware set in a warm oat glaze. Microwave, dishwasher, and oven safe — and each piece is subtly unique from the kiln.", specs: { Pieces: "16", Material: "Stoneware", Safe: "Dishwasher/microwave/oven" }, pros: ["Durable stoneware", "Unique glaze", "Complete set"], cons: ["Heavy plates"], isNew: true },
  { name: "Halo Table Lamp", cat: "home-kitchen", brand: "domus", price: 89, compareAt: 115, images: [IMG.home[4], IMG.home[5]], color: "#f5f5f4", badges: ["Trending"], tags: ["trending"], rating: 4.6, reviewCount: 318, desc: "A sculptural LED lamp with a touch-dimmable halo ring and three color temperatures. Instant ambiance, zero glare.", specs: { Light: "LED ring", Dimmable: "Touch, 3 temps", Base: "Solid ash wood" }, pros: ["Beautiful light quality", "Touch controls", "Wood base"], cons: ["Cord is short"], trending: true, isNew: true },
  { name: "Nordic Oak Serving Board", cat: "home-kitchen", brand: "domus", price: 64, images: [IMG.home[0], IMG.home[4]], color: "#b45309", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 523, desc: "A live-edge acacia board with a juice groove and hidden handles. The centerpiece of every cheese board and charcuterie moment.", specs: { Wood: "Acacia", Size: "16x12in", Finish: "Food-safe oil" }, pros: ["Live-edge beauty", "Juice groove", "Food-safe finish"], cons: ["Needs oiling"], bestSeller: true },
  { name: "Cloud Linen Throw Blanket", cat: "home-kitchen", brand: "domus", price: 78, compareAt: 98, images: [IMG.home[5], IMG.home[2]], color: "#e2e8f0", badges: ["Seasonal"], tags: ["seasonal"], rating: 4.8, reviewCount: 689, desc: "A stonewashed linen throw that gets softer every wash. Generous 50x70 size, fringed ends, and breathable warmth for every season.", specs: { Material: "100% stonewashed linen", Size: "50x70in", Care: "Machine wash" }, pros: ["Gets softer with time", "Breathable", "Generous size"], cons: ["Linen wrinkles", "Sheds initially"], featured: true },
  { name: "Brise Aroma Diffuser", cat: "home-kitchen", brand: "domus", price: 54, compareAt: 70, images: [IMG.home[2], IMG.home[5]], color: "#a7f3d0", badges: ["Deal"], tags: ["deal"], rating: 4.5, reviewCount: 342, desc: "An ultrasonic diffuser with a 300ml tank, whisper-quiet operation, and 7-color ambient light. Fill your space with calm in minutes.", specs: { Tank: "300ml", Runtime: "10 hours", Light: "7-color LED" }, pros: ["Ultrasonic quiet", "Long runtime", "Auto shut-off"], cons: ["Plastic body"], trending: true },
  // Electronics
  { name: "Aurora ANC Headphones", cat: "electronics", brand: "nova-tech", price: 249, compareAt: 329, images: [IMG.tech[5], IMG.tech[4]], color: "#18181b", badges: ["Best Seller"], tags: ["premium"], rating: 4.8, reviewCount: 3218, desc: "Adaptive noise cancelling, 40-hour battery, and studio-tuned 40mm drivers. Luxury comfort meets reference sound — your daily escape.", specs: { ANC: "Adaptive hybrid", Battery: "40 hours", Drivers: "40mm", Codecs: "LDAC, AAC" }, pros: ["Top-tier ANC", "40h battery", "Plush comfort"], cons: ["Case is bulky", "No 3.5mm in box"], bestSeller: true, featured: true },
  { name: "NovaBook Air 14", cat: "electronics", brand: "nova-tech", price: 999, compareAt: 1199, images: [IMG.tech[1], IMG.tech[3]], color: "#cbd5e1", badges: ["Premium Picks"], tags: ["premium"], rating: 4.7, reviewCount: 856, desc: "A 2.6lb ultrabook with a 3K OLED display, 16GB RAM, and 18-hour battery. Power meets portability for the modern workflow.", specs: { Display: "14in 3K OLED", CPU: "Ryzen AI 9", RAM: "16GB LPDDR5X", Battery: "18 hours" }, pros: ["Stunning OLED", "Featherweight", "All-day battery"], cons: ["Single USB-A port", "No SD slot"], featured: true },
  { name: "Pulse Smartwatch Pro", cat: "electronics", brand: "nova-tech", price: 299, compareAt: 380, images: [IMG.tech[3], IMG.tech[2]], color: "#0f172a", badges: ["Trending"], tags: ["trending", "new"], rating: 4.6, reviewCount: 1432, desc: "AMOLED always-on display, dual-band GPS, ECG, and 14-day battery. A health lab on your wrist, dressed for every occasion.", specs: { Display: "1.43in AMOLED", GPS: "Dual-band", Health: "ECG + SpO2", Battery: "14 days" }, pros: ["14-day battery", "Accurate GPS", "Premium build"], cons: ["Charger proprietary", "App needs polish"], trending: true, isNew: true },
  { name: "Pixel Pro Smartphone", cat: "electronics", brand: "nova-tech", price: 799, images: [IMG.tech[4], IMG.tech[1]], color: "#64748b", badges: ["Premium Picks"], tags: ["premium"], rating: 4.7, reviewCount: 1987, desc: "A 6.7in flagship with a 200MP camera, on-device AI, and a 5,000mAh battery that sips power. The camera phone that makes every shot a keeper.", specs: { Display: "6.7in 120Hz", Camera: "200MP triple", Battery: "5000mAh", AI: "On-device" }, pros: ["200MP camera", "Clean AI features", "2-day battery"], cons: ["No charger included", "Slippery back"], premium: true },
  { name: "Echo Boom Bluetooth Speaker", cat: "electronics", brand: "nova-tech", price: 129, compareAt: 169, images: [IMG.tech[0], IMG.tech[5]], color: "#7c3aed", badges: ["Deal"], tags: ["deal"], rating: 4.5, reviewCount: 2234, desc: "A 360° speaker with room-filling sound, deep bass radiators, and IPX7 waterproofing. 24 hours of party, pocket-sized.", specs: { Output: "30W 360°", Battery: "24 hours", Rating: "IPX7", Pairing: "Stereo-pair" }, pros: ["Big sound, small size", "IPX7 waterproof", "24h battery"], cons: ["Bass overwhelms at max", "No aux"], bestSeller: true },
  { name: "Vision AR Glasses", cat: "electronics", brand: "nova-tech", price: 459, compareAt: 590, images: [IMG.tech[2], IMG.tech[0]], color: "#1e293b", badges: ["New"], tags: ["new", "premium"], rating: 4.4, reviewCount: 234, desc: "Sleek AR glasses that project a 130-inch virtual display. Works with any USB-C device — cinema, spreadsheets, and games anywhere.", specs: { Display: "130in virtual", Weight: "79g", Connectivity: "USB-C", Audio: "Open-ear" }, pros: ["Featherlight", "Plug-and-play", "Huge virtual display"], cons: ["Niche use cases", "Brightness indoors"], isNew: true },
  // Gaming
  { name: "Hyperion RGB Headset", cat: "gaming", brand: "nova-tech", price: 149, compareAt: 199, images: [IMG.tech[0], IMG.tech[4]], color: "#22d3ee", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 1876, desc: "A 7.1 surround headset with 50mm drivers, a broadcast-grade mic, and plush memory-foam earcups. Hear footsteps before they happen.", specs: { Sound: "7.1 surround", Drivers: "50mm", Mic: "Broadcast-grade", Weight: "310g" }, pros: ["Precise spatial audio", "Comfortable for long sessions", "Detachable mic"], cons: ["RGB drains battery", "Clamp force strong"], bestSeller: true },
  { name: "Titan X Gaming Controller", cat: "gaming", brand: "nova-tech", price: 79, compareAt: 100, images: [IMG.tech[2], IMG.tech[0]], color: "#6366f1", badges: ["Deal"], tags: ["deal"], rating: 4.6, reviewCount: 2456, desc: "A pro-level controller with hall-effect sticks (no drift, ever), remappable paddles, and a 40-hour battery. Aim better, longer.", specs: { Sticks: "Hall-effect", Paddles: "4 remappable", Battery: "40 hours", Connection: "2.4GHz + BT" }, pros: ["Zero-drift sticks", "4 back paddles", "40h battery"], cons: ["Learning curve for paddles"], bestSeller: true },
  { name: "Nebula 4K Gaming Monitor", cat: "gaming", brand: "nova-tech", price: 649, compareAt: 820, images: [IMG.tech[3], IMG.tech[2]], color: "#0ea5e9", badges: ["Premium Picks"], tags: ["premium"], rating: 4.8, reviewCount: 743, desc: "A 27in 4K 144Hz IPS monitor with 1ms response, HDR600, and KVM switch. The competitive edge, in glorious color.", specs: { Panel: "27in IPS 4K", Refresh: "144Hz", Response: "1ms", HDR: "HDR600" }, pros: ["4K + 144Hz", "Accurate colors", "KVM switch"], cons: ["Expensive", "Stand is wobbly"], featured: true },
  { name: "Quantum Mechanical Keyboard", cat: "gaming", brand: "nova-tech", price: 159, compareAt: 210, images: [IMG.tech[4], IMG.tech[5]], color: "#e11d48", badges: ["Trending"], tags: ["trending"], rating: 4.7, reviewCount: 987, desc: "A gasket-mounted 75% board with pre-lubed switches, PBT keycaps, and tri-mode connectivity. Thocky, creamy, endgame.", specs: { Layout: "75%", Switches: "Pre-lubed linear", Keycaps: "PBT double-shot", Modes: "BT/2.4G/USB-C" }, pros: ["Gasket-mounted flex", "Buttery switches", "Hot-swappable"], cons: ["No wrist rest", "RGB not per-key in BT"], trending: true, isNew: true },
  // Computers
  { name: "NovaStation Pro Desktop", cat: "computers", brand: "nova-tech", price: 1899, compareAt: 2199, images: [IMG.tech[2], IMG.tech[1]], color: "#111827", badges: ["Premium Picks"], tags: ["premium"], rating: 4.8, reviewCount: 412, desc: "A creator's workstation with a 16-core CPU, RTX-class GPU, 32GB DDR5, and 2TB Gen4 SSD. Render 4K timelines in real time.", specs: { CPU: "16-core", GPU: "RTX 4070-class", RAM: "32GB DDR5", Storage: "2TB Gen4 SSD" }, pros: ["Blazing renders", "Quiet cooling", "Tool-less upgrade"], cons: ["Premium price", "Bulky case"], premium: true, featured: true },
  { name: "UltraBook 16 Creator Edition", cat: "computers", brand: "nova-tech", price: 1399, images: [IMG.tech[1], IMG.tech[5]], color: "#78716c", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 289, desc: "A 16in creator laptop with a 4K+ mini-LED display, 100% DCI-P3, and a precision trackpad. Your studio, anywhere.", specs: { Display: "16in mini-LED 4K+", Color: "100% DCI-P3", RAM: "32GB", GPU: "Studio-class" }, pros: ["Reference display", "Great thermals", "Excellent keyboard"], cons: ["Heavy", "Webcam average"], isNew: true },
  { name: "Mechanical Lab Keyboard Kit", cat: "computers", brand: "nova-tech", price: 99, compareAt: 130, images: [IMG.tech[5], IMG.tech[4]], color: "#d4d4d8", badges: ["Deal"], tags: ["deal"], rating: 4.5, reviewCount: 678, desc: "A hot-swappable 65% kit with aluminum case, gasket mount, and all the tools. Build your perfect typing feel in an afternoon.", specs: { Layout: "65% kit", Case: "CNC aluminum", Mount: "Gasket", Extras: "Tools + switches" }, pros: ["Fully customizable", "Aluminum build", "Gasket comfort"], cons: ["Assembly required", "No keycaps included"], trending: true },
  { name: "Dock Pro 12-in-1 Thunderbolt", cat: "computers", brand: "nova-tech", price: 189, compareAt: 240, images: [IMG.tech[3], IMG.tech[2]], color: "#334155", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 1123, desc: "One cable to rule them all: dual 4K60 video, 100W charging, 10Gbps ports, and an SD slot. Desk setup, solved.", specs: { Video: "Dual 4K60", Power: "100W PD", Ports: "12 total", Speed: "10Gbps" }, pros: ["Dual 4K output", "100W laptop charging", "Compact design"], cons: ["Cable non-removable", "Gets warm"], bestSeller: true },
  // Books
  { name: "The Art of Quiet Luxury — Hardcover", cat: "books", brand: "maison-lumiere", price: 45, compareAt: 60, images: [IMG.home[4], IMG.home[5]], color: "#a8a29e", badges: ["Best Seller"], tags: [], rating: 4.9, reviewCount: 876, desc: "A 320-page visual manifesto on living well with less — interiors, fashion, and rituals from the world's most considered makers. 250 photographs.", specs: { Pages: "320", Format: "Hardcover", Photos: "250" }, pros: ["Stunning photography", "Coffee-table worthy", "Thoughtful essays"], cons: ["Heavy book"], bestSeller: true },
  { name: "Atomic Habits — Deluxe Edition", cat: "books", brand: "maison-lumiere", price: 32, images: [IMG.home[5], IMG.home[0]], color: "#f59e0b", badges: ["Trending"], tags: ["trending"], rating: 4.8, reviewCount: 5678, desc: "The deluxe edition of the modern classic on building systems that stick — with a new foreword and bonus workbook sections.", specs: { Pages: "340", Format: "Deluxe hardcover", Bonus: "Workbook sections" }, pros: ["Proven framework", "Beautiful edition", "Bonus workbook"], cons: ["Dense for some"], trending: true },
  { name: "Taste Atlas: World Cuisines", cat: "books", brand: "maison-lumiere", price: 38, compareAt: 50, images: [IMG.home[0], IMG.home[1]], color: "#f97316", badges: ["New"], tags: ["new"], rating: 4.7, reviewCount: 234, desc: "An illustrated journey through 120 cuisines with 60 recipes and regional deep-dives. The cookbook-meets-travelogue you'll gift everyone.", specs: { Pages: "288", Recipes: "60", Illustrated: "Yes" }, pros: ["Gorgeous illustrations", "Authentic recipes", "Great gift"], cons: ["Recipes advanced"], isNew: true },
  { name: "Mindful Money — Finance Guide", cat: "books", brand: "maison-lumiere", price: 28, images: [IMG.home[2], IMG.home[4]], color: "#10b981", badges: ["Deal"], tags: ["deal"], rating: 4.6, reviewCount: 445, desc: "A calm, practical guide to building wealth without burnout — budgeting frameworks, investing basics, and the psychology of spending.", specs: { Pages: "256", Format: "Paperback", Workbook: "Included" }, pros: ["Practical frameworks", "Non-intimidating", "Workbook included"], cons: ["US-centric tax advice"] },
  // Toys
  { name: "Starlight Teddy Bear", cat: "toys", brand: "petit-jouet", price: 39, compareAt: 52, images: [IMG.toys[2], IMG.toys[3]], color: "#fca5a5", badges: ["Seasonal", "Best Seller"], tags: ["seasonal"], rating: 4.9, reviewCount: 1543, desc: "A 40cm plush bear in cloud-soft recycled fiber with hand-embroidered details. Certified safe for 0+, machine washable, endlessly huggable.", specs: { Size: "40cm", Fill: "Recycled fiber", Age: "0+", Care: "Machine wash" }, pros: ["Ultra-soft", "Machine washable", "Ethically made"], cons: ["Sheds a little initially"], bestSeller: true, featured: true },
  { name: "Whimsy Plush Collection", cat: "toys", brand: "petit-jouet", price: 62, images: [IMG.toys[1], IMG.toys[0]], color: "#fbbf24", badges: ["New"], tags: ["new"], rating: 4.8, reviewCount: 432, desc: "A set of three whimsical plush characters, each with a different texture to delight curious hands. Collect them all.", specs: { Set: "3 plush", Textures: "3 distinct", Age: "0+" }, pros: ["Sensory variety", "Adorable designs", "Quality stitching"], cons: ["Set only, no singles"], isNew: true },
  { name: "Rainbow Stacker — Wooden", cat: "toys", brand: "petit-jouet", price: 45, compareAt: 58, images: [IMG.toys[0], IMG.toys[1]], color: "#f472b6", badges: ["Trending"], tags: ["trending"], rating: 4.7, reviewCount: 623, desc: "A 12-piece wooden rainbow in non-toxic pastels. Open-ended play that grows with your child — stacking, sorting, tunnels, and more.", specs: { Pieces: "12", Wood: "FSC beech", Paint: "Non-toxic", Age: "18m+" }, pros: ["Open-ended play", "Beautiful pastels", "Non-toxic finish"], cons: ["Small pieces supervision"], trending: true },
  { name: "Circuit Lab Junior", cat: "toys", brand: "nova-tech", price: 54, images: [IMG.toys[3], IMG.toys[2]], color: "#22c55e", badges: ["Best Seller"], tags: [], rating: 4.6, reviewCount: 378, desc: "20 snap-together experiments that teach real electronics — lights, buzzers, and fans. STEM learning disguised as play.", specs: { Experiments: "20", Age: "8+", Power: "AA batteries" }, pros: ["Real STEM learning", "No tools needed", "Great manual"], cons: ["Batteries not included"], bestSeller: true },
  // Automotive
  { name: "AeroDash Dash Cam 4K", cat: "automotive", brand: "nova-tech", price: 129, compareAt: 170, images: [IMG.women[2], IMG.tech[1]], color: "#1e293b", badges: ["Deal"], tags: ["deal"], rating: 4.6, reviewCount: 987, desc: "A 4K front + 1080p rear dash cam with night vision, parking guard, and app control. Your silent witness on every drive.", specs: { Front: "4K", Rear: "1080p", Night: "Sony sensor", Parking: "Guard mode" }, pros: ["Crisp 4K footage", "Easy app setup", "Parking surveillance"], cons: ["SD card not included"], bestSeller: true },
  { name: "GripMaster Phone Mount", cat: "automotive", brand: "nova-tech", price: 24, images: [IMG.tech[3], IMG.women[2]], color: "#0f172a", badges: ["Best Seller"], tags: [], rating: 4.5, reviewCount: 2103, desc: "A magnetic dash mount with a 12lb grip and one-hand release. Rock solid on the roughest roads, cradle-free.", specs: { Grip: "12lb magnets", Mount: "Dash + vent", Rotation: "360°" }, pros: ["Strong magnets", "One-hand dock", "Compact"], cons: ["Needs metal plate for some cases"], bestSeller: true },
  { name: "Velocity Cordless Tire Inflator", cat: "automotive", brand: "nova-tech", price: 69, compareAt: 90, images: [IMG.fitness[0], IMG.tech[4]], color: "#dc2626", badges: ["Trending"], tags: ["trending"], rating: 4.7, reviewCount: 654, desc: "A cordless inflator that hits 150 PSI with a digital gauge, auto-stop, and a USB output. From tires to beach balls in seconds.", specs: { Max: "150 PSI", Battery: "20V Li-ion", Gauge: "Digital + auto-stop", Output: "USB-A" }, pros: ["Fast inflation", "Auto-stop accuracy", "Cordless freedom"], cons: ["Loud", "Battery drains fast"], trending: true, isNew: true },
  // Fitness
  { name: "IronCore Adjustable Dumbbells", cat: "fitness", brand: "apex-fit", price: 349, compareAt: 450, images: [IMG.fitness[0], IMG.fitness[1]], color: "#262626", badges: ["Best Seller"], tags: [], rating: 4.8, reviewCount: 1321, desc: "A pair of dumbbells that replace 15 sets — 5-52.5 lbs each with a twist of the dial. Compact, fast, and gym-quality.", specs: { Range: "5-52.5 lbs each", Increments: "2.5 lbs", Includes: "Pair + tray" }, pros: ["Replaces 15 pairs", "Dial quick-change", "Solid build"], cons: ["Premium price", "Longer than standard"], bestSeller: true, featured: true },
  { name: "FlexForm Yoga Mat Pro", cat: "fitness", brand: "apex-fit", price: 88, compareAt: 115, images: [IMG.fitness[2], IMG.fitness[3]], color: "#a855f7", badges: ["Trending"], tags: ["trending"], rating: 4.7, reviewCount: 876, desc: "A 6mm alignment mat with a grippy non-slip surface, carrying strap, and lifetime guarantee. Your practice, elevated.", specs: { Thickness: "6mm", Material: "Eco TPE", Extras: "Strap + lifetime warranty" }, pros: ["No-slip grip", "Cushioned joints", "Eco materials"], cons: ["Shows marks", "Rolls tightly initially"], trending: true },
  { name: "Pulse HR Fitness Band", cat: "fitness", brand: "apex-fit", price: 49, compareAt: 65, images: [IMG.fitness[3], IMG.fitness[0]], color: "#0ea5e9", badges: ["Deal"], tags: ["deal"], rating: 4.4, reviewCount: 1456, desc: "A lightweight tracker with 24/7 heart rate, 120+ sport modes, and 10-day battery. Motivation on your wrist.", specs: { Battery: "10 days", Modes: "120+ sports", Water: "5ATM", Display: "AMOLED" }, pros: ["10-day battery", "Accurate HR", "Featherlight"], cons: ["Basic smart features"], bestSeller: true },
  { name: "Atlas Adjustable Bench", cat: "fitness", brand: "apex-fit", price: 219, compareAt: 280, images: [IMG.fitness[1], IMG.fitness[2]], color: "#1c1917", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 345, desc: "A foldable bench with 8 incline positions, 1,000lb capacity, and quick-release leg hold-down. The home-gym cornerstone.", specs: { Positions: "8", Capacity: "1000 lbs", Folded: "Flat storage" }, pros: ["Rock solid", "8 positions", "Folds flat"], cons: ["Heavy to move", "Assembly time"], isNew: true },
  // Kitchen
  { name: "Chef's Edge Knife Set", cat: "kitchen", brand: "domus", price: 179, compareAt: 240, images: [IMG.home[0], IMG.home[1]], color: "#374151", badges: ["Best Seller"], tags: [], rating: 4.8, reviewCount: 1187, desc: "Five German-forged knives with 60-day edge retention and a bamboo block. From chef's knife to paring — everything sharp, everything balanced.", specs: { Pieces: "5 + block", Steel: "German X50CrMoV15", HRC: "58" }, pros: ["Holds edge 60 days", "Perfect balance", "Full tang"], cons: ["Hand wash only", "Block takes counter space"], bestSeller: true, featured: true },
  { name: "Sous-Vide Precision Cooker", cat: "kitchen", brand: "domus", price: 139, compareAt: 180, images: [IMG.home[3], IMG.home[5]], color: "#0f172a", badges: ["Deal"], tags: ["deal"], rating: 4.7, reviewCount: 765, desc: "Restaurant-perfect steaks with 0.1°C precision, app control, and 1100W of fast heating. Set it, forget it, impress everyone.", specs: { Power: "1100W", Precision: "0.1°C", App: "Wi-Fi + Bluetooth", Capacity: "5 gallons" }, pros: ["Foolproof results", "App recipes", "Fast heating"], cons: ["Needs container", "Circulator noise"], trending: true },
  { name: "Artisan Cast Iron Skillet", cat: "kitchen", brand: "domus", price: 65, compareAt: 85, images: [IMG.home[1], IMG.home[3]], color: "#171717", badges: ["Premium Picks"], tags: ["premium"], rating: 4.9, reviewCount: 2134, desc: "A pre-seasoned 12-inch skillet that sears, bakes, and roasts like a legend. Passed-down quality, induction-ready, lifetime warranty.", specs: { Size: "12in", Seasoning: "Pre-seasoned", Warranty: "Lifetime" }, pros: ["Legendary searing", "Oven to 500°F", "Lifetime warranty"], cons: ["Heavy (7.5 lbs)", "Needs care"], bestSeller: true },
  { name: "Café Pour-Over Set", cat: "kitchen", brand: "domus", price: 42, images: [IMG.home[4], IMG.home[2]], color: "#f8fafc", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 432, desc: "A ceramic dripper, glass carafe, and reusable filter — the weekend ritual starter kit. Slow coffee, fast mornings.", specs: { Includes: "Dripper + carafe + filter", Material: "Ceramic + glass", Capacity: "600ml" }, pros: ["Beautiful set", "Reusable filter", "Clean taste"], cons: ["Glass carafe fragile"], isNew: true },
  // Garden
  { name: "Terra Self-Watering Planter", cat: "garden", brand: "domus", price: 38, compareAt: 50, images: [IMG.home[2], IMG.home[5]], color: "#65a30d", badges: ["Trending"], tags: ["trending"], rating: 4.6, reviewCount: 543, desc: "A self-watering planter with a 2-week reservoir and a water-level window. Indoor plants, minus the guesswork.", specs: { Reservoir: "2 weeks", Sizes: "6/8/10in", Material: "Recycled PP" }, pros: ["2-week reservoir", "Clear water gauge", "Lightweight"], cons: ["Plastic (not ceramic)"], trending: true },
  { name: "Solstice Garden Light Set", cat: "garden", brand: "domus", price: 56, compareAt: 72, images: [IMG.home[5], IMG.home[4]], color: "#fde047", badges: ["Seasonal"], tags: ["seasonal"], rating: 4.5, reviewCount: 654, desc: "Eight solar-powered lanterns with warm flicker mode and auto dusk-to-dawn sensing. Magic, delivered nightly.", specs: { Count: "8", Power: "Solar", Modes: "Steady + flicker", Rating: "IP65" }, pros: ["Zero electricity", "Auto on/off", "Warm ambiance"], cons: ["Brightness depends on sun"], bestSeller: true },
  { name: "Bloom Garden Tool Set", cat: "garden", brand: "domus", price: 34, images: [IMG.home[1], IMG.home[2]], color: "#15803d", badges: ["Deal"], tags: ["deal"], rating: 4.4, reviewCount: 287, desc: "Nine rust-resistant tools with ergonomic handles and a canvas tote. From potting to pruning, everything in one gift-ready set.", specs: { Pieces: "9 + tote", Material: "Rust-resistant steel", Handles: "Ergonomic" }, pros: ["Complete set", "Comfortable grips", "Gift-ready"], cons: ["Trowel flexes a bit"] },
  // Pet Supplies
  { name: "Royal Canine Orthopedic Bed", cat: "pet-supplies", brand: "paw-kingdom", price: 119, compareAt: 155, images: [IMG.pet[0], IMG.pet[3]], color: "#f472b6", badges: ["Best Seller"], tags: [], rating: 4.8, reviewCount: 1876, desc: "A memory-foam bed with a washable velvet cover and anti-slip base. Joint support for the good boy (or girl) who deserves the throne.", specs: { Fill: "Memory foam", Cover: "Washable velvet", Base: "Anti-slip", Sizes: "S-XL" }, pros: ["Orthopedic support", "Machine-washable cover", "Anti-slip base"], cons: ["Foam can't be washed"], bestSeller: true, featured: true },
  { name: "Whisker Haven Cat Tree", cat: "pet-supplies", brand: "paw-kingdom", price: 159, compareAt: 200, images: [IMG.pet[1], IMG.pet[2]], color: "#d6d3d1", badges: ["Trending"], tags: ["trending"], rating: 4.7, reviewCount: 654, desc: "A six-level cat condo with sisal posts, plush perches, and a hideaway cubby. Your cat's penthouse, delivered flat-packed.", specs: { Levels: "6", Posts: "Sisal-wrapped", Perches: "3 + cubby", Capacity: "Up to 20 lbs" }, pros: ["Sturdy construction", "Cats love it", "Easy assembly"], cons: ["Takes an hour to build"], trending: true },
  { name: "Noble Feast Pet Bowls", cat: "pet-supplies", brand: "paw-kingdom", price: 42, images: [IMG.pet[2], IMG.pet[0]], color: "#94a3b8", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 342, desc: "A raised stainless steel feeding station with a non-slip bamboo base. Better posture, cleaner floors, zero plastic.", specs: { Material: "Stainless + bamboo", Height: "Raised 6in", Includes: "2 bowls" }, pros: ["Elevated comfort", "Non-slip base", "Dishwasher safe"], cons: ["Bamboo needs oiling"], isNew: true },
  { name: "Adventure Harness + Leash", cat: "pet-supplies", brand: "paw-kingdom", price: 36, compareAt: 48, images: [IMG.pet[3], IMG.pet[2]], color: "#ef4444", badges: ["Deal"], tags: ["deal"], rating: 4.5, reviewCount: 876, desc: "A no-pull harness with padded chest plate, reflective stitching, and a hands-free waist leash. Trail days, sorted.", specs: { Fit: "No-pull padded", Reflect: "360° stitching", Leash: "Hands-free 6ft" }, pros: ["No-pull design", "Reflective safety", "Hands-free option"], cons: ["Sizing runs small"], bestSeller: true },
  // Gifts
  { name: "Luxe Gift Box — The Essentials", cat: "gifts", brand: "maison-lumiere", price: 89, compareAt: 120, images: [IMG.gifts[0], IMG.gifts[1]], color: "#dc2626", badges: ["Best Seller", "Seasonal"], tags: ["seasonal"], rating: 4.8, reviewCount: 876, desc: "A curated box of five small luxuries — candle, chocolates, tea, stationery, and a silk scrunchie. The gift that says everything.", specs: { Items: "5 curated", Box: "Rigid gift box", Occasions: "All" }, pros: ["Beautifully curated", "Unboxing experience", "Universal appeal"], cons: ["Contents fixed"], bestSeller: true, featured: true },
  { name: "Midnight Noir Gift Set", cat: "gifts", brand: "maison-lumiere", price: 125, images: [IMG.gifts[1], IMG.gifts[3]], color: "#111827", badges: ["Premium Picks"], tags: ["premium"], rating: 4.7, reviewCount: 342, desc: "An all-black luxury set: cashmere-blend scarf, leather card holder, and a mini fragrance. For the person who already has everything.", specs: { Items: "3", Theme: "Noir luxury", Packaging: "Matte black box" }, pros: ["Premium curation", "Gift-ready packaging", "Useful pieces"], cons: ["Pricey"], premium: true },
  { name: "Emerald Elegance Box", cat: "gifts", brand: "maison-lumiere", price: 74, compareAt: 95, images: [IMG.gifts[2], IMG.gifts[0]], color: "#0d9488", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 234, desc: "A teal-and-gold themed box with a scented candle, botanical skincare, and artisan chocolate. Sophisticated, seasonal, sendable.", specs: { Items: "4", Theme: "Emerald", Occasion: "Seasonal" }, pros: ["Seasonal charm", "Lovely scents", "Beautiful box"], cons: ["Scent preference"], isNew: true },
  { name: "Gourmet Chocolate Atelier", cat: "gifts", brand: "maison-lumiere", price: 58, compareAt: 75, images: [IMG.gifts[3], IMG.gifts[2]], color: "#7f1d1d", badges: ["Deal"], tags: ["deal"], rating: 4.9, reviewCount: 1234, desc: "24 single-origin bonbons from a bean-to-bar atelier. Sea salt caramel, yuzu, and 70% Madagascar — dangerously good.", specs: { Pieces: "24", Origin: "Single-origin", Dietary: "Gluten-free" }, pros: ["Award-winning taste", "Beautiful box", "Gluten-free"], cons: ["Melt in warm weather"], bestSeller: true },
  // Travel
  { name: "AeroLite Carry-On 40L", cat: "travel", brand: "wanderlust", price: 229, compareAt: 299, images: [IMG.travel[1], IMG.travel[0]], color: "#6366f1", badges: ["Best Seller"], tags: [], rating: 4.7, reviewCount: 1432, desc: "A polycarbonate carry-on with 360° spinner wheels, a TSA lock, and an expansion zipper. Cabin-approved everywhere, elegant everywhere else.", specs: { Size: "40L / cabin", Shell: "Polycarbonate", Wheels: "360° spinner", Lock: "TSA" }, pros: ["Featherweight shell", "Silent wheels", "Interior organizers"], cons: ["Scuffs show on light colors"], bestSeller: true, featured: true },
  { name: "Nomad Packable Backpack", cat: "travel", brand: "wanderlust", price: 79, compareAt: 100, images: [IMG.travel[0], IMG.travel[2]], color: "#eab308", badges: ["Deal"], tags: ["deal"], rating: 4.5, reviewCount: 987, desc: "A 20L daypack that stuffs into its own pocket — water-resistant, RFID-safe, and ready for every side trip.", specs: { Capacity: "20L", Packed: "Fist-sized", Material: "Ripstop nylon", Security: "RFID pocket" }, pros: ["Packs to nothing", "RFID pocket", "Water resistant"], cons: ["No frame"], trending: true },
  { name: "SilkSlumber Travel Set", cat: "travel", brand: "wanderlust", price: 68, compareAt: 88, images: [IMG.travel[3], IMG.travel[1]], color: "#f5f5f4", badges: ["New"], tags: ["new"], rating: 4.6, reviewCount: 432, desc: "A 22-momme silk sleep mask, neck pillow, and earplugs in a travel pouch. Arrive rested, anywhere.", specs: { Silk: "22-momme", Includes: "Mask + pillow + plugs", Pouch: "Included" }, pros: ["Real silk", "Compact pouch", "Hotel-proof sleep"], cons: ["Pillow not inflatable"], isNew: true },
  { name: "Voyager Tech Organizer", cat: "travel", brand: "wanderlust", price: 34, compareAt: 45, images: [IMG.travel[2], IMG.travel[0]], color: "#334155", badges: ["Trending"], tags: ["trending"], rating: 4.5, reviewCount: 654, desc: "A padded organizer for cables, chargers, and power banks — with a pass-through for charging on the go. Chaos, contained.", specs: { Capacity: "Cables + 20K bank", Padding: "Impact zones", "Pass-through": "Yes" }, pros: ["Pass-through charging", "Great pockets", "Slim profile"], cons: ["Small for big bricks"], trending: true },
];

const reviewPool: Array<[string, number, string, string]> = [
  ["Sample reviewer 8", 5, "Exceeded every expectation", "The quality is honestly better than items I've bought at 3x the price. Shipping was fast and the packaging felt like a gift."],
  ["Sample reviewer 4", 5, "Worth every penny", "Did a ton of research before buying and this was the right call. Works exactly as described and looks premium."],
  ["Sample reviewer 1", 4, "Really great, one small note", "Love everything about it. Only wish the color options were a bit wider, but I'd buy again."],
  ["Sample reviewer 6", 5, "Instant favorite", "This has become part of my daily routine. The attention to detail is remarkable."],
  ["Sample reviewer 2", 4, "Great value", "Solid quality for the price. The comparison tool on MeowMeow helped me pick this over two alternatives."],
  ["Sample reviewer 5", 5, "Better than advertised", "Photos don't do it justice. Genuinely impressed with the craftsmanship."],
  ["Sample reviewer 7", 3, "Good but not perfect", "It's good overall, but there were a couple of details I expected to be better. Customer service was lovely though."],
  ["Sample reviewer 3", 5, "Five stars, no notes", "Arrived quickly, packaged beautifully, and performs flawlessly. Highly recommend."],
];

const blogData: Array<[string, string, string, string, string[], number, string]> = [
  [
    "the-2026-gift-guide-everyone-will-actually-love",
    "The 2026 Gift Guide Everyone Will Actually Love",
    "From $30 finds to once-in-a-lifetime splurges — 40 curated gifts organized by budget, personality, and occasion.",
    "Gift-giving is an art, and the best gifts sit at the intersection of thoughtful and useful. We spent 200 hours researching this year's most-wanted products across 20 categories...\n\n## The Under-$50 Zone\n\nThe sweet spot for coworkers, hosts, and 'just because' moments. Our top picks combine clever design with everyday utility — think the GripMaster Phone Mount for the commuter in your life or the Solstice Garden Light Set for anyone with a balcony.\n\n## The $50–$150 Sweet Spot\n\nThis is where quality becomes tangible. Items like the Aurora ANC Headphones or the Chef's Edge Knife Set feel twice their price. If you're gifting a couple, the Luxe Gift Box — The Essentials hits the mark every single time.\n\n## The Splurge Tier\n\nFor the people who deserve the world: the Chrono Noir Automatic, the Étoile Diamond Tennis Bracelet, or the Sac Lumière Leather Tote. These are heirloom-quality pieces chosen to last decades, not seasons.\n\n## The Golden Rule\n\nWhen in doubt, choose something the recipient would never buy for themselves but will use every single day. That's the whole secret.",
    ["Gifts", "Buying Guides", "Seasonal"],
    6,
    "MeowMeow Editorial Team",
  ],
  [
    "how-we-pick-every-product-on-meowmeow",
    "How We Pick Every Product on MeowMeow",
    "How a product ends up on MeowMeow: what we check, what a discount figure actually means, and why placement is never for sale.",
    "How a product ends up on MeowMeow, described plainly.\n\n## We curate, we do not test\n\nWe are a curation platform, not a testing lab. We have not used these products in our own hands, and we would rather say so than imply otherwise. What we do is read the specification, the merchant rating and the discount against list price, and shortlist what looks worth your attention.\n\n## What the discount figure means\n\nWhere we show a saving, it is measured against the list price recorded for that item. It is not a claim that the price is the lowest available anywhere, and it is not based on a price history we have tracked ourselves.\n\n## Placement is never for sale\n\nWe earn a commission when you buy through our links. No retailer can pay to be listed, ranked higher, or described more favourably. Commission rates do differ between retailers, and that is a limitation worth naming rather than hiding.\n\n## Check the retailer before you buy\n\nPrices and availability change constantly. The retailer's own page is always the source of truth.",
    ["About", "Methodology", "Editorial"],
    4,
    "MeowMeow Editorial Team",
  ],
  [
    "capsule-wardrobe-2026",
    "Build a Capsule Wardrobe That Actually Works (2026 Edition)",
    "12 pieces, 40 outfits, zero decision fatigue. The modern capsule wardrobe, explained by our fashion editors.",
    "The promise of a capsule wardrobe is simple: fewer choices, better style...\n\n## The 12-Piece Formula\n\nOur editors' formula: 2 tailored blazers, 2 knitwear pieces, 3 bottoms, 3 tops, 1 statement outerwear piece, and 1 pair of investment shoes. That's it.\n\n## Invest Where It Shows\n\nSkimp on trends, invest in structure. The Cobalt Tailored Blazer and Noir Sculpt Blazer anchor outfits for a decade. The Aurora Silk Wrap Dress proves one dress can carry an entire season.\n\n## The Shoes Rule\n\nOne white low-top, one lug-sole high-top, one polished mule — you can walk through 90% of life with these three.",
    ["Fashion", "Style Guides"],
    5,
    "MeowMeow Editorial Team",
  ],
  [
    "clean-beauty-ingredients-decoded",
    "Clean Beauty Ingredients, Decoded by a Dermatologist",
    "Vitamin C, retinol, ceramides, squalane — what actually works, what's marketing, and how to layer it all.",
    "Walk into any beauty aisle and you're hit with 40 buzzwords. Here's what the science actually says...\n\n## Vitamin C\n\nAt 10–20%, stabilized with ferulic acid and vitamin E, it's the gold standard for brightness. Look for opaque, airless packaging — light kills it.\n\n## Ceramides\n\nThink of them as the mortar between skin cells. Five-ceramide complexes (like in our Hydra Veil pick) measurably improve barrier function in 2 weeks.\n\n## The Layering Rule\n\nThinnest to thickest, always. Serum before moisturizer, SPF last. And never mix retinol with direct acids on the same night.",
    ["Beauty", "Wellness"],
    7,
    "Dr. Nina Patel",
  ],
  [
    "tech-gifts-under-300",
    "The Best Tech Gifts Under $300 (Tested for 30 Days)",
    "We lived with 14 gadgets for a month. These 8 earned permanent spots in our daily routines.",
    "Tech gifting is risky — too complicated, too niche, too expensive. After 30 days of daily use, these are the gadgets that survived the honeymoon phase...\n\n## The Everyday Winners\n\nThe Pulse Smartwatch Pro's 14-day battery means it's never dead when you need it. The Aurora ANC Headphones turned our editor's commute into a spa session.\n\n## The Surprise Hits\n\nNobody expected the Echo Boom Speaker to sound this big, or the Quantum Mechanical Keyboard to convert two self-proclaimed non-mechanical people.\n\n## What We Sent Back\n\nThree gadgets didn't make the cut — one for battery lies, one for app instability, and one that was just… fine. Mediocrity doesn't get a recommendation.",
    ["Tech", "Gifts", "Reviews"],
    6,
    "MeowMeow Editorial Team",
  ],
  [
    "travel-light-masterclass",
    "The Travel Light Masterclass: 7kg, 10 Days, Zero Regrets",
    "Our travel editors break down exactly how to pack for 10 days in one carry-on — including what to leave at home.",
    "The average traveler packs 3x more than they need and wears 40% of it. Here's the system that fixes both...\n\n## The Rule of Threes\n\nThree tops per three days, one pair of 'nice' shoes, one versatile layer. The AeroLite Carry-On 40L gives you honest space without airline headaches.\n\n## Packing Cubes Are Not Optional\n\nThey're not about saving space — they're about finding things. A 5-minute hotel-room unpack becomes 30 seconds.\n\n## What We Never Pack\n\nHair tools (hotels have them), 'just in case' shoes (you won't wear them), and full-size toiletries (the SilkSlumber Travel Set is all you need).",
    ["Travel", "Guides"],
    5,
    "MeowMeow Editorial Team",
  ],
];

const couponData: Array<[string, string, string, string, number, number]> = [
  ["MEOW10", "10% off your first order", "Welcome discount for new MeowMeow members", "percent", 10, 0],
  ["LUXE20", "20% off premium picks", "Applied automatically to Premium Picks collection", "percent", 20, 200],
  ["TECH15", "15% off electronics", "Valid on all Electronics, Gaming & Computers", "percent", 15, 100],
  ["FLASH25", "25% off flash sale", "Weekend flash sale — limited time", "percent", 25, 50],
  ["BEAUTY5", "$5 off beauty", "Flat discount on beauty & skincare", "flat", 5, 30],
  ["TRAVEL12", "12% off travel gear", "Gear up for your next adventure", "percent", 12, 80],
];

const notificationData: Array<[string, string, string]> = [
  ["Today's deals updated", "Fresh markdowns across the catalogue.", "tag"],
  ["💎 New Premium Picks", "The Étoile Diamond Tennis Bracelet just landed.", "💎"],
  ["🎁 Gift guide 2026", "40 curated gifts, from $30 to splurge-tier.", "🎁"],
  ["New in the catalogue", "Recently added products are ready to browse.", "sparkles"],
  ["✨ Welcome to MeowMeow", "Your wishlist and cart are synced across devices.", "✨"],
];

async function main() {
  // The demo fixtures include an administrator with a published password. The
  // README tells operators to run this after migrating, so without a guard a
  // production deploy would end up with a publicly known admin account.
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PRODUCTION_SEED) {
    throw new Error(
      "Refusing to seed demo data in production: the fixtures contain a known admin password. " +
        "Set ALLOW_PRODUCTION_SEED=1 only if you understand this and will rotate the credentials immediately."
    );
  }

  console.log("🌱 Seeding MeowMeow database...");

  // Make the seed idempotent: re-running it previously failed on unique
  // constraints, so `npm run db:seed` only ever worked once. TRUNCATE with
  // RESTART IDENTITY also rewinds the serial sequences — plain DELETEs left
  // them advanced, which broke the fixed brand/category ids used below.
  await db.execute(
    sql`TRUNCATE TABLE
      cart_items, wishlist_items, clicks, price_history, reviews, notifications,
      blog_posts, coupons, newsletter_subscribers, messages,
      products, categories, brands, users
    RESTART IDENTITY CASCADE`
  );

  // Users
  //
  // The demo accounts exist so a fresh checkout is usable immediately. That is
  // only safe while the database is a development one: a well-known admin
  // password on a public deployment is a full compromise, so this refuses to
  // run in production unless a real password is supplied.
  // The top-level guard already blocks production seeding unless explicitly
  // overridden. This closes the remaining gap: if someone does override it,
  // they must still supply a real admin password rather than shipping the
  // documented default.
  // There is no documented default any more. Either you supply the password, or
  // one is generated at random and printed once for this machine only — so a
  // leaked or forgotten seed can never leave a guessable admin account behind.
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(15).toString("base64url");
  const generatedAdminPassword = !process.env.SEED_ADMIN_PASSWORD;

  if (generatedAdminPassword && process.env.ALLOW_PRODUCTION_SEED) {
    throw new Error(
      "ALLOW_PRODUCTION_SEED is set, so SEED_ADMIN_PASSWORD must be supplied explicitly — " +
        "refusing to seed a production database with a generated password nobody recorded."
    );
  }

  await db.insert(users).values([
    {
      name: "Admin",
      email: "admin@example.test",
      passwordHash: hashPassword(seedAdminPassword),
      role: "admin",
      avatar: null,
    },
    { name: "Demo Shopper", email: "shopper@example.test", passwordHash: hashPassword(randomBytes(15).toString("base64url")), role: "user", avatar: null },
    { name: "Demo Shopper Two", email: "shopper2@example.test", passwordHash: hashPassword(randomBytes(15).toString("base64url")), role: "user", avatar: null },
  ]);

  // Categories
  await db.insert(categories).values(
    catData.map(([slug, name, emoji, image, isCollection], i) => ({
      slug,
      name,
      emoji,
      image,
      isCollection,
      description: `${name} — curated premium picks, tested and approved by the MeowMeow editors.`,
      sortOrder: i,
    }))
  );

  // Brands
  await db.insert(brands).values(brandData.map(([slug, name, tagline]) => ({ slug, name, tagline })));

  // Affiliate networks & merchants (architecture for multi-offer catalog)
  await db.insert(affiliateNetworks).values([
    { slug: "amazon-associates", name: "Amazon Associates", website: "https://affiliate-program.amazon.com", trackingParam: "tag", active: true },
    { slug: "impact", name: "Impact", website: "https://impact.com", trackingParam: null, active: true },
    { slug: "manual", name: "Manual / Direct", website: null, trackingParam: null, active: true },
  ]);
  await db.insert(merchants).values([
    { slug: "amazon", name: "Amazon", website: "https://www.amazon.com", networkId: 1, country: "US", currency: "USD", active: true },
    { slug: "demo-merchant", name: "Demo Merchant", website: null, networkId: 3, country: "PK", currency: "PKR", active: true },
  ]);

  // Products
  const catMap = new Map(catData.map(([slug], i) => [slug, i + 1]));
  const brandMap = new Map(brandData.map(([slug], i) => [slug, i + 1]));

  const productRows = P.map((p, i) => ({
    slug: `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${i + 1}`,
    name: p.name,
    brandId: brandMap.get(p.brand),
    categoryId: catMap.get(p.cat),
    description: p.desc,
    source: "demo",
    sourceId: `demo:${i + 1}`,
    price: p.price,
    compareAtPrice: p.compareAt ?? null,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images,
    color: p.color,
    badges: p.badges,
    // Demo catalogue: no affiliate URL. Previously this generated sequential
    // Amazon ASINs (dp/1000000, dp/1000137, …) which pointed at products that
    // do not exist and implied an affiliate relationship we do not have. An
    // empty value makes the product demonstrably un-linkable, and the UI
    // disables the outbound CTA rather than sending anyone to a dead page.
    // Insert real, tagged merchant URLs here when the catalogue becomes real.
    affiliateUrl: "",
    store: p.store ?? "Demo merchant",
    tags: p.premium && !p.tags.includes("premium") ? [...p.tags, "premium"] : p.tags,
    featured: p.featured ?? false,
    trending: p.trending ?? false,
    bestSeller: p.bestSeller ?? false,
    isNew: p.isNew ?? false,
    inStock: true,
    specs: p.specs,
    pros: p.pros,
    cons: p.cons,
  }));

  for (const row of productRows) {
    await db.insert(products).values({
      ...row,
      published: true,
      lastPriceCheckedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Product offers — one primary offer per product (demo merchant).
  // When real merchant feeds are connected, additional offers are inserted here.
  const insertedProducts = await db.select({ id: products.id, price: products.price, compareAtPrice: products.compareAtPrice, affiliateUrl: products.affiliateUrl }).from(products);
  const offerRows = insertedProducts.map((p) => ({
    productId: p.id,
    merchantId: 2, // demo-merchant
    affiliateUrl: p.affiliateUrl || `/products/${p.id}`,
    currency: "PKR",
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    availability: "in_stock" as const,
    source: "seed",
    isPrimary: true,
    lastCheckedAt: new Date(),
    lastSyncedAt: new Date(),
  }));
  for (let i = 0; i < offerRows.length; i += 50) {
    await db.insert(productOffers).values(offerRows.slice(i, i + 50) as never);
  }

  // Reviews — spread across first 30 products
  const productIds = (await db.select({ id: products.id }).from(products)).map((r) => r.id);
  const reviewRows: Array<Record<string, unknown>> = [];
  for (let i = 0; i < Math.min(productIds.length, 32); i++) {
    const count = 2 + (i % 3);
    for (let j = 0; j < count; j++) {
      const [author, rating, title, body] = reviewPool[(i + j * 3) % reviewPool.length];
      reviewRows.push({
        productId: productIds[i],
        // Unmistakably demo: neutral label, never a person's name.
        author: `${author} — demo data`,
        rating,
        title,
        body,
        // Never claim a fabricated review came from a verified buyer.
        verified: false,
        helpful: (i * 7 + j * 13) % 40,
        createdAt: new Date(Date.now() - (i * 86400000 + j * 3600000)),
      });
    }
  }
  await db.insert(reviews).values(reviewRows as never);

  // Blog posts
  await db.insert(blogPosts).values(
    blogData.map(([slug, title, excerpt, content, tags, readTime, author]) => ({
      slug,
      title,
      excerpt,
      content,
      cover: IMG.home[4],
      tags,
      readTime,
      author,
      publishedAt: new Date(Date.now() - Math.random() * 60 * 86400000),
    }))
  );

  // Coupons
  await db.insert(coupons).values(
    couponData.map(([code, title, description, discountType, value, minSpend]) => ({
      code,
      title,
      description,
      discountType,
      value,
      minSpend,
      validUntil: new Date(Date.now() + 90 * 86400000),
      active: true,
    }))
  );

  // Price history — 12 weeks of points per product
  const historyRows: Array<Record<string, unknown>> = [];
  for (const p of productIds) {
    const start = 100 + (p * 53) % 400;
    for (let w = 0; w < 12; w++) {
      const wave = Math.sin(w / 2.5) * 8;
      const dip = w === 9 || w === 10 ? -15 : 0;
      historyRows.push({
        productId: p,
        price: Math.max(10, Math.round(start + wave + dip + ((p * 7) % 30))),
        date: new Date(Date.now() - (11 - w) * 7 * 86400000),
      });
    }
  }
  for (let i = 0; i < historyRows.length; i += 500) {
    await db.insert(priceHistory).values(historyRows.slice(i, i + 500) as never);
  }

  // Clicks — simulate analytics across products
  const clickRows: Array<Record<string, unknown>> = [];
  for (let i = 0; i < 400; i++) {
    clickRows.push({
      productId: productIds[i % productIds.length],
      sessionId: `seed-${(i * 31) % 137}`,
      createdAt: new Date(Date.now() - (i * 97 * 3600000) % (30 * 86400000)),
    });
  }
  for (let i = 0; i < clickRows.length; i += 500) {
    await db.insert(clicks).values(clickRows.slice(i, i + 500) as never);
  }

  // Notifications + newsletter
  await db.insert(notifications).values(notificationData.map(([title, body, icon]) => ({ title, body, icon })));
  await db.insert(newsletterSubscribers).values([
    { email: "happy@shopper.com" },
    { email: "deals@hunter.io" },
    { email: "style@lover.co" },
  ]);

  if (generatedAdminPassword) {
    console.log("\n──────────────────────────────────────────────────────────────");
    console.log("  Admin account:  admin@example.test");
    console.log(`  Password:       ${seedAdminPassword}`);
    console.log("  Generated for this seed only and not stored anywhere else.");
    console.log("  Set SEED_ADMIN_PASSWORD to choose your own.");
    console.log("──────────────────────────────────────────────────────────────\n");
  }

  console.log(`✅ Seeded ${productRows.length} products, ${catData.length} categories, ${reviewRows.length} reviews, 6 blog posts, 6 coupons.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
