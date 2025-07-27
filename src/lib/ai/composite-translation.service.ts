import { TranslationService } from "./translation-service";
import { CerebrasTranslationService } from "./cerebras-service";
import { GroqTranslationService } from "./groq-service";
import { logger } from "../logger";

export class CompositeTranslationService implements TranslationService {
  private cerebrasService: CerebrasTranslationService;
  private groqService: GroqTranslationService;

  constructor() {
    this.cerebrasService = new CerebrasTranslationService();
    this.groqService = new GroqTranslationService();
  }

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId?: string,
  ): Promise<{ translatedText: string; serviceUsed: "cerebras" | "groq" }> {
    try {
      // Attempt to translate with the primary service (Cerebras)
      return await this.cerebrasService.translate(
        text,
        sourceLanguage,
        targetLanguage,
      );
    } catch (error) {
      logger.warn(
        "Primary translation service (Cerebras) failed. Falling back to Groq service.",
        {
          originalError: error instanceof Error ? error.message : String(error),
          userId,
        },
      );
      // Fallback to the secondary service (Groq) on any failure from the primary.
      return await this.groqService.translate(
        text,
        sourceLanguage,
        targetLanguage,
      );
    }
  }
}