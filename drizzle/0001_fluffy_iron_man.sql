CREATE TABLE "categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" jsonb NOT NULL,
	"blurb" jsonb,
	"department" text NOT NULL,
	"art" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
