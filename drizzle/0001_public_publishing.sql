ALTER TABLE "projects" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_unique" UNIQUE("slug");