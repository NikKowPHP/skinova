import { QuestionGenerationService } from "./generation-service";
import { executeGeminiWithRotation } from "./gemini-executor";
import { logger } from "../logger";
import { getSkinAnalysisPrompt } from "./prompts/skinAnalysis.prompt";
import { SkinType } from "@prisma/client";
import * as crypto from "crypto";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { Part } from "@google/genai";

export class GeminiQuestionGenerationService
  implements QuestionGenerationService
{
  private model: string = "gemini-2.5-flash"; // Use multi-modal capable model
  private jsonConfig = {
    responseMimeType: "application/json",
  };

  constructor() {}

  async analyzeSkinScan(
    imageBuffer: Buffer,
    userProfile: {
      skinType: SkinType;
      primaryConcern: string;
      notes?: string | null;
    },
  ): Promise<any> {
    const prompt = getSkinAnalysisPrompt(
      userProfile.skinType,
      userProfile.primaryConcern,
      userProfile.notes,
    );

    const tempFileName = `${crypto.randomBytes(16).toString("hex")}.jpeg`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
      await fs.promises.writeFile(tempFilePath, imageBuffer);

      const result = await executeGeminiWithRotation(async (client) => {
        let uploadedFileResponse: any;
        try {
          uploadedFileResponse = await client.files.upload({
            file: tempFilePath,
            config: { mimeType: "image/jpeg" },
          });

          const imagePart: Part = {
            fileData: {
              mimeType: uploadedFileResponse.mimeType!,
              fileUri: uploadedFileResponse.uri!,
            },
          };

          return await client.models.generateContent({
            model: this.model,
            config: this.jsonConfig,
            contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
          });
        } finally {
          if (uploadedFileResponse?.name) {
            await client.files
              .delete({ name: uploadedFileResponse.name })
              .catch((e) =>
                logger.error(
                  `Non-critical failure to delete Gemini temp file ${uploadedFileResponse.name}`,
                  e,
                ),
              );
          }
        }
      });

      const text = result.text;
      if (!text) {
        throw new Error("Empty response from Gemini API for skin scan analysis");
      }
      const cleanedText = this.cleanJsonString(text);
      return JSON.parse(cleanedText);
    } catch (error) {
      logger.error("Error analyzing skin scan with Gemini:", {
        err: error,
        userProfile,
      });
      if (error instanceof Error && error.message.includes("JSON")) {
        logger.warn(
       
          "Gemini response for analyzeSkinScan was not valid JSON.",
        );
      }
      throw error;
    } finally {
      try {
        await fs.promises.unlink(tempFilePath);
      } catch (unlinkError) {
        logger.warn(
          `Failed to unlink temporary file: ${tempFilePath}`,
          unlinkError,
        );
      }
    }
  }

  private cleanJsonString(text: string): string {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    return cleaned.trim();
  }
}