'use client';
import { ProgressChart } from "@/components/progress/ProgressChart";
import { ScanHistoryList } from "@/components/progress/ScanHistoryList";
import { useProgressAnalytics, useScanHistory } from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProgressPage() {
  const { data: analytics, isLoading: isAnalyticsLoading } = useProgressAnalytics();
  const { data: scans, isLoading: areScansLoading } = useScanHistory();

  const isLoading = isAnalyticsLoading || areScansLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const mappedScans =
    scans?.map((scan: any) => ({
      id: scan.id,
      date: new Date(scan.createdAt).toLocaleDateString(),
      overallScore: scan.analysis?.overallScore ?? 'N/A',
      thumbnailUrl: scan.imageUrl,
    })) || [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Your complete skin health logbook.</p>
      </header>
      
      {mappedScans.length === 0 ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>No Progress to Show Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Perform your first scan to start tracking your skin health journey.
            </p>
            <Button asChild>
              <Link href="/scan">Perform First Scan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <ProgressChart />
          <ScanHistoryList scans={mappedScans} />
        </>
      )}
    </div>
  );
}