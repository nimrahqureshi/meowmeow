import {
  pgTable,
  serial,
  text,
  integer,
  real,
  boolean,
  timestamp,
  jsonb,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description"),
  image: text("image"),
  isCollection: boolean("is_collection").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  description: text("description"),
  logo: text("logo"),
  website: text("website"),
});

/** Affiliate networks / merchant platforms (Amazon Associates, Impact, etc.) */
export const affiliateNetworks = pgTable("affiliate_networks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  website: text("website"),
  trackingParam: text("tracking_param"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Merchants that sell products (Amazon, Daraz, Best Buy, etc.) */
export const merchants = pgTable(
  "merchants",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    logo: text("logo"),
    website: text("website"),
    networkId: integer("network_id").references(() => affiliateNetworks.id),
    country: varchar("country", { length: 2 }).default("PK"),
    currency: varchar("currency", { length: 3 }).notNull().default("PKR"),
    active: boolean("active").notNull().default(true),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("merchants_network_idx").on(t.networkId)]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    brandId: integer("brand_id").references(() => brands.id),
    categoryId: integer("category_id").references(() => categories.id),
    description: text("description").notNull(),
    /** Stable product identifiers used for conservative cross-merchant deduplication. */
    sku: text("sku"),
    mpn: text("mpn"),
    gtin: text("gtin"),
    source: varchar("source", { length: 40 }).notNull().default("manual"),
    sourceId: text("source_id"),
    /** Canonical / primary price (lowest known or primary offer). Prefer product_offers for multi-merchant. */
    price: real("price").notNull(),
    compareAtPrice: real("compare_at_price"),
    rating: real("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    images: jsonb("images").$type<string[]>().notNull(),
    color: varchar("color", { length: 9 }).notNull().default("#e5e7eb"),
    badges: jsonb("badges").$type<string[]>().notNull().default([]),
    /** @deprecated Prefer product_offers. Kept for backward compatibility. */
    affiliateUrl: text("affiliate_url").notNull(),
    /** @deprecated Prefer product_offers.merchant */
    store: text("store").notNull().default("Amazon"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    trending: boolean("trending").notNull().default(false),
    bestSeller: boolean("best_seller").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    inStock: boolean("in_stock").notNull().default(true),
    specs: jsonb("specs").$type<Record<string, string>>().notNull().default({}),
    pros: jsonb("pros").$type<string[]>().notNull().default([]),
    cons: jsonb("cons").$type<string[]>().notNull().default([]),
    /** SEO */
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    published: boolean("published").notNull().default(true),
    lastPriceCheckedAt: timestamp("last_price_checked_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_brand_idx").on(t.brandId),
    index("products_rating_idx").on(t.rating),
    index("products_published_idx").on(t.published),
    index("products_gtin_idx").on(t.gtin),
    index("products_mpn_idx").on(t.mpn),
    uniqueIndex("products_source_uidx").on(t.source, t.sourceId),
  ]
);

/**
 * Merchant-specific offers for a product.
 * One product can have many offers (Amazon, Daraz, etc.).
 */
export const productOffers = pgTable(
  "product_offers",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    merchantId: integer("merchant_id")
      .notNull()
      .references(() => merchants.id, { onDelete: "cascade" }),
    externalProductId: text("external_product_id"),
    merchantUrl: text("merchant_url"),
    affiliateUrl: text("affiliate_url").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("PKR"),
    price: real("price").notNull(),
    compareAtPrice: real("compare_at_price"),
    availability: varchar("availability", { length: 20 }).notNull().default("unknown"), // in_stock | out_of_stock | unknown | preorder
    shippingInfo: text("shipping_info"),
    condition: varchar("condition", { length: 20 }).notNull().default("new"),
    source: varchar("source", { length: 40 }).notNull().default("manual"), // manual | feed | api | scrape
    isPrimary: boolean("is_primary").notNull().default(false),
    lastCheckedAt: timestamp("last_checked_at"),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("offers_product_idx").on(t.productId),
    index("offers_merchant_idx").on(t.merchantId),
    index("offers_price_idx").on(t.price),
    uniqueIndex("offers_merchant_ext_uidx").on(t.merchantId, t.externalProductId),
  ]
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id").references(() => users.id),
    author: text("author").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    verified: boolean("verified").notNull().default(false),
    helpful: integer("helpful").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productId)]
);

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  cover: text("cover"),
  author: text("author").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  readTime: integer("read_time").notNull().default(5),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  discountType: varchar("discount_type", { length: 10 }).notNull().default("percent"),
  value: real("value").notNull(),
  minSpend: real("min_spend").notNull().default(0),
  validUntil: timestamp("valid_until"),
  active: boolean("active").notNull().default(true),
});

export const clicks = pgTable(
  "clicks",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    offerId: integer("offer_id").references(() => productOffers.id, { onDelete: "set null" }),
    merchantId: integer("merchant_id").references(() => merchants.id, { onDelete: "set null" }),
    sessionId: text("session_id").notNull().default("anonymous"),
    sourcePage: text("source_page"),
    placement: varchar("placement", { length: 40 }), // buy_box | card | compare | chat | search
    device: varchar("device", { length: 20 }),
    campaign: text("campaign"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("clicks_product_idx").on(t.productId),
    index("clicks_offer_idx").on(t.offerId),
    index("clicks_merchant_idx").on(t.merchantId),
  ]
);

export const priceHistory = pgTable(
  "price_history",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    offerId: integer("offer_id").references(() => productOffers.id, { onDelete: "set null" }),
    merchantId: integer("merchant_id").references(() => merchants.id, { onDelete: "set null" }),
    price: real("price").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("PKR"),
    date: timestamp("date").notNull().defaultNow(),
  },
  (t) => [
    index("price_history_product_idx").on(t.productId),
    index("price_history_offer_idx").on(t.offerId),
  ]
);

/** User price alerts — notify when price drops to target. */
export const priceAlerts = pgTable(
  "price_alerts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    sessionId: text("session_id"),
    email: text("email"),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    alertType: varchar("alert_type", { length: 20 }).notNull().default("target_price"),
    targetPrice: real("target_price"),
    targetPercentDrop: real("target_percent_drop"),
    currency: varchar("currency", { length: 3 }).notNull().default("PKR"),
    active: boolean("active").notNull().default(true),
    lastKnownPrice: real("last_known_price"),
    lastKnownAvailability: varchar("last_known_availability", { length: 20 }),
    notifiedAt: timestamp("notified_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("price_alerts_product_idx").on(t.productId),
    index("price_alerts_user_idx").on(t.userId),
    index("price_alerts_active_idx").on(t.active),
  ]
);

/** Sync job logs for merchant feed / API imports. */
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: serial("id").primaryKey(),
    merchantId: integer("merchant_id").references(() => merchants.id, { onDelete: "set null" }),
    source: varchar("source", { length: 40 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(), // running | success | partial | failed
    productsProcessed: integer("products_processed").notNull().default(0),
    productsUpdated: integer("products_updated").notNull().default(0),
    productsFailed: integer("products_failed").notNull().default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
  },
  (t) => [index("sync_logs_merchant_idx").on(t.merchantId)]
);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  icon: text("icon").notNull().default("✨"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    qty: integer("qty").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("cart_session_idx").on(t.sessionId)]
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("wishlist_session_idx").on(t.sessionId)]
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Brand = typeof brands.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type User = typeof users.$inferSelect;
export type Merchant = typeof merchants.$inferSelect;
export type ProductOffer = typeof productOffers.$inferSelect;
export type AffiliateNetwork = typeof affiliateNetworks.$inferSelect;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type SyncLog = typeof syncLogs.$inferSelect;

/** Background jobs — serverless-compatible queue with locks & retries */
export const jobs = pgTable(
  "jobs",
  {
    id: serial("id").primaryKey(),
    jobId: text("job_id").notNull().unique(),
    type: varchar("type", { length: 40 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("queued"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    result: jsonb("result").$type<Record<string, unknown>>(),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").notNull().default(0),
    maxRetries: integer("max_retries").notNull().default(3),
    lockToken: text("lock_token"),
    lockedAt: timestamp("locked_at"),
    timeoutMs: integer("timeout_ms").notNull().default(300000),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at"),
    scheduledFor: timestamp("scheduled_for"),
  },
  (t) => [
    index("jobs_status_idx").on(t.status),
    index("jobs_type_idx").on(t.type),
    index("jobs_scheduled_idx").on(t.scheduledFor),
  ]
);

/** Support tickets */
export const supportTickets = pgTable(
  "support_tickets",
  {
    id: serial("id").primaryKey(),
    ticketNumber: text("ticket_number").notNull().unique(),
    userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
    sessionId: text("session_id"),
    email: text("email").notNull(),
    name: text("name"),
    subject: text("subject").notNull(),
    status: varchar("status", { length: 20 }).notNull().default("open"),
    priority: varchar("priority", { length: 20 }).notNull().default("normal"),
    source: varchar("source", { length: 20 }).notNull().default("web"),
    assignedTo: integer("assigned_to").references(() => users.id, { onDelete: "set null" }),
    aiConversationId: text("ai_conversation_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at"),
  },
  (t) => [
    index("tickets_status_idx").on(t.status),
    index("tickets_user_idx").on(t.userId),
    index("tickets_email_idx").on(t.email),
  ]
);

export const supportMessages = pgTable(
  "support_messages",
  {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => supportTickets.id, { onDelete: "cascade" }),
    authorType: varchar("author_type", { length: 20 }).notNull(),
    authorId: integer("author_id"),
    authorName: text("author_name"),
    body: text("body").notNull(),
    isInternal: boolean("is_internal").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("support_messages_ticket_idx").on(t.ticketId)]
);

/** Email delivery queue & logs */
export const emailQueue = pgTable(
  "email_queue",
  {
    id: serial("id").primaryKey(),
    toAddress: text("to_address").notNull(),
    template: varchar("template", { length: 40 }).notNull(),
    subject: text("subject").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    status: varchar("status", { length: 20 }).notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    providerMessageId: text("provider_message_id"),
    scheduledFor: timestamp("scheduled_for").notNull().defaultNow(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("email_queue_status_idx").on(t.status),
    index("email_queue_scheduled_idx").on(t.scheduledFor),
  ]
);

export const emailLogs = pgTable(
  "email_logs",
  {
    id: serial("id").primaryKey(),
    queueId: integer("queue_id").references(() => emailQueue.id, { onDelete: "set null" }),
    toAddress: text("to_address").notNull(),
    template: varchar("template", { length: 40 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    providerResponse: text("provider_response"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("email_logs_to_idx").on(t.toAddress)]
);

/** Social accounts & posts (authorized APIs only) */
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 20 }).notNull(),
  accountName: text("account_name").notNull(),
  accountId: text("account_id"),
  accessTokenEnc: text("access_token_enc"),
  refreshTokenEnc: text("refresh_token_enc"),
  status: varchar("status", { length: 20 }).notNull().default("not_configured"),
  lastTestedAt: timestamp("last_tested_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const socialPosts = pgTable(
  "social_posts",
  {
    id: serial("id").primaryKey(),
    accountId: integer("account_id").references(() => socialAccounts.id, { onDelete: "set null" }),
    platform: varchar("platform", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("draft"),
    content: text("content").notNull(),
    mediaUrls: jsonb("media_urls").$type<string[]>().notNull().default([]),
    utmCampaign: text("utm_campaign"),
    scheduledFor: timestamp("scheduled_for"),
    publishedAt: timestamp("published_at"),
    externalPostId: text("external_post_id"),
    lastError: text("last_error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("social_posts_status_idx").on(t.status),
    index("social_posts_scheduled_idx").on(t.scheduledFor),
  ]
);

/** Audit log for admin actions */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    actorId: integer("actor_id").references(() => users.id, { onDelete: "set null" }),
    actorEmail: text("actor_email"),
    action: varchar("action", { length: 60 }).notNull(),
    entityType: varchar("entity_type", { length: 40 }),
    entityId: text("entity_id"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    ip: text("ip"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("audit_logs_actor_idx").on(t.actorId),
    index("audit_logs_action_idx").on(t.action),
  ]
);

/** Provider configuration (credentials stay server-side) */
export const providerConfigs = pgTable("provider_configs", {
  id: serial("id").primaryKey(),
  providerId: varchar("provider_id", { length: 40 }).notNull().unique(),
  displayName: text("display_name").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("not_configured"),
  config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
  lastTestedAt: timestamp("last_tested_at"),
  lastSyncAt: timestamp("last_sync_at"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Job = typeof jobs.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type EmailQueueItem = typeof emailQueue.$inferSelect;
export type SocialAccount = typeof socialAccounts.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type ProviderConfig = typeof providerConfigs.$inferSelect;
