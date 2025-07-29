'use client';
import { RoutineStepCard } from "@/components/routine/RoutineStepCard";
import { useRoutine } from "@/lib/hooks/data/useRoutine";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
        
export default function RoutinePage() {
  const { data: routine, isLoading } = useRoutine();

  if (isLoading) {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    )
  }

  if (!routine || routine.steps.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Your Routine Awaits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Your personalized skincare routine will appear here after your first skin analysis is complete.
            </p>
            <Button asChild size="lg">
              <Link href="/scan">Start First Scan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const amRoutine = routine.steps.filter(s => s.timeOfDay === "AM");
  const pmRoutine = routine.steps.filter(s => s.timeOfDay === "PM");

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">My Routine</h1>
        <p className="text-muted-foreground">Your AI-generated daily skincare plan.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">AM Routine ☀️</h2>
          {amRoutine.map(step => <RoutineStepCard key={step.id} step={step.stepNumber} productType={step.product.type} productName={step.product.name} instructions={step.instructions} />)}
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">PM Routine 🌙</h2>
          {pmRoutine.map(step => <RoutineStepCard key={step.id} step={step.stepNumber} productType={step.product.type} productName={step.product.name} instructions={step.instructions} />)}
        </section>
      </div>
    </div>
  );
}