-- CreateTable
CREATE TABLE "public"."GeneralReceipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "clientIds" TEXT[],
    "reason" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL,
    "signedById" INTEGER NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneralReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GeneralReceipt_receiptNumber_key" ON "public"."GeneralReceipt"("receiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "GeneralReceipt_transactionHash_key" ON "public"."GeneralReceipt"("transactionHash");

-- AddForeignKey
ALTER TABLE "public"."GeneralReceipt" ADD CONSTRAINT "GeneralReceipt_signedById_fkey" FOREIGN KEY ("signedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
