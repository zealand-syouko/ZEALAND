-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "trade_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" DATETIME,
    CONSTRAINT "payment_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "payment_orders_user_id_idx" ON "payment_orders"("user_id");

-- CreateIndex
CREATE INDEX "payment_orders_trade_no_idx" ON "payment_orders"("trade_no");
