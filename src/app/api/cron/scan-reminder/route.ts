import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendScanReminderEmail } from "@/lib/services/email.service";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const usersToRemind = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
        onboardingCompleted: true,
        scans: {
          none: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      select: { id: true },
    });

    if (usersToRemind.length === 0) {
      logger.info("Cron job: No users to remind today.");
      return NextResponse.json({ message: "No users to remind." });
    }

    logger.info(`Cron job: Found ${usersToRemind.length} users to remind.`);
    
    await Promise.all(
      usersToRemind.map(user => sendScanReminderEmail(user.id))
    );

    return NextResponse.json({
      message: `Successfully sent reminders to ${usersToRemind.length} users.`,
    });

  } catch (error) {
    logger.error("Error in scan reminder cron job:", error);
    return NextResponse.json({ error: "Failed to process scan reminders" }, { status: 500 });
  }
}