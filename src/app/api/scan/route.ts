import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt, decrypt } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET Handler for scan history
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  logger.info(`Fetching scan history for user ${user.id}`);
  try {
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

    const decryptedScans = await Promise.all(scans.map(async (scan) => {
        const decryptedPath = decrypt(scan.imageUrl);
        if (!decryptedPath) {
            return { ...scan, imageUrl: null };
        }

        if (decryptedPath.startsWith('http')) {
          return { ...scan, imageUrl: decryptedPath };
        }
        
        const { data, error } = await supabaseAdmin.storage
            .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
            .createSignedUrl(decryptedPath, 60 * 5); // 5 minute expiry for list view

        if (error) {
            logger.error(`Failed to create signed URL for scan ${scan.id} in history view`, error);
            return { ...scan, imageUrl: null };
        }

        return { ...scan, imageUrl: data.signedUrl };
    }));

    return NextResponse.json(decryptedScans);
  } catch (error) {
    logger.error(`Failed to fetch scan history for user ${user.id}`, error);
    return NextResponse.json({ error: "Failed to fetch scan history" }, { status: 500 });
  }
}

// POST Handler for creating a new scan
const createScanSchema = z.object({
    imageUrl: z.string(), // Now expects a path, not a URL
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