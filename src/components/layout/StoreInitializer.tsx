"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  useUserProfile,
  useScanHistory,
} from "@/lib/hooks/data";
import { useAcceptanceStore } from "@/lib/stores/acceptance.store";

function StoreInitializer() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const { step, determineCurrentStep, resetOnboarding } = useOnboardingStore();
  const isAcceptanceComplete = useAcceptanceStore(state => state.isAcceptanceComplete());

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

  // Effect to determine the onboarding step once all necessary data is loaded.
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
    isAcceptanceComplete, // React to changes in acceptance status
    determineCurrentStep,
    resetOnboarding,
  ]);

  return null;
}

export default StoreInitializer;