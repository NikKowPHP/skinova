import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt, decrypt } from "@/lib/encryption";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from 'crypto';

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
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const notes = formData.get('notes') as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop();
    const filePath = `public/${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
      });

    if (uploadError) {
      logger.error('Supabase upload failed in /api/scan', uploadError);
      throw new Error('Failed to upload image to storage.');
    }
    
    logger.info(`/api/scan - POST - User: ${user.id}`, { filePath });

    const newScan = await prisma.skinScan.create({
      data: {
        userId: user.id,
        imageUrl: encrypt(filePath),
        notes: notes ? encrypt(notes) : undefined,
      },
    });

    return NextResponse.json(newScan, { status: 201 });
  } catch (error) {
    logger.error("/api/scan - POST failed", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create scan";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}