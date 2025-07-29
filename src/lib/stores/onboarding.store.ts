import { create } from "zustand";
import type { User, SkinScan, SkinAnalysis } from "@prisma/client";

export type OnboardingStep =
  | "PROFILE_SETUP"
  | "FIRST_SCAN"
  | "VIEW_ANALYSIS"
  | "COMPLETED"
  | "INACTIVE";

interface OnboardingContext {
  userProfile: User;
  scans: (SkinScan & { analysis: SkinAnalysis | null })[];
}

interface OnboardingState {
  step: OnboardingStep;
  isActive: boolean;
  onboardingScanId: string | null;
  setStep: (step: OnboardingStep) => void;
  setOnboardingScanId: (id: string | null) => void;
  resetOnboarding: () => void;
  determineCurrentStep: (context: OnboardingContext) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: "INACTIVE",
  isActive: false,
  onboardingScanId: null,

  setStep: (step) =>
    set((state) => ({
      step,
      isActive: step !== "INACTIVE",
    })),

  setOnboardingScanId: (id) => set({ onboardingScanId: id }),

  resetOnboarding: () =>
    set({ step: "INACTIVE", isActive: false, onboardingScanId: null }),

  determineCurrentStep: (context: OnboardingContext) => {
    const { userProfile, scans } = context;

    if (userProfile.onboardingCompleted) {
      set({ step: "INACTIVE", isActive: false });
      return;
    }

    const profileIsComplete = !!(
      userProfile.skinType && userProfile.primaryConcern
    );
    const hasScans = scans && scans.length > 0;

    let nextStep: OnboardingStep = "INACTIVE";

    if (!profileIsComplete) {
      nextStep = "PROFILE_SETUP";
    } else if (!hasScans) {
      nextStep = "FIRST_SCAN";
    } else {
      const latestScan = scans[0];
      if (latestScan) {
        // Store the latest scan ID for the tour
        set({ onboardingScanId: latestScan.id });
        if (!latestScan.analysis) {
          nextStep = "VIEW_ANALYSIS"; // Waiting for analysis
        } else {
          nextStep = "COMPLETED"; // User has done everything needed for the tour
        }
      }
    }

    if (nextStep !== "INACTIVE") {
      set({ step: nextStep, isActive: true });
    }
  },
}));