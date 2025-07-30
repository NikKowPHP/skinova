/** @jest-environment jsdom */
import { useOnboardingStore } from "./onboarding.store";
import { SkinType } from "@prisma/client";

// A helper function to create a mock user profile
const createMockProfile = (overrides: any = {}) => ({
  id: "user-1",
  email: "test@test.com",
  supabaseAuthId: "user-1-supa",
  onboardingCompleted: false,
  skinType: null,
  primaryConcern: null,
  ...overrides,
});

// A helper function to create a mock scan
const createMockScan = (overrides: any = {}) => ({
  id: "scan-1",
  userId: "user-1",
  createdAt: new Date(),
  analysis: null,
  ...overrides,
});

describe("useOnboardingStore: determineCurrentStep", () => {
  const initialState = useOnboardingStore.getState();
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useOnboardingStore.setState(initialState);
  });

  it("should set step to INACTIVE for a user with onboardingCompleted as true", () => {
    const { determineCurrentStep } = useOnboardingStore.getState();
    const profile = createMockProfile({ onboardingCompleted: true });

    determineCurrentStep({ userProfile: profile, scans: [] });

    expect(useOnboardingStore.getState().step).toBe("INACTIVE");
    expect(useOnboardingStore.getState().isActive).toBe(false);
  });

  it("should set step to PROFILE_SETUP for a new user with incomplete profile", () => {
    const { determineCurrentStep } = useOnboardingStore.getState();
    const profile = createMockProfile({ skinType: null }); // Missing skinType

    determineCurrentStep({ userProfile: profile, scans: [] });

    expect(useOnboardingStore.getState().step).toBe("PROFILE_SETUP");
    expect(useOnboardingStore.getState().isActive).toBe(true);
  });

  it("should set step to FIRST_SCAN for a user with a complete profile but no scans", () => {
    const { determineCurrentStep } = useOnboardingStore.getState();
    const profile = createMockProfile({
      skinType: SkinType.NORMAL,
      primaryConcern: "Acne",
    });

    determineCurrentStep({ userProfile: profile, scans: [] });

    expect(useOnboardingStore.getState().step).toBe("FIRST_SCAN");
    expect(useOnboardingStore.getState().isActive).toBe(true);
  });

  it("should set step to VIEW_ANALYSIS for a user with an unanalyzed scan", () => {
    const { determineCurrentStep } = useOnboardingStore.getState();
    const profile = createMockProfile({
      skinType: SkinType.NORMAL,
      primaryConcern: "Acne",
    });
    const scans = [createMockScan({ analysis: null })];

    determineCurrentStep({ userProfile: profile, scans: scans as any });

    expect(useOnboardingStore.getState().step).toBe("VIEW_ANALYSIS");
    expect(useOnboardingStore.getState().isActive).toBe(true);
    expect(useOnboardingStore.getState().onboardingScanId).toBe("scan-1");
  });

  it("should set step to COMPLETED for a user with an analyzed scan", () => {
    const { determineCurrentStep } = useOnboardingStore.getState();
    const profile = createMockProfile({
      skinType: SkinType.NORMAL,
      primaryConcern: "Acne",
    });
    const scans = [createMockScan({ analysis: { id: "analysis-1" } })];

    determineCurrentStep({ userProfile: profile, scans: scans as any });

    expect(useOnboardingStore.getState().step).toBe("COMPLETED");
    expect(useOnboardingStore.getState().isActive).toBe(true);
  });
});