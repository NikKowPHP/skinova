### Final Updated Plan for Phase H

Here is the complete, refined plan for Phase H, incorporating the critical routine generation logic and the configuration refinement.

```markdown
# **Phase H: Backend Automation & Advanced Services**

**Goal:** Build the automated and asynchronous systems that power the app's unique value. This includes implementing the **end-to-end AI Image Analysis Pipeline** (securely fetching from storage, calling the multi-modal AI, parsing results, and updating the user's routine) and the **Weekly Scan Reminder** email engine using cron jobs and the Resend API.

---

### 1. AI Image Analysis & Routine Generation Pipeline

-   `[ ]` **Task 1.1: Create a Supabase Admin Client for Backend Services**

    -   **File:** `src/lib/supabase/admin.ts`
    -   **Action:** Create a new server-side Supabase client that uses the `SERVICE_ROLE_KEY`. This is essential for backend processes to access private storage buckets without a user session.
    -   **Content:**
        ```typescript
        import { createClient } from "@supabase/supabase-js";
        import { logger } from "@/lib/logger";

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          throw new Error("Supabase URL or Service Role Key is not defined in environment variables.");
        }

        // This admin client can be used in server-side code that is not part of a request
        // (e.g., cron jobs, queues) to perform privileged operations.
        export const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );

        logger.info("Supabase admin client initialized.");
        ```

-   `[ ]` **Task 1.2: Create the `skinAnalysis` AI Prompt**

    -   **File:** `src/lib/ai/prompts/skinAnalysis.prompt.ts`
    -   **Action:** Create the core prompt that instructs the multi-modal AI on how to analyze a user's skin image and what JSON structure to return.
    -   **Content:**
        ```typescript
        import { SkinType } from "@prisma/client";

        export const getSkinAnalysisPrompt = (skinType: SkinType, primaryConcern: string, notes?: string | null) => {
          const userNotes = notes ? `\n*   **User Notes:** "${notes}"` : "";

          return `
          You are an expert AI dermatology assistant. Your task is to analyze a user's skin image and provide a structured, helpful analysis. Your tone should be clinical, informative, and encouraging.

          **USER PROFILE:**
          *   **Skin Type:** ${skinType}
          *   **Primary Concern:** ${primaryConcern}
          ${userNotes}
          
          **YOUR TASK:**
          Analyze the provided image and return a single raw JSON object with this exact structure:
          {
            "overallScore": "A numerical score from 0 to 100 representing the skin's overall health, considering clarity, texture, and hydration.",
            "analysisSummary": "A 1-2 sentence, encouraging summary of the key findings from the scan.",
            "concerns": [
              {
                "name": "The specific name of the concern (e.g., 'Acne', 'Hyperpigmentation', 'Fine Lines').",
                "severity": "MILD | MODERATE | SEVERE",
                "description": "A brief, clear description of what was observed and why it's a concern.",
                "boundingBox": { "x": 0.25, "y": 0.3, "width": 0.1, "height": 0.15 } // Normalized coordinates [0-1] of the area on the image. Can be null if not applicable.
              }
            ],
            "routineRecommendations": {
                "am": [
                    { "productType": "Cleanser", "reason": "A gentle cleanser is recommended to start the day without stripping natural oils." },
                    { "productType": "Serum", "reason": "A Vitamin C serum can help with the observed dullness and provide antioxidant protection." }
                ],
                "pm": [
                    { "productType": "Cleanser", "reason": "To remove impurities from the day." },
                    { "productType": "Treatment", "reason": "A retinoid is recommended to address the fine lines and improve texture." }
                ]
            }
          }

          **GUIDELINES:**
          1.  Identify 2-4 key concerns from the image.
          2.  The "routineRecommendations" should be simple, high-level suggestions based on product *type*, not specific brand names.
          3.  Bounding box coordinates must be normalized between 0.0 and 1.0. If you cannot identify a specific area for a concern, you may set "boundingBox" to null.
          4.  Ensure the analysis is consistent with the user's provided skin profile.

          Now, analyze the user's skin image.
          `;
        };
        ```

-   `[ ]` **Task 1.3: Extend AI Service and Interface for Multi-modal Analysis**
    -   **File:** `src/lib/ai/generation-service.ts`
        -   **Action:** Add the `analyzeSkinScan` method to the `QuestionGenerationService` interface.
        -   **Content Snippet (to add to interface):**
            ```typescript
            // ... inside QuestionGenerationService interface
            analyzeSkinScan(
              imageBuffer: Buffer,
              userProfile: { skinType: SkinType; primaryConcern: string; notes?: string | null }
            ): Promise<any>; // Type will be the parsed JSON
            ```
    -   **File:** `src/lib/ai/gemini-service.ts`
        -   **Action:** Implement the `analyzeSkinScan` method.
        -   **Content Snippet (to add to `GeminiQuestionGenerationService` class):**
            ```typescript
            import { getSkinAnalysisPrompt } from "./prompts/skinAnalysis.prompt";
            import { SkinType } from "@prisma/client";
            // ...
            async analyzeSkinScan(
              imageBuffer: Buffer,
              userProfile: { skinType: SkinType; primaryConcern: string; notes?: string | null }
            ): Promise<any> {
              const prompt = getSkinAnalysisPrompt(userProfile.skinType, userProfile.primaryConcern, userProfile.notes);
              
              const imagePart = {
                inlineData: {
                  data: imageBuffer.toString("base64"),
                  mimeType: "image/jpeg", // Assuming JPEG for now
                },
              };

              try {
                const result = await executeGeminiWithRotation((client) =>
                  client.models.generateContent({
                    model: "gemini-1.5-flash", // Use a multi-modal capable model
                    config: this.jsonConfig,
                    contents: [{ role: "user", parts: [{ text: prompt }, imagePart] }],
                  }),
                );
                
                const text = result.text;
                if (!text) {
                  throw new Error("Empty response from Gemini API for skin scan analysis");
                }
                const cleanedText = this.cleanJsonString(text);
                return JSON.parse(cleanedText);
              } catch (error) {
                logger.error("Error analyzing skin scan with Gemini:", error);
                throw error;
              }
            }
            ```

-   `[ ]` **Task 1.4: Create the Routine Generation Service**
    -   **File:** `src/lib/services/routine.service.ts`
    -   **Action:** Create a new service to translate AI recommendations into a concrete routine stored in the database.
    -   **Content:**
        ```typescript
        import { prisma } from "@/lib/db";
        import { Prisma } from "@prisma/client";
        import { logger } from "../logger";

        type Tx = Omit<Prisma.TransactionClient, "$Ґ" | "$transaction" | "$disconnect" | "$connect" | "$on" | "$use" | "$extends">;

        interface RoutineRecommendation {
          productType: string;
          reason: string;
        }

        export async function updateRoutineFromAnalysis(
          tx: Tx,
          userId: string,
          recommendations: { am: RoutineRecommendation[]; pm: RoutineRecommendation[] }
        ) {
          logger.info(`Updating routine for user: ${userId}`);
          const routine = await tx.routine.findUnique({ where: { userId } });
          if (!routine) throw new Error(`Routine not found for user ${userId}`);

          // Clear existing routine steps
          await tx.routineStep.deleteMany({ where: { routineId: routine.id } });

          const allProducts = await tx.product.findMany();
          const newSteps: Prisma.RoutineStepCreateManyInput[] = [];
          let stepCounter = 1;

          for (const rec of recommendations.am) {
            const product = allProducts.find(p => p.type === rec.productType);
            if (product) {
              newSteps.push({
                routineId: routine.id,
                productId: product.id,
                stepNumber: stepCounter++,
                timeOfDay: "AM",
                instructions: rec.reason,
              });
            }
          }
          
          stepCounter = 1; // Reset for PM
          for (const rec of recommendations.pm) {
            const product = allProducts.find(p => p.type === rec.productType);
            if (product) {
              newSteps.push({
                routineId: routine.id,
                productId: product.id,
                stepNumber: stepCounter++,
                timeOfDay: "PM",
                instructions: rec.reason,
              });
            }
          }
          
          if (newSteps.length > 0) {
            await tx.routineStep.createMany({ data: newSteps });
          }
          logger.info(`Successfully created ${newSteps.length} new routine steps for user ${userId}.`);
        }
        ```

-   `[ ]` **Task 1.5: Implement the Real Analysis Pipeline API with Routine Update**

    -   **File:** `src/app/api/scan/analyze/route.ts`
    -   **Action:** Replace the entire content of the file, swapping the mock logic with the end-to-end pipeline that includes saving the analysis AND updating the user's routine in a single transaction.
    -   **Content:**
        ```typescript
        import { NextRequest, NextResponse } from "next/server";
        import { createClient } from "@/lib/supabase/server";
        import { supabaseAdmin } from "@/lib/supabase/admin";
        import { prisma } from "@/lib/db";
        import { z } from "zod";
        import { logger } from "@/lib/logger";
        import { encrypt, decrypt } from "@/lib/encryption";
        import { getQuestionGenerationService } from "@/lib/ai";
        import { updateRoutineFromAnalysis } from "@/lib/services/routine.service";
        
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
              include: { user: { select: { skinType: true, primaryConcern: true } } },
            });
            if (!scan || !scan.user.skinType || !scan.user.primaryConcern) {
              return NextResponse.json({ error: "Scan or complete user profile not found" }, { status: 404 });
            }
        
            const imagePath = decrypt(scan.imageUrl);
            if (!imagePath) throw new Error("Failed to decrypt image path.");

            const { data: fileData, error: downloadError } = await supabaseAdmin.storage
              .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
              .download(imagePath);
            if (downloadError) throw new Error(`Failed to download image from storage: ${downloadError.message}`);
            
            const imageBuffer = Buffer.from(await fileData.arrayBuffer());

            const aiService = getQuestionGenerationService();
            const analysisResult = await aiService.analyzeSkinScan(imageBuffer, {
                skinType: scan.user.skinType,
                primaryConcern: scan.user.primaryConcern,
                notes: scan.notes ? decrypt(scan.notes) : null
            });

            // Use a transaction to save analysis and update routine atomically
            const newAnalysis = await prisma.$transaction(async (tx) => {
                const createdAnalysis = await tx.skinAnalysis.create({
                    data: {
                        scanId: scanId,
                        overallScore: analysisResult.overallScore,
                        analysisJson: encrypt(JSON.stringify(analysisResult)),
                        rawAiResponse: encrypt(JSON.stringify(analysisResult)),
                        concerns: {
                            create: analysisResult.concerns.map((concern: any) => ({
                                name: concern.name,
                                severity: concern.severity,
                                description: concern.description,
                                boundingBoxJson: concern.boundingBox ? JSON.stringify(concern.boundingBox) : null,
                            }))
                        }
                    }
                });

                if (analysisResult.routineRecommendations) {
                    await updateRoutineFromAnalysis(tx, user.id, analysisResult.routineRecommendations);
                }
                
                return createdAnalysis;
            });
            
            return NextResponse.json(newAnalysis);
          } catch (error) {
            logger.error("Error in /api/scan/analyze", { message: (error as Error).message });
            return NextResponse.json({ error: "Failed to analyze scan" }, { status: 500 });
          }
        }
        ```

---

### 2. Weekly Scan Reminder System

-   `[ ]` **Task 2.1: Add Email "From" Address to Environment**
    -   **File:** `.env.example`
    -   **Action:** Add the `RESEND_FROM_EMAIL` variable for better configuration.
    -   **Content Snippet (to add):**
        ```
        # ... inside .env.example
        RESEND_API_KEY="re_..." # SECRET
        RESEND_FROM_EMAIL="Skinova <reminders@yourdomain.com>"
        CRON_SECRET="your-secure-random-string" # SECRET
        ```

-   `[ ]` **Task 2.2: Create Scan Reminder Email Logic**

    -   **File:** `src/lib/services/email.service.ts`
    -   **Action:** Create a new `sendScanReminderEmail` function that uses the new environment variable.
    -   **Content:**
        ```typescript
        import { Resend } from "resend";
        import { prisma } from "@/lib/db";
        import { logger } from "../logger";

        const resend = new Resend(process.env.RESEND_API_KEY);

        export async function sendScanReminderEmail(userId: string) {
          try {
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
            if (!user || !user.email) {
              logger.warn(`Could not find user or email for ID: ${userId} to send reminder.`);
              return;
            }

            const emailHtml = `
              <h1>It's Time for Your Weekly Skin Check-in!</h1>
              <p>Hello,</p>
              <p>Just a friendly reminder to perform your weekly skin scan. Consistent tracking is the key to understanding your progress and achieving your skin goals.</p>
              <p><a href="${process.env.NEXT_PUBLIC_API_URL}/scan">Scan Now</a></p>
              <p>The Skinova Team</p>
            `;

            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || "Skinova <noreply@skinova.app>",
              to: user.email,
              subject: "Your Weekly Skin Scan Reminder",
              html: emailHtml,
            });

            logger.info(`Scan reminder sent to ${user.email}`);
          } catch (error) {
            logger.error(`Error sending scan reminder for user ${userId}:`, error);
          }
        }
        ```

-   `[ ]` **Task 2.3: Create the Cron Job API Route**

    -   **File:** `src/app/api/cron/scan-reminder/route.ts`
    -   **Action:** Create a new file for the cron job endpoint. This will find users who haven't scanned in a week and trigger the email.
    -   **Content:**
        ```typescript
        import { NextResponse } from "next/server";
        import { prisma } from "@/lib/db";
        import { sendScanReminderEmail } from "@/lib/services/email.service";
        import { logger } from "@/lib/logger";

        export async function GET(req: Request) {
          const authHeader = req.headers.get("authorization");
          if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }

          try {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            const usersToRemind = await prisma.user.findMany({
              where: {
                status: "ACTIVE",
                onboardingCompleted: true,
                scans: {
                  none: {
                    createdAt: {
                      gte: sevenDaysAgo,
                    },
                  },
                },
              },
              select: { id: true },
            });

            if (usersToRemind.length === 0) {
              logger.info("Cron job: No users to remind today.");
              return NextResponse.json({ message: "No users to remind." });
            }

            logger.info(`Cron job: Found ${usersToRemind.length} users to remind.`);
            
            await Promise.all(
              usersToRemind.map(user => sendScanReminderEmail(user.id))
            );

            return NextResponse.json({
              message: `Successfully sent reminders to ${usersToRemind.length} users.`,
            });

          } catch (error) {
            logger.error("Error in scan reminder cron job:", error);
            return NextResponse.json({ error: "Failed to process scan reminders" }, { status: 500 });
          }
        }
        ```

-   `[ ]` **Task 2.4: Configure the Cron Job Schedule**

    -   **File:** `vercel.json`
    -   **Action:** Add the new cron job definition to run every Sunday at 9 AM UTC.
    -   **Content:**
        ```json
        {
          "crons": [
            {
              "path": "/api/cron/scan-reminder",
              "schedule": "0 9 * * 0"
            }
          ]
        }
        ```
```