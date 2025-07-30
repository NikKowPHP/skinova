/** @jest-environment node */
import { GeminiQuestionGenerationService } from "./gemini-service";
import { SkinType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// These tests make real API calls to the Gemini API and will not run if
// the GEMINI_API_KEY environment variable is not set.
// These tests are for verifying the service's interaction with the live API,
// including prompt correctness and response parsing.

const apiKey = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY;
const describeIfApiKey = apiKey ? describe : describe.skip;

describeIfApiKey("GeminiQuestionGenerationService Integration Tests", () => {
  let service: GeminiQuestionGenerationService;
  let imageBuffer: Buffer;

  // Increase timeout for integration tests
  jest.setTimeout(30000);

  beforeAll(() => {
    // We instantiate the service here. It will use the key rotation internally.
    service = new GeminiQuestionGenerationService();

    // Create a tiny, valid JPEG buffer to use for tests.
    // This is a 1x1 black pixel.
    const base64Pixel =
      "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABwn/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdAAr/2Q==";
    imageBuffer = Buffer.from(base64Pixel, "base64");
  });

  it("should analyze a skin scan and return a structured response", async () => {
    const userProfile = {
      skinType: SkinType.OILY,
      primaryConcern: "Acne",
      notes: "Having a breakout on my chin.",
    };

    const result = await service.analyzeSkinScan(imageBuffer, userProfile);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("overallScore");
    expect(typeof result.overallScore).toBe("number");
    expect(result).toHaveProperty("analysisSummary");
    expect(typeof result.analysisSummary).toBe("string");
    expect(result).toHaveProperty("concerns");
    expect(Array.isArray(result.concerns)).toBe(true);
    expect(result).toHaveProperty("routineRecommendations");
    expect(typeof result.routineRecommendations).toBe("object");
  });
});

// A dummy test to ensure the suite doesn't fail if skipped
if (!apiKey) {
  describe("Gemini Integration Test Suite", () => {
    it("skips integration tests because GEMINI_API_KEY is not set", () => {
      console.warn(
        "Skipping Gemini integration tests: GEMINI_API_KEY is not set.",
      );
      expect(true).toBe(true);
    });
  });
}