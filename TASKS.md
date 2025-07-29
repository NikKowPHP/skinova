My plan is to execute Phase D, which establishes the entire data layer for the Skinova application.

Here's my step-by-step implementation plan:

1.  **Define the Schema:** I will replace the entire content of `prisma/schema.prisma` with the new schema tailored for Skinova. This includes all the necessary models like `SkinScan`, `SkinAnalysis`, `Routine`, `Product`, and `Consultation`.

2.  **Update Environment Variables:** I will add the new seeding variables (`ADMIN_EMAIL` and `ADMIN_USER_ID`) to the `.env.example` file.

3.  **Implement the Seed Script:** I will replace the content of `prisma/seed.cts` with the comprehensive new seed script. This script is crucial as it populates the database with a product catalog, an admin user, and mock scan data, ensuring the application is testable immediately after setup. It will also correctly use the `encrypt` function for sensitive data.

4.  **Database Migration & Seeding Commands:** I will provide the necessary `BASH COMMANDS` to remove the old Lexity migrations, generate the new `init` migration for Skinova, and run the new seed script.

5.  **Update Task Tracking:** I will mark Phase D as complete in `docs/master_plan.md` and update `TASKS.md` accordingly.

### BASH COMMANDS
```bash
rm -rf "prisma/migrations"
npx prisma migrate dev --name init
npx prisma db seed
```
-------------------------------------------------------------------------------
### .env.example
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

# --- Seeding ---
# Used by `prisma/seed.cts` to create a default admin user.
# Use a real Supabase Auth UID for the ID if you want to log in as this user.
ADMIN_EMAIL="admin@skinova.app"
ADMIN_USER_ID="00000000-0000-0000-0000-000000000000"
```
-------------------------------------------------------------------------------
### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ENUMS
enum SkinType {
  NORMAL
  OILY
  DRY
  COMBINATION
  SENSITIVE
}

enum ConcernSeverity {
  MILD
  MODERATE
  SEVERE
}

// USER & AUTH
model User {
  id                 String    @id
  email              String    @unique
  supabaseAuthId     String    @unique
  status             String    @default("ACTIVE") // e.g., ACTIVE, DELETION_PENDING

  // Skin Profile
  skinType           SkinType?
  primaryConcern     String?

  // Monetization
  stripeCustomerId   String? @unique
  subscriptionTier   String  @default("FREE")
  subscriptionStatus String?

  // Onboarding
  onboardingCompleted Boolean @default(false)

  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  // Relations
  scans              SkinScan[]
  routine            Routine?
  consultations      Consultation[]
}

// CORE SCAN & ANALYSIS
model SkinScan {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  imageUrl  String   @db.Text // Encrypted signed URL from storage
  notes     String?  @db.Text // Encrypted user notes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  analysis      SkinAnalysis?
  consultations Consultation[]
}

model SkinAnalysis {
  id            String   @id @default(cuid())
  scanId        String   @unique
  scan          SkinScan @relation(fields: [scanId], references: [id], onDelete: Cascade)

  // AI Output
  overallScore  Int
  analysisJson  String   @db.Text // Encrypted structured JSON with detailed analysis
  rawAiResponse String   @db.Text // Encrypted raw AI response for debugging/retries

  createdAt     DateTime @default(now())

  // Relations
  concerns      IdentifiedConcern[]
}

model IdentifiedConcern {
  id          String          @id @default(cuid())
  analysisId  String
  analysis    SkinAnalysis    @relation(fields: [analysisId], references: [id], onDelete: Cascade)

  name        String          // e.g., "Acne", "Hyperpigmentation"
  severity    ConcernSeverity
  description String          @db.Text

  // For mapping to the image
  boundingBoxJson String? // JSON string of coordinates for highlighting on the image
}

// ROUTINE & PRODUCTS
model Routine {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  steps     RoutineStep[]
}

model RoutineStep {
  id          String   @id @default(cuid())
  routineId   String
  routine     Routine  @relation(fields: [routineId], references: [id], onDelete: Cascade)

  productId   String
  product     Product  @relation(fields: [productId], references: [id])

  stepNumber  Int
  timeOfDay   String   // "AM" or "PM"
  instructions String  @db.Text // e.g., "Apply a pea-sized amount"
}

model Product {
  id          String        @id @default(cuid())
  name        String
  brand       String?
  type        String        // e.g., "Cleanser", "Serum", "Moisturizer"
  description String        @db.Text

  // Relations
  routines    RoutineStep[]
}

// CONSULTATIONS (Pay-per-use)
model Consultation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scanId    String
  scan      SkinScan @relation(fields: [scanId], references: [id], onDelete: Cascade)

  status    String   @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED
  stripePaymentId String? @unique
  
  notes     String? @db.Text // Encrypted notes from the dermatologist

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// UTILITY MODELS (Inherited from Lexity)
model ProcessedWebhook {
  id        String   @id @default(cuid())
  eventId   String   @unique
  type      String
  createdAt DateTime @default(now())
}

model SystemSetting {
  key       String   @id
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
-------------------------------------------------------------------------------
### prisma/seed.cts
```typescript
import { PrismaClient, SkinType, ConcernSeverity } from "@prisma/client";
import { encrypt } from "../src/lib/encryption"; // Import the encryption service

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Skinova database...");

  // --- Static System Settings ---
  await prisma.systemSetting.upsert({
    where: { key: "earlyAdopterModeEnabled" },
    update: {},
    create: {
      key: "earlyAdopterModeEnabled",
      value: { enabled: true },
    },
  });
  console.log("Seeded initial system settings.");

  // --- Admin User ---
  const adminEmail = process.env.ADMIN_EMAIL || "admin@skinova.app";
  const adminUserId = process.env.ADMIN_USER_ID || "00000000-0000-0000-0000-000000000000";
  
  const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
          id: adminUserId,
          supabaseAuthId: adminUserId,
          email: adminEmail,
          subscriptionTier: "ADMIN",
          skinType: SkinType.NORMAL,
          onboardingCompleted: true
      }
  });
  console.log(`Ensured admin user exists: ${adminEmail}`);

  // --- Seed a Default Routine for the Admin User ---
  await prisma.routine.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
    },
  });
  console.log(`Ensured default routine exists for admin user.`);

  // --- Seed a Mock Scan and Analysis for immediate UI testing ---
  const existingScan = await prisma.skinScan.findFirst({ where: { userId: adminUser.id } });
  if (!existingScan) {
    const mockScan = await prisma.skinScan.create({
      data: {
        userId: adminUser.id,
        imageUrl: encrypt("https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop"),
        notes: encrypt("This is the first seeded scan for the admin user."),
        analysis: {
          create: {
            overallScore: 88,
            analysisJson: encrypt(JSON.stringify({ skinCondition: "Good", hydration: "Optimal" })),
            rawAiResponse: encrypt(JSON.stringify({ message: "Mock AI response" })),
            concerns: {
              create: [
                { name: "Mild Redness", severity: ConcernSeverity.MILD, description: "Slight inflammation detected on the cheek area." },
                { name: "Dehydration", severity: ConcernSeverity.MODERATE, description: "Fine lines on the forehead indicate a lack of hydration." },
              ]
            }
          }
        }
      }
    });
    console.log(`Created mock scan and analysis (ID: ${mockScan.id}) for admin user.`);
  }

  // --- Product Catalog ---
  console.log("Seeding product catalog...");
  const products = [
    // Cleansers
    { name: 'Gentle Hydrating Cleanser', type: 'Cleanser', brand: 'BrandA', description: 'A mild, non-stripping cleanser for all skin types.' },
    { name: 'Salicylic Acid Cleanser', type: 'Cleanser', brand: 'BrandB', description: 'An exfoliating cleanser for oily and acne-prone skin.' },
    
    // Serums
    { name: 'Vitamin C Serum', type: 'Serum', brand: 'BrandA', description: 'A brightening antioxidant serum for daytime use.' },
    { name: 'Hyaluronic Acid Serum', type: 'Serum', brand: 'BrandC', description: 'Provides intense hydration for dry and dehydrated skin.' },
    
    // Treatments
    { name: 'Retinoid Cream 0.025%', type: 'Treatment', brand: 'BrandB', description: 'A prescription-strength retinoid for anti-aging and acne.' },
    { name: 'Benzoyl Peroxide Gel 5%', type: 'Treatment', brand: 'BrandD', description: 'An effective spot treatment for inflammatory acne.' },
    
    // Moisturizers
    { name: 'Daily Hydration Lotion', type: 'Moisturizer', brand: 'BrandA', description: 'A lightweight daily moisturizer with ceramides.' },
    { name: 'Night Repair Cream', type: 'Moisturizer', brand: 'BrandC', description: 'A rich, nourishing cream for overnight skin repair.' },
    
    // Sunscreens
    { name: 'SPF 50+ Mineral Sunscreen', type: 'Sunscreen', brand: 'BrandD', description: 'A broad-spectrum physical sunscreen for sensitive skin.' },
    { name: 'SPF 30 Chemical Sunscreen', type: 'Sunscreen', brand: 'BrandB', description: 'A lightweight, non-greasy chemical sunscreen.' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```
-------------------------------------------------------------------------------
### docs/master_plan.md
```markdown
# **Skinova: Master Implementation Plan (v1)**

This document outlines the high-level, phased plan for building the **Skinova** **Progressive Web App**. It serves as the single source of truth for the development roadmap, guiding the team through each stage of implementation from initial setup to deployment readiness. The successful completion of all phases will result in a fully functional, production-ready application.

## The Plan

### `[x]` Phase A: Project Setup & Initial Scaffolding

**Goal:** Execute all initial project setup, including environment configuration, dependency installation, and boilerplate removal. Scaffold all primary pages, routes (`/scan`, `/routine`, `/progress`, `/settings`, `/admin`), and the foundational folder structure required for the application. The output will be a clean, prepared codebase ready for feature implementation.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-a-setup-and-scaffolding.md`]*

---

### `[x]` Phase B: Static Component Implementation

**Goal:** Systematically build all new, static, and reusable UI components required by Skinova's core features. This includes the `ScanUploadForm`, `AnalysisResultDisplay` with image overlay capabilities, `RoutineCard`, `ProgressChart`, and `ConsultationModal`. Integrate these components into the scaffolded pages from Phase A, **using mock or hardcoded data** to ensure the UI is developed independently and rapidly.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-b-static-components.md`]*

---

### `[x]` Phase C: Theming & Visual Polish

**Goal:** Implement the application's design system, including light/dark mode functionality, typography, color palettes, and spacing. Conduct a full visual review to refine styling, ensuring a cohesive and polished look and feel across all components and pages, reflecting the Skinova brand.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-c-theming-and-polish.md`]*

---

### `[x]` Phase D: Database Schema & Seeding

**Goal:** Establish the application's data layer. This involves implementing the final database schema using Prisma for all core models (`User`, `SkinScan`, `SkinAnalysis`, `IdentifiedConcern`, `Routine`, `RoutineStep`, `Product`, `Consultation`), running the initial database migration, and creating seed scripts to populate the database with essential starting data (e.g., the `Product` catalog, subscription plan details, an initial admin user).

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-d-database-schema.md`]*

---

### `[ ]` Phase E: Core Feature API Implementation

**Goal:** Build the essential backend API routes for all core user-facing features. This includes the complete business logic and CRUD operations for **Skin Scanning & Analysis**, **Personalized Routine Management**, **Progress Tracking**, and **User Data Portability (Export/Delete)**, ensuring all routes are protected by the Supabase authentication strategy.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-e-core-api.md`]*

---

### `[ ]` Phase F: Frontend API Integration

**Goal:** Make the application fully dynamic by connecting the static frontend to the live backend. This involves **replacing all mock data** in the UI with live data fetched from the API, using `@tanstack/react-query` for data fetching, caching, mutations, and optimistic updates for features like submitting a new `SkinScan`.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-f-frontend-integration.md`]*

---

### `[ ]` Phase G: Monetization & Billing Integration

**Goal:** Implement the complete monetization lifecycle by integrating with Stripe. This includes creating checkout sessions for both **Pro tier subscriptions** and **pay-per-use teledermatology consultations**, providing a customer portal for management, and building a secure webhook endpoint to synchronize billing status with the application database.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-g-billing-integration.md`]*

---

### `[ ]` Phase H: Backend Automation & Advanced Services

**Goal:** Build the automated and asynchronous systems that power the app's unique value. This includes implementing the **end-to-end AI Image Analysis Pipeline** (securely fetching from storage, calling the multi-modal AI, parsing results) and the **Weekly Scan Reminder** email engine using cron jobs and the Resend API.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-h-backend-automation.md`]*

---

### `[ ]` Phase I: Admin Dashboard & Internal Tooling

**Goal:** Develop the necessary internal tools for application management. This involves building a secure admin dashboard where authorized users can **manage user accounts and subscriptions**, **review teledermatology consultation requests**, and **manage the master `Product` catalog**.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-i-admin-dashboard.md`]*

---

### `[ ]` Phase J: Final Testing & Deployment Preparation

**Goal:** Ensure the application is stable, secure, and ready for production. This includes end-to-end manual and automated (Playwright) testing of all user flows, especially the image upload workflow. Set up production-grade observability (Sentry, PostHog), and configure all production environment variables and security policies (CSP) for deployment.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-j-testing-and-deployment.md`]*

---

## Feature Coverage Traceability Matrix

This matrix demonstrates that 100% of the features defined in the `Skinova: Technical Application Description` are covered by this master plan, ensuring complete alignment between vision and execution.

| Epic from App Description | Primary Implementation Phase(s) |
| :--- | :--- |
| **Epic 1: User Onboarding & Auth** | **Phase E** (Backend Logic), **Phase F** (Frontend Integration) |
| **Epic 2: Skin Scanning & AI Analysis** | **Phase B** (Static UI), **Phase E** (API), **Phase F** (Integration), **Phase H** (AI Pipeline) |
| **Epic 3: Personalized Routines & Progress Tracking** | **Phase B** (Static UI), **Phase D** (DB Models), **Phase E** (API), **Phase F** (Integration) |
| **Epic 4: Monetization (Subscription & Consultation)** | **Phase G** (Billing Integration) |
| **Epic 5: Automated Process (Scan Reminders)** | **Phase H** (Backend Automation) |
| **Epic 6: Admin Management** | **Phase D** (Admin user seed), **Phase I** (Admin Dashboard) |
| **Epic 7: User Data Portability & Deletion** | **Phase E** (API for Export/Delete) |
| **Core System & Infrastructure** | **Phase A** (Setup), **Phase D** (DB), **Phase E** (API), **Phase H** (Cron), **Phase J** (Observability) |
```
-------------------------------------------------------------------------------
### TASKS.md
```markdown
- [x] Implement Phase A: Project Setup & Initial Scaffolding
- [x] Correct oversights from initial Phase A implementation (icons, hooks, tests)
- [x] Implement Phase B: Static Component Implementation
- [x] Fix missed `SkinProfileWizard` integration from Phase B
- [x] Implement Phase C: Theming & Visual Polish
- [x] Fix missed component styling from Phase C (Card, Button)
- [x] Implement Phase D: Database Schema & Seeding
```