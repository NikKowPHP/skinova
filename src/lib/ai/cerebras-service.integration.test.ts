/** @jest-environment node */
import { CerebrasTranslationService } from "./cerebras-service";

// These tests make real API calls to the Cerebras API and will not run if
// the CEREBRAS_API_KEY or CEREBRAS_API_KEY_1 environment variable is not set.
const apiKey = process.env.CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY_1;
const describeIfApiKey = apiKey ? describe : describe.skip;

describeIfApiKey("CerebrasTranslationService Integration Tests", () => {
  let service: CerebrasTranslationService;

  // Increase timeout for integration tests
  jest.setTimeout(30000);

  beforeAll(() => {
    service = new CerebrasTranslationService();
  });

  it("should translate text correctly from English to Spanish", async () => {
    const result = await service.translate("Hello", "English", "Spanish");
    expect(result).toHaveProperty("translatedText");
    expect(result).toHaveProperty("serviceUsed", "cerebras");
    expect(result.translatedText.toLowerCase()).toContain("hola");
  });
});

// A dummy test to ensure the suite doesn't fail if skipped
if (!apiKey) {
  describe("Cerebras Integration Test Suite", () => {
    it("skips integration tests because CEREBRAS_API_KEY is not set", () => {
      console.warn(
        "Skipping Cerebras integration tests: CEREBRAS_API_KEY is not set.",
      );
      expect(true).toBe(true);
    });
  });
}