import { TranslationService } from "./translation-service";
import { executeCerebrasWithRotation } from "./cerebras-executor";
import { getCerebrasTranslationSystemPrompt } from "./prompts/cerebrasTranslation.prompt";
import { logger } from "../logger";

const CEREBRAS_MODEL = "qwen-3-32b";

export class CerebrasTranslationService implements TranslationService {
  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<{ translatedText: string; serviceUsed: "cerebras" }> {
    const systemPrompt = getCerebrasTranslationSystemPrompt(
      sourceLanguage,
      targetLanguage,
    );

    try {
      const response = await executeCerebrasWithRotation(async (client) => {
        const payload = {
          model: CEREBRAS_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
          temperature: 0.5,
          max_tokens: 2048,
          stream: false,
          top_p: 0.9,
          response_format: { type: "json_object" },
        };
        logger.info("Sending translation request to Cerebras API", payload);
        // The baseURL is already set to the full completions endpoint in the executor
        return await client.post("", payload);
      });

      const rawContent = response.data?.choices?.[0]?.message?.content;
      logger.info(
        "Received translation response from Cerebras API",
        response.data.choices?.[0]?.message,
      );
      if (!rawContent) {
        logger.error("Cerebras response is missing expected content.", {
          response: response.data,
        });
        throw new Error("Invalid response structure from Cerebras API.");
      }

      // The model sometimes wraps its response in <think> tags. We remove them.
      const cleanedContent = rawContent
        .replace(/<think>[\s\S]*?<\/think>/, "")
        .trim();

      try {
        const parsed = JSON.parse(cleanedContent);
        const translatedText = parsed.translation;

        if (typeof translatedText !== "string") {
          logger.error(
            "Cerebras JSON response is missing 'translation' field or it is not a string.",
            {
              parsedResponse: parsed,
            },
          );
          throw new Error("Invalid JSON structure from Cerebras API.");
        }

        return { translatedText: translatedText.trim(), serviceUsed: "cerebras" };
      } catch (e) {
        logger.error("Failed to parse Cerebras response as JSON.", {
          rawResponse: cleanedContent,
          error: e,
        });
        throw new Error("Cerebras API returned malformed JSON.");
      }
    } catch (error) {
      logger.error("Error translating text with Cerebras:", error);
      throw error;
    }
  }
}