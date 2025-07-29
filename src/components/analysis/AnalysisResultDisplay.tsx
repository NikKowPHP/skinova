'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Concern {
  id: string;
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  position: { top: string; left: string; width: string; height: string };
}

interface AnalysisResultDisplayProps {
  imageUrl: string;
  concerns: Concern[];
  activeConcernId: string | null;
  onConcernHover: (id: string | null) => void;
}

export const AnalysisResultDisplay = ({ imageUrl, concerns, activeConcernId, onConcernHover }: AnalysisResultDisplayProps) => {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <img src={imageUrl} alt="Analyzed skin scan" className="rounded-lg object-cover w-full h-full" />
      {concerns.map(concern => (
        <div
          key={concern.id}
          className={cn(
            "absolute border-2 rounded-md transition-all duration-300 cursor-pointer",
            activeConcernId === concern.id ? 'border-primary shadow-lg' : 'border-primary/30 hover:border-primary/70'
          )}
          style={{ ...concern.position }}
          onMouseEnter={() => onConcernHover(concern.id)}
          onMouseLeave={() => onConcernHover(null)}
        />
      ))}
    </div>
  );
};