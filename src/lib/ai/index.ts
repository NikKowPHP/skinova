import { QuestionGenerationService } from "./generation-service";
import { GeminiQuestionGenerationService } from "./gemini-service";

/**
 * Factory function to get the configured question generation service
 * @returns Instance of QuestionGenerationService based on AI_PROVIDER
 * @throws Error if no valid provider is configured
 */
export function getQuestionGenerationService(): QuestionGenerationService {
  const provider = process.env.AI_PROVIDER;

  switch (provider) {
    case "gemini":
      return new GeminiQuestionGenerationService();

    // Add cases for other providers here

    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}