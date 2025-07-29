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
  logger.info("Received POST request at /api/analyze-scan");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn("/api/analyze-scan - Unauthorized access attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.info(`/api/analyze-scan - Authenticated user: ${user.id}`);

    const body = await req.json();
    logger.info(`/api/analyze-scan - Request body parsed for user: ${user.id}`, body);

    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn(`/api/analyze-scan - Invalid request body for user: ${user.id}`, parsed.error);
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { scanId } = parsed.data;
    logger.info(`/api/analyze-scan - Starting analysis for scanId: ${scanId}`);

    const scan = await prisma.skinScan.findFirst({
      where: { id: scanId, userId: user.id },
      include: { user: { select: { skinType: true, primaryConcern: true } } },
    });
    if (!scan || !scan.user.skinType || !scan.user.primaryConcern) {
      logger.warn(`/api/analyze-scan - Scan not found or incomplete profile for scanId: ${scanId}, user: ${user.id}`);
      return NextResponse.json({ error: "Scan or complete user profile not found" }, { status: 404 });
    }
    logger.info(`/api/analyze-scan - Found scan ${scanId} for user ${user.id}`);

    const imagePath = decrypt(scan.imageUrl);
    if (!imagePath) {
        logger.error(`/api/analyze-scan - Failed to decrypt image path for scan ${scanId}`);
        throw new Error("Failed to decrypt image path.");
    }
    logger.info(`/api/analyze-scan - Decrypted image path for scan ${scanId}: ${imagePath}`);

    let imageBuffer: Buffer;

    logger.info(`Fetching image for analysis from Supabase Storage path: ${imagePath}`);
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
      .download(imagePath);
    
    if (downloadError) {
      logger.error(`Failed to download image from storage for scan ${scanId}`, downloadError);
      throw new Error(`Failed to download image from storage: ${downloadError.message}`);
    }
    imageBuffer = Buffer.from(await fileData.arrayBuffer());
    logger.info(`/api/analyze-scan - Successfully downloaded image for scan ${scanId}`);

    const aiService = getQuestionGenerationService();
    logger.info(`/api/analyze-scan - Calling AI service for scan ${scanId}`);
    const analysisResult = await aiService.analyzeSkinScan(imageBuffer, {
        skinType: scan.user.skinType,
        primaryConcern: scan.user.primaryConcern,
        notes: scan.notes ? decrypt(scan.notes) : null
    });
    logger.info(`/api/analyze-scan - Received analysis from AI for scan ${scanId}`);

    logger.info(`/api/analyze-scan - Starting database transaction for scan ${scanId}`);
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
        logger.info(`/api/analyze-scan - Created SkinAnalysis record in transaction for scan ${scanId}`);

        if (analysisResult.routineRecommendations) {
            await updateRoutineFromAnalysis(tx, user.id, analysisResult.routineRecommendations);
            logger.info(`/api/analyze-scan - Updated routine in transaction for user ${user.id}`);
        }
        
        return createdAnalysis;
    });
    logger.info(`/api/analyze-scan - Transaction completed for scan ${scanId}`);
    
    return NextResponse.json(newAnalysis);
  } catch (error) {
    logger.error("Error in /api/analyze-scan", error);
    return NextResponse.json({ error: "Failed to analyze scan" }, { status: 500 });
  }
}