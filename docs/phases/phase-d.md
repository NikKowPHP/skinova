
# **Phase D: Database Schema & Seeding**

**Goal:** Establish the application's data layer. This involves implementing the final database schema using Prisma, running the initial database migration, and creating a seed script to populate the database with essential starting data (e.g., the product catalog, a fully provisioned admin user, and mock data for immediate UI testing). The "definition of done" for this phase is a clean, migrated, and seeded database that is ready to be connected to the backend API in the next phase.

---

### 1. Database Schema Implementation

-   `[ ]` **Task 1.1: Define the Core Skinova Schema**

    -   **File:** `prisma/schema.prisma`
    -   **Action:** Replace the entire content of the file with the new schema tailored for Skinova. This schema introduces models for `SkinScan`, `SkinAnalysis`, `IdentifiedConcern`, `Routine`, `Product`, and `Consultation`, while adapting the `User` model. **Note the use of `@db.Text` for encrypted fields.**
    -   **Content:**
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
          analysis  SkinAnalysis?
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

---

### 2. Database Migration & Environment

-   `[ ]` **Task 2.1: Update `.env.example` with Seeding Variables**

    -   **File:** `.env.example`
    -   **Action:** Add the new seeding-specific variables to the `.env.example` file to ensure the seed script is fully configurable.
    -   **Content Snippet to Add:**
        ```
        # --- Seeding ---
        # Used by `prisma/seed.cts` to create a default admin user.
        # Use a real Supabase Auth UID for the ID if you want to log in as this user.
        ADMIN_EMAIL="admin@skinova.app"
        ADMIN_USER_ID="00000000-0000-0000-0000-000000000000"
        ```

-   `[ ]` **Task 2.2: Generate and Apply the Initial Migration**

    -   **Action:** First, remove all old migrations from the Lexity project. Then, generate a new "init" migration based on the Skinova schema and apply it to your local database.
    -   **Prerequisite:** Ensure your local Docker database is running (`docker-compose up -d db`).
    -   **Command:**
        ```bash
        # 1. Remove old migration history to start fresh
        rm -rf prisma/migrations
        
        # 2. Generate the new migration for Skinova
        npx prisma migrate dev --name init
        ```
    -   **Expected Output:** A new folder `prisma/migrations/[timestamp]_init` will be created, and your local database will be updated with the new tables.

---

### 3. Data Seeding

-   `[ ]` **Task 3.1: Create the Comprehensive Seed Script for Skinova**

    -   **File:** `prisma/seed.cts`
    -   **Action:** Replace the entire content of the file with a new seed script that populates the database with a complete initial state: an admin user with an associated (empty) routine, one mock scan/analysis for UI testing, system settings, and a product catalog.
    -   **Content:**
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

-   `[ ]` **Task 3.2: Run the Seed Script**

    -   **Action:** Execute the seed script to populate your local database.
    -   **Prerequisite:** The `APP_ENCRYPTION_KEY` must be set in your `.env` file for the seed script to run successfully.
    -   **Command:**
        ```bash
        npx prisma db seed
        ```
    -   **Expected Output:** Console logs indicating that the settings, a fully provisioned admin user, a mock scan, and the product catalog have been successfully seeded. You can verify this by opening Prisma Studio (`npx prisma studio`).