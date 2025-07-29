import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authMiddleware } from "@/lib/auth";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    await authMiddleware(request); // Admin check
    const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(products);
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
}

const productSchema = z.object({
  name: z.string().min(1),
  brand: z.string().optional(),
  type: z.string().min(1),
  description: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await authMiddleware(request); // Admin check
    const body = await request.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json(product, { status: 201 });
  } catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 403 }); }
}