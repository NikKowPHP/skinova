Of course. Here is the fully updated and refined plan for Phase C, incorporating the recommendations to establish a distinct visual identity for Skinova.

---

# **Phase C: Theming & Visual Polish**

**Goal:** Implement the Skinova design system across the application. This includes defining the color palette, typography, component styling (shape, feel), and ensuring both light and dark modes are fully functional and visually appealing. The "definition of done" is an application with a cohesive, polished, and brand-aligned visual identity, ready for dynamic data integration.

---

### 1. Branding & Core Assets

-   `[ ]` **Task 1.1: Replace Application Favicons and Manifest**

    -   **Action:** Replace all existing favicon files in the `public/` and `public/favicon/` directories with the new Skinova assets. Then, update the manifest files to reflect the new brand name and theme colors.
    -   **Files to Replace:**
        -   `public/favicon.ico`
        -   `public/favicon/apple-touch-icon.png`
        -   `public/favicon/favicon-16x16.png`
        -   `public/favicon/favicon-32x32.png`
        -   `public/favicon/android-chrome-192x192.png`
        -   `public/favicon/android-chrome-512x512.png`
    -   **File to Update:** `public/manifest.json`
        ```json
        {
          "name": "Skinova",
          "short_name": "Skinova",
          "description": "AI-driven personalized skincare routines and teledermatology services.",
          "start_url": "/",
          "display": "standalone",
          "background_color": "#ffffff",
          "theme_color": "#0991B1",
          "icons": [
            { "src": "/favicon/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/favicon/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
          ]
        }
        ```
    -   **File to Update:** `public/site.webmanifest`
        ```json
        {
          "name": "Skinova",
          "short_name": "Skinova",
          "icons": [
            { "src": "/favicon/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
            { "src": "/favicon/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
          ],
          "theme_color": "#ffffff",
          "background_color": "#ffffff",
          "display": "standalone"
        }
        ```

-   `[ ]` **Task 1.2: Create a Reusable `SkinovaLogo` Component**

    -   **File:** `src/components/SkinovaLogo.tsx`
    -   **Action:** Create a new file for a reusable SVG logo component.
    -   **Content:**
        ```tsx
        import React from 'react';

        export const SkinovaLogo = () => {
          return (
            <svg width="100" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Placeholder for the actual Skinova SVG logo path */}
              <text x="0" y="20" fontFamily="Inter, sans-serif" fontSize="24" fontWeight="bold" fill="currentColor">
                Skinova
              </text>
            </svg>
          );
        };
        ```

-   `[ ]` **Task 1.3: Integrate the `SkinovaLogo`**

    -   **Action:** Replace the text-based "Lexity" brand name with the new `SkinovaLogo` component in the main layouts.
    -   **File:** `src/components/layout/DesktopSidebar.tsx`
        -   **Action:** Import and use the `SkinovaLogo` component.
            ```tsx
            import { SkinovaLogo } from "@/components/SkinovaLogo";
            // ...
            <div className="flex items-center h-16 border-b px-6">
              <Link href="/">
                <SkinovaLogo />
              </Link>
            </div>
            // ...
            ```
    -   **File:** `src/components/layout/AppShell.tsx`
        -   **Action:** Import and use the `SkinovaLogo` component in the public-facing navigation bar.
            ```tsx
            import { SkinovaLogo } from "@/components/SkinovaLogo";
            // ...
            <Link href="/" className="text-lg font-bold">
              <SkinovaLogo />
            </Link>
            // ...
            ```

---

### 2. Design System Configuration & Styling

-   `[ ]` **Task 2.1: Define the Skinova Color Palette & Typography**

    -   **File:** `src/app/globals.css`
    -   **Action:** Replace the entire content of the file with Skinova's brand colors, design tokens, and preserved typography classes. This palette uses a calming teal/cyan as the primary color.
    -   **Content:**
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        
        @layer base {
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 194.3 87.5% 38.6%; /* Skinova Teal */
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 194.3 87.5% 38.6%;
            --radius: 0.75rem;
          }
        
          .dark {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 194.3 75.5% 48.6%; /* Brighter Teal for dark mode */
            --primary-foreground: 222.2 47.4% 11.2%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 194.3 75.5% 48.6%;
          }
        }
        
        @layer base {
          * {
            @apply border-border;
          }
          body {
            @apply bg-background text-foreground;
          }
        }
        
        /* Typography Classes */
        @layer components {
          .text-large-title { @apply text-3xl font-bold tracking-tight md:text-4xl; }
          .text-title-1 { @apply text-2xl font-bold tracking-tight md:text-3xl; }
          .text-title-2 { @apply text-xl font-semibold tracking-tight md:text-2xl; }
          .text-title-3 { @apply text-lg font-semibold tracking-tight md:text-xl; }
          .text-headline { @apply text-base font-semibold; }
          .text-body { @apply text-base font-normal; }
          .text-callout { @apply text-sm font-normal; }
          .text-subhead { @apply text-sm font-semibold; }
          .text-footnote { @apply text-xs font-normal; }
          .text-caption-1 { @apply text-xs font-normal text-muted-foreground; }
          .text-caption-2 { @apply text-[11px] font-normal text-muted-foreground; }
        }
        ```

-   `[ ]` **Task 2.2: Configure Application Fonts**

    -   **File:** `src/app/layout.tsx`
    -   **Action:** Update the font import from `next/font/google` to use "Inter", a clean and modern sans-serif font suitable for Skinova.
    -   **Content:**
        ```tsx
        import { Inter } from "next/font/google";
        // ...
        const inter = Inter({
          subsets: ["latin"],
          variable: "--font-sans",
        });
        // ...
        export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
          return (
            <html lang="en" suppressHydrationWarning>
              <body className={`${inter.variable} font-sans antialiased`}>
                {/* ... providers and other content ... */}
              </body>
            </html>
          );
        }
        ```

-   `[ ]` **Task 2.3: Update `shadcn/ui` Base Color**
    -   **File:** `components.json`
    -   **Action:** Update the `baseColor` from "slate" to "neutral" to better align with the new, cleaner design system.
    -   **Content:**
        ```json
        {
          "$schema": "https://ui.shadcn.com/schema.json",
          "style": "new-york",
          "rsc": true,
          "tsx": true,
          "tailwind": {
            "config": "tailwind.config.ts",
            "css": "src/app/globals.css",
            "baseColor": "neutral",
            "cssVariables": true
          },
          "aliases": {
            "components": "@/components",
            "utils": "@/lib/utils"
          }
        }
        ```

-   `[ ]` **Task 2.4: Define Skinova's Component Style Language**

    -   **Action:** Update the core, reusable UI components (`Card`, `Button`, `Input`) to reflect Skinova's unique aesthetic. The goal is a cleaner, more modern feel with consistent styling across all devices.
    -   **File:** `src/components/ui/card.tsx`
        -   **Action:** Modify the `Card` component to have a softer, more modern feel by removing the glassmorphism effect and using a consistent style for mobile and desktop.
        -   **Content:**
            ```tsx
            import * as React from "react";
            import { cn } from "@/lib/utils";

            function Card({ className, ...props }: React.ComponentProps<"div">) {
              return (
                <div
                  data-slot="card"
                  className={cn(
                    "rounded-xl border bg-card text-card-foreground shadow-sm", // Use consistent, softer styling
                    className,
                  )}
                  {...props}
                />
              );
            }
            // Keep the rest of the Card components (CardHeader, etc.) as they are
            ```
    -   **File:** `src/components/ui/button.tsx`
        -   **Action:** Modify the `buttonVariants` to use a consistent, modern border-radius, removing the mobile-specific "pill" shape.
        -   **Content Snippet:** (Update the `size` variants inside the `cva` call)
            ```ts
            //... inside buttonVariants cva
            size: {
              default: "h-10 px-4 py-2 rounded-md", // Consistent rounded-md
              sm: "h-9 rounded-md px-3",
              lg: "h-11 rounded-md px-8",
              icon: "h-10 w-10 rounded-md", // Consistent rounded-md for icons
            },
            //...
            ```
    -   **File:** `src/components/ui/input.tsx`
        -   **Action:** Modify the `Input` component to have a consistent style across mobile and desktop, favoring the bordered, clean look.
        -   **Content:**
            ```tsx
            import * as React from "react";
            import { cn } from "@/lib/utils";

            function Input({ className, type, ...props }: React.ComponentProps<"input">) {
              return (
                <input
                  type={type}
                  data-slot="input"
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                  )}
                  {...props}
                />
              );
            }
            ```

---

### 3. Visual Review and Polish

-   `[ ]` **Task 3.1: Refine Landing Page Visuals**

    -   **File:** `src/app/page.tsx`
    -   **Action:** Update the landing page hero section to use the brand's primary color in a gradient for a more polished and engaging look.
    -   **Content Snippet:** (Replace the `<h1>` in `src/app/page.tsx`)
        ```tsx
        // ... inside the Hero Section
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-4">
          Data-Driven Skincare, <span className="text-primary">Personalized for You</span>
        </h1>
        // ...
        ```

-   `[ ]` **Task 3.2: Full Application Visual Review**
    -   **Action:** Manually navigate through every page and component created in Phase A and B to ensure the new theme and component styles are applied correctly and consistently.
    -   **Pages to Review:**
        -   `/` (Landing Page)
        -   `/dashboard`
        -   `/scan` and `/scan/[id]` (Static mock page)
        -   `/routine`
        -   `/progress`
        -   `/settings`
        -   `/login`, `/signup`, and other auth pages
    -   **Checklist:**
        -   Are all buttons and interactive elements using the new primary color?
        -   Is the text legible and using the correct font (`Inter`) in both light and dark modes?
        -   Are `Card`, `Button`, and `Input` components using the new, consistent styling?
        -   Is the spacing between elements consistent and visually pleasing?
        -   Are there any lingering colors or styles from the old Lexity theme?
        -   Do interactive states (hover, focus) look correct with the new theme?