This is the perfect moment to ask this question. The plan for Phase G is technically excellent and covers the happy path and basic security. However, when dealing with payments, the bar for robustness is extremely high. User trust is paramount, and edge cases can have real financial consequences.

You are not missing any major *steps*, but we can significantly harden the plan by adding considerations for **transactional integrity**, **user experience edge cases**, and **production readiness**.

Here is a summary of the refinements, followed by the final, updated Phase G plan.

### **Summary of What's Missing (and Now Added):**

| Category | Missing Consideration | Why It's Critical |
| :--- | :--- | :--- |
| **Transactional Integrity** | **Database Transactions:** The current webhook logic reads from the DB, then writes to it. If the write fails after the read, the system could be in an inconsistent state. | Wrapping the webhook logic in a database transaction (`prisma.$transaction`) ensures that all database operations (e.g., creating the `Consultation`, logging the webhook) either succeed together or fail together. This prevents partial data updates and maintains data integrity. |
| **User Experience Edge Cases** | **Pre-Payment Data Persistence:** What happens if a user fills out the consultation form, goes to Stripe, but their browser crashes before they pay? Their detailed notes and uploaded images are lost. | To create a premium experience, we should save the consultation details in a `DRAFT` state *before* sending the user to Stripe. If they return later, they can resume where they left off. This drastically improves the user journey for a high-intent action. |
| **Production Readiness** | **Webhook Retry Logic & Monitoring:** Stripe will retry sending a webhook if our endpoint is down. The plan doesn't explicitly mention how to handle this or how to monitor for failures. | We need to ensure our webhook logic is truly idempotent and resilient to retries. We also need to set up alerts in Sentry or a similar tool to notify us immediately if our webhook endpoint fails consistently, as this directly impacts revenue. |
| **Security & Compliance** | **Explicit Metadata Validation:** The plan uses metadata to link a payment to a user, but it doesn't explicitly validate that this metadata is present and correct in the webhook. | A missing `userId` in the webhook metadata would result in a "paid" consultation that isn't linked to any user—a critical failure. Explicitly validating and logging errors for this is essential. |

By incorporating these points, we are moving from a "functional" payment system to a "resilient, production-grade" payment system that protects both the user and the business.

---

# **Phase G: Monetization & Billing Integration (v1.1)**

**Goal:** Implement a secure, resilient, and user-friendly monetization lifecycle with Stripe. This includes creating checkout sessions for pay-per-use consultations, providing a customer portal, and building a robust, transactional webhook endpoint to guarantee data integrity.

**Associated Epic(s):** Monetization & Billing, Core System & Infrastructure
**Estimated Duration:** 2 weeks

---

## `[ ]` 1. Stripe Setup & Backend Configuration

**Objective:** Configure the Stripe environment and build the server-side API endpoints required to initiate payments.

-   `[ ]` **Configure Stripe Dashboard:** Create the "Teledermatology Consultation" product and a one-time price in Test Mode.
-   `[ ]` **Configure Environment Variables:** Populate `.env` with Stripe secret, publishable, and webhook signing secret keys.
-   `[ ]` **[Refined] Implement Checkout Session API Route (`POST /api/billing/checkout`):**
    -   `[ ]` This route will now accept the `imageUrls` and `userNotes` from the consultation form.
    -   `[ ]` Get the current user and their `stripeCustomerId` (creating one if it doesn't exist).
    -   `[ ]` **[Added] Pre-Payment Persistence:**
        -   `[ ]` Before creating the Stripe session, create a `Consultation` record in the database with `status: 'DRAFT'`. Store the user's notes and image URLs here.
        -   `[ ]` This ensures that if the user abandons the checkout, their work is saved.
    -   `[ ]` **Create the Stripe Checkout Session:**
        -   `[ ]` Call `stripe.checkout.sessions.create` with `mode: 'payment'`.
        -   `[ ]` **Crucially**, in the `metadata`, pass both the `userId` and the `consultationId` of the newly created `DRAFT` record.
    -   `[ ]` Return the session `url`.

## `[ ]` 2. Frontend Payment Flow Implementation

**Objective:** Integrate the payment flow into the UI, ensuring a seamless user journey.

-   `[ ]` **Create `useCreateCheckoutSession` Hook:** Implement the `useMutation` hook to call the checkout endpoint and redirect to the Stripe URL on success.
-   `[ ]` **Integrate into `ConsultationRequestForm.tsx`:**
    -   `[ ]` The "Proceed to Payment" button's `onClick` handler should call the `mutate` function, passing the form data (notes, image URLs).
    -   `[ ]` Use the `isPending` state for the button's loading indicator.
-   `[ ]` **Handle Redirect Callbacks:** On the `/consultations` page, read the `payment` query parameter to display success or cancellation toasts.

## `[ ]` 3. Webhook Integration for Payment Confirmation

**Objective:** Build a secure, idempotent, and transactional webhook endpoint to reliably handle payment confirmations from Stripe.

-   `[ ]` **Implement Webhook API Route (`POST /api/billing/webhook`):**
    -   `[ ]` **Security First:** Verify the Stripe webhook signature.
    -   `[ ]` **Idempotency:** Before processing, check if the `event.id` already exists in the `ProcessedWebhook` table. If so, return `200 OK`.
    -   `[ ]` **Handle `checkout.session.completed`:**
        -   `[ ]` **[Added] Metadata Validation:**
            -   `[ ]` Extract the session object.
            -   `[ ]` Vigorously validate that `session.metadata.userId` and `session.metadata.consultationId` exist. If either is missing, log a critical error in Sentry and return a `400 Bad Request` to Stripe (they will retry, but we need to know about this misconfiguration).
        -   `[ ]` **[Refined] Use a Database Transaction:**
            -   `[ ]` Wrap the following logic in `prisma.$transaction(async (tx) => { ... })`.
            -   `[ ]` **Inside the transaction:**
                1.  Find the `Consultation` record using the `consultationId` from the metadata.
                2.  Update its status from `DRAFT` to `PENDING`.
                3.  Store the `payment_intent` in the `stripePaymentId` field.
                4.  Create a record in the `ProcessedWebhook` table with the `event.id`.
        -   `[ ]` (Optional) After the transaction successfully completes, trigger a confirmation email.
    -   `[ ]` Return `200 OK`.

## `[ ]` 4. Customer Portal Integration

**Objective:** Provide users with a self-service way to manage their payment methods.

-   `[ ]` **Implement Portal API Route (`POST /api/billing/portal`):** Create a Stripe Billing Portal session for the user.
-   `[ ]` **Integrate into Settings Page:** Add a "Manage Billing" button that uses a `useCreatePortalSession` hook to redirect the user.

## `[ ]` 5. [Added] Production Readiness & Monitoring

**Objective:** Ensure the payment system is observable and resilient in production.

-   `[ ]` **Stripe CLI Webhook Testing:** Set up and document the `stripe listen` command for local development and testing.
-   `[ ]` **Monitoring & Alerting:**
    -   `[ ]` Configure Sentry to capture any errors within the `/api/billing/webhook` route.
    -   `[ ]` Set up a high-priority alert in Sentry that triggers if the webhook endpoint returns any non-200 status code, as this indicates a critical failure in the payment processing flow.
-   `[ ]` **Stripe Dashboard Review:** Familiarize the team with the Stripe Dashboard's sections for viewing payments, customers, and, most importantly, webhook delivery attempt logs.

## `[ ]` 6. Final Testing & Validation

**Objective:** Rigorously test the entire monetization flow, including edge cases.

-   `[ ]` **End-to-End Test (Happy Path):** Complete a payment and verify that the `Consultation` record is correctly updated from `DRAFT` to `PENDING` and that the webhook is logged.
-   `[ ]` **Test Checkout Abandonment:** Fill out the form, proceed to Stripe, but do *not* pay. Verify that a `Consultation` record exists in the database with `status: 'DRAFT'`.
-   `[ ]` **Test Webhook Idempotency:** Manually resend a successful webhook event from the Stripe Dashboard and verify that it is gracefully ignored (returns `200 OK`) and does not create a duplicate consultation.
-   `[ ]` **Code Review:** Review all billing-related code, with a special focus on the transactional integrity of the webhook, security, and metadata handling.
-   `[ ]` **Mark as Complete:** Merge the feature branch into `main` and mark this phase as complete in the Master Implementation Plan.