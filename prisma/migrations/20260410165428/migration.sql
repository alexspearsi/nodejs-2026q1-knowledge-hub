/*
  Warnings:

  - You are about to drop the column `created_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `tags` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[login]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "comments" DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- CreateIndex
CREATE UNIQUE INDEX "users_login_key" ON "users"("login");
