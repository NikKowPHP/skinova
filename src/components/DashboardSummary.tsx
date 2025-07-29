import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSummaryProps {
  totalScans: number;
  overallScore: number;
  topConcern: string;
}

export function DashboardSummary({
  totalScans,
  overallScore,
  topConcern,
}: DashboardSummaryProps) {
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