-- DropIndex
DROP INDEX "articles_status_category_id_idx";

-- CreateIndex
CREATE INDEX "articles_status_idx" ON "articles"("status");

-- CreateIndex
CREATE INDEX "articles_category_id_idx" ON "articles"("category_id");
