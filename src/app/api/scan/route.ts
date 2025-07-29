import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt, decrypt } from "@/lib/encryption";

// GET Handler for scan history
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scans = await prisma.skinScan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      imageUrl: true,
      createdAt: true,
      analysis: { select: { overallScore: true } },
    },
  });

  const decryptedScans = scans.map(scan => {
    const decryptedUrl = decrypt(scan.imageUrl);
    return { ...scan, imageUrl: decryptedUrl };
  });

  return NextResponse.json(decryptedScans);
}

// POST Handler for creating a new scan
const createScanSchema = z.object({
    imageUrl: z.string().url(),
    notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    logger.info(`/api/scan - POST - User: ${user.id}`, { imageUrl: 'REDACTED' });

    const parsed = createScanSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { imageUrl, notes } = parsed.data;

    const newScan = await prisma.skinScan.create({
      data: {
        userId: user.id,
        imageUrl: encrypt(imageUrl),
        notes: notes ? encrypt(notes) : undefined,
      },
    });

    return NextResponse.json(newScan, { status: 201 });
  } catch (error) {
    logger.error("/api/scan - POST failed", error);
    return NextResponse.json({ error: "Failed to create scan" }, { status: 500 });
  }
}