"use client";

import { useAcceptanceStore } from "@/lib/stores/acceptance.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { DisclaimerDialog } from "./DisclaimerDialog";
import { PrivacyPolicyDialog } from "./PrivacyPolicyDialog";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";

export function AcceptanceFlow() {
  const { user, authLoading } = useAuthStore();
  const { 
    isAcceptanceComplete, 
    hasAcceptedDisclaimer, 
    hasAcceptedPrivacyPolicy,
    acceptDisclaimer, 
    acceptPrivacyPolicy 
  } = useAcceptanceStore();
  
  // Do not show acceptance flow if the main onboarding tour is active.
  const onboardingIsActive = useOnboardingStore(state => state.isActive);

  // Conditions to hide the flow
  if (authLoading || !user || isAcceptanceComplete() || onboardingIsActive) {
    return null;
  }
  
  const showDisclaimer = !hasAcceptedDisclaimer;
  const showPrivacy = hasAcceptedDisclaimer && !hasAcceptedPrivacyPolicy;

  if (showDisclaimer) {
      return <DisclaimerDialog isOpen={true} onAccept={acceptDisclaimer} />;
  }
  
  if (showPrivacy) {
      return <PrivacyPolicyDialog isOpen={true} onAccept={acceptPrivacyPolicy} />;
  }

  return null;
}