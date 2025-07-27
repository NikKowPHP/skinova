/** @jest-environment node */
import { GroqTranslationService } from "./groq-service";

// These tests make real API calls to the Groq API and will not run if
// the GROQ_API_KEY or GROQ_API_KEY_1 environment variable is not set.
const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_1;
const describeIfApiKey = apiKey ? describe : describe.skip;

describeIfApiKey("GroqTranslationService Integration Tests", () => {
  let service: GroqTranslationService;

  // Increase timeout for integration tests
  jest.setTimeout(30000);

  beforeAll(() => {
    service = new GroqTranslationService();
  });

  it("should translate text correctly from English to Spanish", async () => {
    const result = await service.translate("Hello", "English", "Spanish");
    expect(result).toHaveProperty("translatedText");
    expect(result).toHaveProperty("serviceUsed", "groq");
    expect(result.translatedText.toLowerCase()).toContain("hola");
  });
});

// A dummy test to ensure the suite doesn't fail if skipped
if (!apiKey) {
  describe("Groq Integration Test Suite", () => {
    it("skips integration tests because GROQ_API_KEY is not set", () => {
      console.warn(
        "Skipping Groq integration tests: GROQ_API_KEY is not set.",
      );
      expect(true).toBe(true);
    });
  });
}