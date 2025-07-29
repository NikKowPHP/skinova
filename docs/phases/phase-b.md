Of course. Here is the fully updated and comprehensive plan for Phase B, incorporating all the recommended refinements.

---

# **Phase B: Static Component Implementation**

**Goal:** Systematically build all new, static, and reusable UI components required by Skinova's core features. Integrate these components into the scaffolded pages from Phase A, **using mock or hardcoded data** to ensure the UI is developed independently and rapidly. The "definition of done" for this phase is an application that is visually complete and reviewable, with all pages populated by static components, but with no live backend functionality.

---

### 1. Onboarding & Core Scan Journey

-   `[ ]` **Task 1.1: Create the `SkinProfileWizard` Component**

    -   **File:** `src/components/onboarding/SkinProfileWizard.tsx`
    -   **Action:** Create this new component to guide users through the initial profile setup. This will be integrated with the main app shell in a later phase.
    -   **Content:**
        ```tsx
        'use client';
        import React from 'react';
        import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
        import { Button } from "@/components/ui/button";
        import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
        import { SUPPORTED_SKIN_TYPES, SUPPORTED_CONCERNS } from '@/lib/constants';

        export const SkinProfileWizard = () => {
          const [step, setStep] = React.useState(1);
          // This component will be connected to the Zustand store in a later phase.
          // For now, its state is self-contained.

          return (
            <Dialog open={true}>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>
                    {step === 1 && "Welcome to Skinova!"}
                    {step === 2 && "Tell Us About Your Skin"}
                    {step === 3 && "What Are Your Goals?"}
                  </DialogTitle>
                </DialogHeader>

                {step === 1 && <p>Let's personalize your experience. A few quick questions will help us get started.</p>}
                
                {step === 2 && (
                  <div className="space-y-4">
                    <label>What is your skin type?</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select skin type" /></SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_SKIN_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {step === 3 && (
                   <div className="space-y-4">
                    <label>What is your primary skin concern?</label>
                     <Select>
                      <SelectTrigger><SelectValue placeholder="Select primary concern" /></SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CONCERNS.map(concern => <SelectItem key={concern.value} value={concern.value}>{concern.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter className="mt-6">
                  {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
                  {step < 3 ? (
                    <Button onClick={() => setStep(step + 1)} className="ml-auto">Next</Button>
                  ) : (
                    <Button onClick={() => alert("Onboarding Complete! (Phase B)")} className="ml-auto">Finish Setup</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          );
        };
        ```

-   `[ ]` **Task 1.2: Create the `ScanInstructions` Component**

    -   **File:** `src/components/scan/ScanInstructions.tsx`
    -   **Action:** Create a new file with the following content. This component will guide users on how to take an effective photo for analysis.
    -   **Content:**
        ```tsx
        import { Lightbulb, Camera, Sun, Smile } from "lucide-react";
        import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

        const instructions = [
          { icon: Sun, text: "Find a well-lit area, preferably with natural light." },
          { icon: Smile, text: "Maintain a neutral facial expression." },
          { icon: Camera, text: "Ensure your face is centered and clearly in focus." },
        ];

        export const ScanInstructions = () => {
          return (
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Tips for a Great Scan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {instructions.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <item.icon className="h-5 w-5 mt-0.5 shrink-0" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        };
        ```

-   `[ ]` **Task 1.3: Create the `ScanUploadForm` Component**

    -   **File:** `src/components/scan/ScanUploadForm.tsx`
    -   **Action:** Create a new file with the following content. This is the main interactive element for submitting a new scan.
    -   **Content:**
        ```tsx
        'use client';
        import { useState } from 'react';
        import { Button } from "@/components/ui/button";
        import { Textarea } from "@/components/ui/textarea";
        import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
        import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";

        export const ScanUploadForm = () => {
          const [imagePreview, setImagePreview] = useState<string | null>(null);
          const [notes, setNotes] = useState('');
          const [isUploading, setIsUploading] = useState(false);

          // In this phase, this is a mock function.
          const handleAnalyzeClick = () => {
            setIsUploading(true);
            setTimeout(() => {
              setIsUploading(false);
              alert("Mock analysis complete! (Phase B)");
            }, 2000);
          };

          return (
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Scan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Skin scan preview" className="object-cover h-full w-full rounded-lg" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                      <p>Click to upload or drag & drop</p>
                      <p className="text-xs">PNG, JPG, or WEBP</p>
                    </div>
                  )}
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                </div>
                <Textarea
                  placeholder="Add any notes about your skin today (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={handleAnalyzeClick} disabled={isUploading}>
                  {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isUploading ? "Analyzing..." : "Analyze My Skin"}
                </Button>
              </CardFooter>
            </Card>
          );
        };
        ```

-   `[ ]` **Task 1.4: Assemble the `/scan` Page**

    -   **File:** `src/app/scan/page.tsx`
    -   **Action:** Update the placeholder page to use the newly created static components.
    -   **Content:**
        ```tsx
        import { ScanInstructions } from "@/components/scan/ScanInstructions";
        import { ScanUploadForm } from "@/components/scan/ScanUploadForm";

        export default function ScanPage() {
          return (
            <div className="container mx-auto p-4 space-y-8">
              <header>
                <h1 className="text-3xl font-bold">New Skin Scan</h1>
                <p className="text-muted-foreground">Upload a photo to get your personalized analysis.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ScanInstructions />
                <ScanUploadForm />
              </div>
            </div>
          );
        }
        ```

---

### 2. The Analysis, Routine & Consultation UI

-   `[ ]` **Task 2.1: Create the `AnalysisResultDisplay` Component**

    -   **File:** `src/components/analysis/AnalysisResultDisplay.tsx`
    -   **Action:** Create this new component for visualizing analysis results on an image.
    -   **Content:**
        ```tsx
        'use client';
        import { useState } from 'react';
        import { cn } from '@/lib/utils';

        interface Concern {
          id: string;
          name: string;
          severity: 'Mild' | 'Moderate' | 'Severe';
          position: { top: string; left: string; width: string; height: string };
        }

        interface AnalysisResultDisplayProps {
          imageUrl: string;
          concerns: Concern[];
          activeConcernId: string | null;
          onConcernHover: (id: string | null) => void;
        }

        export const AnalysisResultDisplay = ({ imageUrl, concerns, activeConcernId, onConcernHover }: AnalysisResultDisplayProps) => {
          return (
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <img src={imageUrl} alt="Analyzed skin scan" className="rounded-lg object-cover w-full h-full" />
              {concerns.map(concern => (
                <div
                  key={concern.id}
                  className={cn(
                    "absolute border-2 rounded-md transition-all duration-300 cursor-pointer",
                    activeConcernId === concern.id ? 'border-primary shadow-lg' : 'border-primary/30 hover:border-primary/70'
                  )}
                  style={{ ...concern.position }}
                  onMouseEnter={() => onConcernHover(concern.id)}
                  onMouseLeave={() => onConcernHover(null)}
                />
              ))}
            </div>
          );
        };
        ```

-   `[ ]` **Task 2.2: Create the `ConcernCard` Component**

    -   **File:** `src/components/analysis/ConcernCard.tsx`
    -   **Action:** Create a card to display details of a single identified concern.
    -   **Content:**
        ```tsx
        import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
        import { cn } from "@/lib/utils";

        interface ConcernCardProps {
          name: string;
          severity: 'Mild' | 'Moderate' | 'Severe';
          description: string;
          isActive: boolean;
          onMouseEnter: () => void;
          onMouseLeave: () => void;
        }

        export const ConcernCard = ({ name, severity, description, isActive, onMouseEnter, onMouseLeave }: ConcernCardProps) => {
          const severityColor = {
            Mild: 'text-green-500',
            Moderate: 'text-yellow-500',
            Severe: 'text-red-500',
          }[severity];

          return (
            <Card className={cn("transition-shadow", isActive && "shadow-lg ring-2 ring-primary")} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              <CardHeader className="p-4">
                <div className="flex justify-between items-baseline">
                  <CardTitle className="text-base">{name}</CardTitle>
                  <span className={cn("font-semibold text-sm", severityColor)}>{severity}</span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          );
        };
        ```

-   `[ ]` **Task 2.3: Create the `ConsultationPrompt` Component**

    -   **File:** `src/components/analysis/ConsultationPrompt.tsx`
    -   **Action:** Create a new component to be shown alongside analysis results as a call-to-action.
    -   **Content:**
        ```tsx
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
        import { Button } from "@/components/ui/button";
        import { Stethoscope } from "lucide-react";

        export const ConsultationPrompt = () => {
          return (
            <Card className="bg-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Need a Professional Opinion?
                </CardTitle>
                <CardDescription>
                  For a detailed assessment and prescription-strength recommendations, you can share this analysis with a board-certified dermatologist.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => alert("Initiating consultation... (Phase B)")}>
                  Start a Consultation ($49)
                </Button>
              </CardContent>
            </Card>
          );
        };
        ```
-   `[ ]` **Task 2.4: Create the `RoutineStepCard` Component**

    -   **File:** `src/components/routine/RoutineStepCard.tsx`
    -   **Action:** Create a component to display a single step in a skincare routine.
    -   **Content:**
        ```tsx
        import { Card, CardContent } from "@/components/ui/card";

        interface RoutineStepCardProps {
          step: number;
          productType: string;
          productName: string;
          instructions: string;
        }

        export const RoutineStepCard = ({ step, productType, productName, instructions }: RoutineStepCardProps) => {
          return (
            <Card className="flex items-start p-4 gap-4">
              <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold">{step}</div>
              <div className="flex-1">
                <p className="font-semibold">{productType}</p>
                <p className="text-sm text-muted-foreground">{productName}</p>
                <p className="text-xs mt-1">{instructions}</p>
              </div>
            </Card>
          );
        };
        ```

-   `[ ]` **Task 2.5: Assemble the `/scan/[id]` Page**

    -   **File:** `src/app/scan/[id]/page.tsx`
    -   **Action:** Create this new dynamic route page to display the results of a single, past scan using the new components.
    -   **Content:**
        ```tsx
        'use client';
        import React from 'react';
        import { AnalysisResultDisplay } from "@/components/analysis/AnalysisResultDisplay";
        import { ConcernCard } from "@/components/analysis/ConcernCard";
        import { ConsultationPrompt } from "@/components/analysis/ConsultationPrompt";

        const mockAnalysis = {
          imageUrl: 'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop',
          concerns: [
            { id: 'c1', name: 'Mild Redness', severity: 'Mild' as const, description: 'Slight inflammation detected on the cheek area.', position: { top: '45%', left: '20%', width: '15%', height: '15%' } },
            { id: 'c2', name: 'Dehydration', severity: 'Moderate' as const, description: 'Fine lines on the forehead indicate a lack of hydration.', position: { top: '22%', left: '40%', width: '25%', height: '10%' } },
          ],
        };

        export default function ScanResultPage({ params }: { params: { id: string } }) {
          const [activeConcernId, setActiveConcernId] = React.useState<string | null>(null);

          return (
            <div className="container mx-auto p-4 space-y-8">
              <header>
                <h1 className="text-3xl font-bold">Scan Analysis: July 28, 2024</h1>
                <p className="text-muted-foreground">Scan ID: {params.id}</p>
              </header>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <AnalysisResultDisplay 
                    imageUrl={mockAnalysis.imageUrl} 
                    concerns={mockAnalysis.concerns}
                    activeConcernId={activeConcernId}
                    onConcernHover={setActiveConcernId}
                  />
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Identified Concerns</h2>
                  {mockAnalysis.concerns.map(concern => (
                    <ConcernCard
                      key={concern.id}
                      {...concern}
                      isActive={activeConcernId === concern.id}
                      onMouseEnter={() => setActiveConcernId(concern.id)}
                      onMouseLeave={() => setActiveConcernId(null)}
                    />
                  ))}
                  <ConsultationPrompt />
                </div>
              </div>
            </div>
          );
        }
        ```

-   `[ ]` **Task 2.6: Assemble the `/routine` Page**

    -   **File:** `src/app/routine/page.tsx`
    -   **Action:** Update the placeholder page with static routine components.
    -   **Content:**
        ```tsx
        import { RoutineStepCard } from "@/components/routine/RoutineStepCard";
        
        const mockAmRoutine = [
          { step: 1, productType: 'Cleanser', productName: 'Gentle Hydrating Cleanser', instructions: 'Lather and rinse with lukewarm water.' },
          { step: 2, productType: 'Serum', productName: 'Vitamin C Serum', instructions: 'Apply 2-3 drops to face and neck.' },
          { step: 3, productType: 'Moisturizer', productName: 'Daily Hydration Lotion', instructions: 'Apply evenly to face.' },
          { step: 4, productType: 'Sunscreen', productName: 'SPF 50+ Mineral Sunscreen', instructions: 'Apply generously 15 minutes before sun exposure.' },
        ];

        const mockPmRoutine = [
          { step: 1, productType: 'Cleanser', productName: 'Gentle Hydrating Cleanser', instructions: 'Lather and rinse with lukewarm water.' },
          { step: 2, productType: 'Treatment', productName: 'Retinoid Cream 0.025%', instructions: 'Apply a pea-sized amount. Use 3x a week.' },
          { step: 3, productType: 'Moisturizer', productName: 'Night Repair Cream', instructions: 'Apply evenly to face and neck.' },
        ];

        export default function RoutinePage() {
          return (
            <div className="container mx-auto p-4 space-y-8">
              <header>
                <h1 className="text-3xl font-bold">My Routine</h1>
                <p className="text-muted-foreground">Your AI-generated daily skincare plan.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">AM Routine ☀️</h2>
                  {mockAmRoutine.map(step => <RoutineStepCard key={step.step} {...step} />)}
                </section>
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold">PM Routine 🌙</h2>
                  {mockPmRoutine.map(step => <RoutineStepCard key={step.step} {...step} />)}
                </section>
              </div>
            </div>
          );
        }
        ```
---

### 3. Progress & Dashboard Components

-   `[ ]` **Task 3.1: Adapt `DashboardSummary` for Skinova**

    -   **File:** `src/components/DashboardSummary.tsx`
    -   **Action:** Update the component to show skin-related metrics.
    -   **Content:**
        ```tsx
        import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

        interface DashboardSummaryProps {
          totalScans: number;
          overallScore: number;
          topConcern: string;
        }

        export function DashboardSummary({ totalScans, overallScore, topConcern }: DashboardSummaryProps) {
          return (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalScans}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{overallScore.toFixed(1)} / 100</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Concern</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold capitalize">{topConcern}</p>
                </CardContent>
              </Card>
            </div>
          );
        }
        ```

-   `[ ]` **Task 3.2: Create `ScanHistoryList` Component**

    -   **File:** `src/components/progress/ScanHistoryList.tsx`
    -   **Action:** Create a new component to display a list of past scans.
    -   **Content:**
        ```tsx
        import Link from "next/link";
        import { Card, CardContent } from "@/components/ui/card";

        interface ScanEntry {
          id: string;
          date: string;
          overallScore: number;
          thumbnailUrl: string;
        }

        interface ScanHistoryListProps {
          scans: ScanEntry[];
        }

        export function ScanHistoryList({ scans }: ScanHistoryListProps) {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Scan History</h2>
              <div className="space-y-2">
                {scans.map((scan) => (
                  <Link key={scan.id} href={`/scan/${scan.id}`} passHref>
                    <Card className="transition-colors cursor-pointer hover:bg-accent/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <img src={scan.thumbnailUrl} alt={`Scan from ${scan.date}`} className="h-16 w-16 rounded-md object-cover bg-secondary" />
                        <div className="flex-1">
                          <p className="font-medium">Scan from {scan.date}</p>
                          <p className="text-sm text-muted-foreground">Overall Score: {scan.overallScore}/100</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        }
        ```

-   `[ ]` **Task 3.3: Create `ProgressChart` Placeholder Component**

    -   **File:** `src/components/progress/ProgressChart.tsx`
    -   **Action:** Create a new static component to represent the future analytics chart.
    -   **Content:**
        ```tsx
        import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
        import { BarChart3 } from "lucide-react";

        export const ProgressChart = () => {
          return (
            <Card>
              <CardHeader>
                <CardTitle>Skin Health Over Time</CardTitle>
                <CardDescription>Tracking your overall score based on your scans.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-secondary rounded-md flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Your progress chart will appear here after a few scans.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        };
        ```

-   `[ ]` **Task 3.4: Assemble the `/dashboard` and `/progress` Pages**

    -   **File:** `src/app/dashboard/page.tsx`
    -   **Action:** Update the dashboard placeholder with the new summary and a snippet of the scan history.
    -   **Content:**
        ```tsx
        import { DashboardSummary } from "@/components/DashboardSummary";
        import { ScanHistoryList } from "@/components/progress/ScanHistoryList";
        import { Button } from "@/components/ui/button";
        import Link from "next/link";

        const mockScans = [
            { id: '1', date: 'July 28, 2024', overallScore: 88, thumbnailUrl: 'https://via.placeholder.com/150' },
            { id: '2', date: 'July 21, 2024', overallScore: 85, thumbnailUrl: 'https://via.placeholder.com/150' },
        ];

        export default function DashboardPage() {
          return (
            <div className="container mx-auto p-4 space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button asChild>
                  <Link href="/scan">New Scan</Link>
                </Button>
              </div>
              <DashboardSummary totalScans={12} overallScore={88.4} topConcern="Redness" />
              <ScanHistoryList scans={mockScans} />
            </div>
          );
        }
        ```
    -   **File:** `src/app/progress/page.tsx`
    -   **Action:** Update the progress page to show the full history and the chart placeholder.
    -   **Content:**
        ```tsx
        import { ProgressChart } from "@/components/progress/ProgressChart";
        import { ScanHistoryList } from "@/components/progress/ScanHistoryList";

        const mockScans = [
            { id: '1', date: 'July 28, 2024', overallScore: 88, thumbnailUrl: 'https://via.placeholder.com/150' },
            { id: '2', date: 'July 21, 2024', overallScore: 85, thumbnailUrl: 'https://via.placeholder.com/150' },
            { id: '3', date: 'July 14, 2024', overallScore: 82, thumbnailUrl: 'https://via.placeholder.com/150' },
        ];

        export default function ProgressPage() {
          return (
            <div className="container mx-auto p-4 space-y-8">
              <header>
                <h1 className="text-3xl font-bold">My Progress</h1>
                <p className="text-muted-foreground">Your complete skin health logbook.</p>
              </header>
              <ProgressChart />
              <ScanHistoryList scans={mockScans} />
            </div>
          );
        }
        ```