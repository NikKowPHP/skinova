'use client';
import { RoutineStepCard } from "@/components/routine/RoutineStepCard";
import { useRoutine, useCompleteOnboarding } from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useRouter } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
        
export default function RoutinePage() {
  const { data: routine, isLoading } = useRoutine();
  const { step } = useOnboardingStore();
  const router = useRouter();

  const completeOnboardingMutation = useCompleteOnboarding({
    onSuccess: () => {
      router.push("/dashboard?onboarding_complete=true");
    },
  });

  const isOnboardingRoutine = step === 'VIEW_ROUTINE';

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
          {amRoutine.map(step => <RoutineStepCard 
            key={step.id} 
            step={step.stepNumber} 
            productType={step.product.type} 
            productName={step.product.name}
            productBrand={step.product.brand}
            productDescription={step.product.description}
            instructions={step.instructions}
            imageUrl={step.product.imageUrl}
            purchaseUrl={step.product.purchaseUrl}
          />)}
        </section>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">PM Routine 🌙</h2>
          {pmRoutine.map(step => <RoutineStepCard 
            key={step.id} 
            step={step.stepNumber} 
            productType={step.product.type} 
            productName={step.product.name}
            productBrand={step.product.brand}
            productDescription={step.product.description}
            instructions={step.instructions}
            imageUrl={step.product.imageUrl}
            purchaseUrl={step.product.purchaseUrl}
          />)}
        </section>
      </div>

       {isOnboardingRoutine && (
          <div className="text-center mt-8 pb-20 md:pb-0">
              <Card className="max-w-md mx-auto p-6 bg-primary/10 border-primary/20">
                  <CardHeader>
                      <CardTitle>This is your first personalized routine!</CardTitle>
                      <CardDescription>You're all set up. Explore your dashboard to track your progress.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Button 
                        size="lg" 
                        onClick={() => completeOnboardingMutation.mutate()}
                        disabled={completeOnboardingMutation.isPending}
                      >
                          {completeOnboardingMutation.isPending ? (
                              <>
                                <Spinner size="sm" className="mr-2" />
                                Finalizing...
                              </>
                          ) : (
                              "Complete & Go to Dashboard"
                          )}
                      </Button>
                  </CardContent>
              </Card>
          </div>
      )}
    </div>
  );
}