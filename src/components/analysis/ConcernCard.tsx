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