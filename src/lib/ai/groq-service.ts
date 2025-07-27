import { TranslationService } from "./translation-service";
import { executeGroqWithRotation } from "./groq-executor";
import { getGroqTranslationSystemPrompt } from "./prompts/groqTranslation.prompt";
import { logger } from "../logger";

const GROQ_MODEL = "qwen/qwen3-32b";

export class GroqTranslationService implements TranslationService {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<{ translatedText: string; serviceUsed: "groq" }> {
    const systemPrompt = getGroqTranslationSystemPrompt(
      sourceLanguage,
      targetLanguage,
    );

    try {
      const response = await executeGroqWithRotation(async (client) => {
        const payload = {
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.5,
          max_tokens: 2048,
        };
        // The baseURL is already set to the full completions endpoint in the executor
        return await client.post("", payload);
      });

      const translatedText = response.data?.choices?.[0]?.message?.content;

      if (!translatedText) {
        logger.error("Groq response is missing expected content.", {
          response: response.data,
        });
        throw new Error("Invalid response structure from Groq API.");
      }

      return { translatedText: translatedText.trim(), serviceUsed: "groq" };
    } catch (error) {
      logger.error("Error translating text with Groq:", error);
      throw error;
    }
  }
}