import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  type: z.string().min(1),
  description: z.string().min(1),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await authMiddleware(request); // Admin check
    logger.info(`Admin product PUT request by ${user.id} for product ${id}`);
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json(product);
  } catch (error) { 
    logger.error(`Error updating admin product ${id}`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 403 }); 
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { user } = await authMiddleware(request); // Admin check
    logger.info(`Admin product DELETE request by ${user.id} for product ${id}`);
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) { 
    logger.error(`Error deleting admin product ${id}`, error);
    return NextResponse.json({ error: (error as Error).message }, { status: 403 }); 
  }
}