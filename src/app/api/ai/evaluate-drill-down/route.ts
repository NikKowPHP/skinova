// src/app/api/ai/evaluate-drill-down/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { tieredRateLimiter } from "@/lib/rateLimiter";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { encrypt } from "@/lib/encryption";

const evaluateDrillDownSchema = z.object({
  mistakeId: z.string(),
  taskPrompt: z.string(),
  expectedAnswer: z.string(),
  userAnswer: z.string(),
  targetLanguage: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { subscriptionTier: true, nativeLanguage: true },
    });
    if (!dbUser?.nativeLanguage) {
      return new NextResponse("User native language not set.", { status: 400 });
    }

    const rateLimitResult = tieredRateLimiter(
      user.id,
      dbUser?.subscriptionTier || "FREE",
    );
    if (!rateLimitResult.allowed) {
      return new NextResponse("Rate limit exceeded", { status: 429 });
    }

    const parsed = evaluateDrillDownSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    const { mistakeId, taskPrompt, expectedAnswer, userAnswer, targetLanguage } =
      parsed.data;

    const aiService = getQuestionGenerationService();
    const evaluationResult = await aiService.evaluateDrillDownAnswer({
      taskPrompt,
      expectedAnswer,
      userAnswer,
      targetLanguage,
      nativeLanguage: dbUser.nativeLanguage,
    });

    // Store the practice attempt
    await prisma.practiceAttempt.create({
      data: {
        mistakeId,
        userId: user.id,
        taskPrompt,
        expectedAnswer,
        userAnswer,
        aiEvaluationJson: encrypt(JSON.stringify(evaluationResult)), // Encrypt AI's raw evaluation
        isCorrect: evaluationResult.isCorrect,
        score: evaluationResult.score, // Store the numerical score
      },
    });

    return NextResponse.json(evaluationResult);
  } catch (error) {
    logger.error("[API:evaluate-drill-down] An unexpected error occurred.", {
      error,
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}