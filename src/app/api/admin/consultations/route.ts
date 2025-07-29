import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await authMiddleware(request); // Admin check
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const consultations = await prisma.consultation.findMany({
      where: { status: status || undefined },
      include: { user: { select: { email: true } }, scan: { select: { id: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(consultations);
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
}