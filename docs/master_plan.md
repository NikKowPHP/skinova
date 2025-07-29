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

### `[x]` Phase E: Core Feature API Implementation

**Goal:** Build the essential backend API routes for all core user-facing features. This includes the complete business logic and CRUD operations for **Skin Scanning & Analysis**, **Personalized Routine Management**, **Progress Tracking**, and **User Data Portability (Export/Delete)**, ensuring all routes are protected by the Supabase authentication strategy.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-e-core-api.md`]*

---

### `[x]` Phase F: Frontend API Integration

**Goal:** Make the application fully dynamic by connecting the static frontend to the live backend. This involves **replacing all mock data** in the UI with live data fetched from the API, using `@tanstack/react-query` for data fetching, caching, mutations, and optimistic updates for features like submitting a new `SkinScan`.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-f-frontend-integration.md`]*

---

### `[x]` Phase G: Monetization & Billing Integration

**Goal:** Implement the complete monetization lifecycle by integrating with Stripe. This includes creating checkout sessions for both **Pro tier subscriptions** and **pay-per-use teledermatology consultations**, providing a customer portal for management, and building a secure webhook endpoint to synchronize billing status with the application database.

- *[Link to a detailed breakdown document, e.g., `./docs/phases/phase-g-billing-integration.md`]*

---

### `[x]` Phase H: Backend Automation & Advanced Services

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