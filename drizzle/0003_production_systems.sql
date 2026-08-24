CREATE TABLE IF NOT EXISTS "jobs" (
  "id" serial PRIMARY KEY NOT NULL,
  "job_id" text NOT NULL UNIQUE,
  "type" varchar(40) NOT NULL,
  "status" varchar(20) DEFAULT 'queued' NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "result" jsonb,
  "error_message" text,
  "retry_count" integer DEFAULT 0 NOT NULL,
  "max_retries" integer DEFAULT 3 NOT NULL,
  "lock_token" text,
  "locked_at" timestamp,
  "timeout_ms" integer DEFAULT 300000 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "started_at" timestamp,
  "finished_at" timestamp,
  "scheduled_for" timestamp
);
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs" ("status");
CREATE INDEX IF NOT EXISTS "jobs_type_idx" ON "jobs" ("type");
CREATE INDEX IF NOT EXISTS "jobs_scheduled_idx" ON "jobs" ("scheduled_for");

CREATE TABLE IF NOT EXISTS "support_tickets" (
  "id" serial PRIMARY KEY NOT NULL,
  "ticket_number" text NOT NULL UNIQUE,
  "user_id" integer REFERENCES "users"("id") ON DELETE set null,
  "session_id" text,
  "email" text NOT NULL,
  "name" text,
  "subject" text NOT NULL,
  "status" varchar(20) DEFAULT 'open' NOT NULL,
  "priority" varchar(20) DEFAULT 'normal' NOT NULL,
  "source" varchar(20) DEFAULT 'web' NOT NULL,
  "assigned_to" integer REFERENCES "users"("id") ON DELETE set null,
  "ai_conversation_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "resolved_at" timestamp
);
CREATE INDEX IF NOT EXISTS "tickets_status_idx" ON "support_tickets" ("status");
CREATE INDEX IF NOT EXISTS "tickets_user_idx" ON "support_tickets" ("user_id");
CREATE INDEX IF NOT EXISTS "tickets_email_idx" ON "support_tickets" ("email");

CREATE TABLE IF NOT EXISTS "support_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "ticket_id" integer NOT NULL REFERENCES "support_tickets"("id") ON DELETE cascade,
  "author_type" varchar(20) NOT NULL,
  "author_id" integer,
  "author_name" text,
  "body" text NOT NULL,
  "is_internal" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "support_messages_ticket_idx" ON "support_messages" ("ticket_id");

CREATE TABLE IF NOT EXISTS "email_queue" (
  "id" serial PRIMARY KEY NOT NULL,
  "to_address" text NOT NULL,
  "template" varchar(40) NOT NULL,
  "subject" text NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" varchar(20) DEFAULT 'queued' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "last_error" text,
  "provider_message_id" text,
  "scheduled_for" timestamp DEFAULT now() NOT NULL,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "email_queue_status_idx" ON "email_queue" ("status");
CREATE INDEX IF NOT EXISTS "email_queue_scheduled_idx" ON "email_queue" ("scheduled_for");

CREATE TABLE IF NOT EXISTS "email_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "queue_id" integer REFERENCES "email_queue"("id") ON DELETE set null,
  "to_address" text NOT NULL,
  "template" varchar(40) NOT NULL,
  "status" varchar(20) NOT NULL,
  "provider_response" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "email_logs_to_idx" ON "email_logs" ("to_address");

CREATE TABLE IF NOT EXISTS "social_accounts" (
  "id" serial PRIMARY KEY NOT NULL,
  "platform" varchar(20) NOT NULL,
  "account_name" text NOT NULL,
  "account_id" text,
  "access_token_enc" text,
  "refresh_token_enc" text,
  "status" varchar(20) DEFAULT 'not_configured' NOT NULL,
  "last_tested_at" timestamp,
  "last_error" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "social_posts" (
  "id" serial PRIMARY KEY NOT NULL,
  "account_id" integer REFERENCES "social_accounts"("id") ON DELETE set null,
  "platform" varchar(20) NOT NULL,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "content" text NOT NULL,
  "media_urls" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "utm_campaign" text,
  "scheduled_for" timestamp,
  "published_at" timestamp,
  "external_post_id" text,
  "last_error" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "social_posts_status_idx" ON "social_posts" ("status");
CREATE INDEX IF NOT EXISTS "social_posts_scheduled_idx" ON "social_posts" ("scheduled_for");

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "actor_id" integer REFERENCES "users"("id") ON DELETE set null,
  "actor_email" text,
  "action" varchar(60) NOT NULL,
  "entity_type" varchar(40),
  "entity_id" text,
  "details" jsonb,
  "ip" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "audit_logs_actor_idx" ON "audit_logs" ("actor_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs" ("action");

CREATE TABLE IF NOT EXISTS "provider_configs" (
  "id" serial PRIMARY KEY NOT NULL,
  "provider_id" varchar(40) NOT NULL UNIQUE,
  "display_name" text NOT NULL,
  "status" varchar(20) DEFAULT 'not_configured' NOT NULL,
  "config" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "last_tested_at" timestamp,
  "last_sync_at" timestamp,
  "last_error" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "offers_merchant_ext_uidx" ON "product_offers" ("merchant_id", "external_product_id");
