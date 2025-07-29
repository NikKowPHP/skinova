import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  type: z.string().min(1),
  description: z.string().min(1),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authMiddleware(request); // Admin check
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const product = await prisma.product.update({
      where: { id: params.id },
      data: parsed.data,
    });
    return NextResponse.json(product);
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authMiddleware(request); // Admin check
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
}