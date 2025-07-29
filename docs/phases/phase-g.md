Excellent question. The plan for Phase G is very thorough and covers the entire lifecycle of both subscriptions and one-time payments. It correctly identifies the necessary API modifications, webhook logic, and frontend integrations.

After a detailed review, I've identified one minor but important missing piece related to user experience after a successful purchase.

### Analysis: Are We Missing Anything?

The plan is **98% complete**. The only missing element is handling the success state after a user completes a checkout session. The current plan redirects them to a URL with a query parameter (`?success=true` or `?consultation_success=true`), but the frontend doesn't do anything with this information.

**Why this is important:** A user who has just spent money expects immediate feedback confirming their purchase was successful. Without this, they might be confused about whether their new subscription is active or if their consultation request was received.

**Recommended Addition:**

-   `[ ]` **Task 4.4: Handle Post-Checkout Success States in the UI**
    -   **Action:** Implement logic on the `Dashboard` and `Scan Result` pages to detect the success query parameters from the Stripe redirect and display an appropriate "Thank You" toast notification.
    -   **File:** `src/app/dashboard/page.tsx`
        -   **Logic:** Use the `useSearchParams` hook to check for `?success=true`. If present, trigger a toast notification: `"Welcome to Pro! Your subscription is now active."` and use `router.replace()` to clean the URL.
    -   **File:** `src/app/scan/[id]/page.tsx`
        -   **Logic:** Use the `useSearchParams` hook to check for `?consultation_success=true`. If present, trigger a toast notification: `"Consultation requested! A dermatologist will review your scan within 24-48 hours."` and use `router.replace()` to clean the URL.

---

### Final Updated Plan for Phase G

Here is the complete, refined plan for Phase G, incorporating the addition of the post-checkout success handling.

```markdown
# **Phase G: Monetization & Billing Integration**

**Goal:** Implement the complete monetization lifecycle by integrating with Stripe. This includes creating checkout sessions for both **Pro tier subscriptions** and **pay-per-use teledermatology consultations**, providing a customer portal for management, and building a secure webhook endpoint to synchronize billing status with the application database.

---

### 1. Stripe & Environment Configuration (Prerequisite)

-   `[ ]` **Task 1.1: Document Stripe Product Setup**
    -   **Action:** Ensure the Stripe account has two products configured:
        1.  **Product 1 (Subscription):** "Skinova Pro" with a recurring monthly price.
        2.  **Product 2 (One-Time):** "Dermatology Consultation" with a one-time price.
    -   **Note:** This is a manual step in the Stripe Dashboard. The price IDs generated are critical for the next step.

-   `[ ]` **Task 1.2: Update Environment Variables**
    -   **File:** `.env.example` and `.env`
    -   **Action:** Add the new `CONSULTATION_PRICE_ID` variable and ensure all Stripe variables are present and documented.
    -   **Content Snippet:**
        ```
        # ... existing variables
        STRIPE_PRO_PRICE_ID="price_..."
        CONSULTATION_PRICE_ID="price_..." # ID for the one-time consultation payment
        ```
    -   **Action:** Ensure your local `.env` file is populated with the actual Price IDs from your Stripe dashboard.

---

### 2. Backend API Implementation

-   `[ ]` **Task 2.1: Enhance the Checkout API for Hybrid Payments**
    -   **File:** `src/app/api/billing/checkout/route.ts`
    -   **Action:** Modify the checkout route to dynamically handle both subscriptions and one-time payments based on the provided `priceId`. It must also attach `scanId` metadata for consultation payments.
    -   **Content:**
        ```typescript
        import { NextResponse } from "next/server";
        import { stripe } from "@/lib/services/stripe.service";
        import { createClient } from "@/lib/supabase/server";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";

        export async function POST(request: Request) {
          try {
            const supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const body = await request.json();
            const { priceId, scanId } = body;
            if (!priceId) {
              return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
            }

            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { stripeCustomerId: true },
            });

            let customerId = dbUser?.stripeCustomerId;
            if (!customerId) {
              const customer = await stripe.customers.create({
                email: user.email!,
                metadata: { userId: user.id },
              });
              await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customer.id },
              });
              customerId = customer.id;
            }

            const price = await stripe.prices.retrieve(priceId);

            const session = await stripe.checkout.sessions.create({
              customer: customerId,
              payment_method_types: ["card"],
              line_items: [{ price: priceId, quantity: 1 }],
              mode: price.recurring ? 'subscription' : 'payment', // DYNAMIC MODE
              success_url: price.recurring 
                ? `${process.env.NEXT_PUBLIC_API_URL}/dashboard?success=true`
                : `${process.env.NEXT_PUBLIC_API_URL}/scan/${scanId}?consultation_success=true`,
              cancel_url: price.recurring
                ? `${process.env.NEXT_PUBLIC_API_URL}/pricing?canceled=true`
                : `${process.env.NEXT_PUBLIC_API_URL}/scan/${scanId}`,
              // Attach metadata for one-time payments
              ...(price.recurring ? {} : {
                payment_intent_data: {
                  metadata: {
                    userId: user.id,
                    scanId: scanId,
                  }
                },
                metadata: {
                  userId: user.id,
                  scanId: scanId,
                }
              })
            });

            return NextResponse.json({ url: session.url });
          } catch (error: any) {
            logger.error("Checkout error:", error);
            return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
          }
        }
        ```

-   `[ ]` **Task 2.2: Implement a Robust Webhook Handler**
    -   **File:** `src/app/api/billing/webhook/route.ts`
    -   **Action:** Update the webhook to differentiate between subscription and consultation checkouts and handle each case accordingly.
    -   **Content:**
        ```typescript
        import { NextResponse } from "next/server";
        import Stripe from "stripe";
        import { stripe } from "@/lib/services/stripe.service";
        import { prisma } from "@/lib/db";
        import { logger } from "@/lib/logger";

        export async function POST(req: Request) {
          logger.info("/api/billing/webhook - POST - Received webhook");
          const body = await req.text();
          const signature = req.headers.get("stripe-signature");
          if (!signature) {
            return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 });
          }

          let event;
          try {
            event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            logger.error("Webhook signature verification failed", { error: message });
            return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
          }
          
          const existingEvent = await prisma.processedWebhook.findUnique({ where: { eventId: event.id } });
          if (existingEvent) {
            return NextResponse.json({ received: true });
          }

          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              
              if (session.mode === 'subscription') {
                await handleSubscriptionCheckout(session);
              } else if (session.mode === 'payment') {
                await handleConsultationCheckout(session);
              }
              break;
            }
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              const subscription = event.data.object as Stripe.Subscription;
              await handleSubscriptionChange(subscription);
              break;
            }
            default:
              logger.info(`Unhandled event type ${event.type}`);
          }

          await prisma.processedWebhook.create({
            data: { eventId: event.id, type: event.type },
          });

          return NextResponse.json({ received: true });
        }

        async function handleSubscriptionCheckout(session: Stripe.Checkout.Session) {
          const subscriptionId = session.subscription as string;
          if (!session.customer || !subscriptionId) {
            logger.warn("Missing customer or subscription in checkout session", { session });
            return;
          }

          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;

          let tier = "FREE";
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
            tier = "PRO";
          }

          await prisma.user.update({
            where: { stripeCustomerId: session.customer as string },
            data: { subscriptionTier: tier, subscriptionStatus: "ACTIVE" },
          });
          logger.info(`Subscription started for customer: ${session.customer}`);
        }

        async function handleConsultationCheckout(session: Stripe.Checkout.Session) {
          const { userId, scanId } = session.metadata || {};
          const stripePaymentId = session.payment_intent as string;
          
          if (!userId || !scanId || !stripePaymentId) {
              logger.error("Missing metadata for consultation checkout", { session });
              return;
          }

          await prisma.consultation.create({
              data: {
                  userId,
                  scanId,
                  stripePaymentId,
                  status: 'PENDING', // Initial status for a new consultation
              }
          });
          logger.info(`Consultation created for user ${userId} and scan ${scanId}`);
        }
        
        async function handleSubscriptionChange(subscription: Stripe.Subscription) {
            const customerId = subscription.customer as string;
            const priceId = subscription.items.data[0].price.id;

            let tier = "FREE";
            if (priceId === process.env.STRIPE_PRO_PRICE_ID && subscription.status === 'active') {
                tier = "PRO";
            }

            await prisma.user.update({
                where: { stripeCustomerId: customerId },
                data: {
                    subscriptionTier: tier,
                    subscriptionStatus: subscription.status.toUpperCase(),
                }
            });
            logger.info(`Subscription updated for customer: ${customerId}`);
        }
        ```

-   `[ ]` **Task 2.3: Verify Customer Portal API**
    -   **File:** `src/app/api/billing/portal/route.ts`
    -   **Action:** No changes needed. This route from Lexity works as-is for subscription management. This task is to simply verify its functionality.

---

### 3. Frontend Data Hooks

-   `[ ]` **Task 3.1: Enhance `useCreateCheckoutSession` Hook**
    -   **File:** `src/lib/hooks/data/useCreateCheckoutSession.ts`
    -   **Action:** Modify the hook to accept an optional `scanId` for consultation checkouts.
    -   **Content:**
        ```typescript
        import { useMutation } from "@tanstack/react-query";
        import { apiClient } from "@/lib/services/api-client.service";
        import { useToast } from "@/components/ui/use-toast";
        
        interface CheckoutPayload {
          priceId: string;
          scanId?: string;
        }

        export const useCreateCheckoutSession = () => {
          const { toast } = useToast();
          return useMutation({
            mutationFn: (payload: CheckoutPayload) => apiClient.billing.createCheckoutSession(payload),
            onError: (error: Error) => {
              toast({
                variant: "destructive",
                title: "Checkout Error",
                description: error.message || "Could not proceed to checkout. Please try again.",
              });
            },
          });
        };
        ```
    -   **File:** `src/lib/services/api-client.service.ts`
        -   **Action:** Update the corresponding method in the API client.
        -   **Content Snippet:**
            ```typescript
            //... inside apiClient.billing
            createCheckoutSession: async (payload: { priceId: string; scanId?: string }) => {
              const { data } = await axios.post("/api/billing/checkout", payload);
              return data;
            },
            ```

---

### 4. UI Integration

-   `[ ]` **Task 4.1: Integrate Subscription Checkout in `PricingTable`**
    -   **File:** `src/components/PricingTable.tsx`
    -   **Action:** Update the component to use the enhanced `useCreateCheckoutSession` hook for starting a subscription.
    -   **Content Snippet:**
        ```tsx
        // ... inside PricingTable component
        const handleCheckout = (priceId: string) => {
            checkoutMutation.mutate({ priceId }, {
                onSuccess: (response) => {
                    if (response.url) {
                        window.location.href = response.url;
                    }
                },
            });
        };
        ```

-   `[ ]` **Task 4.2: Integrate Consultation Checkout in `ConsultationPrompt`**
    -   **File:** `src/components/analysis/ConsultationPrompt.tsx`
    -   **Action:** Update the prompt to trigger a one-time payment checkout, passing the required `scanId`.
    -   **Content:**
        ```tsx
        'use client';
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
        import { Button } from "@/components/ui/button";
        import { Stethoscope } from "lucide-react";
        import { useCreateCheckoutSession } from "@/lib/hooks/data/useCreateCheckoutSession";

        interface ConsultationPromptProps {
            scanId: string;
        }

        export const ConsultationPrompt = ({ scanId }: ConsultationPromptProps) => {
          const checkoutMutation = useCreateCheckoutSession();

          const handleStartConsultation = () => {
            if (!process.env.NEXT_PUBLIC_CONSULTATION_PRICE_ID) {
                console.error("Consultation Price ID is not configured.");
                return;
            }
            checkoutMutation.mutate({
                priceId: process.env.NEXT_PUBLIC_CONSULTATION_PRICE_ID,
                scanId: scanId,
            }, {
                onSuccess: (response) => {
                    if (response.url) {
                        window.location.href = response.url;
                    }
                }
            });
          };

          return (
            <Card className="bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Need a Professional Opinion?
                </CardTitle>
                <CardDescription>
                  For a detailed assessment and prescription-strength recommendations, share this analysis with a board-certified dermatologist.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={handleStartConsultation} disabled={checkoutMutation.isPending}>
                  {checkoutMutation.isPending ? "Redirecting..." : "Start a Consultation ($49)"}
                </Button>
              </CardContent>
            </Card>
          );
        };
        ```
    -   **File:** `src/app/scan/[id]/page.tsx`
        -   **Action:** Ensure the `scanId` is passed down to the `ConsultationPrompt`.
        -   **Content Snippet:** `<ConsultationPrompt scanId={params.id} />`

-   `[ ]` **Task 4.3: Verify Subscription Management on Settings Page**
    -   **File:** `src/app/settings/page.tsx`
    -   **Action:** Review the settings page to confirm that the "Manage Subscription & Billing" button correctly uses the `useCreatePortalSession` hook and works for users with an active Pro subscription. No code changes are expected, this is a verification step.

-   `[ ]` **Task 4.4: Handle Post-Checkout Success States in the UI**
    -   **Action:** Implement logic on the `Dashboard` and `Scan Result` pages to detect the success query parameters from the Stripe redirect and display an appropriate "Thank You" toast notification.
    -   **File:** `src/app/dashboard/page.tsx`
        -   **Logic:** Use the `useSearchParams` and `useRouter` hooks. In an effect, check for `?success=true`. If present, call `toast({ title: "Welcome to Pro!", description: "Your subscription is now active." })`, invalidate the user profile query (`queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] })`), and use `router.replace('/dashboard')` to clean the URL.
    -   **File:** `src/app/scan/[id]/page.tsx`
        -   **Logic:** Use the `useSearchParams` and `useRouter` hooks. In an effect, check for `?consultation_success=true`. If present, call `toast({ title: "Consultation Requested!", description: "A dermatologist will review your scan within 24-48 hours." })`, invalidate the consultations query (`queryClient.invalidateQueries({ queryKey: ["consultations", authUser?.id] })`), and use `router.replace(\`/scan/\${params.id}\`)` to clean the URL.
```