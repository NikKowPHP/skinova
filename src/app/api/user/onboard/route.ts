import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { z } from "zod";
import { SkinType } from "@prisma/client";

const onboardingSchema = z.object({
  skinType: z.nativeEnum(SkinType),
  primaryConcern: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  logger.info(`/api/user/onboard - POST - User: ${user.id}`, body);

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  
  const { skinType, primaryConcern } = parsed.data;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        skinType,
        primaryConcern,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error("Failed to update user profile on onboarding", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 },
    );
  }
}