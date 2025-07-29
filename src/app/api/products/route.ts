import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { type: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    logger.error("Failed to fetch product catalog", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}