import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt, decrypt } from "@/lib/encryption";
import { getQuestionGenerationService } from "@/lib/ai";
import { updateRoutineFromAnalysis } from "@/lib/services/routine.service";

const analyzeSchema = z.object({ scanId: z.string() });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { scanId } = parsed.data;

    const scan = await prisma.skinScan.findFirst({
      where: { id: scanId, userId: user.id },
      include: { user: { select: { skinType: true, primaryConcern: true } } },
    });
    if (!scan || !scan.user.skinType || !scan.user.primaryConcern) {
      return NextResponse.json({ error: "Scan or complete user profile not found" }, { status: 404 });
    }

    const imagePath = decrypt(scan.imageUrl);
    if (!imagePath) throw new Error("Failed to decrypt image path.");

    logger.info(`Fetching image for analysis from Supabase Storage path: ${imagePath}`);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
      .download(imagePath);
    
    if (downloadError) {
      logger.error(`Failed to download image from storage for scan ${scanId}`, downloadError);
      throw new Error(`Failed to download image from storage: ${downloadError.message}`);
    }
    const imageBuffer = Buffer.from(await fileData.arrayBuffer());

    const aiService = getQuestionGenerationService();
    const analysisResult = await aiService.analyzeSkinScan(imageBuffer, {
        skinType: scan.user.skinType,
        primaryConcern: scan.user.primaryConcern,
        notes: scan.notes ? decrypt(scan.notes) : null
    });

    // Use a transaction to save analysis and update routine atomically
    const newAnalysis = await prisma.$transaction(async (tx) => {
        const createdAnalysis = await tx.skinAnalysis.create({
            data: {
                scanId: scanId,
                overallScore: analysisResult.overallScore,
                analysisJson: encrypt(JSON.stringify(analysisResult)),
                rawAiResponse: encrypt(JSON.stringify(analysisResult)),
                concerns: {
                    create: analysisResult.concerns.map((concern: any) => ({
                        name: concern.name,
                        severity: concern.severity,
                        description: concern.description,
                        boundingBoxJson: concern.boundingBox ? JSON.stringify(concern.boundingBox) : null,
                    }))
                }
            }
        });

        if (analysisResult.routineRecommendations) {
            await updateRoutineFromAnalysis(tx, user.id, analysisResult.routineRecommendations);
        }
        
        return createdAnalysis;
    });
    
    return NextResponse.json(newAnalysis);
  } catch (error) {
    logger.error("Error in /api/scan/analyze", error);
    return NextResponse.json({ error: "Failed to analyze scan" }, { status: 500 });
  }
}