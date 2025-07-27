export interface TranslationService {
  translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    userId?: string, // Add optional userId for logging purposes
  ): Promise<{
    translatedText: string;
    serviceUsed: "cerebras" | "groq";
  }>;
}