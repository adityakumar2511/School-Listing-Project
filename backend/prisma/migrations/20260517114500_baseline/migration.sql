-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('SCHOOL_VERIFIED', 'SCHOOL_REJECTED', 'SCHOOL_EDITED', 'SCHOOL_DELETED', 'SCHOOL_FEATURED_TOGGLED', 'SCHOOL_CREATED', 'ADMIN_LOGIN');

-- CreateEnum
CREATE TYPE "public"."GalleryType" AS ENUM ('photo', 'video');

-- CreateEnum
CREATE TYPE "public"."InquiryStatus" AS ENUM ('new', 'contacted', 'interested', 'converted', 'closed');

-- CreateEnum
CREATE TYPE "public"."PendingUpdateStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."SchoolStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('parent', 'school', 'admin');

-- CreateTable
CREATE TABLE "public"."approval_logs" (
    "id" TEXT NOT NULL,
    "pending_update_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "admin_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_email" TEXT,
    "actor_role" TEXT NOT NULL,
    "actor_team_role" TEXT,
    "action" "public"."AuditAction" NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_name" TEXT,
    "previous_data" JSONB,
    "new_data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "published_at" TIMESTAMP(3),
    "seo_title" TEXT,
    "seo_description" TEXT,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "has_schools" BOOLEAN NOT NULL DEFAULT false,
    "state_id" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."facilities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "slug" TEXT NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."featured_listings" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "plan_type" TEXT NOT NULL,
    "payment_id" TEXT,

    CONSTRAINT "featured_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inquiries" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "school_id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "class_applying" TEXT NOT NULL,
    "message" TEXT,
    "status" "public"."InquiryStatus" NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inquiry_notes" (
    "id" TEXT NOT NULL,
    "inquiry_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inquiry_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."otp_codes" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "razorpay_order_id" TEXT,
    "razorpay_payment_id" TEXT,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pending_updates" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "status" "public"."PendingUpdateStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "pending_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_academics" (
    "school_id" TEXT NOT NULL,
    "streams" TEXT[],
    "classes_from" TEXT NOT NULL,
    "classes_to" TEXT NOT NULL,
    "admission_open" BOOLEAN NOT NULL DEFAULT false,
    "admission_start" TIMESTAMP(3),
    "admission_end" TIMESTAMP(3),
    "documents_required" TEXT[],
    "age_criteria" TEXT,

    CONSTRAINT "school_academics_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "public"."school_achievements" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" INTEGER,
    "description" TEXT,

    CONSTRAINT "school_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_address" (
    "school_id" TEXT NOT NULL,
    "address_line" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "google_maps_url" TEXT,

    CONSTRAINT "school_address_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "public"."school_details" (
    "school_id" TEXT NOT NULL,
    "principal_name" TEXT,
    "established_year" INTEGER,
    "affiliation_no" TEXT,
    "website" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,

    CONSTRAINT "school_details_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "public"."school_facilities" (
    "school_id" TEXT NOT NULL,
    "library" BOOLEAN NOT NULL DEFAULT false,
    "labs" BOOLEAN NOT NULL DEFAULT false,
    "hostel" BOOLEAN NOT NULL DEFAULT false,
    "transport" BOOLEAN NOT NULL DEFAULT false,
    "smart_classroom" BOOLEAN NOT NULL DEFAULT false,
    "wifi" BOOLEAN NOT NULL DEFAULT false,
    "cctv" BOOLEAN NOT NULL DEFAULT false,
    "gym" BOOLEAN NOT NULL DEFAULT false,
    "swimming_pool" BOOLEAN NOT NULL DEFAULT false,
    "playground" BOOLEAN NOT NULL DEFAULT false,
    "auditorium" BOOLEAN NOT NULL DEFAULT false,
    "cafeteria" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "school_facilities_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "public"."school_fees" (
    "school_id" TEXT NOT NULL,
    "admission_fee" INTEGER,
    "tuition_fee_monthly" INTEGER,
    "tuition_fee_annual" INTEGER,
    "transport_fee" INTEGER,
    "hostel_fee" INTEGER,
    "exam_fee" INTEGER,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_fees_pkey" PRIMARY KEY ("school_id")
);

-- CreateTable
CREATE TABLE "public"."school_gallery" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "type" "public"."GalleryType" NOT NULL,
    "cloudinary_url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "school_gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school_sections" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "section_type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "school_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "state_id" TEXT NOT NULL,
    "board_id" TEXT NOT NULL,
    "owner_id" TEXT,
    "type" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."SchoolStatus" NOT NULL DEFAULT 'pending',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."seo_pages" (
    "id" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "custom_title" TEXT,
    "custom_description" TEXT,
    "custom_content" TEXT,

    CONSTRAINT "seo_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."states" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'parent',
    "google_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "public"."audit_logs"("actor_id" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "public"."audit_logs"("created_at" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "public"."audit_logs"("target_type" ASC, "target_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "public"."blog_posts"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "boards_slug_key" ON "public"."boards"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "public"."cities"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "facilities_slug_key" ON "public"."facilities"("slug" ASC);

-- CreateIndex
CREATE INDEX "otp_codes_expiresAt_idx" ON "public"."otp_codes"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "otp_codes_phone_code_used_idx" ON "public"."otp_codes"("phone" ASC, "code" ASC, "used" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "schools_slug_key" ON "public"."schools"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "states_slug_key" ON "public"."states"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "public"."users"("google_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "public"."users"("phone" ASC);

-- AddForeignKey
ALTER TABLE "public"."approval_logs" ADD CONSTRAINT "approval_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."approval_logs" ADD CONSTRAINT "approval_logs_pending_update_id_fkey" FOREIGN KEY ("pending_update_id") REFERENCES "public"."pending_updates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cities" ADD CONSTRAINT "cities_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."featured_listings" ADD CONSTRAINT "featured_listings_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."featured_listings" ADD CONSTRAINT "featured_listings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiries" ADD CONSTRAINT "inquiries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiry_notes" ADD CONSTRAINT "inquiry_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inquiry_notes" ADD CONSTRAINT "inquiry_notes_inquiry_id_fkey" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_updates" ADD CONSTRAINT "pending_updates_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_updates" ADD CONSTRAINT "pending_updates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_updates" ADD CONSTRAINT "pending_updates_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_academics" ADD CONSTRAINT "school_academics_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_achievements" ADD CONSTRAINT "school_achievements_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_address" ADD CONSTRAINT "school_address_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_details" ADD CONSTRAINT "school_details_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_facilities" ADD CONSTRAINT "school_facilities_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_fees" ADD CONSTRAINT "school_fees_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_gallery" ADD CONSTRAINT "school_gallery_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school_sections" ADD CONSTRAINT "school_sections_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schools" ADD CONSTRAINT "schools_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "public"."boards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schools" ADD CONSTRAINT "schools_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schools" ADD CONSTRAINT "schools_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
