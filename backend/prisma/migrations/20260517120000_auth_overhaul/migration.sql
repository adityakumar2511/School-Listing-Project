-- Auth overhaul: align otp_codes + users with unified auth schema.
-- OTP rows are discarded (codes are short-lived).
TRUNCATE TABLE "otp_codes";

-- CreateEnum
CREATE TYPE "OtpType" AS ENUM ('EMAIL_VERIFY', 'PHONE_LOGIN', 'PASSWORD_RESET');

-- DropIndex
DROP INDEX IF EXISTS "otp_codes_expiresAt_idx";

-- DropIndex
DROP INDEX IF EXISTS "otp_codes_phone_code_used_idx";

-- AlterTable
ALTER TABLE "otp_codes" DROP COLUMN IF EXISTS "createdAt",
DROP COLUMN IF EXISTS "expiresAt",
DROP COLUMN IF EXISTS "phone",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "identifier" TEXT NOT NULL,
ADD COLUMN     "type" "OtpType" NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "is_phone_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "password_hash" TEXT,
ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otp_codes_identifier_type_code_used_idx" ON "otp_codes"("identifier", "type", "code", "used");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "otp_codes_expires_at_idx" ON "otp_codes"("expires_at");
