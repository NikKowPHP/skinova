Of course. Based on the analysis, I have integrated the two missing API endpoints into the plan for Phase E. The following is the complete, updated, and final version of the plan for this phase.

---
### `docs/phases/phase-e.md`
```markdown
# **Phase E: Core Feature API Implementation**

**Goal:** Build the essential backend API routes for all core user-facing features. This includes the complete business logic and CRUD operations for **Skin Scanning & Analysis**, **Personalized Routine Management**, **Progress Tracking**, and **User Data Portability (Export/Delete)**, ensuring all routes are protected by the Supabase authentication strategy.

---

### 1. User & Onboarding API Adaptation

-   `[ ]` **Task 1.1: Adapt User Onboarding Logic**

    -   **File:** `src/app/api/user/onboard/route.ts`
    -   **Action:** Update the route to handle Skinova's onboarding data: `skinType` and `primaryConcern`. This replaces the language-learning fields.
    -   **Content:**
        ```typescript
        import { prisma } from "@/lib/db";
        import { NextResponse } from "next/server";
        import { getCurrentUser } from "@/lib/supabase/server";
        import { logger } from "@/lib/logger";
        import { z } from "zod";
        import { SkinType } from "@prisma/client";

        const onboardingSchema = z.object({
          skinType: z.nativeEnum(SkinType),
          primaryConcern: z.string().min(1),
        });

        export async function POST(request: Request) {
          const user = await getCurrentUser();
          if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          const body = await request.json();
          logger.info(`/api/user/onboard - POST - User: ${user.id}`, body);

          const parsed = onboardingSchema.safeParse(body);
          if (!parsed.success) {
            return NextResponse.json({ error: parsed.error }, { status: 400 });
          }
          
          const { skinType, primaryConcern } = parsed.data;

          try {
            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: {
                skinType,
                primaryConcern,
              },
            });

            return NextResponse.json(updatedUser);
          } catch (error) {
            logger.error("Failed to update user profile on onboarding", error);
            return NextResponse.json(
              { error: "Failed to update user profile" },
              { status: 500 },
            );
          }
        }
        ```

-   `[ ]` **Task 1.2: Adapt Profile Management API**

    -   **Action:** Update the `GET` and `PUT` handlers in the user profile route to manage Skinova-specific fields.
    -   **File:** `src/app/api/user/profile/route.ts`
    -   **Content:**
        ```typescript
        import { NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";
        import { Prisma, SkinType } from "@prisma/client";
        import { z } from "zod";

        export async function GET() {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
        
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: {
              email: true,
              skinType: true,
              primaryConcern: true,
              subscriptionTier: true,
              subscriptionStatus: true,
              onboardingCompleted: true,
            },
          });
        
          if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
          }
        
          return NextResponse.json(dbUser);
        }

        const profileUpdateSchema = z.object({
          skinType: z.nativeEnum(SkinType).optional(),
          primaryConcern: z.string().min(1).optional(),
        });

        export async function PUT(req: Request) {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
        
          try {
            const body = await req.json();
            logger.info(`/api/user/profile - PUT - User: ${user.id}`, body);
            
            const parsed = profileUpdateSchema.safeParse(body);
            if (!parsed.success) {
                return NextResponse.json({ error: parsed.error }, { status: 400 });
            }

            const updatedUser = await prisma.user.update({
              where: { id: user.id },
              data: parsed.data,
            });
        
            return NextResponse.json(updatedUser);
          } catch (error) {
            logger.error("Failed to update profile", error);
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
          }
        }
        ```

---

### 2. Core Scan API Implementation

-   `[ ]` **Task 2.1: Create Scan API Route (`POST`, `GET`)**

    -   **File:** `src/app/api/scan/route.ts`
    -   **Action:** Create the main route for creating new scans and fetching scan history. This re-purposes logic from the old `/api/journal` route.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { z } from "zod";
        import { logger } from "@/lib/logger";
        import { encrypt, decrypt } from "@/lib/encryption";

        // GET Handler for scan history
        export async function GET(req: NextRequest) {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

          const scans = await prisma.skinScan.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              imageUrl: true,
              createdAt: true,
              analysis: { select: { overallScore: true } },
            },
          });
        
          const decryptedScans = scans.map(scan => {
            const decryptedUrl = decrypt(scan.imageUrl);
            return { ...scan, imageUrl: decryptedUrl };
          });
        
          return NextResponse.json(decryptedScans);
        }

        // POST Handler for creating a new scan
        const createScanSchema = z.object({
            imageUrl: z.string().url(),
            notes: z.string().optional(),
        });
        
        export async function POST(req: NextRequest) {
          try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
            const body = await req.json();
            logger.info(`/api/scan - POST - User: ${user.id}`, { imageUrl: 'REDACTED' });
        
            const parsed = createScanSchema.safeParse(body);
            if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
        
            const { imageUrl, notes } = parsed.data;
        
            const newScan = await prisma.skinScan.create({
              data: {
                userId: user.id,
                imageUrl: encrypt(imageUrl),
                notes: notes ? encrypt(notes) : undefined,
              },
            });
        
            return NextResponse.json(newScan, { status: 201 });
          } catch (error) {
            logger.error("/api/scan - POST failed", error);
            return NextResponse.json({ error: "Failed to create scan" }, { status: 500 });
          }
        }
        ```

-   `[ ]` **Task 2.2: Create Dynamic Scan Route (`GET`, `DELETE`)**

    -   **File:** `src/app/api/scan/[id]/route.ts`
    -   **Action:** Create the route for fetching or deleting a single `SkinScan` by its ID.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";
        import { decrypt } from "@/lib/encryption";

        // GET handler to fetch a single scan with its analysis
        export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
          const { id } = params;
          if (!id) return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });
        
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
          const scan = await prisma.skinScan.findFirst({
            where: { id, userId: user.id },
            include: { analysis: { include: { concerns: true } } },
          });
        
          if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });
        
          // Decrypt sensitive fields before returning
          scan.imageUrl = decrypt(scan.imageUrl) ?? "[Decryption Failed]";
          if (scan.notes) scan.notes = decrypt(scan.notes) ?? "[Decryption Failed]";
          if (scan.analysis) {
            scan.analysis.analysisJson = decrypt(scan.analysis.analysisJson) ?? "{}";
            scan.analysis.rawAiResponse = decrypt(scan.analysis.rawAiResponse) ?? "{}";
          }
        
          return NextResponse.json(scan);
        }

        // DELETE handler to remove a scan
        export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
          const { id } = params;
          if (!id) return NextResponse.json({ error: "Scan ID is required" }, { status: 400 });
        
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
          try {
            await prisma.skinScan.delete({
              where: { id, userId: user.id },
            });
            return NextResponse.json({ success: true });
          } catch (error) {
            logger.error(`/api/scan/[id] - DELETE failed`, error);
            return NextResponse.json({ error: "Failed to delete scan" }, { status: 500 });
          }
        }
        ```

---

### 3. Analysis & Progress API

-   `[ ]` **Task 3.1: Implement Analysis Trigger Route**

    -   **File:** `src/app/api/scan/analyze/route.ts`
    -   **Action:** Create the endpoint that will eventually trigger the AI pipeline. In this phase, it will create mock analysis data. This replaces the old `/api/analyze` route.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { z } from "zod";
        import { logger } from "@/lib/logger";
        import { encrypt } from "@/lib/encryption";
        
        const analyzeSchema = z.object({ scanId: z.string() });
        
        export async function POST(req: NextRequest) {
          try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
            const body = await req.json();
            const parsed = analyzeSchema.safeParse(body);
            if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
        
            const { scanId } = parsed.data;
        
            const scan = await prisma.skinScan.findFirst({
              where: { id: scanId, userId: user.id },
            });
            if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 });

            // **MOCK AI PIPELINE** - This logic will be replaced in Phase H
            const mockAnalysis = {
              overallScore: Math.floor(Math.random() * 15) + 80, // Score between 80-95
              analysisJson: encrypt(JSON.stringify({ mock: true, detectedConcerns: 2 })),
              rawAiResponse: encrypt(JSON.stringify({ message: "This is a mock AI response for Phase E." })),
            };

            const newAnalysis = await prisma.skinAnalysis.create({
              data: {
                scanId: scanId,
                ...mockAnalysis
              },
            });
            // End of mock section
        
            return NextResponse.json(newAnalysis);
          } catch (error) {
            logger.error("Error in /api/scan/analyze", error);
            return NextResponse.json({ error: "Failed to analyze scan" }, { status: 500 });
          }
        }
        ```

-   `[ ]` **Task 3.2: Implement Progress Analytics Route**

    -   **File:** `src/app/api/progress/analytics/route.ts`
    -   **Action:** Create a new route to compute and return user progress analytics based on their scan history.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";

        export async function GET(req: NextRequest) {
          try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

            const analyses = await prisma.skinAnalysis.findMany({
              where: { scan: { userId: user.id } },
              orderBy: { createdAt: "asc" },
              include: { concerns: true },
            });

            if (analyses.length === 0) {
              return NextResponse.json({
                totalScans: 0,
                averageScore: 0,
                topConcern: "N/A",
                progressOverTime: [],
              });
            }

            const totalScans = analyses.length;
            const averageScore = analyses.reduce((sum, a) => sum + a.overallScore, 0) / totalScans;
            
            const concernCounts = analyses
              .flatMap(a => a.concerns)
              .reduce((acc, concern) => {
                acc[concern.name] = (acc[concern.name] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

            const topConcern = Object.entries(concernCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
            
            const progressOverTime = analyses.map(a => ({
              date: a.createdAt.toISOString(),
              score: a.overallScore,
            }));

            return NextResponse.json({
              totalScans,
              averageScore,
              topConcern,
              progressOverTime,
            });
          } catch (error) {
            logger.error("Error fetching analytics:", error);
            return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
          }
        }
        ```

---

### 4. Consultation API

-   `[ ]` **Task 4.1: Create Consultation History API (`GET`)**
    -   **File:** `src/app/api/consultation/route.ts`
    -   **Action:** Create a new route to fetch the authenticated user's history of consultations, decrypting any sensitive notes before returning them.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";
        import { decrypt } from "@/lib/encryption";

        export async function GET(req: NextRequest) {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

          try {
            const consultations = await prisma.consultation.findMany({
              where: { userId: user.id },
              orderBy: { createdAt: "desc" },
              include: { scan: { select: { id: true, createdAt: true } } }
            });

            const decryptedConsultations = consultations.map(c => {
                if(c.notes) {
                    c.notes = decrypt(c.notes) ?? "[Notes could not be decrypted]";
                }
                return c;
            });

            return NextResponse.json(decryptedConsultations);
          } catch(e) {
            logger.error("Failed to fetch consultations", e);
            return NextResponse.json({ error: "Could not retrieve consultation history." }, { status: 500 });
          }
        }
        ```

---

### 5. Routine Management API

-   `[ ]` **Task 5.1: Implement Routine API Route (`GET`, `PUT`)**

    -   **File:** `src/app/api/routine/route.ts`
    -   **Action:** Create the new route for fetching and updating the user's single, canonical skincare routine.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";
        import { z } from "zod";

        // GET Handler for fetching the user's routine
        export async function GET(req: NextRequest) {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
            const routine = await prisma.routine.findUnique({
                where: { userId: user.id },
                include: { steps: { include: { product: true }, orderBy: { stepNumber: 'asc' } } },
            });
        
            if (!routine) return NextResponse.json({ error: "Routine not found" }, { status: 404 });
        
            return NextResponse.json(routine);
        }

        // PUT Handler for updating the routine
        const routineStepSchema = z.object({
            productId: z.string(),
            stepNumber: z.number().int(),
            timeOfDay: z.enum(["AM", "PM"]),
            instructions: z.string(),
        });
        const updateRoutineSchema = z.object({
            steps: z.array(routineStepSchema),
        });

        export async function PUT(req: NextRequest) {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
            try {
                const body = await req.json();
                const parsed = updateRoutineSchema.safeParse(body);
                if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
        
                const { steps } = parsed.data;
        
                const updatedRoutine = await prisma.$transaction(async (tx) => {
                    const routine = await tx.routine.findUnique({ where: { userId: user.id } });
                    if (!routine) throw new Error("Routine not found for user");
        
                    await tx.routineStep.deleteMany({ where: { routineId: routine.id } });
        
                    if (steps.length > 0) {
                        await tx.routineStep.createMany({
                            data: steps.map(step => ({ ...step, routineId: routine.id })),
                        });
                    }
        
                    return tx.routine.findUnique({
                        where: { userId: user.id },
                        include: { steps: { include: { product: true } } },
                    });
                });
        
                return NextResponse.json(updatedRoutine);
            } catch (error) {
                logger.error("/api/routine - PUT failed", error);
                return NextResponse.json({ error: "Failed to update routine" }, { status: 500 });
            }
        }
        ```

-   `[ ]` **Task 5.2: Implement Product Catalog API (`GET`)**

    -   **File:** `src/app/api/products/route.ts`
    -   **Action:** Create a new, simple, read-only endpoint for fetching the list of available products. This is a public-facing endpoint (no user authentication needed) as the product catalog is not sensitive.
    -   **Content:**
        ```typescript
        import { NextResponse } from "next/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";

        export async function GET() {
          try {
            const products = await prisma.product.findMany({
              orderBy: { type: 'asc' },
            });
            return NextResponse.json(products);
          } catch (error) {
            logger.error("Failed to fetch product catalog", error);
            return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
          }
        }
        ```

---

### 6. Data Portability API Adaptation

-   `[ ]` **Task 6.1: Adapt User Data Export**

    -   **File:** `src/app/api/user/export/route.ts`
    -   **Action:** Modify the data export route to fetch and return all `SkinScan` and `SkinAnalysis` records for the authenticated user, ensuring data is decrypted before being sent.
    -   **Content:**
        ```typescript
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { NextRequest, NextResponse } from "next/server";
        import { decrypt } from "@/lib/encryption";
        import { logger } from "@/lib/logger";

        export const GET = async (req: NextRequest) => {
          const supabase = await createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return new NextResponse("Unauthorized", { status: 401 });
        
          const userId = user.id;
        
          const scans = await prisma.skinScan.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { analysis: { include: { concerns: true } } }
          });

          // Decrypt all sensitive data before exporting
          const decryptedData = scans.map(scan => {
            try {
              const decryptedScan = { ...scan };
              decryptedScan.imageUrl = decrypt(scan.imageUrl) ?? "DECRYPTION_FAILED";
              if (scan.notes) decryptedScan.notes = decrypt(scan.notes) ?? "DECRYPTION_FAILED";
              if (scan.analysis) {
                decryptedScan.analysis.analysisJson = decrypt(scan.analysis.analysisJson) ?? "DECRYPTION_FAILED";
                decryptedScan.analysis.rawAiResponse = decrypt(scan.analysis.rawAiResponse) ?? "DECRYPTION_FAILED";
              }
              return decryptedScan;
            } catch (e) {
                logger.error(`Failed to decrypt data for scan ${scan.id} during export`, e);
                return { ...scan, error: "Decryption failed for this record" };
            }
          });
        
          return new NextResponse(JSON.stringify(decryptedData, null, 2), {
            headers: {
              "Content-Type": "application/json",
              "Content-Disposition": 'attachment; filename="skinova_export.json"',
            },
          });
        };
        ```

-   `[ ]` **Task 6.2: Verify Account Deletion**
    -   **File:** `src/app/api/user/route.ts`
    -   **Action:** No changes are required. The existing logic marks the user for deletion, and the `onDelete: Cascade` rule in `schema.prisma` will ensure all associated `SkinScan`, `Routine`, and other records are automatically deleted by the database. This task is to simply verify this behavior.
```