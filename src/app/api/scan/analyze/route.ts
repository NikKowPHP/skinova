import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { encrypt } from "@/lib/encryption";

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
    });
    if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

    // **MOCK AI PIPELINE** - This logic will be replaced in Phase H
    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 15) + 80, // Score between 80-95
      analysisJson: encrypt(JSON.stringify({ mock: true, detectedConcerns: 2 })),
      rawAiResponse: encrypt(JSON.stringify({ message: "This is a mock AI response for Phase E." })),
    };

    const newAnalysis = await prisma.skinAnalysis.create({
      data: {
        scanId: scanId,
        ...mockAnalysis
      },
    });
    // End of mock section

    return NextResponse.json(newAnalysis);
  } catch (error) {
    logger.error("Error in /api/scan/analyze", error);
    return NextResponse.json({ error: "Failed to analyze scan" }, { status: 500 });
  }
}