import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ConcernSeverity } from "@prisma/client";

interface ConcernCardProps {
  name: string;
  severity: ConcernSeverity;
  description: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const ConcernCard = ({ name, severity, description, isActive, onMouseEnter, onMouseLeave }: ConcernCardProps) => {
  const severityColor = {
    MILD: 'text-green-500',
    MODERATE: 'text-yellow-500',
    SEVERE: 'text-red-500',
  }[severity];

  const displaySeverity = severity.charAt(0) + severity.slice(1).toLowerCase();

  return (
    <Card className={cn("transition-shadow", isActive && "shadow-lg ring-2 ring-primary")} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <CardHeader className="p-4">
        <div className="flex justify-between items-baseline">
          <CardTitle className="text-base">{name}</CardTitle>
          <span className={cn("font-semibold text-sm", severityColor)}>{displaySeverity}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};