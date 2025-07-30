'use client';
import { DashboardSummary } from "@/components/DashboardSummary";
import { ScanHistoryList } from "@/components/progress/ScanHistoryList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useProgressAnalytics, useScanHistory } from "@/lib/hooks/data";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function DashboardPage() {
  const { data: analytics, isLoading: isAnalyticsLoading } = useProgressAnalytics();
  const { data: scans, isLoading: areScansLoading } = useScanHistory();

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const authUser = useAuthStore((state) => state.user);

  useEffect(() => {
    // Handle post-subscription redirect
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Welcome to Pro!",
        description: "Your subscription is now active."
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile", authUser?.id] });
      router.replace('/dashboard');
    }
    
    // Handle post-onboarding redirect
    if (searchParams.get('onboarding_complete') === 'true') {
        toast({
            title: "Welcome to Skinova!",
            description: "You're all set up. Let's get started on your skin journey.",
        });
        // Invalidate all queries to fetch the freshest data for the dashboard
        queryClient.invalidateQueries({ queryKey: ["progressAnalytics", authUser?.id] });
        queryClient.invalidateQueries({ queryKey: ["scans", authUser?.id] });
        router.replace('/dashboard');
    }
  }, [searchParams, router, toast, queryClient, authUser]);


  const isLoading = isAnalyticsLoading || areScansLoading;

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

  const mappedScans =
    scans?.slice(0, 5).map((scan: any) => ({
      id: scan.id,
      date: new Date(scan.createdAt).toLocaleDateString(),
      overallScore: scan.analysis?.overallScore ?? 'N/A',
      thumbnailUrl: scan.imageUrl,
    })) || [];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {hasScans && (
          <Button asChild>
            <Link href="/scan">New Scan</Link>
          </Button>
        )}
      </div>
      
      {!hasScans ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Welcome to Skinova!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-muted-foreground">
              Your skin journey starts here. Perform your first scan to get a personalized analysis and routine.
            </p>
            <Button asChild size="lg">
              <Link href="/scan">Perform First Scan</Link>
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
          <section className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Scans</h2>
                {scans && scans.length > 5 && (
                    <Button variant="link" asChild>
                        <Link href="/progress">View All</Link>
                    </Button>
                )}
            </div>
            <ScanHistoryList scans={mappedScans} />
          </section>
        </>
      )}
    </div>
  );
}