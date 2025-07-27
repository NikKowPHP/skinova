
# **Document 2: Skinova Master Implementation Plan (v1.2)**

_**Changelog v1.2:** Refined Phase H goal to reflect adaptation of the existing Gemini AI pipeline. Added Architectural Principle for AI abstraction. Updated timeline estimates. Added Pre-Flight Checklist._

This document outlines the high-level, phased plan for building the **Skinova** **Progressive Web App**. It serves as the single source of truth for the development roadmap, guiding the team through each stage of implementation from initial setup to deployment readiness.

## Project Management & Workflow

-   **Methodology:** Agile methodology with two-week sprints.
-   **Tooling:** A project board (e.g., Trello, Linear) will be used to track epics, user stories, and tasks.
-   **Architectural Principle:** Where possible, new services (like AI providers) will be built behind abstraction layers to maintain flexibility and allow for future integrations (e.g., Cerebras, Groq) with minimal refactoring.

## Pre-Flight Checklist (Pre-Phase A Actions)
-   `[x]` **Engage Legal Counsel:** Hold kickoff meeting with a lawyer specializing in GDPR and health-tech.
-   `[x]` **Secure Dermatologist Partners:** Sign contracts with at least two (2) Polish-licensed dermatologists for the MVP.
-   `[x]` **Finalize UX/UI Mockups:** Designer to produce high-fidelity mockups for core user flows.
-   `[ ]` **Create Sprint 0 Backlog:** Product Owner to break down Phases A & B into actionable tickets.

## The Plan

### `[ ]` Phase A: Setup & Scaffolding (Est. Duration: 1 week)
**Goal:** Execute initial project setup, configure environments, and scaffold all primary pages and routes based on the Lexity framework.

### `[ ]` Phase B: Static Component Implementation (Est. Duration: 2 weeks)
**Goal:** Build all new, static UI components (Image Uploader, Analysis Report Card, etc.) using mock data.

### `[ ]` Phase C: Theming & Visual Polish (Est. Duration: 1 week)
**Goal:** Implement the iOS-inspired design system, including light/dark mode, typography, and color palettes.

### `[ ]` Phase D: Database Schema & Seeding (Est. Duration: 1 week)
**Goal:** Implement the final Skinova database schema using Prisma, run the initial migration, and create seed scripts.

### `[ ]` Phase E: Core Feature API Implementation (Est. Duration: 2 weeks)
**Goal:** Build the essential backend API routes for Skin Analysis, Consultation management, and User Profile updates.

### `[ ]` Phase F: Frontend API Integration (Est. Duration: 2 weeks)
**Goal:** Make the application fully dynamic by connecting the frontend to the backend, replacing all mock data, and implementing optimistic updates and skeletons.

### `[ ]` Phase G: Monetization & Billing Integration (Est. Duration: 2 weeks)
**Goal:** Implement the pay-per-use Teledermatology lifecycle with Stripe Checkout and a secure webhook endpoint.

### `[ ]` Phase H: Backend Automation & AI Adaptation (Est. Duration: 1 week)
**Goal:** Build the automated systems, including **adapting the existing Gemini AI Image Analysis Pipeline** for skin-specific tasks, refining vision prompts, and implementing the Email Notification Engine.

### `[ ]` Phase I: Dermatologist Portal (Est. Duration: 2 weeks)
**Goal:** Develop the secure portal where dermatologists can view pending consultations, review user data, and submit diagnostic reports.

### `[ ]` Phase J: Final Testing & Deployment Prep (Est. Duration: 1 week)
**Goal:** Ensure the application is stable and ready for production through end-to-end testing, setting up observability, and configuring production environments.

---
_**Total Estimated MVP Timeline: 15 weeks**_

## Development, QA & Deployment Process

-   **Environment Strategy:** `Development` (Local), `Staging` (Vercel Preview), `Production` (Vercel).
-   **Branching Strategy:** Feature branches from `main`, merged via Pull Request.
-   **CI/CD Pipeline:** On PR, run Jest and Playwright tests. On merge to `main`, deploy to production.
-   **QA Process:** The Product Owner will conduct QA on Vercel preview deployments before sprint completion.

## Feature Coverage Traceability Matrix
| Epic from App Description | Primary Implementation Phase(s) |
| :--- | :--- |
| **Epic 1: Core System & Infrastructure** | **Phase D, E, H** |
| **Epic 2: User Account & Auth** | **Phase E, F** |
| **Epic 3: Core Feature - AI Skin Analysis**| **Phase B, E, F, H** |
| **Epic 4: Monetization - Teledermatology**| **Phase G** |
| **Epic 5: Dermatologist Portal** | **Phase I** |
| **Compliance & Data Handling** | **Phase D, H, J** |
| **Reactive UI & Performance** | **Phase B, F** |