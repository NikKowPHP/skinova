import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AcceptanceState {
  hasAcceptedDisclaimer: boolean;
  hasAcceptedPrivacyPolicy: boolean;
  acceptDisclaimer: () => void;
  acceptPrivacyPolicy: () => void;
  isAcceptanceComplete: () => boolean;
}

export const useAcceptanceStore = create<AcceptanceState>()(
  persist(
    (set, get) => ({
      hasAcceptedDisclaimer: false,
      hasAcceptedPrivacyPolicy: false,
      acceptDisclaimer: () => set({ hasAcceptedDisclaimer: true }),
      acceptPrivacyPolicy: () => set({ hasAcceptedPrivacyPolicy: true }),
      isAcceptanceComplete: () => {
        const state = get();
        return state.hasAcceptedDisclaimer && state.hasAcceptedPrivacyPolicy;
      },
    }),
    {
      name: "skinova-acceptance-storage",
    },
  ),
);