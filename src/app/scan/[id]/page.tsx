'use client';
import React from 'react';
import { AnalysisResultDisplay } from "@/components/analysis/AnalysisResultDisplay";
import { ConcernCard } from "@/components/analysis/ConcernCard";
import { ConsultationPrompt } from "@/components/analysis/ConsultationPrompt";

const mockAnalysis = {
  imageUrl: 'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop',
  concerns: [
    { id: 'c1', name: 'Mild Redness', severity: 'Mild' as const, description: 'Slight inflammation detected on the cheek area.', position: { top: '45%', left: '20%', width: '15%', height: '15%' } },
    { id: 'c2', name: 'Dehydration', severity: 'Moderate' as const, description: 'Fine lines on the forehead indicate a lack of hydration.', position: { top: '22%', left: '40%', width: '25%', height: '10%' } },
  ],
};

export default function ScanResultPage({ params }: { params: { id: string } }) {
  const [activeConcernId, setActiveConcernId] = React.useState<string | null>(null);

  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Scan Analysis: July 28, 2024</h1>
        <p className="text-muted-foreground">Scan ID: {params.id}</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnalysisResultDisplay 
            imageUrl={mockAnalysis.imageUrl} 
            concerns={mockAnalysis.concerns}
            activeConcernId={activeConcernId}
            onConcernHover={setActiveConcernId}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Identified Concerns</h2>
          {mockAnalysis.concerns.map(concern => (
            <ConcernCard
              key={concern.id}
              {...concern}
              isActive={activeConcernId === concern.id}
              onMouseEnter={() => setActiveConcernId(concern.id)}
              onMouseLeave={() => setActiveConcernId(null)}
            />
          ))}
          <ConsultationPrompt />
        </div>
      </div>
    </div>
  );
}