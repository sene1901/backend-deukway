-- CreateEnum
CREATE TYPE "ListingModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Annonce" ADD COLUMN     "moderationStatus" "ListingModerationStatus" NOT NULL DEFAULT 'PENDING';
