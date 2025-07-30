/** @jest-environment node */
import { GeminiQuestionGenerationService } from "./gemini-service";
import * as keyProvider from "./gemini-key-provider";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../utils/withRetry";
import { SkinType } from "@prisma/client";

// Mock the entire @google/genai library
jest.mock("@google/genai");

// Mock our key provider module
jest.mock("./gemini-key-provider");

// Mock the withRetry utility to prevent delays and multiple attempts in this test suite
jest.mock("../utils/withRetry", () => ({
  withRetry: jest.fn((fn) => fn()),
}));

const mockedGoogleGenAI = GoogleGenAI as jest.Mock;
const mockedKeyProvider = keyProvider as jest.Mocked<typeof keyProvider>;

// Mock implementation for the generateContent method
const mockGenerateContent = jest.fn();
const mockUploadFile = jest.fn().mockResolvedValue({
  name: "files/temp-file",
  uri: "file://temp",
  mimeType: "image/jpeg",
});
const mockDeleteFile = jest.fn();

// Mock the file system to avoid actual file I/O, while preserving other fs functions
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  promises: {
    ...jest.requireActual("fs").promises,
    writeFile: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("GeminiQuestionGenerationService with Key Rotation", () => {
  let service: GeminiQuestionGenerationService;
  const mockImageBuffer = Buffer.from("test-image");
  const mockUserProfile = {
    skinType: SkinType.NORMAL,
    primaryConcern: "Acne",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (withRetry as jest.Mock).mockImplementation((fn) => fn());

    // Mock the constructor and method chain for GoogleGenAI
    mockedGoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
      files: {
        upload: mockUploadFile,
        delete: mockDeleteFile,
      },
    }));

    service = new GeminiQuestionGenerationService();
  });

  it("should succeed on the first key if it is valid", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["valid-key-1"]);
    mockGenerateContent.mockResolvedValue({
      text: '{"overallScore": 90}',
    });

    const result = await service.analyzeSkinScan(
      mockImageBuffer,
      mockUserProfile,
    );

    expect(result.overallScore).toBe(90);
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockDeleteFile).toHaveBeenCalledWith({ name: "files/temp-file" });
  });

  it("should failover to another key if one is rate-limited (429)", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue([
      "rate-limited-key",
      "valid-key-2",
    ]);

    // First call fails with a 429-like error, second call succeeds
    mockGenerateContent
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValueOnce({
        text: '{"overallScore": 85}',
      });

    const result = await service.analyzeSkinScan(
      mockImageBuffer,
      mockUserProfile,
    );

    expect(result.overallScore).toBe(85);
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    // Verify that GoogleGenAI was instantiated twice (once for each key attempt)
    expect(mockedGoogleGenAI).toHaveBeenCalledTimes(2);
    expect(mockDeleteFile).toHaveBeenCalledTimes(2);
  });

  it("should throw an error if all keys fail", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["key1", "key2"]);

    mockGenerateContent.mockRejectedValue(new Error("API key not valid"));

    await expect(
      service.analyzeSkinScan(mockImageBuffer, mockUserProfile),
    ).rejects.toThrow(
      "All Gemini API keys failed. Last error: API key not valid",
    );

    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("should throw immediately for non-rotation errors", async () => {
    mockedKeyProvider.getAllKeys.mockReturnValue(["key1", "key2"]);

    const nonRotationError = new Error("Invalid request");
    mockGenerateContent.mockRejectedValue(nonRotationError);

    await expect(
      service.analyzeSkinScan(mockImageBuffer, mockUserProfile),
    ).rejects.toThrow("Invalid request");

    // It should only try once
    expect(mockedKeyProvider.getAllKeys).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});