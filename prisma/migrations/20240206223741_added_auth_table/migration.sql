/*
  Warnings:

  - A unique constraint covering the columns `[password]` on the table `Auth` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Auth_password_key" ON "Auth"("password");
