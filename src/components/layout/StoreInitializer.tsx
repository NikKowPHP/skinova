"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  useUserProfile,
  useScanHistory,
} from "@/lib/hooks/data";
import { useLanguageStore } from "@/lib/stores/language.store";

function StoreInitializer() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const { step, determineCurrentStep, resetOnboarding } = useOnboardingStore();
  const { activeTargetLanguage, setActiveTargetLanguage } = useLanguageStore();

  // Auth state listener
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => {
      unsubscribe();
    };
  }, [initializeAuth]);

  // Data fetching hooks
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: scans, isLoading: areScansLoading } = useScanHistory();

  // Effect 1: Set the active language as soon as the profile is available.
  // This unblocks other data hooks that depend on the active language.
  useEffect(() => {
    if (user && userProfile && !activeTargetLanguage) {
      // In Skinova, there's no language selection, so this effect is simplified or could be removed.
      // We'll keep it as a no-op for now in case of future language support.
    }
  }, [user, userProfile, activeTargetLanguage, setActiveTargetLanguage]);

  // Effect 2: Determine the onboarding step once all necessary data is loaded.
  useEffect(() => {
    // We must wait for auth, profile, and scans to be loaded before making a decision.
    if (authLoading || isProfileLoading || areScansLoading) {
      return;
    }

    if (user && userProfile) {
      // If onboarding is NOT complete, we should always re-evaluate the step based on the latest data.
      if (!userProfile.onboardingCompleted) {
        determineCurrentStep({
          userProfile: userProfile,
          scans: scans || [],
        });
      } else if (userProfile.onboardingCompleted && step !== "INACTIVE") {
        // If onboarding IS complete, ensure we reset the store to INACTIVE.
        resetOnboarding();
      }
    }
  }, [
    user,
    userProfile,
    scans,
    authLoading,
    isProfileLoading,
    areScansLoading,
    determineCurrentStep,
    resetOnboarding,
  ]);

  return null;
}

export default StoreInitializer;