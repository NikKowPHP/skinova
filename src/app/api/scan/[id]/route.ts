import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { decrypt } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET handler to fetch a single scan with its analysis
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  logger.info(`Fetching scan ${id} for user ${user.id}`);
  try {
    const scan = await prisma.skinScan.findFirst({
      where: { id, userId: user.id },
      include: { analysis: { include: { concerns: true } } },
    });

    if (!scan) {
      logger.warn(`Scan ${id} not found for user ${user.id}`);
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    // Decrypt path and create a signed URL for secure, temporary access
    const decryptedPath = decrypt(scan.imageUrl);
    if (decryptedPath) {
        const { data, error } = await supabaseAdmin.storage
            .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
            .createSignedUrl(decryptedPath, 60 * 60); // 1 hour expiry

        if (error) {
            logger.error(`Failed to create signed URL for scan ${id}`, error);
            scan.imageUrl = ''; // Prevent exposing a broken link
        } else {
            scan.imageUrl = data.signedUrl;
        }
    } else {
        scan.imageUrl = '';
    }

    if (scan.notes) scan.notes = decrypt(scan.notes) ?? "[Decryption Failed]";
    if (scan.analysis) {
      scan.analysis.analysisJson = decrypt(scan.analysis.analysisJson) ?? "{}";
      scan.analysis.rawAiResponse = decrypt(scan.analysis.rawAiResponse) ?? "{}";
    }

    return NextResponse.json(scan);
  } catch (error) {
    logger.error(`Failed to fetch scan ${id} for user ${user.id}`, error);
    return NextResponse.json({ error: "Failed to fetch scan" }, { status: 500 });
  }
}

// DELETE handler to remove a scan
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  logger.info(`Deleting scan ${id} for user ${user.id}`);
  try {
    await prisma.skinScan.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`Failed to delete scan ${id} for user ${user.id}`, error);
    return NextResponse.json({ error: "Failed to delete scan" }, { status: 500 });
  }
}