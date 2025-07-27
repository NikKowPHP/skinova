
/** @jest-environment node */
import { GeminiQuestionGenerationService } from "./gemini-service";

// These tests make real API calls to the Gemini API and will not run if
// the GEMINI_API_KEY environment variable is not set.
// These tests are for verifying the service's interaction with the live API,
// including prompt correctness and response parsing.

const apiKey = process.env.GEMINI_API_KEY;
const describeIfApiKey = apiKey ? describe : describe.skip;

describeIfApiKey("GeminiQuestionGenerationService Integration Tests", () => {
  let service: GeminiQuestionGenerationService;

  // Increase timeout for integration tests
  jest.setTimeout(30000);

  beforeAll(() => {
    // We instantiate the service here. It will use the key rotation internally.
    service = new GeminiQuestionGenerationService();
  });

  it("should translate text correctly", async () => {
    const result = await service.translateText("Hello", "English", "Spanish");
    expect(result.toLowerCase()).toContain("hola");
  });

  it("should analyze a journal entry and return a structured response", async () => {
    const journalContent = "I go to the beach. It was fun. I see a dog.";
    const result = await service.analyzeJournalEntry(
      journalContent,
      "English",
      50,
      "Spanish",
    );

    expect(result).toBeDefined();
    expect(result).toHaveProperty("grammarScore");
    expect(typeof result.grammarScore).toBe("number");
    expect(result).toHaveProperty("phrasingScore");
    expect(typeof result.phrasingScore).toBe("number");
    expect(result).toHaveProperty("vocabularyScore");
    expect(typeof result.vocabularyScore).toBe("number");
    expect(result).toHaveProperty("feedback");
    expect(typeof result.feedback).toBe("string");
    expect(result).toHaveProperty("mistakes");
    expect(Array.isArray(result.mistakes)).toBe(true);
  });

  it("should generate a title for a journal entry", async () => {
    const journalContent =
      "Today I went to the park and played with my dog. The weather was sunny and I felt very happy.";
    const title = await service.generateTitleForEntry(journalContent);

    expect(title).toBeDefined();
    expect(typeof title).toBe("string");
    expect(title.length).toBeGreaterThan(5);
    expect(title.length).toBeLessThan(100);
  });

  it("should provide suggestions for a stuck writer", async () => {
    const context = {
      topic: "My favorite food",
      currentText: "I really like to eat pizza.",
      targetLanguage: "English",
    };
    const result = await service.generateStuckWriterSuggestions(context);

    expect(result).toBeDefined();
    expect(result).toHaveProperty("suggestions");
    expect(Array.isArray(result.suggestions)).toBe(true);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it("should generate questions", async () => {
    const context = {
      role: "Junior React Developer",
      difficulty: "Easy",
      count: 1,
    };
    const result = await service.generateQuestions(context);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
    const question = result[0];
    expect(question).toHaveProperty("question");
    expect(typeof question.question).toBe("string");
    expect(question).toHaveProperty("ideal_answer_summary");
    expect(typeof question.ideal_answer_summary).toBe("string");
    expect(question).toHaveProperty("topics");
    expect(Array.isArray(question.topics)).toBe(true);
  });



  it("should evaluate an answer", async () => {
    const context = {
      question: "What is a closure in JavaScript?",
      userAnswer: "A function that remembers its outer variables.",
      idealAnswerSummary:
        "A closure is a function having access to the parent scope, even after the parent function has closed.",
    };
    const result = await service.evaluateAnswer(context);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("score");
    expect(typeof result.score).toBe("number");
    expect(result).toHaveProperty("feedbackSummary");
    expect(typeof result.feedbackSummary).toBe("string");
    expect(result).toHaveProperty("evaluation");
    expect(typeof result.evaluation.accuracy).toBe("string");
    expect(result).toHaveProperty("refinedExampleAnswer");
    expect(typeof result.refinedExampleAnswer).toBe("string");
  });

  it("should generate journaling aids", async () => {
    const context = {
      topic: "My favorite season",
      targetLanguage: "Spanish",
      proficiency: 40,
    };
    const result = await service.generateJournalingAids(context);
    expect(result).toBeDefined();
    expect(result).toHaveProperty("sentenceStarter");
    expect(typeof result.sentenceStarter).toBe("string");
    expect(result).toHaveProperty("suggestedVocab");
    expect(Array.isArray(result.suggestedVocab)).toBe(true);
  });

  it("should generate topics", async () => {
    const context = {
      targetLanguage: "French",
      proficiency: 60,
      count: 3,
    };
    const result = await service.generateTopics(context);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
    expect(typeof result[0]).toBe("string");
  });

  it("should translate and breakdown a paragraph", async () => {
    const text = "I went to the store to buy some bread. It was a sunny day.";
    const sourceLang = "English";
    const targetLang = "Spanish";
    const result = await service.translateAndBreakdown(
      text,
      sourceLang,
      targetLang,
      "English",
    );
    expect(result).toBeDefined();
    expect(result).toHaveProperty("fullTranslation");
    expect(typeof result.fullTranslation).toBe("string");
    expect(result).toHaveProperty("segments");
    expect(Array.isArray(result.segments)).toBe(true);
    if (result.segments.length > 0) {
      const segment = result.segments[0];
      expect(segment).toHaveProperty("source");
      expect(segment).toHaveProperty("translation");
      expect(segment).toHaveProperty("explanation");
    }
  });

  it("should get a sentence completion", async () => {
    const text = "The weather is very nice so I think I will go to the";
    const result = await service.getSentenceCompletion(text);
    expect(typeof result).toBe("string");
  });
});

// A dummy test to ensure the suite doesn't fail if skipped
if (!process.env.GEMINI_API_KEY) {
  describe("Gemini Integration Test Suite", () => {
    it("skips integration tests because GEMINI_API_KEY is not set", () => {
      console.warn(
        "Skipping Gemini integration tests: GEMINI_API_KEY is not set.",
      );
      expect(true).toBe(true);
    });
  });
}