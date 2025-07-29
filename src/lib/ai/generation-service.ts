import { SkinType } from "@prisma/client";

/**
 * Interface defining the contract for AI question generation services
 */
export interface QuestionGenerationService {
  /**
   * Analyzes a skin scan image and returns structured data.
   * @param imageBuffer The image file as a Buffer.
   * @param userProfile The user's skin profile for context.
   * @returns A promise that resolves to the parsed JSON analysis from the AI.
   */
  analyzeSkinScan(
    imageBuffer: Buffer,
    userProfile: { skinType: SkinType; primaryConcern: string; notes?: string | null }
  ): Promise<any>;
}