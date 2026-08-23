CREATE TYPE "public"."gender" AS ENUM('kadin', 'erkek', 'belirtilmemis');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('randevu_olusturuldu', 'randevu_iptal', 'randevu_hatirlatma', 'yeni_mesaj', 'yeni_yorum', 'musaitlik_bildirimi');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('bireysel', 'cift', 'aile', 'grup');--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"psychologist_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_client_id_psychologist_id_unique" UNIQUE("client_id","psychologist_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text,
	"link" varchar(255),
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"psychologist_id" integer NOT NULL,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_entries_client_id_psychologist_id_unique" UNIQUE("client_id","psychologist_id")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "session_type" "session_type" DEFAULT 'bireysel' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "is_intro" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "no_show_by" varchar(20);--> statement-breakpoint
ALTER TABLE "availability_slots" ADD COLUMN "session_type" "session_type" DEFAULT 'bireysel' NOT NULL;--> statement-breakpoint
ALTER TABLE "availability_slots" ADD COLUMN "is_intro" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "gender" "gender" DEFAULT 'belirtilmemis' NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "languages" text[] DEFAULT '{"Türkçe"}' NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "approaches" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD COLUMN "intro_call_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "moderated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" varchar(60) DEFAULT 'Europe/Istanbul' NOT NULL;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_psychologist_id_psychologist_profiles_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "waitlist_entries" ADD CONSTRAINT "waitlist_entries_psychologist_id_psychologist_profiles_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_client_id_psychologist_id_unique" UNIQUE("client_id","psychologist_id");