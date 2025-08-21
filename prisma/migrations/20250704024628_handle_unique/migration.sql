/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Channel_handle_key" ON "Channel"("handle");
