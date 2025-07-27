Of course. Here are the two final, comprehensive, and production-ready planning documents for the Skinova project. These documents incorporate all the strategic decisions, technical details, and operational considerations we have discussed.

1.  **Technical Application Description (v1.4):** The "what and why." This is the single source of truth for the project's vision, architecture, and core requirements.
2.  **Master Implementation Plan (v1.2):** The "how and when." This is the actionable roadmap for building, testing, and deploying the application.

Together, they form a complete and professional blueprint ready for execution.

---
---

# **Document 1: Skinova Technical Application Description (v1.4)**

### *An Adaptation of the Lexity Framework*

## 1. Vision & Architectural Philosophy

**Skinova** is a **Progressive Web App** designed to **provide users with hyper-personalized skincare routines via AI-driven image analysis and direct access to teledermatology services.** Our architecture, adapted from the proven Lexity framework, prioritizes **end-to-end type-safety**, **robust data privacy through application-layer encryption**, and a **seamless, mobile-first user journey**.

The core philosophy is to **transform skincare from guesswork into a data-driven science**. We believe that by providing accessible, intelligent analysis, we can empower users to understand their skin's unique needs. This application is designed not as a **simple product catalog**, but as a **Personalized Skin Health Logbook** to help users **methodically track, understand, and improve their skin health over time**.

Our core development loop mirrors Lexity's proven `Input -> Analyze -> Action` cycle:
1.  **Scan:** The user provides an image (the input).
2.  **Analyze:** The multi-modal AI provides structured feedback (the analysis).
3.  **Act:** The user receives recommendations and can optionally seek professional consultation (the action).
4.  **Track:** The history of scans creates a visual log of progress.

Furthermore, we are deeply committed to **data privacy and security**, a principle inherited from the Lexity architecture. Our hybrid **freemium and pay-per-use model** is built on the foundation that **user data is never sold and sensitive information is encrypted at the application layer**. The premium tier and pay-per-use consultations fund the app's development and offer **advanced analytics, historical progress tracking, and professional medical advice**.

## 2. Architectural Overview

The system is built upon a **clean separation of concerns** within a **Next.js monorepo**, leveraging the established patterns of the Lexity project. This approach utilizes **server components for performance** and **dedicated API services for backend logic**, ensuring a cohesive and scalable development environment.

```mermaid
graph TD
    subgraph User Device
        A[Client App on Browser/Mobile]
    end

    subgraph Hosting / Frontend Layer
        B([Next.js App])
        B -- Serves UI --> A
        B -- API Calls --> C
    end

    subgraph Backend Services & APIs
        C{ Skinova API }
        D[Supabase Auth]
        E[Supabase Storage (for user selfies)]
        F[Database (PostgreSQL via Prisma)]
        G[Stripe API (for Payments & Subscriptions)]
        H[SendGrid (for Email Notifications)]
        J[Google Gemini API (for Skin Analysis)]
    end

    %% User Flow: Skin Analysis
    A -- "1. Signs In/Up" --> D
    A -- "2. Uploads Selfie" --> E
    E -- "3. Triggers API" --> C
    
    %% User Flow: Teledermatology
    A -- "Requests Teledermatology Consult" --> G

    %% Backend Flow: Analysis Pipeline
    C -- "4. Verifies User Token" --> D
    C -- "5. Sends image for processing" --> J
    J -- "6. Returns structured analysis" --> C
    C -- "7. Encrypts & saves results to DB" --> F
    C -- "8. Notifies user" --> H

    %% Backend Flow: Payment & Consultation
    C -- "Manages Subscription Status" --> G
    C -- "Manages Consultation Payment" --> G
    G -- "Webhook on Payment Success" --> C
    C -- "Creates Consultation Record" --> F
```

**Flow Description:**

1.  **Client:** The user interacts with the **Next.js** frontend.
2.  **Authentication & Storage:** **Supabase** provides a complete, secure solution for user management (Auth) and encrypted storage for user-submitted images (Storage).
3.  **Application Backend:** Core business logic resides in **Next.js API Routes**. These endpoints are protected by **JWT verification** via Supabase.
4.  **Database Interaction:** **Prisma** acts as the type-safe layer between our application logic and the **PostgreSQL** database. Sensitive data (analysis results, consultation notes) is encrypted via our `encryption.ts` utility before persistence.
5.  **Payment Processing:** **Stripe** handles both recurring premium subscriptions and one-time payments for teledermatology consultations. Our backend listens to webhooks to sync state and create consultation records.
6.  **Asynchronous Tasks:** Background tasks like **sending email notifications** and long-running **AI analysis jobs** are handled by **Vercel Functions**.

## 3. Core Tech Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15+** | Inherited from Lexity. The App Router, Server Components, and integrated API routes provide a high-performance, full-stack development experience. |
| **Database** | **PostgreSQL** | Inherited from Lexity. Chosen for its robustness, reliability, and powerful features for handling sensitive user data and relational analysis history. |
| **ORM** | **Prisma** | Inherited from Lexity. Provides end-to-end type safety from the database to the frontend, simplifying data access and eliminating entire classes of bugs. |
| **Authentication** | **Supabase Auth** | Inherited from Lexity. A secure, feature-rich, and easy-to-integrate solution for user management. |
| **Payments** | **Stripe** | Inherited from Lexity. The market leader for developer-friendly payments, supporting both subscriptions and one-time payments required for our model. |
| **AI / Core Engine**| **Google Gemini API** | **[LEVERAGED]** Inherited from Lexity. The framework already includes a robust, key-rotated Gemini service capable of multi-modal (text and image) analysis. We will adapt the existing implementation to process skin images. |
| **Encryption** | **`crypto` (Node.js)** | Inherited from Lexity. The `encryption.ts` service provides critical application-layer encryption (AES-256-GCM) for all sensitive user data. |
| **Styling** | **Tailwind CSS + shadcn/ui** | Inherited from Lexity. A utility-first approach that enables rapid, consistent UI development with a strong foundation of accessible components. |
| **Deployment** | **Vercel** | Inherited from Lexity. The ideal platform for Next.js, providing seamless CI/CD, serverless functions, and a global CDN. |

## 4. Key NPM Libraries & Tooling
-   **State Management:** `Zustand`
-   **Data Fetching & Mutation:** `@tanstack/react-query`
-   **Forms:** `react-hook-form`
-   **Schema Validation:** `Zod`
-   **UI Components:** `shadcn/ui`
-   **Utilities:** `date-fns`, `clsx`, `lucide-react`

## 5. Monetization Strategy: Hybrid (Freemium & Pay-Per-Use)
| Tier / Service | Price | Key Features | Target Audience |
| :--- | :--- | :--- | :--- |
| **Free** | $0 | • AI Skin Analysis (2 per month)<br>• Basic personalized routine<br>• Access to educational content | Individuals in Poland (18-45) curious about personalized skincare. |
| **Premium** | ~25 PLN / month | All Free features, plus:<br>• Unlimited & advanced AI analysis<br>• Historical skin progress tracking<br>• E-commerce discounts & price comparisons | Dedicated skincare enthusiasts who want to track their journey and optimize their routine. |
| **Teledermatology**| ~120 PLN (Pay-Per-Use) | • Secure image submission to a licensed dermatologist<br>• Professional review & personalized diagnosis<br>• Secure in-app report delivery | Any user with a specific skin concern seeking fast, professional medical advice. |

## 6. High-Level Database Schema

*This schema is an adaptation of Lexity's model, repurposed for the Skinova domain. Sensitive text fields will be encrypted using the inherited `encryption.ts` utility.*
```prisma
model User {
  id               String    @id
  // ... (keep existing fields like email, supabaseAuthId, stripeCustomerId, etc.)
  skinAnalyses   SkinAnalysis[]
  consultations  Consultation[]
}

model SkinAnalysis {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  imageUrl  String
  results   String   @db.Text // Encrypted JSON from the Vision AI
  createdAt DateTime @default(now())
}

model Consultation {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status         String   @default("PENDING") // PENDING, IN_REVIEW, COMPLETED
  imageUrls      String[]
  userNotes      String?  @db.Text // Encrypted
  dermatologistReport String?  @db.Text // Encrypted
  stripePaymentId String   @unique
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## 7. Development Epics & User Stories
- **Epic 1: Core System & Infrastructure:** Handle Stripe webhooks, build the AI analysis pipeline, and gate features by subscription tier.
- **Epic 2: User Account & Authentication:** Implement user registration and login.
- **Epic 3: Core Feature - AI Skin Analysis:** Implement the free-tier image upload, analysis report, and the premium historical tracking feature.
- **Epic 4: Monetization:** Build the pricing page, Stripe Checkout for one-time consultations, and a customer portal for future subscriptions.
- **Epic 5: Dermatologist Portal:** Build a secure portal for dermatologists to review pending consultations and submit reports.

## 8. Development & Compliance Practices

### 8.1. UI/UX Philosophy
The application will be built with a **mobile-first** philosophy and a design system inspired by **Apple's Human Interface Guidelines (HIG)**, favoring clarity, depth through layers, and a clean aesthetic.

### 8.2. Code Quality & Best Practices
-   **Folder Structure:** Feature-based (`/features/skin-analysis`).
-   **Type Safety:** End-to-end type safety with Zod and Prisma.
-   **Security:** Application-layer encryption for all sensitive data.

### 8.3. Compliance & Data Handling (PHI/GDPR)
-   **Data Classification:** User images and consultation data are considered Protected Health Information (PHI).
-   **Legal Counsel:** We will engage a lawyer specializing in health-tech and GDPR.
-   **Required Documents:** Terms of Service, Privacy Policy, and Dermatologist Contracts will be formally drafted.
-   **User Consent Flow:** A legally-reviewed, explicit consent checkbox will be required before image upload.

### 8.4. Observability Strategy
-   **Error Tracking:** Sentry.
-   **Performance Monitoring:** Vercel Analytics.
-   **Structured Logging:** For key backend processes.

### 8.5. Reactive UI & Performance Philosophy
-   **Skeletons for Initial Loading States:** Use layout placeholders (`skeleton.tsx`) during initial data fetches.
-   **Reactive Button and Control States:** Buttons will enter a loading state using `Spinner.tsx`, controlled by `useMutation`.
-   **Optimistic UI Updates:** For low-risk operations, the UI will update instantly, managed by `react-query`.

### 8.6. AI Provider Abstraction & Future-Proofing
All AI service calls will be made through an abstracted service interface. This ensures that in the future, we can easily integrate, swap, or A/B test different AI models (such as those from **Cerebras** or **Groq**) with minimal refactoring.

## 9. MVP Scope & Phasing
-   **Phase 1: MVP (Target: Q4 2024):** Focus on core user authentication, the free AI analysis flow, the pay-per-use teledermatology loop, and a basic dermatologist portal.
-   **Phase 2: Post-MVP (First Major Update):** Introduce the recurring revenue (Premium) model and enhance user retention features like historical tracking.

## 10. Potential Risks & Mitigation
| Risk Category | Risk Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Technical** | AI analysis yields inaccurate results. | Add clear disclaimers that the AI is a guide, not a medical diagnosis. Have a human dermatologist review a sample of results to calibrate. |
| **Product** | Low conversion rate for pay-per-use consultations. | Price competitively, feature dermatologist credentials prominently, and offer a first-time user discount. |
| **Compliance**| **[HIGH RISK]** Mishandling of PHI creates GDPR liability. | Enforce application-layer encryption on all PHI. Implement strict, role-based access control. Consult with legal experts throughout development. |
| **Resource** | Teledermatology service becomes a bottleneck. | For MVP, partner with a small group of dermatologists and cap daily consultations. Build a scalable onboarding process for future phases. |

## 11. Future Scope & Roadmap Ideas
-   E-commerce integration with retailers like Hebe/Rossmann.
-   AR Product Try-On feature.
-   Community platform for users.
-   B2B white-label solution for clinics.

## 12. Business & Operational Readiness
-   **Go-to-Market Strategy:**
    -   **Beta Testing:** Closed beta with 50-100 Polish users.
    -   **Launch Strategy:** Focus on the Polish market via influencer collaborations and targeted social media ads.
-   **Customer Support Plan:**
    -   **Channel:** `support@skinova.app`.
    -   **SLA:** 24-hour target response time.
-   **Key Performance Indicators (KPIs):**
    1.  **Activation Rate:** % of signups completing their first scan.
    2.  **Scan-to-Consultation Conversion Rate:** % of free users purchasing a consultation.
    3.  **Weekly Active Users (WAU).**
    4.  **User Retention (Cohort Analysis).**

---
---
