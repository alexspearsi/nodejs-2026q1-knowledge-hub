-- CreateIndex
CREATE INDEX "articles_status_category_id_idx" ON "articles"("status", "category_id");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");
