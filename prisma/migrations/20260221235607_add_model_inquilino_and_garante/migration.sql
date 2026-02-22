-- CreateEnum
CREATE TYPE "public"."ClientType" AS ENUM ('LANDLORD', 'TENANT', 'GUARANTOR');

-- AlterTable
ALTER TABLE "public"."Client" ADD COLUMN     "clientType" "public"."ClientType" NOT NULL DEFAULT 'LANDLORD',
ADD COLUMN     "dni" TEXT,
ADD COLUMN     "fiscalAddress" TEXT,
ADD COLUMN     "workplace" TEXT;

-- CreateTable
CREATE TABLE "public"."ClientDocument" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ClientDocument" ADD CONSTRAINT "ClientDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
