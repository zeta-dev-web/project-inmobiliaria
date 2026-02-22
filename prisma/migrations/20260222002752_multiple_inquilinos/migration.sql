/*
  Warnings:

  - You are about to drop the column `tenantId` on the `Rental` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Rental" DROP CONSTRAINT "Rental_tenantId_fkey";

-- AlterTable
ALTER TABLE "public"."Rental" DROP COLUMN "tenantId";

-- CreateTable
CREATE TABLE "public"."RentalTenant" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentalTenant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RentalTenant" ADD CONSTRAINT "RentalTenant_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "public"."Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RentalTenant" ADD CONSTRAINT "RentalTenant_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
