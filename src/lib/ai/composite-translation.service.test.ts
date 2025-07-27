/** @jest-environment node */
import { CompositeTranslationService } from "./composite-translation.service";
import { CerebrasTranslationService } from "./cerebras-service";
import { GroqTranslationService } from "./groq-service";

// Mock the individual services
jest.mock("./cerebras-service");
jest.mock("./groq-service");

const MockedCerebrasService =
  CerebrasTranslationService as jest.MockedClass<typeof CerebrasTranslationService>;
const MockedGroqService =
  GroqTranslationService as jest.MockedClass<typeof GroqTranslationService>;

describe("CompositeTranslationService", () => {
  let cerebrasTranslateMock: jest.Mock;
  let groqTranslateMock: jest.Mock;
  let service: CompositeTranslationService;

  beforeEach(() => {
    jest.clearAllMocks();

    cerebrasTranslateMock = jest.fn();
    groqTranslateMock = jest.fn();

    MockedCerebrasService.mockImplementation(() => ({
      translate: cerebrasTranslateMock,
    }));

    MockedGroqService.mockImplementation(() => ({
      translate: groqTranslateMock,
    }));

    service = new CompositeTranslationService();
  });

  const translateArgs: [string, string, string] = [
    "Hello",
    "English",
    "Spanish",
  ];

  it("should use the primary (Cerebras) service successfully", async () => {
    cerebrasTranslateMock.mockResolvedValue({
      translatedText: "Hola from Cerebras",
      serviceUsed: "cerebras",
    });

    const result = await service.translate(...translateArgs);

    expect(result.translatedText).toBe("Hola from Cerebras");
    expect(result.serviceUsed).toBe("cerebras");
    expect(cerebrasTranslateMock).toHaveBeenCalledWith(...translateArgs);
    expect(groqTranslateMock).not.toHaveBeenCalled();
  });

  it("should fall back to the Groq service on ANY failure from Cerebras", async () => {
    // Simulate a generic error from Cerebras, as the executor would throw this
    const cerebrasError = new Error("All Cerebras API keys failed.");
    cerebrasTranslateMock.mockRejectedValue(cerebrasError);

    groqTranslateMock.mockResolvedValue({
      translatedText: "Hola from Groq",
      serviceUsed: "groq",
    });

    const result = await service.translate(...translateArgs);

    expect(result.translatedText).toBe("Hola from Groq");
    expect(result.serviceUsed).toBe("groq");
    expect(cerebrasTranslateMock).toHaveBeenCalledWith(...translateArgs);
    expect(groqTranslateMock).toHaveBeenCalledWith(...translateArgs);
  });

  it("should throw an error if the fallback (Groq) service also fails", async () => {
    const cerebrasError = new Error("Cerebras service is down");
    cerebrasTranslateMock.mockRejectedValue(cerebrasError);

    const groqError = new Error("Groq service is also down");
    groqTranslateMock.mockRejectedValue(groqError);

    await expect(service.translate(...translateArgs)).rejects.toThrow(
      "Groq service is also down",
    );

    expect(cerebrasTranslateMock).toHaveBeenCalledWith(...translateArgs);
    expect(groqTranslateMock).toHaveBeenCalledWith(...translateArgs);
  });
});