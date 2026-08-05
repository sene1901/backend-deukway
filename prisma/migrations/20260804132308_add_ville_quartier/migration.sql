-- AlterTable
ALTER TABLE "Annonce" ADD COLUMN     "quartierId" TEXT;

-- CreateTable
CREATE TABLE "Ville" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ville_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quartier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "villeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quartier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ville_name_key" ON "Ville"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Quartier_name_villeId_key" ON "Quartier"("name", "villeId");

-- AddForeignKey
ALTER TABLE "Annonce" ADD CONSTRAINT "Annonce_quartierId_fkey" FOREIGN KEY ("quartierId") REFERENCES "Quartier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quartier" ADD CONSTRAINT "Quartier_villeId_fkey" FOREIGN KEY ("villeId") REFERENCES "Ville"("id") ON DELETE CASCADE ON UPDATE CASCADE;
