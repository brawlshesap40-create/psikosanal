CREATE TYPE "public"."appointment_status" AS ENUM('onaylandi', 'tamamlandi', 'iptal_edildi');--> statement-breakpoint
CREATE TYPE "public"."psikolog_approval_status" AS ENUM('beklemede', 'onaylandi', 'reddedildi');--> statement-breakpoint
CREATE TYPE "public"."slot_status" AS ENUM('musait', 'dolu', 'pasif');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('danisan', 'psikolog', 'admin');--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"psychologist_id" integer NOT NULL,
	"status" "appointment_status" DEFAULT 'onaylandi' NOT NULL,
	"client_note" text,
	"cancelled_by" varchar(20),
	"cancel_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_slot_id_unique" UNIQUE("slot_id")
);
--> statement-breakpoint
CREATE TABLE "availability_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"psychologist_id" integer NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 50 NOT NULL,
	"status" "slot_status" DEFAULT 'musait' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psychologist_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(150) NOT NULL,
	"bio" text,
	"experience_years" integer,
	"session_price_tl" integer,
	"city" varchar(100),
	"online_available" boolean DEFAULT true NOT NULL,
	"in_person_available" boolean DEFAULT false NOT NULL,
	"photo_url" text,
	"license_document_url" text,
	"approval_status" "psikolog_approval_status" DEFAULT 'beklemede' NOT NULL,
	"admin_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "psychologist_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "psychologist_profiles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "psychologist_specialties" (
	"id" serial PRIMARY KEY NOT NULL,
	"psychologist_id" integer NOT NULL,
	"specialty_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	CONSTRAINT "specialties_name_unique" UNIQUE("name"),
	CONSTRAINT "specialties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"full_name" varchar(150) NOT NULL,
	"phone" varchar(30),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_slot_id_availability_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."availability_slots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_psychologist_id_psychologist_profiles_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_psychologist_id_psychologist_profiles_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_profiles" ADD CONSTRAINT "psychologist_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_specialties" ADD CONSTRAINT "psychologist_specialties_psychologist_id_psychologist_profiles_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."psychologist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychologist_specialties" ADD CONSTRAINT "psychologist_specialties_specialty_id_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."specialties"("id") ON DELETE cascade ON UPDATE no action;