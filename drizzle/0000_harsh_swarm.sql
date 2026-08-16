CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"handle" text NOT NULL,
	"name" jsonb NOT NULL,
	"summary" jsonb NOT NULL,
	"description" jsonb NOT NULL,
	"details" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"care" jsonb,
	"category" text NOT NULL,
	"department" text NOT NULL,
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"art" text NOT NULL,
	"age_groups" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"bestseller" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"size" text NOT NULL,
	"colour" text NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "products_handle_idx" ON "products" USING btree ("handle");--> statement-breakpoint
CREATE UNIQUE INDEX "variants_product_size_colour_idx" ON "variants" USING btree ("product_id","size","colour");