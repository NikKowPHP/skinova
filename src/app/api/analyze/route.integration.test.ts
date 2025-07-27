/** @jest-environment node */
import { POST } from "./route";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { getQuestionGenerationService } from "@/lib/ai";
import { decrypt } from "@/lib/encryption";

// Mock dependencies
jest.mock("@/lib/supabase/server");
jest.mock("@/lib/db", () => ({
  __esModule: true,
  prisma: {
    user: { findUnique: jest.fn() },
    journalEntry: { findFirst: jest.fn() },
    languageProfile: { findUnique: jest.fn(), upsert: jest.fn() },
    analysis: { create: jest.fn(), findMany: jest.fn() },
    topic: { update: jest.fn() },
  },
}));
jest.mock("@/lib/ai");
jest.mock("@/lib/encryption", () => ({
  ...jest.requireActual("@/lib/encryption"),
  decrypt: jest.fn((text) => text), // Mock decrypt to pass through the value
}));

const mockedCreateClient = createClient as jest.Mock;
const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedGetQGS = getQuestionGenerationService as jest.Mock;

describe("API Route: /api/analyze", () => {
  const mockUser = { id: "user-123" };
  const mockAnalyzeJournalEntry = jest.fn();

  const createMockRequest = (body: any) =>
    new NextRequest("http://localhost/api/analyze", {
      method: "POST",
      body: JSON.stringify(body),
    });

  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    });
    mockedGetQGS.mockReturnValue({
      analyzeJournalEntry: mockAnalyzeJournalEntry,
      generateTitleForEntry: jest.fn().mockResolvedValue("AI-Generated Title"),
    });
    // Default mocks for prisma calls
    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      nativeLanguage: "english",
    });
    (mockedPrisma.languageProfile.findUnique as jest.Mock).mockResolvedValue({
      aiAssessedProficiency: 50,
    });
    (mockedPrisma.analysis.create as jest.Mock).mockResolvedValue({ id: "new-analysis" });
    (mockedPrisma.analysis.findMany as jest.Mock).mockResolvedValue([]);
    mockAnalyzeJournalEntry.mockResolvedValue({
      grammarScore: 80,
      phrasingScore: 85,
      vocabularyScore: 90,
      feedback: "Good job",
      mistakes: [],
      highlights: [],
      overallSummary: "A great summary.",
      strengths: [{ type: "vocabulary", text: "good word", explanation: "it was good" }],
    });
  });

  it("should pass aidsUsage data to the AI service if it exists on the journal entry", async () => {
    // Arrange
    const aidsUsage = [
      {
        type: "translator_dialog_apply",
        details: { text: "hola", timestamp: new Date().toISOString() },
      },
    ];
    (mockedPrisma.journalEntry.findFirst as jest.Mock).mockResolvedValue({
      id: "journal-1",
      authorId: mockUser.id,
      content: "Encrypted content here...",
      targetLanguage: "spanish",
      analysis: null,
      aidsUsage: aidsUsage, // The data we want to test
      topic: { title: "My Day" },
    });

    const request = createMockRequest({ journalId: "journal-1" });

    // Act
    const response = await POST(request);
    await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(mockAnalyzeJournalEntry).toHaveBeenCalledTimes(1);
    expect(mockAnalyzeJournalEntry).toHaveBeenCalledWith(
      "Encrypted content here...", // Decrypt is mocked to pass through
      "spanish",
      50,
      "english",
      aidsUsage, // This is the key assertion
    );
  });

  it("should pass null for aidsUsage to the AI service if it does not exist", async () => {
    // Arrange
    (mockedPrisma.journalEntry.findFirst as jest.Mock).mockResolvedValue({
      id: "journal-2",
      authorId: mockUser.id,
      content: "Encrypted content here...",
      targetLanguage: "spanish",
      analysis: null,
      aidsUsage: null, // No aid data
      topic: { title: "My Day" },
    });

    const request = createMockRequest({ journalId: "journal-2" });

    // Act
    const response = await POST(request);
    await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(mockAnalyzeJournalEntry).toHaveBeenCalledTimes(1);
    expect(mockAnalyzeJournalEntry).toHaveBeenCalledWith(
      "Encrypted content here...",
      "spanish",
      50,
      "english",
      null, // This is the key assertion
    );
  });
});