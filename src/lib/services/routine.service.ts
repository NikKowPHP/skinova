import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { logger } from "../logger";

type Tx = Omit<Prisma.TransactionClient, "$Ґ" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use" | "$extends">;

interface RoutineRecommendation {
  productType: string;
  reason: string;
}

export async function updateRoutineFromAnalysis(
  tx: Tx,
  userId: string,
  recommendations: { am: RoutineRecommendation[]; pm: RoutineRecommendation[] }
) {
  logger.info(`Updating routine for user: ${userId}`);
  const routine = await tx.routine.findUnique({ where: { userId } });
  if (!routine) throw new Error(`Routine not found for user ${userId}`);

  // Clear existing routine steps
  await tx.routineStep.deleteMany({ where: { routineId: routine.id } });

  const allProducts = await tx.product.findMany();
  const newSteps: Prisma.RoutineStepCreateManyInput[] = [];
  let stepCounter = 1;

  for (const rec of recommendations.am) {
    const product = allProducts.find(p => p.type === rec.productType);
    if (product) {
      newSteps.push({
        routineId: routine.id,
        productId: product.id,
        stepNumber: stepCounter++,
        timeOfDay: "AM",
        instructions: rec.reason,
      });
    }
  }
  
  stepCounter = 1; // Reset for PM
  for (const rec of recommendations.pm) {
    const product = allProducts.find(p => p.type === rec.productType);
    if (product) {
      newSteps.push({
        routineId: routine.id,
        productId: product.id,
        stepNumber: stepCounter++,
        timeOfDay: "PM",
        instructions: rec.reason,
      });
    }
  }
  
  if (newSteps.length > 0) {
    await tx.routineStep.createMany({ data: newSteps });
  }
  logger.info(`Successfully created ${newSteps.length} new routine steps for user ${userId}.`);
}