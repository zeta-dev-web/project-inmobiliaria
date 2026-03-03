-- AlterTable
ALTER TABLE "public"."Rental" ADD COLUMN     "lateFeeType" "public"."AdminType" NOT NULL DEFAULT 'PERCENTAGE';
