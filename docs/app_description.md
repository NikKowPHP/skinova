

# Skinova Technical Application Description (v1.5)

### *An Adaptation of the Lexity Framework*

## 1. Vision & Architectural Philosophy

**Skinova** is a **Progressive Web App** designed to **provide users with hyper-personalized skincare routines via AI-driven image analysis and direct access to teledermatology services.** Our architecture, adapted from the proven Lexity framework, prioritizes **end-to-end type-safety**, **robust data privacy through application-layer encryption**, and a **seamless, mobile-first user journey**.

The core philosophy is to **transform skincare from guesswork into a data-driven science**. We believe that by providing accessible, intelligent analysis, we can empower users to understand their skin's unique needs. This application is designed not as a **simple product catalog**, but as a **Personalized Skin Health Logbook** to help users **methodically track, understand, and improve their skin health over time**.

Our core development loop mirrors Lexity's proven `Input -> Analyze -> Action` cycle:
1.  **Scan:** The user provides an image (the input).
2.  **Analyze:** The multi-modal AI provides structured feedback (the analysis).
3.  **Act:** The user receives recommendations and can optionally seek professional consultation (the action).
4.  **Track:** The history of scans creates a visual log of progress.

Furthermore, we are deeply committed to **data privacy and security**, a principle inherited from the Lexity architecture. Our hybrid **freemium and pay-per-use model** is built on the foundation that **user data is never sold, is encrypted at the application layer, and remains fully portable via a data export feature**. The premium tier and pay-per-use consultations fund the app's development and offer **advanced analytics, historical progress tracking, and professional medical advice**.

## 2. Core Functionality & User Journeys

The application is built around four primary journeys:

### A. The Scan & Analysis Loop
- A `User` uploads a `SkinScan` (an image of their face), potentially adding notes.
- The scan is submitted to the `/api/scan/analyze` endpoint.
- An `SkinAnalysis` record is created, containing structured data about identified skin concerns, overall skin health scores, and personalized recommendations.
- The analysis will contain multiple `IdentifiedConcern` records (e.g., acne, dryness, hyperpigmentation).
- The user can view their original image with highlighted areas corresponding to each identified concern.

### B. The Action & Consultation Loop
- Based on the `SkinAnalysis`, the user is presented with a recommended `Routine`.
- The routine consists of `RoutineStep`s, which are linked to specific `Product`s from our database.
- For more serious concerns, the user can initiate a pay-per-use `Consultation` with a licensed dermatologist. This is handled via a **Stripe Checkout session for a one-time payment**, which is linked directly to the `SkinScan` and its `SkinAnalysis`.

### C. The Tracking & Progress Loop
- Each `SkinScan` is saved, creating a historical, visual log of the user's skin over time.
- The dashboard will feature analytics (`/api/analytics`) showing trend lines for key skin health metrics (e.g., clarity, hydration, texture) derived from the series of `SkinAnalysis` records.
- This allows users to correlate their `Routine` adherence with tangible visual progress.

### D. Admin & Support Journey
- An administrative journey allows authorized staff to manage user accounts, view consultation histories, and handle support requests via a dedicated `/admin` dashboard. This role is protected and requires a specific subscription tier (`ADMIN`) set in the database.

## 3. Technical Architecture

### A. Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication & Storage:** Supabase
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** TanStack Query (Server State) & Zustand (Client State)
- **AI Services:** Google Gemini (Multi-modal for image analysis)
- **Testing:** Jest (Unit/Integration), Playwright (E2E)
- **Monitoring & Analytics:** Sentry, PostHog

### B. AI Service Architecture & Strategy
The application's core intelligence relies on a resilient and focused AI architecture.

- **Primary Analysis Service:** **Google Gemini with multi-modal capabilities** (`src/lib/ai/gemini-service.ts`) is the exclusive AI provider. It is responsible for processing user-submitted images and text to generate the structured `SkinAnalysis`.
- **Resilience:** The application uses a dedicated "executor" (`src/lib/ai/gemini-executor.ts`) which implements **randomized API key rotation** and an **exponential backoff retry mechanism** (`src/lib/utils/withRetry.ts`). This ensures high availability and gracefully handles transient API errors or rate limits.
- **The "Brain" of the AI:** The AI's analytical capabilities, output structure, and clinical tone are defined by prompt-engineering files located in `src/lib/ai/prompts/`. A key prompt, for example, would be `skinAnalysis.prompt.ts`, which instructs the multi-modal model how to analyze an image and return valid JSON.

### C. Critical Workflow: Image Upload and Analysis
The handling of sensitive user images follows a strict security protocol:

1.  **Client-Side Upload:** The user selects an image in the browser. The client-side code directly uploads this image to a **private Supabase Storage bucket**. This ensures the raw image data never touches our application server directly.
2.  **Secure URL Generation:** Upon successful upload, Supabase Storage returns a unique identifier for the file. Our backend then generates a time-limited, signed URL for this private file.
3.  **Data Encryption & Storage:** This temporary signed URL is encrypted using our `encryption.service` and stored in the `SkinScan.imageUrl` field in the database.
4.  **AI Analysis:** When an analysis is requested, the backend decrypts the URL, fetches the image data from the secure storage, and sends the image blob/base64 data directly to the Google Gemini multi-modal API. **The AI does not access the storage URL directly.**
5.  **Secure Viewing:** When a user needs to view their past scan, the backend generates a new short-lived signed URL for the client to render the image securely.

### D. Security: Application-Layer Encryption
Inherited directly from the Lexity framework, this is a critical security and privacy feature. All sensitive user data is encrypted at the application layer before being stored.

- **Service:** `src/lib/encryption.ts` provides `encrypt` and `decrypt` functions using `AES-256-GCM`.
- **Encrypted Fields (`prisma/schema.prisma`):**
    - `SkinScan.imageUrl` (The URL to the private, encrypted image file)
    - `SkinScan.notes`
    - `SkinAnalysis.analysisJson`, `SkinAnalysis.rawAiResponse`
    - `Consultation.notes`
- **Implication:** Sensitive user photos and health data are unreadable at rest, even with direct database access. All data must be passed through the application's encryption service to be viewed.

### E. State Management Strategy
The application uses a dual strategy for state management:

1.  **Server State (TanStack Query):** All server interactions (fetching scans, submitting data) are managed by TanStack Query. Hooks are centralized in `src/lib/hooks/data/`. This provides robust caching, request deduplication, and optimistic updates for a fluid user experience.
2.  **Global Client State (Zustand):** Zustand manages ephemeral, cross-cutting client state. Key stores include:
    - `src/lib/stores/auth.store.ts`: Current user session and auth status.
    - `src/lib/stores/onboarding.store.ts`: Manages the state for the new user guided tour.

### F. Onboarding Flow Logic
The new user experience is a stateful, guided tour managed by `src/lib/stores/onboarding.store.ts`.

- **`SKIN_PROFILE_SETUP`:** User provides their skin type, primary concerns, and goals.
- **`FIRST_SCAN`:** User is guided to take and upload their first photo.
- **`VIEW_ANALYSIS`:** After the AI analysis is complete, the user is prompted to view their results.
- **`CREATE_ROUTINE`:** The user is shown their first recommended routine and prompted to save it.
- **`VIEW_PROGRESS_LOG`:** The user is shown their new Skin Health Logbook, which now contains its first entry.
- **`COMPLETED`:** The flow is finalized and the user's profile is marked `onboardingCompleted=true`.

### G. Scheduled & Background Tasks
- A weekly cron job (`/api/cron/scan-reminder`) is configured to send users an email notification, encouraging them to perform their weekly scan and maintain their progress log. This is secured via a `CRON_SECRET` environment variable.

## 4. Data Models
The database schema (`prisma/schema.prisma`) is designed around the core user journey.

- **User:** The central model. Contains profile information like `skinType` and `skinGoals`.
- **SkinScan:** Replaces `JournalEntry`. Contains an encrypted `imageUrl` and optional `notes`.
- **SkinAnalysis:** Replaces `Analysis`. Linked to a `SkinScan`, it stores the structured JSON output from the AI.
- **IdentifiedConcern:** Replaces `Mistake`. Linked to a `SkinAnalysis`, it details a specific issue (e.g., 'acne'), its location, and severity.
- **Routine:** A collection of `RoutineStep`s for a `User`. A `User` has **one active `Routine`** at any given time. Each new `SkinAnalysis` or `Consultation` can generate recommendations that **update** this single, canonical routine.
- **RoutineStep:** An action in a routine, linked to a `Product` (e.g., "AM - Cleanser").
- **Product:** A generic product that can be recommended in a routine.
- **Consultation:** Links a `User` and a `SkinScan` to a dermatologist for a paid review.

## 5. Key Directories & API Endpoints

- `src/app/api/`: All backend API routes (`/api/scan/`, `/api/consultation/`, `/api/admin/`).
- `src/app/(pages)/`: Next.js App Router pages (`/scan`, `/routine`, `/progress`, `/admin`).
- `src/components/`: Reusable UI components.
- `src/lib/`: Core application logic.
    - `src/lib/ai/`: All AI service clients, executors, and prompts.
    - `src/lib/hooks/`: All TanStack Query hooks.
    - `src/lib/stores/`: Zustand stores for global client state.
- `prisma/`: Database schema, migrations, and seed script.
- `e2e/`: Playwright end-to-end tests.

#### Core API Endpoints

| Action | Endpoint | Description |
| :--- | :--- | :--- |
| Upload Scan & Request Analysis | `POST /api/scan/analyze` | Initiates the core analysis loop. |
| Fetch Scan History | `GET /api/scan` | Retrieves a user's historical scans. |
| Fetch Single Scan | `GET /api/scan/[id]` | Retrieves a specific scan and its analysis. |
| Manage Routine | `PUT /api/routine` | Updates the user's active skincare routine. |
| Initiate Consultation | `POST /api/consultation/checkout` | Creates a Stripe session for a new consultation. |
| Export User Data | `GET /api/user/export` | Allows the user to download a JSON file of all their scan and analysis data. |

## 6. Setup & Configuration

### A. Setup Steps
1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Set up the `.env` file using `.env.example` as a template.
4.  Start the database: `docker-compose up -d db`.
5.  Run database migrations: `npx prisma migrate dev`.
6.  (Optional) Seed the database: `npx prisma seed`.
7.  Run the development server: `npm run dev`.

### B. Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| **Database** | | |
| `DATABASE_URL` | Connection string for PostgreSQL. | `postgresql://user:pass@host:port/db` |
| **Authentication & Storage**| | |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of your Supabase project. | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Public "anon" key for Supabase. | `ey...` |
| `SUPABASE_SERVICE_ROLE_KEY` | **SECRET:** The service role key for backend operations like generating signed URLs. | `ey...` |
| `NEXT_PUBLIC_SKIN_SCANS_BUCKET`| Name of the private Supabase Storage bucket. | `skin-scans` |
| **Security** | | |
| `APP_ENCRYPTION_KEY` | **CRITICAL:** 32-byte Base64 encoded key for data encryption. | `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=` |
| **AI Providers** | | |
| `AI_PROVIDER` | The primary provider for generation tasks. | `gemini` |
| `GEMINI_API_KEY_1` | API key for Google Gemini. Use `_2`, `_3` for more keys. | `AIza...` |
| **Billing** | | |
| `STRIPE_SECRET_KEY` | Secret key for your Stripe account. | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret for verifying Stripe webhooks. | `whsec_...` |
| `STRIPE_PRO_PRICE_ID` | Price ID for the "Pro" subscription plan. | `price_...` |
| `CONSULTATION_PRICE_ID` | The Stripe Price ID for a single pay-per-use consultation. | `price_...` |
| **Email & Cron** | | |
| `RESEND_API_KEY` | API key for Resend email service. | `re_...` |
| `CRON_SECRET` | A secret key to authorize cron job requests. | `your-secure-random-string` |
| **Monitoring & Analytics** | | |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN for Sentry error monitoring. | `https://...` |
| `SENTRY_ORG` | Your Sentry organization slug. | `your-org` |
| `SENTRY_PROJECT` | Your Sentry project slug. | `your-project` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Public key for PostHog analytics. | `phc_...` |
| `NEXT_PUBLIC_POSTHOG_HOST` | URL for your PostHog instance. | `https://app.posthog.com` |