import type { SkinScan, SkinAnalysis, IdentifiedConcern, Routine, RoutineStep, Product, Consultation, User, SkinType } from "@prisma/client";

// API Payloads
export type OnboardingData = {
  skinType: SkinType;
  primaryConcern: string;
};

export type ProfileUpdateData = Partial<OnboardingData>;

// API Responses with Relations
export type ScanWithAnalysis = SkinScan & {
    analysis: (SkinAnalysis & {
        concerns: IdentifiedConcern[];
    }) | null;
};

export type RoutineWithStepsAndProducts = Routine & {
    steps: (RoutineStep & {
        product: Product;
    })[];
};

export type ProgressAnalyticsData = {
    totalScans: number;
    averageScore: number;
    topConcern: string;
    progressOverTime: { date: string; score: number }[];
};