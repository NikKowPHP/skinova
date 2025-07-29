import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { decrypt } from "@/lib/encryption";

// GET handler to fetch a single scan with its analysis
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scan = await prisma.skinScan.findFirst({
    where: { id, userId: user.id },
    include: { analysis: { include: { concerns: true } } },
  });

  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

  // Decrypt sensitive fields before returning
  scan.imageUrl = decrypt(scan.imageUrl) ?? "[Decryption Failed]";
  if (scan.notes) scan.notes = decrypt(scan.notes) ?? "[Decryption Failed]";
  if (scan.analysis) {
    scan.analysis.analysisJson = decrypt(scan.analysis.analysisJson) ?? "{}";
    scan.analysis.rawAiResponse = decrypt(scan.analysis.rawAiResponse) ?? "{}";
  }

  return NextResponse.json(scan);
}

// DELETE handler to remove a scan
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.skinScan.delete({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(`/api/scan/[id] - DELETE failed`, error);
    return NextResponse.json({ error: "Failed to delete scan" }, { status: 500 });
  }
}