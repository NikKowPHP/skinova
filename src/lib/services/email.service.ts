import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { logger } from "../logger";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendScanReminderEmail(userId: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user || !user.email) {
      logger.warn(`Could not find user or email for ID: ${userId} to send reminder.`);
      return;
    }

    const emailHtml = `
      <h1>It's Time for Your Weekly Skin Check-in!</h1>
      <p>Hello,</p>
      <p>Just a friendly reminder to perform your weekly skin scan. Consistent tracking is the key to understanding your progress and achieving your skin goals.</p>
      <p><a href="${process.env.NEXT_PUBLIC_API_URL}/scan">Scan Now</a></p>
      <p>The Skinova Team</p>
    `;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Skinova <noreply@skinova.app>",
      to: user.email,
      subject: "Your Weekly Skin Scan Reminder",
      html: emailHtml,
    });

    logger.info(`Scan reminder sent to ${user.email}`);
  } catch (error) {
    logger.error(`Error sending scan reminder for user ${userId}:`, error);
  }
}