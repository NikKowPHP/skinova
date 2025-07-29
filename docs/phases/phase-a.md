Of course. Here is the detailed breakdown for Phase A, tailored for the Skinova adaptation.

---

# **Phase A: Project Setup & Initial Scaffolding**

**Goal:** Execute all initial project setup, including environment configuration, dependency installation, and boilerplate removal. Adapt the Lexity codebase by renaming core features, scaffolding all primary Skinova pages and routes (`/scan`, `/routine`, `/progress`, `/settings`, `/admin`), and updating the navigation. The output will be a clean, prepared codebase that reflects the Skinova domain, ready for feature implementation.

---

### 1. Project Renaming & Configuration

-   `[ ]` **Task 1.1: Update Project Identity in `package.json`**

    -   **File:** `package.json`
    -   **Action:** Update the `name`, `version`, and `description` fields to reflect the Skinova project.
    -   **Content:**
        ```json
        {
          "name": "skinova",
          "version": "1.0.0",
          "description": "AI-driven personalized skincare routines and teledermatology services.",
          "private": true,
          "scripts": {
            "dev": "next dev --turbopack",
            "build": "npx prisma generate && next build",
            "start": "next start",
            "lint": "next lint",
            "test": "dotenv -e .env.test jest",
            "beforetest": "dotenv -e .env.test -- docker-compose up -d db && dotenv -e .env.test -- prisma migrate dev",
            "test:coverage": "jest --coverage",
            "prisma:seed": "ts-node prisma/seed.cts",
            "db:encrypt": "ts-node -r dotenv/config scripts/encrypt-existing-data.cts",
            "test:e2e": "playwright test"
          },
          "prisma": {
            "seed": "ts-node prisma/seed.cts"
          },
          "dependencies": {
            "@google-cloud/speech": "^7.1.0",
            "@google/genai": "^1.8.0",
            "@headlessui/react": "^2.0.0",
            "@prisma/client": "^6.9.0",
            "@radix-ui/react-dialog": "^1.1.14",
            "@radix-ui/react-label": "^2.1.7",
            "@radix-ui/react-progress": "^1.1.7",
            "@radix-ui/react-select": "^2.2.5",
            "@radix-ui/react-slot": "^1.2.3",
            "@radix-ui/react-tabs": "^1.1.12",
            "@radix-ui/react-toast": "^1.2.14",
            "@sentry/nextjs": "^9.39.0",
            "@stripe/react-stripe-js": "^3.7.0",
            "@stripe/stripe-js": "^7.4.0",
            "@supabase/auth-helpers-nextjs": "^0.10.0",
            "@supabase/supabase-js": "^2.50.0",
            "@tanstack/react-query": "^5.81.5",
            "@tiptap/extension-placeholder": "^2.25.1",
            "@tiptap/pm": "^2.25.0",
            "@tiptap/react": "^2.25.0",
            "@tiptap/starter-kit": "^2.25.0",
            "@types/chart.js": "^2.9.41",
            "axios": "^1.10.0",
            "chart.js": "^4.5.0",
            "class-variance-authority": "^0.7.1",
            "clsx": "^2.1.1",
            "date-fns": "^3.6.0",
            "jspdf": "^2.5.1",
            "jspdf-autotable": "^3.5.6",
            "lucide-react": "^0.525.0",
            "next": "^15.3.3",
            "next-pwa": "^5.6.0",
            "next-themes": "^0.4.6",
            "openai": "^5.5.1",
            "postcss-import": "^16.1.1",
            "posthog-js": "^1.257.0",
            "posthog-node": "^5.6.0",
            "react": "^19.0.0",
            "react-chartjs-2": "^5.3.0",
            "react-dom": "^19.0.0",
            "recharts": "^3.0.2",
            "resend": "^4.6.0",
            "stripe": "^18.3.0",
            "tailwind-merge": "^3.3.1",
            "zod": "^3.25.76",
            "zustand": "^5.0.6"
          },
          "devDependencies": {
            "@eslint/eslintrc": "^3",
            "@eslint/js": "^9.29.0",
            "@playwright/test": "^1.45.3",
            "@supabase/ssr": "^0.6.1",
            "@tailwindcss/postcss": "^4",
            "@testing-library/jest-dom": "^6.6.3",
            "@testing-library/react": "^16.0.0",
            "@types/jest": "^29.5.12",
            "@types/next": "^8.0.7",
            "@types/next-pwa": "^5.6.9",
            "@types/node": "^20.19.1",
            "@types/react": "^19",
            "@types/react-dom": "^19",
            "autoprefixer": "^10.4.21",
            "dotenv": "^16.4.5",
            "dotenv-cli": "^9.0.0",
            "eslint": "^9.29.0",
            "eslint-config-next": "15.3.3",
            "eslint-config-prettier": "^10.1.5",
            "eslint-plugin-prettier": "^5.4.1",
            "eslint-plugin-react": "^7.37.5",
            "globals": "^16.2.0",
            "jest": "^29.7.0",
            "jest-environment-jsdom": "^29.7.0",
            "node-mocks-http": "^1.17.2",
            "postcss": "^8.5.6",
            "prettier": "^3.5.3",
            "prisma": "^6.9.0",
            "tailwindcss": "^4.1.11",
            "ts-jest": "^29.1.2",
            "ts-node": "^10.9.2",
            "tw-animate-css": "^1.3.5",
            "typescript": "^5",
            "typescript-eslint": "^8.34.1"
          }
        }
        ```

-   `[ ]` **Task 1.2: Update Application Metadata**

    -   **File:** `src/app/layout.tsx`
    -   **Action:** Update the `metadata` object to reflect Skinova's identity for SEO and PWA manifests.
    -   **Content:**
        ```tsx
        export const metadata: Metadata = {
          title: "Skinova - AI-Powered Skincare",
          description: "Personalized skincare routines through AI-driven image analysis.",
          manifest: "/manifest.json",
          icons: {
            icon: [
              { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
              { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            ],
            shortcut: "/favicon/favicon.ico",
            apple: "/favicon/apple-touch-icon.png",
            other: [
              {
                rel: "android-chrome-192x192",
                url: "/favicon/android-chrome-192x192.png",
                sizes: "192x192",
              },
              {
                rel: "android-chrome-512x512",
                url: "/favicon/android-chrome-512x512.png",
                sizes: "512x512",
              },
            ],
          },
          appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: "Skinova",
          },
        };
        ```
---

### 2. Environment Setup

-   `[ ]` **Task 2.1: Create `.env.example` File**

    -   **File:** `.env.example`
    -   **Action:** Create a new file with all the required environment variables for Skinova.
    -   **Content:**
        ```
        # Database
        # Example for local Docker setup
        DATABASE_URL="postgresql://postgres:postgres@localhost:5434/skinova?schema=public"

        # Authentication & Storage (Supabase)
        NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
        NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
        SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key" # SECRET
        NEXT_PUBLIC_SKIN_SCANS_BUCKET="skin-scans"

        # Security
        # Generate a 32-byte key and base64 encode it. E.g., `openssl rand -base64 32`
        APP_ENCRYPTION_KEY="your-32-byte-base64-encoded-encryption-key" # SECRET

        # AI Providers (Google Gemini)
        AI_PROVIDER="gemini"
        GEMINI_API_KEY_1="your-gemini-api-key" # SECRET
        # Add GEMINI_API_KEY_2, etc., for key rotation

        # Billing (Stripe)
        STRIPE_SECRET_KEY="sk_test_..." # SECRET
        STRIPE_WEBHOOK_SECRET="whsec_..." # SECRET
        STRIPE_PRO_PRICE_ID="price_..."
        CONSULTATION_PRICE_ID="price_..."

        # Email & Cron
        RESEND_API_KEY="re_..." # SECRET
        CRON_SECRET="your-secure-random-string" # SECRET

        # Monitoring & Analytics
        NEXT_PUBLIC_SENTRY_DSN="https://..."
        SENTRY_ORG="your-sentry-org"
        SENTRY_PROJECT="your-sentry-project"
        NEXT_PUBLIC_POSTHOG_KEY="phc_..."
        NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
        ```

---

### 3. Core Structure & Navigation Adaptation

-   `[ ]` **Task 3.1: Rename Core Feature Directories**

    -   **Action:** Execute the following commands to align the folder structure with the Skinova domain.
    -   **Command:**
        ```bash
        mv src/app/journal src/app/scan
        mv src/app/study src/app/progress
        rm -rf src/app/translator
        ```

-   `[ ]` **Task 3.2: Update Desktop Sidebar Navigation**

    -   **File:** `src/components/layout/DesktopSidebar.tsx`
    -   **Action:** Replace the `navItems` array with Skinova's primary navigation links.
    -   **Content:**
        ```tsx
        import { Home, ScanFace, ListOrdered, BarChart3, Settings, LogOut } from "lucide-react";

        const navItems = [
          { href: "/dashboard", label: "Dashboard", icon: Home },
          { href: "/scan", label: "New Scan", icon: ScanFace },
          { href: "/routine", label: "My Routine", icon: ListOrdered },
          { href: "/progress", label: "Progress", icon: BarChart3 },
        ];
        ```

-   `[ ]` **Task 3.3: Update Mobile Tab Bar Navigation**

    -   **File:** `src/components/layout/BottomTabBar.tsx`
    -   **Action:** Replace the `navItems` array with Skinova's primary navigation links for mobile.
    -   **Content:**
        ```tsx
        import { Home, ScanFace, ListOrdered, BarChart3, Settings } from "lucide-react";

        const navItems = [
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/scan", label: "Scan", icon: ScanFace },
          { href: "/routine", label: "Routine", icon: ListOrdered },
          { href: "/progress", label: "Progress", icon: BarChart3 },
          { href: "/settings", label: "Settings", icon: Settings },
        ];
        ```

---

### 4. Page Scaffolding & Content Update

-   `[ ]` **Task 4.1: Update the Landing Page for Skinova**

    -   **File:** `src/app/page.tsx`
    -   **Action:** Replace the entire file content with a new landing page tailored to Skinova's value proposition.
    -   **Content:**
        ```tsx
        import Link from "next/link";
        import { Button } from "@/components/ui/button";
        import { ScanFace, Sparkles, BarChart3 } from "lucide-react";

        export default function Home() {
          return (
            <div className="bg-background text-foreground">
              {/* Hero Section */}
              <section className="text-center py-20 px-4 sm:py-32">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-4">
                    Data-Driven Skincare, Personalized for You
                  </h1>
                  <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Stop the guesswork. Scan your skin, get an AI-powered analysis, and receive a personalized routine designed for your unique needs. Track your progress and achieve your skin goals.
                  </p>
                  <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Button asChild size="lg">
                      <Link href="/signup">Start Your First Scan</Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg">
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section id="features" className="py-20 px-4 bg-secondary/30">
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                      <ScanFace className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold">1. Scan Your Skin</h3>
                      <p className="text-muted-foreground mt-2">Take a photo to get an instant, AI-driven analysis of your skin's condition.</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Sparkles className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold">2. Get Your Routine</h3>
                      <p className="text-muted-foreground mt-2">Receive a personalized skincare routine with product recommendations tailored to your analysis.</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <BarChart3 className="h-12 w-12 text-primary mb-4" />
                      <h3 className="text-xl font-semibold">3. Track Your Progress</h3>
                      <p className="text-muted-foreground mt-2">Log your journey with regular scans and watch your skin health improve over time.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          );
        }
        ```

-   `[ ]` **Task 4.2: Create Placeholder Pages**

    -   **Action:** Create the following new placeholder pages for the scaffolded routes.
    -   **File:** `src/app/scan/page.tsx`
        ```tsx
        import React from 'react';

        export default function ScanPage() {
          return (
            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold">New Skin Scan</h1>
              <p>Placeholder for the skin scanning and image upload interface.</p>
            </div>
          );
        }
        ```
    -   **File:** `src/app/routine/page.tsx`
        ```tsx
        import React from 'react';

        export default function RoutinePage() {
          return (
            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold">My Routine</h1>
              <p>Placeholder for displaying the user's personalized skincare routine.</p>
            </div>
          );
        }
        ```
    -   **File:** `src/app/progress/page.tsx`
        ```tsx
        import React from 'react';

        export default function ProgressPage() {
          return (
            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold">My Progress</h1>
              <p>Placeholder for the user's progress log and analytics charts.</p>
            </div>
          );
        }
        ```

---

### 5. Removal of Obsolete Lexity Logic

-   `[ ]` **Task 5.1: Clean Up Obsolete Files and Directories**

    -   **Action:** Execute the following commands to remove all files, components, and logic specific to the Lexity (language learning) domain.
    -   **Command:**
        ```bash
        # Remove Lexity-specific components
        rm -f src/components/JournalEditor.tsx src/components/JournalHistoryList.tsx src/components/Flashcard.tsx src/components/StudySession.tsx src/components/LanguageSwitcher.tsx src/components/translator/LanguageSelectorPanel.tsx src/components/translator/TranslationInput.tsx src/components/translator/TranslationOutput.tsx src/components/TranslatorDialog.tsx src/components/TranslationSegmentCard.tsx src/components/ui/TranslationTooltip.tsx

        # Remove Lexity-specific API routes (these will be rebuilt for Skinova)
        rm -rf src/app/api/journal src/app/api/srs src/app/api/ai/translate* src/app/api/tts src/app/api/user/generate-topics src/app/api/user/suggested-topics

        # Remove Lexity-specific data hooks
        rm -f src/lib/hooks/data/useJournal*.ts src/lib/hooks/data/useStudyDeck.ts src/lib/hooks/data/useCreateSrs*.ts src/lib/hooks/data/useReviewSrsItem.ts src/lib/hooks/data/useTranslate*.ts src/lib/hooks/data/useSynthesizeSpeech.ts src/lib/hooks/data/useContextualTranslate.ts src/lib/hooks/data/useGenerateTopics.ts src/lib/hooks/data/useSuggestedTopics.ts

        # Remove Lexity-specific AI prompts
        rm -f src/lib/ai/prompts/journal*.ts src/lib/ai/prompts/srs*.ts src/lib/ai/prompts/*Translation.prompt.ts src/lib/ai/prompts/topicGeneration.prompt.ts

        # Remove Lexity-specific constants and utils
        rm -f src/lib/constants.ts src/lib/translations.ts src/lib/google-*-voices.ts src/lib/utils/language-code-map.util.ts
        ```
        You are not missing anything major. This is an excellent and thorough plan for Phase A. It correctly identifies the key steps of renaming, re-configuring, scaffolding, and cleaning up the codebase. The tasks are logical and well-defined.


Split **Task 5.1** into two more precise tasks:

-   `[ ]` **Task 5.1: Adapt Core Domain-Agnostic Files**
    -   **Action:** Instead of deleting the entire `src/lib/types/index.ts`, `src/lib/constants.ts`, and key data hooks, update their content to remove Lexity-specific exports and prepare them for Skinova.
    -   **File:** `src/lib/types/index.ts`
        -   **Action:** Remove all Lexity-specific type exports (`JournalEntryWithRelations`, `DrillDownResult`, etc.). Leave the file with a placeholder comment: `// Core Skinova types will be defined in Phase D.`
    -   **File:** `src/lib/constants.ts`
        -   **Action:** Replace the `SUPPORTED_LANGUAGES` array with constants relevant to Skinova.
        -   **Content:**
            ```typescript
            export const SUPPORTED_SKIN_TYPES = [
              { name: "Normal", value: "normal" },
              { name: "Oily", value: "oily" },
              { name: "Dry", value: "dry" },
              { name: "Combination", value: "combination" },
              { name: "Sensitive", value: "sensitive" },
            ];

            export const SUPPORTED_CONCERNS = [
              { name: "Acne", value: "acne" },
              { name: "Fine Lines & Wrinkles", value: "wrinkles" },
              { name: "Hyperpigmentation", value: "hyperpigmentation" },
              { name: "Redness", value: "redness" },
              { name: "Dryness", value: "dryness" },
            ];
            ```
    -   **File:** `src/lib/hooks/data/index.ts`
        -   **Action:** Remove all exports except for the ones that will be reused, like `useUserProfile` and `useUpdateProfile`.
    -   **File:** `src/lib/hooks/data/useUserProfile.ts` & `useUpdateProfile.ts`
        -   **Action:** Review these files and remove any logic specific to language learning (e.g., `languageProfiles`).

-   `[ ]` **Task 5.2: Execute Surgical Deletion of Obsolete Files**
    -   **Action:** Now that useful files have been adapted, run a more targeted `rm` command to safely remove the remaining Lexity-specific modules.
    -   **Command:** (This would be the refined version of your original command, confirmed to be safe after the adaptation step above).

#### 2. Missing Task: Dependency Cleanup

The `package.json` was updated with a new name, but it still contains dependencies specific to Lexity's text-editor functionality.

**Why this is critical:** Leaving unused dependencies in the project leads to a larger bundle size, slower installs, and potential security vulnerabilities.

**Recommended Addition:**

-   `[ ]` **Task 1.3: Remove Obsolete Dependencies**
    -   **File:** `package.json`
    -   **Action:** Run the following command to remove libraries that were used for Lexity's rich-text editor, which Skinova does not need.
    -   **Command:**
        ```bash
        npm uninstall @tiptap/react @tiptap/starter-kit @tiptap/pm @tiptap/extension-placeholder
        ```

#### 3. Missing Task: Simplify the Dashboard Page

The `/dashboard` page is a complex component in Lexity, full of charts and logic tied to journals and analytics. It will break without significant refactoring.

**Why this is critical:** Leaving this complex, broken page will create noise and errors during development. It should be simplified to a clean placeholder, just like the other new pages.

**Recommended Addition:**

-   `[ ]` **Task 4.3: Simplify the Dashboard Page to a Placeholder**
    -   **File:** `src/app/dashboard/page.tsx`
    -   **Action:** Replace the entire content of the file with a simple placeholder, removing all data-fetching hooks and complex components.
    -   **Content:**
        ```tsx
        import React from 'react';

        export default function DashboardPage() {
          return (
            <div className="container mx-auto p-4">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p>Placeholder for the main user dashboard. This will display the user's latest scan, progress summary, and routine overview.</p>
            </div>
          );
        }
        ```

#### 4. Missing Task: Clean Up End-to-End Tests

The `e2e/` directory contains tests that are now completely invalid as they target Lexity's features (`journal`, `translator`, etc.).

**Why this is critical:** Broken tests create noise and will fail CI/CD pipelines. They should be removed to make way for new, relevant E2E tests in a later phase.

**Recommended Addition:**

-   `[ ]` **Task 5.3: Remove Obsolete End-to-End Tests**
    -   **Action:** Execute the following command to remove all Lexity-specific E2E test files, preparing a clean slate for Skinova tests in Phase J.
    -   **Command:**
        ```bash
        rm -rf e2e/*.spec.ts
        ```

