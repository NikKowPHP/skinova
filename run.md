# How to Run Skinova: Environment Variable Setup

This guide provides step-by-step instructions on how to obtain the necessary API keys and secrets for the environment variables defined in `.env.example`. To run this project locally, you must create a `.env` file and populate it with these values.

## Prerequisites

Before you begin, you will need to create accounts for the following services:

*   **Supabase:** For database, authentication, and file storage.
*   **Stripe:** For payment processing.
*   **Google AI Studio (or Google Cloud):** For the Gemini API key.
*   **Resend:** For transactional emails.
*   **(Optional) Sentry & PostHog:** For error monitoring and product analytics.

---

## Step 1: Create Your `.env` File

In the root directory of the project, make a copy of the example file:

```bash
cp .env.example .env
```

Now, open the newly created `.env` file. You will fill in the values below.

---

## Step 2: Obtaining Keys

### 1. Database

The default `DATABASE_URL` is configured for the local Docker setup. For standard local development, you do not need to change this.

```env
# No changes needed for local development
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/skinova?schema=public"
```

### 2. Supabase (Authentication & Storage)

1.  Go to [supabase.com](https://supabase.com) and create a new project.
2.  Navigate to **Project Settings** > **API**.
    *   Copy the **Project URL** and set it as `NEXT_PUBLIC_SUPABASE_URL`.
    *   Copy the **Project API key** (the `public` `anon` key) and set it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    *   Under **Project API keys**, reveal and copy the `service_role` **secret** key and set it as `SUPABASE_SERVICE_ROLE_KEY`. **Never expose this key publicly.**
3.  Go to the **Storage** section in the Supabase dashboard.
    *   Click **"Create a new bucket"**.
    *   Name the bucket `skin-scans`.
    *   Ensure the bucket is **NOT** marked as public.
    *   Set `NEXT_PUBLIC_SKIN_SCANS_BUCKET="skin-scans"`.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key" # SECRET
NEXT_PUBLIC_SKIN_SCANS_BUCKET="skin-scans"
```

### 3. Security (Encryption Key)

This key is critical for encrypting user data in the database. Generate a secure, random key using the following command in your terminal:

```bash
openssl rand -base64 32
```

Copy the output and set it as `APP_ENCRYPTION_KEY`.

```env
# Security
APP_ENCRYPTION_KEY="your-32-byte-base64-encoded-encryption-key" # SECRET
```

### 4. AI Provider (Google Gemini)

1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **"Create API key"**.
3.  Copy the generated key and set it as `GEMINI_API_KEY_1`. For resilience, you can create multiple keys and add them as `GEMINI_API_KEY_2`, etc.

```env
# AI Providers
AI_PROVIDER="gemini"
GEMINI_API_KEY_1="your-gemini-api-key" # SECRET
```

### 5. Billing (Stripe)

1.  Go to the [Stripe Dashboard](https://dashboard.stripe.com/). Make sure you are in **Test mode**.
2.  Navigate to **Developers** > **API keys**.
    *   Reveal and copy the **Secret key** (`sk_test_...`) and set it as `STRIPE_SECRET_KEY`.
3.  Navigate to the **Products** section.
    *   Click **"+ Add product"**.
        *   **Name:** `Skinova Pro`
        *   Under **Pricing**, set a recurring monthly price (e.g., $5.00/month).
        *   Save the product. Click on the pricing you just created and copy its **Price ID** (`price_...`). Set this as `STRIPE_PRO_PRICE_ID`.
    *   Click **"+ Add product"** again.
        *   **Name:** `Dermatology Consultation`
        *   Under **Pricing**, set a one-time price (e.g., $49.00).
        *   Save the product. Click on the pricing and copy its **Price ID** (`price_...`). Set this as `CONSULTATION_PRICE_ID`.
4.  Navigate to **Developers** > **Webhooks**.
    *   Click **"+ Add endpoint"**. For local development, it's highly recommended to use the [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward events to your local server.
    *   Run `stripe listen --forward-to localhost:3000/api/billing/webhook`.
    *   The CLI will output a **webhook signing secret** (`whsec_...`). Set this as `STRIPE_WEBHOOK_SECRET`.

```env
# Billing (Stripe)
STRIPE_SECRET_KEY="sk_test_..." # SECRET
STRIPE_WEBHOOK_SECRET="whsec_..." # SECRET
STRIPE_PRO_PRICE_ID="price_..."
CONSULTATION_PRICE_ID="price_..."
```

### 6. Email & Cron

1.  **Resend:**
    *   Go to [resend.com](https://resend.com) and create an account.
    *   Navigate to **API Keys** and create a new key. Set it as `RESEND_API_KEY`.
    *   You must verify a domain to send emails. Set this verified sending address as `RESEND_FROM_EMAIL`.
2.  **Cron Secret:**
    *   This is used to protect your cron job endpoints. Generate any secure random string. You can use the `openssl` command from Step 3 again.
    *   Set this value as `CRON_SECRET`.

```env
# Email & Cron
RESEND_API_KEY="re_..." # SECRET
RESEND_FROM_EMAIL="Skinova <reminders@your-verified-domain.com>"
CRON_SECRET="your-secure-random-string" # SECRET
```

### 7. Seeding

These are used by the `prisma/seed.cts` script to create a default admin user. You can get the `ADMIN_USER_ID` from the **Authentication** section of your Supabase project after you've signed up with the admin email.

```env
# Seeding
ADMIN_EMAIL="admin@skinova.app"
ADMIN_USER_ID="00000000-0000-0000-0000-000000000000" # Replace with your Supabase User ID
```

---

## Step 3: Run the Application

Once your `.env` file is fully populated, you can start the application:

1.  **Start the database:**
    ```bash
    docker-compose up -d db
    ```
2.  **Apply database migrations:**
    ```bash
    npx prisma migrate dev
    ```
3.  **(Optional) Seed the database with initial data:**
    ```bash
    npx prisma db seed
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```

Your application should now be running on `http://localhost:3000`.