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