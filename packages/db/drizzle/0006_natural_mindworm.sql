CREATE TYPE "public"."corporate_lead_status" AS ENUM('yeni', 'iletisimde', 'kapandi');--> statement-breakpoint
CREATE TYPE "public"."discount_applies_to" AS ENUM('hepsi', 'seans', 'paket');--> statement-breakpoint
CREATE TYPE "public"."discount_kind" AS ENUM('yuzde', 'tutar');--> statement-breakpoint
CREATE TYPE "public"."public_question_status" AS ENUM('bekliyor', 'yanitlandi', 'yayinda');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(200) NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" text,
	"author_name" varchar(150) NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "corporate_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(200) NOT NULL,
	"contact_name" varchar(150) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(30),
	"employee_count_range" varchar(50),
	"message" text,
	"status" "corporate_lead_status" DEFAULT 'yeni' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(40) NOT NULL,
	"kind" "discount_kind" NOT NULL,
	"value" integer NOT NULL,
	"applies_to" "discount_applies_to" DEFAULT 'hepsi' NOT NULL,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"valid_from" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "gift_vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"payment_id" integer NOT NULL,
	"recipient_email" varchar(255) NOT NULL,
	"code" varchar(20) NOT NULL,
	"redeemed" boolean DEFAULT false NOT NULL,
	"redeemed_by_client_id" integer,
	"redeemed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gift_vouchers_payment_id_unique" UNIQUE("payment_id"),
	CONSTRAINT "gift_vouchers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "psych_test_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_id" integer NOT NULL,
	"order" integer NOT NULL,
	"text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psych_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(150) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"result_bands" jsonb NOT NULL,
	"related_specialty_slug" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "psych_tests_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "public_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"question_text" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"asker_name" varchar(150),
	"asker_email" varchar(255),
	"answer_text" text,
	"answered_by_psychologist_id" integer,
	"status" "public_question_status" DEFAULT 'bekliyor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"answered_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "discount_code_id" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "discount_amount_tl" integer;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "is_gift" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "gift_recipient_email" varchar(255);--> statement-breakpoint
ALTER TABLE "gift_vouchers" ADD CONSTRAINT "gift_vouchers_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_vouchers" ADD CONSTRAINT "gift_vouchers_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_vouchers" ADD CONSTRAINT "gift_vouchers_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gift_vouchers" ADD CONSTRAINT "gift_vouchers_redeemed_by_client_id_users_id_fk" FOREIGN KEY ("redeemed_by_client_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psych_test_questions" ADD CONSTRAINT "psych_test_questions_test_id_psych_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."psych_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_questions" ADD CONSTRAINT "public_questions_answered_by_psychologist_id_psychologist_profiles_id_fk" FOREIGN KEY ("answered_by_psychologist_id") REFERENCES "public"."psychologist_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_discount_code_id_discount_codes_id_fk" FOREIGN KEY ("discount_code_id") REFERENCES "public"."discount_codes"("id") ON DELETE set null ON UPDATE no action;