import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const { user } = await authMiddleware(request); // Admin check
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    logger.info(`Admin consultations GET request by ${user.id}`, { status });

    const consultations = await prisma.consultation.findMany({
      where: { status: status || undefined },
      include: { user: { select: { email: true } }, scan: { select: { id: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(consultations);
  } catch (error) { 
    logger.error("Error fetching admin consultations", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 403 }); 
  }
}