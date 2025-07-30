import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { z } from "zod";
import { decrypt, encrypt } from "@/lib/encryption";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
      const { user } = await authMiddleware(request); // Admin check
      logger.info(`Admin consultation GET request by ${user.id} for consultation ${id}`);
      const consultation = await prisma.consultation.findUnique({
        where: { id },
        include: { user: { select: { email: true } }, scan: true },
      });
      if (consultation?.scan) {
          consultation.scan.imageUrl = decrypt(consultation.scan.imageUrl) ?? 'DECRYPTION_FAILED';
      }
      return NextResponse.json(consultation);
    } catch (error) { 
        logger.error(`Error fetching admin consultation ${id}`, error);
        return NextResponse.json({ error: (error as Error).message }, { status: 403 }); 
    }
}

const updateSchema = z.object({
  status: z.string(),
  notes: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await authMiddleware(request); // Admin check
    logger.info(`Admin consultation PUT request by ${user.id} for consultation ${id}`);
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const consultation = await prisma.consultation.update({
      where: { id },
      data: {
        status: parsed.data.status,
        notes: parsed.data.notes ? encrypt(parsed.data.notes) : undefined,
      },
    });
    return NextResponse.json(consultation);
  } catch (error) { 
    logger.error(`Error updating admin consultation ${id}`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 403 }); 
  }
}