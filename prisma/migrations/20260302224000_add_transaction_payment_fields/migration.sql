-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT', 'DEBIT', 'PIX', 'CASH');

-- AlterTable
ALTER TABLE "Transaction"
ADD COLUMN "paymentMethod" "PaymentMethod",
ADD COLUMN "purchaseDate" TIMESTAMP(3),
ADD COLUMN "cardId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_cardId_idx" ON "Transaction"("cardId");

-- AddForeignKey
ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_cardId_fkey"
FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;
