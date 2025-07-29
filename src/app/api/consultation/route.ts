import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { decrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  logger.info(`Fetching consultations for user ${user.id}`);
  try {
    const consultations = await prisma.consultation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { scan: { select: { id: true, createdAt: true } } }
    });

    const decryptedConsultations = consultations.map(c => {
        if(c.notes) {
            c.notes = decrypt(c.notes) ?? "[Notes could not be decrypted]";
        }
        return c;
    });

    return NextResponse.json(decryptedConsultations);
  } catch(error) {
    logger.error(`Failed to fetch consultations for user ${user.id}`, error);
    return NextResponse.json({ error: "Could not retrieve consultation history." }, { status: 500 });
  }
}