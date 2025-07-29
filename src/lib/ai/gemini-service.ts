import { QuestionGenerationService } from "./generation-service";
import { executeGeminiWithRotation } from "./gemini-executor";
import { logger } from "../logger";
import { getSkinAnalysisPrompt } from "./prompts/skinAnalysis.prompt";
import { SkinType } from "@prisma/client";

const GEMINI_MODELS = { gemini_2_5_flash : 'gemini-2.5-flash'}

export class GeminiQuestionGenerationService
  implements QuestionGenerationService
{
  private model: string = GEMINI_MODELS.gemini_2_5_flash;
  private jsonConfig = {
    responseMimeType: "application/json",
  };

  constructor() {}

  async analyzeSkinScan(
    imageBuffer: Buffer,
    userProfile: { skinType: SkinType; primaryConcern: string; notes?: string | null }
  ): Promise<any> {
    const prompt = getSkinAnalysisPrompt(userProfile.skinType, userProfile.primaryConcern, userProfile.notes);
    
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg", // Assuming JPEG for now
      },
    };

    try {
      const result = await executeGeminiWithRotation((client) =>
        client.models.generateContent({
          model: "gemini-1.5-flash", // Use a multi-modal capable model
          config: this.jsonConfig,
          contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
        }),
      );
      
      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API for skin scan analysis");
      }
      const cleanedText = this.cleanJsonString(text);
      return JSON.parse(cleanedText);
    } catch (error) {
      logger.error("Error analyzing skin scan with Gemini:", error);
      throw error;
    }
  }

  private cleanJsonString(text: string): string {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    return cleaned.trim();
  }
}