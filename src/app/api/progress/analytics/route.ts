import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const analyses = await prisma.skinAnalysis.findMany({
      where: { scan: { userId: user.id } },
      orderBy: { createdAt: "asc" },
      include: { concerns: true },
    });

    if (analyses.length === 0) {
      return NextResponse.json({
        totalScans: 0,
        averageScore: 0,
        topConcern: "N/A",
        progressOverTime: [],
      });
    }

    const totalScans = analyses.length;
    const averageScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / totalScans;
    
    const concernCounts = analyses
      .flatMap(a => a.concerns)
      .reduce((acc, concern) => {
        acc[concern.name] = (acc[concern.name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topConcern = Object.entries(concernCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    
    const progressOverTime = analyses.map(a => ({
      date: a.createdAt.toISOString(),
      score: a.overallScore,
    }));

    return NextResponse.json({
      totalScans,
      averageScore,
      topConcern,
      progressOverTime,
    });
  } catch (error) {
    logger.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}