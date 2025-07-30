import { create } from "zustand";
import type { User } from "@prisma/client";
import type { ScanHistoryItem } from "@/lib/types";
import { useAcceptanceStore } from "./acceptance.store";

export type OnboardingStep =
  | "PROFILE_SETUP"
  | "FIRST_SCAN"
  | "VIEW_ANALYSIS"
  | "COMPLETED"
  | "INACTIVE";

interface OnboardingContext {
  userProfile: User;
  scans: ScanHistoryItem[];
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

    // Do not start the onboarding tour until legal/disclaimers are accepted.
    if (!useAcceptanceStore.getState().isAcceptanceComplete()) {
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
        set({ onboardingScanId: latestScan.id });
        // The final automatic step is viewing the analysis.
        // The user will manually trigger the 'COMPLETED' step from the UI.
        nextStep = "VIEW_ANALYSIS";
      }
    }

    if (nextStep !== "INACTIVE") {
      set({ step: nextStep, isActive: true });
    }
  },
}));