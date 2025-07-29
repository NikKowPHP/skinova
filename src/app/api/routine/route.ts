import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

// GET Handler for fetching the user's routine
export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const routine = await prisma.routine.findUnique({
        where: { userId: user.id },
        include: { steps: { include: { product: true }, orderBy: { stepNumber: 'asc' } } },
    });

    if (!routine) return NextResponse.json({ error: "Routine not found" }, { status: 404 });

    return NextResponse.json(routine);
}

// PUT Handler for updating the routine
const routineStepSchema = z.object({
    productId: z.string(),
    stepNumber: z.number().int(),
    timeOfDay: z.enum(["AM", "PM"]),
    instructions: z.string(),
});
const updateRoutineSchema = z.object({
    steps: z.array(routineStepSchema),
});

export async function PUT(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const parsed = updateRoutineSchema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

        const { steps } = parsed.data;

        const updatedRoutine = await prisma.$transaction(async (tx) => {
            const routine = await tx.routine.findUnique({ where: { userId: user.id } });
            if (!routine) throw new Error("Routine not found for user");

            await tx.routineStep.deleteMany({ where: { routineId: routine.id } });

            if (steps.length > 0) {
                await tx.routineStep.createMany({
                    data: steps.map(step => ({ ...step, routineId: routine.id })),
                });
            }

            return tx.routine.findUnique({
                where: { userId: user.id },
                include: { steps: { include: { product: true } } },
            });
        });

        return NextResponse.json(updatedRoutine);
    } catch (error) {
        logger.error("/api/routine - PUT failed", error);
        return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
    }
}