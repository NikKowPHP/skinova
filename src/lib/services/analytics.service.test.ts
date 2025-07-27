

/** @jest-environment node */

import { getAnalyticsData } from "./analytics.service";
import { prisma } from "@/lib/db";

// Mock the prisma client
jest.mock("@/lib/db", () => ({
  __esModule: true,
  prisma: {
    analysis: { findMany: jest.fn() },
    languageProfile: { findUnique: jest.fn() },
    journalEntry: { findMany: jest.fn() },
  },
}));

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const userId = "test-user";
const targetLanguage = "spanish";

describe("AnalyticsService: getAnalyticsData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the default response when a user has no analyses", async () => {
    (mockedPrisma.analysis.findMany as jest.Mock).mockResolvedValue([]);
    (mockedPrisma.languageProfile.findUnique as jest.Mock).mockResolvedValue(null);
    (mockedPrisma.journalEntry.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getAnalyticsData(userId, targetLanguage);

    expect(result.totalEntries).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.weakestSkill).toBe("N/A");
    expect(result.predictedProficiencyOverTime).toEqual([]);
  });

  it("should calculate aggregates and historical data correctly for a user with analyses", async () => {
    const mockAnalyses = [
      { id: "1", createdAt: new Date("2023-01-01"), grammarScore: 50, phrasingScore: 60, vocabScore: 70 },
      { id: "2", createdAt: new Date("2023-01-02"), grammarScore: 55, phrasingScore: 65, vocabScore: 75 },
    ];
    (mockedPrisma.analysis.findMany as jest.Mock).mockResolvedValue(mockAnalyses as any);
    (mockedPrisma.languageProfile.findUnique as jest.Mock).mockResolvedValue({ aiAssessedProficiency: 65.0 } as any);
    (mockedPrisma.journalEntry.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getAnalyticsData(userId, targetLanguage);

    expect(result.totalEntries).toBe(2);
    expect(result.averageScore).toBe(65.0);
    expect(result.weakestSkill).toBe("grammar"); // (50+55)/2 = 52.5 is the lowest
    expect(result.proficiencyOverTime.length).toBe(2);
    expect(result.proficiencyOverTime[0].score).toBeCloseTo(60);
  });

  it("should not generate predictions if there are fewer than 7 entries", async () => {
    const mockAnalyses = [
      { id: "1", createdAt: new Date("2023-01-01"), grammarScore: 50, phrasingScore: 60, vocabScore: 70 },
      { id: "2", createdAt: new Date("2023-01-02"), grammarScore: 55, phrasingScore: 65, vocabScore: 75 },
    ];
    (mockedPrisma.analysis.findMany as jest.Mock).mockResolvedValue(mockAnalyses as any);
    (mockedPrisma.languageProfile.findUnique as jest.Mock).mockResolvedValue({ aiAssessedProficiency: 65.0 } as any);
    (mockedPrisma.journalEntry.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getAnalyticsData(userId, targetLanguage);

    expect(result.predictedProficiencyOverTime).toEqual([]);
    expect(result.predictedSubskillProficiencyOverTime).toEqual([]);
  });

  it("should generate predictions when there are 7 or more entries", async () => {
    const mockAnalyses = [
      { id: "1", createdAt: new Date("2023-01-01"), grammarScore: 50, phrasingScore: 60, vocabScore: 70 },
      { id: "2", createdAt: new Date("2023-01-02"), grammarScore: 55, phrasingScore: 65, vocabScore: 75 },
      { id: "3", createdAt: new Date("2023-01-03"), grammarScore: 60, phrasingScore: 70, vocabScore: 80 },
      { id: "4", createdAt: new Date("2023-01-04"), grammarScore: 62, phrasingScore: 72, vocabScore: 82 },
      { id: "5", createdAt: new Date("2023-01-05"), grammarScore: 64, phrasingScore: 74, vocabScore: 84 },
      { id: "6", createdAt: new Date("2023-01-06"), grammarScore: 66, phrasingScore: 76, vocabScore: 86 },
      { id: "7", createdAt: new Date("2023-01-07"), grammarScore: 68, phrasingScore: 78, vocabScore: 88 },
    ];
    (mockedPrisma.analysis.findMany as jest.Mock).mockResolvedValue(mockAnalyses as any);
    (mockedPrisma.languageProfile.findUnique as jest.Mock).mockResolvedValue({ aiAssessedProficiency: 70.0 } as any);
    (mockedPrisma.journalEntry.findMany as jest.Mock).mockResolvedValue([]);

    const result = await getAnalyticsData(userId, targetLanguage);

    expect(result.predictedProficiencyOverTime.length).toBe(30);
    expect(result.predictedSubskillProficiencyOverTime.length).toBe(30);
    // Check if the prediction starts around the last actual score
    const lastActualScore = (68 + 78 + 88) / 3;
    expect(result.predictedProficiencyOverTime[0].score).toBeGreaterThan(lastActualScore - 1);
  });
});