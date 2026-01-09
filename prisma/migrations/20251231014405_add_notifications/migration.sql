-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('CONTRACT_EXPIRING', 'PRICE_UPDATE');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "rentalId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_rentalId_notified_idx" ON "public"."Notification"("rentalId", "notified");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "public"."Rental"("id") ON DELETE CASCADE ON UPDATE CASCADE;
