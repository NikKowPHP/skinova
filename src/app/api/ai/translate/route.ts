import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getTranslationService } from "@/lib/ai";
import { GeminiQuestionGenerationService } from "@/lib/ai/gemini-service";
import { tieredRateLimiter } from "@/lib/rateLimiter";
import { logger } from "@/lib/logger";
import { PostHog } from "posthog-node";

let posthog: PostHog | null = null;
if (
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_POSTHOG_HOST
) {
  posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
}

export const POST = async (req: NextRequest) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  logger.info(`/api/ai/translate - POST - User: ${user.id}`);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionTier: true },
  });

  // Rate limit based on user's subscription tier
  const rateLimitResult = tieredRateLimiter(
    user.id,
    dbUser?.subscriptionTier || "FREE",
  );

  if (!rateLimitResult.allowed) {
    return new NextResponse("Rate limit exceeded", {
      status: 429,
      headers: {
        "Retry-After": rateLimitResult.retryAfter?.toString() || "86400", // 24 hours
      },
    });
  }

  try {
    const { text, sourceLanguage, targetLanguage } = await req.json();

    if (!text || !sourceLanguage || !targetLanguage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    let translatedText: string;
    let serviceUsed: "cerebras" | "groq" | "gemini";
    const startTime = Date.now();

    // Feature Flag Check
    if (process.env.USE_NEW_TRANSLATION_SERVICE) {
      logger.info("Using new translation service (Cerebras/Groq)");
      const translationService = getTranslationService();
      const result = await translationService.translate(
        text,
        sourceLanguage,
        targetLanguage,
        user.id,
      );
      translatedText = result.translatedText;
      serviceUsed = result.serviceUsed;
    } else {
      logger.info("Using legacy translation service (Gemini)");
      const geminiService = new GeminiQuestionGenerationService();
      translatedText = await geminiService.translateText(
        text,
        sourceLanguage,
        targetLanguage,
      );
      serviceUsed = "gemini";
    }

    const latency = Date.now() - startTime;

    if (posthog) {
      posthog.capture({
        distinctId: user.id,
        event: "TranslationCompleted",
        properties: {
          serviceUsed,
          latency,
          sourceLanguage,
          targetLanguage,
          characterCount: text.length,
        },
      });
    }

    return NextResponse.json({ translatedText });
  } catch (error) {
    logger.error("Error in translation API:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    if (posthog) {
      await posthog.shutdown();
    }
  }
};