'use client';
import { DashboardSummary } from "@/components/DashboardSummary";
import { ScanHistoryList } from "@/components/progress/ScanHistoryList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProgressAnalytics, useScanHistory } from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: analytics, isLoading: isAnalyticsLoading } = useProgressAnalytics();
  const { data: scans, isLoading: isScansLoading } = useScanHistory();

  const isLoading = isAnalyticsLoading || isScansLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const hasScans = analytics && analytics.totalScans > 0;
  const recentScans = scans?.slice(0, 2).map(scan => ({
    id: scan.id,
    date: new Date(scan.createdAt).toLocaleDateString(),
    overallScore: scan.analysis?.overallScore ?? 0,
    thumbnailUrl: scan.imageUrl,
  })) || [];


  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/scan">New Scan</Link>
        </Button>
      </div>
      
      {!hasScans ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Welcome to Skinova!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Your journey to better skin starts now. Perform your first scan to get a personalized analysis and routine.
            </p>
            <Button asChild size="lg">
              <Link href="/scan">Start First Scan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <DashboardSummary 
            totalScans={analytics.totalScans} 
            overallScore={analytics.averageScore} 
            topConcern={analytics.topConcern} 
          />
          <ScanHistoryList scans={recentScans} />
        </>
      )}
    </div>
  );
}