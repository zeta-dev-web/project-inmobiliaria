/*
  Warnings:

  - A unique constraint covering the columns `[rentalId,type]` on the table `Notification` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "delivered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "deliveryMethod" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Notification_rentalId_type_key" ON "public"."Notification"("rentalId", "type");
