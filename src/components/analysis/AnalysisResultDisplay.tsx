'use client';
import { cn } from '@/lib/utils';
import { ConcernSeverity } from '@prisma/client';
import Image from 'next/image';

interface Concern {
  id: string;
  name: string;
  severity: ConcernSeverity;
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
      <Image src={imageUrl} alt="Analyzed skin scan" fill className="rounded-lg object-cover" />
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