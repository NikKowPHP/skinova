'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import { AnalysisResultDisplay } from "@/components/analysis/AnalysisResultDisplay";
import { ConcernCard } from "@/components/analysis/ConcernCard";
import { ConsultationPrompt } from "@/components/analysis/ConsultationPrompt";
import { useScan } from "@/lib/hooks/data/useScan";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/Spinner';

export default function ScanResultPage() {
  const params = useParams<{ id: string }>();
  const [activeConcernId, setActiveConcernId] = React.useState<string | null>(null);
  const { data: scan, isLoading, error } = useScan(params.id);

  if (isLoading) {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Skeleton className="w-full aspect-square max-w-md mx-auto" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (error) return <p>Error loading scan: {error.message}</p>;
  if (!scan) return <p>Scan not found.</p>;

  if (!scan.analysis) {
    return (
        <div className="container mx-auto p-4">
            <Card className="text-center p-8 max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Analysis in Progress...</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-muted-foreground">
                  Your scan is being analyzed. This page will update automatically when it's ready.
                </p>
              </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Scan Analysis: {new Date(scan.createdAt).toLocaleDateString()}</h1>
        <p className="text-muted-foreground">Scan ID: {params.id}</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnalysisResultDisplay 
            imageUrl={scan.imageUrl} 
            concerns={scan.analysis.concerns.map(c => ({...c, position: JSON.parse(c.boundingBoxJson || '{}')}))}
            activeConcernId={activeConcernId}
            onConcernHover={setActiveConcernId}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Identified Concerns</h2>
          {scan.analysis.concerns.map(concern => (
            <ConcernCard
              key={concern.id}
              name={concern.name}
              severity={concern.severity}
              description={concern.description}
              isActive={activeConcernId === concern.id}
              onMouseEnter={() => setActiveConcernId(concern.id)}
              onMouseLeave={() => setActiveConcernId(null)}
            />
          ))}
          <ConsultationPrompt scanId={params.id} />
        </div>
      </div>
    </div>
  );
}