import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";

export const GET = async (req: NextRequest) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  logger.info(`Exporting data for user ${user.id}`);
  try {
    const userId = user.id;

    const scans = await prisma.skinScan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { analysis: { include: { concerns: true } } }
    });

    // Decrypt all sensitive data before exporting
    const decryptedData = scans.map(scan => {
      try {
        const decryptedScan = { ...scan };
        decryptedScan.imageUrl = decrypt(scan.imageUrl) ?? "DECRYPTION_FAILED";
        if (scan.notes) decryptedScan.notes = decrypt(scan.notes) ?? "DECRYPTION_FAILED";
        if (scan.analysis) {
          decryptedScan.analysis.analysisJson = decrypt(scan.analysis.analysisJson) ?? "DECRYPTION_FAILED";
          decryptedScan.analysis.rawAiResponse = decrypt(scan.analysis.rawAiResponse) ?? "DECRYPTION_FAILED";
        }
        return decryptedScan;
      } catch (e) {
          logger.error(`Failed to decrypt data for scan ${scan.id} during export`, e);
          return { ...scan, error: "Decryption failed for this record" };
      }
    });

    return new NextResponse(JSON.stringify(decryptedData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="skinova_export.json"',
      },
    });
  } catch (error) {
    logger.error(`Failed to export data for user ${user.id}`, error);
    return new NextResponse("Failed to export data", { status: 500 });
  }
};