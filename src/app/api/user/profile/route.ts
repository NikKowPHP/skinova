import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { Prisma, SkinType } from "@prisma/client";
import { z } from "zod";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      email: true,
      skinType: true,
      primaryConcern: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      onboardingCompleted: true,
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(dbUser);
}

const profileUpdateSchema = z.object({
  skinType: z.nativeEnum(SkinType).optional(),
  primaryConcern: z.string().min(1).optional(),
});

export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    logger.info(`/api/user/profile - PUT - User: ${user.id}`, body);
    
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: parsed.data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logger.error("Failed to update profile", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}