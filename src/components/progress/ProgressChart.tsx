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