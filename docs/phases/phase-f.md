Excellent question. You're probing for the subtle details that elevate a good plan to a great one. The current plan for Phase F is technically comprehensive and follows a logical progression. It's a very strong developer guide.

You are not missing any major *steps*, but we can significantly improve its robustness and ensure a more polished final product by adding considerations for **data integrity**, **user experience edge cases**, and **developer efficiency**.

Here is a summary of the refinements, followed by the final, updated plan for Phase F.

### **Summary of What's Missing (and Now Added):**

| Category | Missing Consideration | Why It's Critical |
| :--- | :--- | :--- |
| **Data Integrity & Caching** | **Cache Invalidation Strategy:** The plan implies cache invalidation but doesn't explicitly define the "when" and "where." For example, creating a new consultation should invalidate the history list. | Without a clear strategy, the UI can easily show stale data. This leads to user confusion ("I just submitted it, why isn't it in my list?") and is a common source of bugs in reactive applications. |
| **User Experience Edge Cases** | **Handling Paginated Data:** The plan assumes all lists (e.g., analysis history) will be short. For a real user, these lists could grow very long, leading to performance issues and a poor UX. | Planning for pagination from the start (even if only implemented for one list in the MVP) makes the application scalable and prevents a major refactor later. |
| **Developer Experience & Efficiency** | **Type Safety for API Payloads:** The plan mentions `zod` for the backend but doesn't explicitly state that these same schemas should be used on the frontend. | Sharing Zod schemas between the client and server creates a single source of truth for data shapes. This prevents entire classes of integration bugs and speeds up development by providing autocompletion and type-checking in the frontend code. |
| **Quality Assurance** | **Testing Decrypted Data:** A critical step is verifying that the encrypted data from Phase D is correctly decrypted by the API in Phase E and displayed correctly in the UI in Phase F. | This is a crucial security and data integrity check. A failure here means the core encryption/decryption loop is broken. This must be the very first test performed in this phase. |

By incorporating these points, we ensure that Phase F results in an application that is not only dynamic but also robust, scalable, and a pleasure to develop and maintain.

---

# **Phase F: Frontend API Integration (v1.1)**

**Goal:** Transform the static application into a fully dynamic and interactive experience. This involves replacing all mock data with live API data, implementing robust server state management with `@tanstack/react-query`, and ensuring the UI is reactive, scalable, and type-safe from end to end.

**Associated Epic(s):** All Core Epics
**Estimated Duration:** 2 weeks

---

## `[ ]` 1. Foundation: API Client, Type Safety & Custom Hooks

**Objective:** Create a robust and type-safe data-fetching layer.

-   `[ ]` **[Added] Define Shared Zod Schemas:**
    -   `[ ]` Create a new directory `src/lib/schemas/`.
    -   `[ ]` Define Zod schemas for all API request and response payloads (e.g., `skinAnalysis.schema.ts`, `consultation.schema.ts`).
    -   `[ ]` Ensure these schemas are imported and used for validation in the backend API routes (from Phase E) and for type inference on the frontend.
-   `[ ]` **Implement API Client Methods:** In `src/lib/services/api-client.service.ts`, implement the API call functions for all Skinova endpoints, using the shared Zod schemas to type their inputs and outputs.
-   `[ ]` **Create Custom `react-query` Hooks:** In `src/lib/hooks/data/`, create a dedicated hook for each API call (e.g., `useUserProfile`, `useCreateSkinAnalysis`).
-   `[ ]` **Error Handling:** Ensure every mutation hook includes a default `onError` callback that displays a user-friendly error toast.

## `[ ]` 2. Initial Data Read & Verification

**Objective:** Populate the application with read-only data to verify the entire data pipeline, including encryption and decryption.

-   `[ ]` **[Added] Test Decryption Flow:**
    -   `[ ]` The very first task is to integrate the `useSkinAnalysisDetail` hook into the `scan/[id]` page.
    -   `[ ]` Use the ID of a seeded analysis from Phase D and verify that the encrypted `results` data is correctly decrypted by the API and displayed in the UI. **This is a critical path test for the core security feature.**
-   `[ ]` **Populate Settings Page:** In `src/app/settings/page.tsx`, use the `useUserProfile` hook to fetch and display user data, replacing static props. Implement the loading state with a skeleton.
-   `[ ]` **Populate History Lists:**
    -   `[ ]` Integrate `useSkinAnalysisHistory` and `useConsultationHistory` into their respective pages.
    -   `[ ]` Use the `isLoading` state to render skeletons and the fetched data's length to handle empty states.

## `[ ]` 3. Implementing User Mutations & Cache Invalidation

**Objective:** Wire up all user actions that modify data and ensure the UI stays in sync.

-   `[ ]` **Implement Profile Update:** In `ProfileForm.tsx`, call the `mutate` function from `useUpdateProfile` and use the `isPending` state for the button's loading indicator.
-   `[ ]` **Implement Image Upload & Analysis Creation:** In `ImageUploader.tsx`, on successful image upload to Supabase Storage, call the `mutate` function from `useCreateSkinAnalysis`.
-   `[ ]` **[Refined] Implement Cache Invalidation Strategy:** For each mutation hook, add an `onSuccess` callback that invalidates the relevant queries to ensure the UI refetches and displays the latest data.
    -   `[ ]` `useCreateSkinAnalysis` -> `onSuccess`: Invalidate `['skinAnalysisHistory']`.
    -   `[ ]` `useCreateConsultation` -> `onSuccess`: Invalidate `['consultationHistory']`.
    -   `[ ]` `useSubmitDermatologistReport` -> `onSuccess`: Invalidate `['dermatologistQueue']` and `['consultationDetail']`.
-   `[ ]` **Implement Dermatologist Portal Actions:** Wire up the `DermatologistReportForm` using the `useSubmitDermatologistReport` mutation hook.

## `[ ]` 4. [Added] Scalability & Advanced UX Patterns

**Objective:** Polish the user experience and ensure the application is scalable for users with large amounts of data.

-   `[ ]` **Implement Pagination for Analysis History:**
    -   `[ ]` Modify the `GET /api/skin-analysis` endpoint to accept `page` and `limit` query parameters.
    -   `[ ]` Update the `useSkinAnalysisHistory` hook to be a paginated query (e.g., using `useInfiniteQuery` from TanStack).
    -   `[ ]` Add "Load More" or pagination controls to the `SkinAnalysisHistoryList` component.
-   `[ ]` **Implement Optimistic Deletion:**
    -   `[ ]` Create a "Delete" button for a skin analysis in the UI.
    -   `[ ]` Implement the `useDeleteSkinAnalysis` hook using `onMutate` to immediately remove the item from the cache and `onError` to roll back the change if the API call fails.

## `[ ]` 5. Phase Completion & Review

-   `[ ]` **Code Review:** The lead developer reviews all hooks and component integrations, focusing on correct `react-query` usage, cache invalidation, type safety with shared schemas, and state management.
-   `[ ]` **Functional Review:** The Product Owner conducts a full end-to-end test of the now-dynamic application on a Vercel preview deployment. This includes:
    -   `[ ]` Verifying all CRUD operations.
    -   `[ ]` Testing all loading, empty, and error states.
    -   `[ ]` Confirming that optimistic updates feel instantaneous and roll back correctly on failure.
    -   `[ ]` Testing the pagination on the analysis history list.
-   `[ ]` **Mark as Complete:** Merge the feature branch into `main` and mark this phase as complete in the Master Implementation Plan.