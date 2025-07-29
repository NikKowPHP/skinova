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