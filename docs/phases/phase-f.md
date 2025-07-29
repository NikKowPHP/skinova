Of course. Here is the complete, updated, and refined plan for Phase F, incorporating the recommended additions for empty states, automatic polling, and consultation history.

---
### `docs/phases/phase-f.md`
```markdown
# **Phase F: Frontend API Integration**

**Goal:** Make the application fully dynamic by connecting the static frontend to the live backend. This involves **replacing all mock data** in the UI with live data fetched from the API, using `@tanstack/react-query` for data fetching, caching, mutations, and optimistic updates for features like submitting a new `SkinScan`.

---

### 1. Centralized API Client Expansion

-   `[ ]` **Task 1.1: Add Skinova Endpoints to `api-client.service`**
    -   **File:** `src/lib/services/api-client.service.ts`
    -   **Action:** Extend the `apiClient` object with methods for all the new Skinova API routes created in Phase E. This centralizes all frontend-to-backend communication.
    -   **Content:**
        ```typescript
        import axios from "axios";
        import type { OnboardingData, ProfileUpdateData } from "@/lib/types"; // These will be updated in a later step
        
        // Placeholder types for Skinova - will be refined in Task 1.2
        interface SkinScan { id: string; [key: string]: any; }
        interface Routine { id: string; [key: string]: any; }
        interface Product { id: string; [key: string]: any; }
        interface Consultation { id: string; [key: string]: any; }
        interface Analytics { [key: string]: any; }

        export const apiClient = {
          profile: {
            get: async () => {
              const { data } = await axios.get("/api/user/profile");
              return data;
            },
            update: async (profileData: ProfileUpdateData) => {
              const { data } = await axios.put("/api/user/profile", profileData);
              return data;
            },
          },
          scan: {
            getAll: async () => {
              const { data } = await axios.get<SkinScan[]>("/api/scan");
              return data;
            },
            getById: async (id: string) => {
              const { data } = await axios.get<SkinScan>(`/api/scan/${id}`);
              return data;
            },
            create: async (payload: { imageUrl: string; notes?: string }) => {
              const { data } = await axios.post<SkinScan>("/api/scan", payload);
              return data;
            },
            delete: async (id: string) => {
                await axios.delete(`/api/scan/${id}`);
            }
          },
          analyze: {
            start: async (scanId: string) => {
              const { data } = await axios.post("/api/scan/analyze", { scanId });
              return data;
            },
          },
          routine: {
            get: async () => {
                const { data } = await axios.get<Routine>("/api/routine");
                return data;
            },
            update: async (payload: { steps: any[] }) => {
                const { data } = await axios.put<Routine>("/api/routine", payload);
                return data;
            }
          },
          products: {
            getAll: async () => {
                const { data } = await axios.get<Product[]>("/api/products");
                return data;
            }
          },
          consultation: {
            getAll: async () => {
                const { data } = await axios.get<Consultation[]>("/api/consultation");
                return data;
            }
          },
          progress: {
            getAnalytics: async () => {
                const { data } = await axios.get<Analytics>("/api/progress/analytics");
                return data;
            }
          },
          user: {
            onboard: async (onboardingData: OnboardingData) => {
              const { data } = await axios.post("/api/user/onboard", onboardingData);
              return data;
            },
            completeOnboarding: async () => {
              const { data } = await axios.post("/api/user/complete-onboarding");
              return data;
            },
            delete: async () => {
              const { data } = await axios.delete("/api/user");
              return data;
            },
          },
        };
        ```

-   `[ ]` **Task 1.2: Define Skinova Data Types**
    -   **File:** `src/lib/types/index.ts`
    -   **Action:** Update the types file to reflect the data models and API payloads for Skinova.
    -   **Content:**
        ```typescript
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
        ```

---

### 2. Data Hook Implementation

-   `[ ]` **Task 2.1: Create New Data Hooks for Skinova Features**
    -   **Action:** Create the following new files in `src/lib/hooks/data/` to manage server state for each core feature.

    -   **File:** `src/lib/hooks/data/useScanHistory.ts`
        ```typescript
        import { useQuery } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useAuthStore } from "@/lib/stores/auth.store";

        export const useScanHistory = () => {
          const authUser = useAuthStore((state) => state.user);
          return useQuery({
            queryKey: ["scans", authUser?.id],
            queryFn: apiClient.scan.getAll,
            enabled: !!authUser,
          });
        };
        ```

    -   **File:** `src/lib/hooks/data/useScan.ts`
        ```typescript
        import { useQuery } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import type { ScanWithAnalysis } from "@/lib/types";

        export const useScan = (id: string) => {
          return useQuery({
            queryKey: ["scan", id],
            queryFn: () => apiClient.scan.getById(id),
            enabled: !!id,
            // Poll every 3 seconds if the analysis is not yet present
            refetchInterval: (query) => {
              const data = query.state.data as ScanWithAnalysis | undefined;
              return data && !data.analysis ? 3000 : false;
            },
          });
        };
        ```

    -   **File:** `src/lib/hooks/data/useCreateScan.ts`
        ```typescript
        import { useMutation, useQueryClient } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useAuthStore } from "@/lib/stores/auth.store";
        import { useToast } from "@/components/ui/use-toast";

        export const useCreateScan = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
          const authUser = useAuthStore((state) => state.user);
        
          return useMutation({
            mutationFn: (payload: { imageUrl: string; notes?: string }) => apiClient.scan.create(payload),
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: ["scans", authUser?.id] });
              // Toast is handled by the analysis hook
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Scan Upload Failed",
                description: error.message || "Your scan could not be saved.",
              });
            },
          });
        };
        ```

    -   **File:** `src/lib/hooks/data/useAnalyzeScan.ts`
        ```typescript
        import { useMutation, useQueryClient } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useToast } from "@/components/ui/use-toast";
        
        export const useAnalyzeScan = () => {
          const queryClient = useQueryClient();
          const { toast } = useToast();
        
          return useMutation({
            mutationFn: (scanId: string) => apiClient.analyze.start(scanId),
            onSuccess: (analysis, scanId) => {
              queryClient.invalidateQueries({ queryKey: ["scan", scanId] });
              toast({
                title: "Analysis Complete",
                description: "Your skin analysis is ready to view.",
              });
            },
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: error.message || "We could not analyze your scan.",
              });
            },
          });
        };
        ```

    -   **File:** `src/lib/hooks/data/useRoutine.ts`
        ```typescript
        import { useQuery } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useAuthStore } from "@/lib/stores/auth.store";

        export const useRoutine = () => {
          const authUser = useAuthStore((state) => state.user);
          return useQuery({
            queryKey: ["routine", authUser?.id],
            queryFn: apiClient.routine.get,
            enabled: !!authUser,
          });
        };
        ```

    -   **File:** `src/lib/hooks/data/useProgressAnalytics.ts`
        ```typescript
        import { useQuery } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useAuthStore } from "@/lib/stores/auth.store";

        export const useProgressAnalytics = () => {
          const authUser = useAuthStore((state) => state.user);
          return useQuery({
            queryKey: ["progressAnalytics", authUser?.id],
            queryFn: apiClient.progress.getAnalytics,
            enabled: !!authUser,
          });
        };
        ```
    -   **File:** `src/lib/hooks/data/useConsultations.ts`
        ```typescript
        import { useQuery } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useAuthStore } from "@/lib/stores/auth.store";

        export const useConsultations = () => {
          const authUser = useAuthStore((state) => state.user);
          return useQuery({
            queryKey: ["consultations", authUser?.id],
            queryFn: apiClient.consultation.getAll,
            enabled: !!authUser,
          });
        };
        ```

-   `[ ]` **Task 2.2: Update Hook Index**
    -   **File:** `src/lib/hooks/data/index.ts`
    -   **Action:** Export all the newly created hooks.
    -   **Content:**
        ```typescript
        export * from "./useUserProfile";
        export * from "./useUpdateProfile";
        export * from "./useOnboardUser";
        export * from "./useCompleteOnboarding";
        export * from "./useDeleteAccount";
        // Skinova specific hooks
        export * from "./useScanHistory";
        export * from "./useScan";
        export * from "./useCreateScan";
        export * from "./useAnalyzeScan";
        export * from "./useRoutine";
        export * from "./useProgressAnalytics";
        export * from "./useConsultations";
        ```

---

### 3. Onboarding Flow Integration

-   `[ ]` **Task 3.1: Connect `SkinProfileWizard` to the API**
    -   **File:** `src/components/onboarding/SkinProfileWizard.tsx`
    -   **Action:** Replace the static `alert` with the `useOnboardUser` mutation hook (adapted from Lexity).
    -   **Content Snippet (to replace `alert` logic):**
        ```tsx
        // ... imports
        import { useOnboardUser } from "@/lib/hooks/data/useOnboardUser"; // Assuming this is adapted for Skinova
        
        // ... inside component
        const { mutate: submitOnboarding, isPending } = useOnboardUser();
        
        const handleComplete = () => {
            submitOnboarding(formData, { // formData is local state
              onSuccess: onComplete, // onComplete is a prop
              onError: (error) => console.error(error),
            });
        };

        // ... update button disabled state
        <Button onClick={handleComplete} disabled={isPending} className="ml-auto">
            {isPending ? "Saving..." : "Finish Setup"}
        </Button>
        ```

-   `[ ]` **Task 3.2: Update Onboarding Store and App Shell**
    -   **File:** `src/lib/stores/onboarding.store.ts`
        -   **Action:** Update the `OnboardingStep` type and `determineCurrentStep` logic for Skinova's flow.
        -   **Content:**
            ```typescript
            // ... imports
            export type OnboardingStep =
              | "PROFILE_SETUP"
              | "FIRST_SCAN"
              | "VIEW_ANALYSIS"
              | "COMPLETED"
              | "INACTIVE";
            
            // ... inside determineCurrentStep
            if (!userProfile.skinType || !userProfile.primaryConcern) {
              nextStep = "PROFILE_SETUP";
            } else if (!hasScans) {
              nextStep = "FIRST_SCAN";
            } else {
              const latestScan = scans[0];
              if (latestScan) {
                set({ onboardingScanId: latestScan.id });
                if (!latestScan.analysis) {
                  nextStep = "VIEW_ANALYSIS"; // Waiting for analysis
                } else {
                  nextStep = "COMPLETED"; // User has done everything needed for the tour
                }
              }
            }
            ```
    -   **File:** `src/components/layout/AppShell.tsx`
        -   **Action:** Replace the `OnboardingWizard` with `SkinProfileWizard` and adapt the `OnboardingOverlay` logic to match the new steps.

---

### 4. Component & Page Integration

-   `[ ]` **Task 4.1: Integrate `useCreateScan` and `useAnalyzeScan` into `ScanUploadForm`**
    -   **File:** `src/components/scan/ScanUploadForm.tsx`
    -   **Action:** Wire up the form to a real submission flow. The flow should be:
        1.  (Mock) Upload image, get a URL.
        2.  Call `createScanMutation` with the URL and notes.
        3.  On success, call `analyzeScanMutation` with the new `scanId`.
        4.  On success of analysis, redirect to the scan result page.
    -   **Content Snippet:**
        ```tsx
        // ... imports
        import { useRouter } from "next/navigation";
        import { useCreateScan } from "@/lib/hooks/data/useCreateScan";
        import { useAnalyzeScan } from "@/lib/hooks/data/useAnalyzeScan";
        
        // ... inside component
        const router = useRouter();
        const createScanMutation = useCreateScan();
        const analyzeScanMutation = useAnalyzeScan();
        
        const handleAnalyzeClick = () => {
          // In a real app, this would come from Supabase Storage upload
          const mockImageUrl = 'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop';

          createScanMutation.mutate({ imageUrl: mockImageUrl, notes }, {
            onSuccess: (newScan) => {
              analyzeScanMutation.mutate(newScan.id, {
                onSuccess: () => {
                  router.push(`/scan/${newScan.id}`);
                }
              });
            }
          });
        };
        
        const isProcessing = createScanMutation.isPending || analyzeScanMutation.isPending;
        // ... update button state with isProcessing
        ```

-   `[ ]` **Task 4.2: Integrate `useScan` with Polling into Scan Result Page**
    -   **File:** `src/app/scan/[id]/page.tsx`
    -   **Action:** Replace all mock data with live data from the `useScan` hook. Handle loading, error, and "analysis in progress" states gracefully with automatic polling.
    -   **Content Snippet:**
        ```tsx
        // ... imports
        import { useScan } from "@/lib/hooks/data/useScan";
        import { Skeleton } from "@/components/ui/skeleton";
        
        // ... inside component
        const { data: scan, isLoading, error } = useScan(params.id);

        if (isLoading) return <p>Loading scan...</p>;
        if (error) return <p>Error loading scan: {error.message}</p>;
        if (!scan) return <p>Scan not found.</p>;

        if (!scan.analysis) {
            return <p>Analysis in progress... This will update automatically.</p>
        }
        // ... pass scan.analysis.concerns and scan.imageUrl to child components
        ```

-   `[ ]` **Task 4.3: Integrate `useRoutine` into Routine Page**
    -   **File:** `src/app/routine/page.tsx`
    -   **Action:** Replace mock routine data with the `useRoutine` hook and implement an empty state.
    -   **Content Snippet:**
        ```tsx
        'use client';
        import { useRoutine } from "@/lib/hooks/data/useRoutine";
        // ...
        export default function RoutinePage() {
            const { data: routine, isLoading } = useRoutine();
            if (isLoading) return <p>Loading routine...</p>;
            if (!routine || routine.steps.length === 0) {
                return <p>Your personalized routine will appear here after your first skin analysis is complete.</p>
            }
            // ... map over routine.steps for AM and PM
        }
        ```

-   `[ ]` **Task 4.4: Integrate Hooks into Dashboard and Progress Pages**
    -   **File:** `src/app/dashboard/page.tsx`
        -   **Action:** Use `useProgressAnalytics` for the `DashboardSummary` and `useScanHistory` for the history list. Implement an empty state for new users.
    -   **File:** `src/app/progress/page.tsx`
        -   **Action:** Use `useProgressAnalytics` for the `ProgressChart` and `useScanHistory` for the full `ScanHistoryList`. Implement an empty state.

-   `[ ]` **Task 4.5: Adapt `ProfileForm` and `useUpdateProfile` Hook**
    -   **File:** `src/components/ProfileForm.tsx`
        -   **Action:** Remove fields related to language learning and replace them with `skinType` and `primaryConcern` selects.
    -   **File:** `src/lib/hooks/data/useUpdateProfile.ts`
        -   **Action:** Update the mutation function and optimistic update logic to handle `skinType` and `primaryConcern`.

-   `[ ]` **Task 4.6: Implement Empty States for Core Pages**
    -   **Action:** Update the primary pages to handle cases where the data-fetching hooks return no data, guiding the user toward the next logical action.
    -   **File:** `src/app/dashboard/page.tsx`
        -   **Logic:** If `useProgressAnalytics` returns `totalScans: 0`, display a prominent "Welcome" card that directs the user to perform their first scan, rather than showing a summary with zeros.
    -   **File:** `src/app/progress/page.tsx`
        -   **Logic:** If `useScanHistory` returns an empty array, display a message encouraging the user to perform their first scan to start tracking their progress.

-   `[ ]` **Task 4.7: Display Consultation History on Settings Page**
    -   **File:** `src/app/settings/page.tsx`
    -   **Action:** Add a new section to the settings page that uses the `useConsultations` hook to display a list of past consultations, including their date and status.
```