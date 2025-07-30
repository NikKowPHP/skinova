"use client";

import { useAcceptanceStore } from "@/lib/stores/acceptance.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { DisclaimerDialog } from "./DisclaimerDialog";
import { PrivacyPolicyDialog } from "./PrivacyPolicyDialog";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { usePathname } from "next/navigation";

export function AcceptanceFlow() {
  const pathname = usePathname();
  const { user, authLoading } = useAuthStore();
  const {
    isAcceptanceComplete,
    hasAcceptedDisclaimer,
    hasAcceptedPrivacyPolicy,
    acceptDisclaimer,
    acceptPrivacyPolicy,
  } = useAcceptanceStore();

  // Do not show acceptance flow if the main onboarding tour is active.
  const onboardingIsActive = useOnboardingStore((state) => state.isActive);

  // Also, do not show these dialogs on the policy pages themselves.
  const isPolicyPage = pathname === "/privacy" || pathname === "/cookies";

  // Conditions to hide the flow
  if (
    authLoading ||
    !user ||
    isAcceptanceComplete() ||
    onboardingIsActive ||
    isPolicyPage
  ) {
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