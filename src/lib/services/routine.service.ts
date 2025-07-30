import { prisma } from "@/lib/db";
import { Prisma, Product, SkinType } from "@prisma/client";
import { logger } from "../logger";

type Tx = Omit<
  Prisma.TransactionClient,
  "$Ґ" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use" | "$extends"
>;

interface RoutineRecommendation {
  productType: string;
  reason: string;
}

// The new intelligent matching engine
const findBestProductMatch = (
  products: Product[],
  productType: string,
  userProfile: { skinType?: SkinType | null; primaryConcern?: string | null },
): Product | null => {
  const candidates = products.filter((p) => p.type === productType);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  let bestMatch = candidates[0];
  let highestScore = -1;

  for (const product of candidates) {
    let score = 0;
    // Score based on tags matching user profile
    if (userProfile.skinType && product.tags.includes(`for-${userProfile.skinType.toLowerCase()}`)) {
      score += 2; // Strong match for skin type
    }
    if (userProfile.primaryConcern && product.tags.includes(userProfile.primaryConcern.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'))) {
      score += 1; // Good match for concern
    }
    // Generic "sensitive" tag match
    if (userProfile.skinType === 'SENSITIVE' && product.tags.includes('for-sensitive-skin')) {
      score += 3; // Very strong match for sensitivity
    }
    // Prefer products with more relevant tags
    score += product.tags.length * 0.1;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = product;
    }
  }

  // If no product scored, it means no specific matches were found.
  // We return the first candidate as a safe default.
  return bestMatch;
};


export async function updateRoutineFromAnalysis(
  tx: Tx,
  userId: string,
  recommendations: { am: RoutineRecommendation[]; pm: RoutineRecommendation[] },
) {
  logger.info(`Updating routine for user: ${userId}`);
  const routine = await tx.routine.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const user = await tx.user.findUnique({ where: { id: userId }});
  if (!user) {
    logger.error(`User with ID ${userId} not found during routine update.`);
    return;
  }

  // Clear existing routine steps
  await tx.routineStep.deleteMany({ where: { routineId: routine.id } });

  const allProducts = await tx.product.findMany();
  const newSteps: Prisma.RoutineStepCreateManyInput[] = [];
  let stepCounter = 1;

  for (const rec of recommendations.am) {
    const product = findBestProductMatch(allProducts, rec.productType, { skinType: user.skinType, primaryConcern: user.primaryConcern });
    if (product) {
      newSteps.push({
        routineId: routine.id,
        productId: product.id,
        stepNumber: stepCounter++,
        timeOfDay: "AM",
        instructions: rec.reason,
      });
    } else {
      logger.warn(`No product match found for type "${rec.productType}" for user ${userId}.`);
    }
  }

  stepCounter = 1; // Reset for PM
  for (const rec of recommendations.pm) {
    const product = findBestProductMatch(allProducts, rec.productType, { skinType: user.skinType, primaryConcern: user.primaryConcern });
    if (product) {
      newSteps.push({
        routineId: routine.id,
        productId: product.id,
        stepNumber: stepCounter++,
        timeOfDay: "PM",
        instructions: rec.reason,
      });
    } else {
        logger.warn(`No product match found for type "${rec.productType}" for user ${userId}.`);
    }
  }

  if (newSteps.length > 0) {
    await tx.routineStep.createMany({ data: newSteps });
  }
  logger.info(
    `Successfully created ${newSteps.length} new routine steps for user ${userId}.`,
  );
}