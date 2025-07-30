-- AlterTable
ALTER TABLE "SkinScan" ADD COLUMN     "analysisError" TEXT,
ADD COLUMN     "analysisStatus" TEXT NOT NULL DEFAULT 'PENDING';
