'use client';
import { ProgressChart } from "@/components/progress/ProgressChart";
import { ScanHistoryList } from "@/components/progress/ScanHistoryList";
import { useProgressAnalytics, useScanHistory } from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProgressPage() {
  const { data: analytics, isLoading: isAnalyticsLoading } = useProgressAnalytics();
  const { data: scans, isLoading: isScansLoading } = useScanHistory();
  
  const isLoading = isAnalyticsLoading || isScansLoading;
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const hasScans = analytics && analytics.totalScans > 0;
  const mappedScans = scans?.map(scan => ({
    id: scan.id,
    date: new Date(scan.createdAt).toLocaleDateString(),
    overallScore: scan.analysis?.overallScore ?? 0,
    thumbnailUrl: scan.imageUrl,
  })) || [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Your complete skin health logbook.</p>
      </header>

      {hasScans ? (
        <>
          <ProgressChart />
          <ScanHistoryList scans={mappedScans} />
        </>
      ) : (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Start Tracking Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Perform your first skin scan to begin your personalized journey and see your progress over time.
            </p>
            <Button asChild size="lg">
              <Link href="/scan">Start First Scan</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}