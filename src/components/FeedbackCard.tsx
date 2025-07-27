import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateSrsFromMistake } from "@/lib/hooks/data";
import { Check } from "lucide-react";
import { PracticeSection } from "./PracticeSection";

interface FeedbackCardProps {
  original: string;
  suggestion: string;
  explanation: string;
  mistakeId: string;
  onOnboardingAddToDeck?: () => void;
  isAlreadyInDeck: boolean;
}

function AddMistakeToDeckButton({
  mistakeId,
  onOnboardingAddToDeck,
  isAlreadyInDeck,
  original,
  suggestion,
  explanation,
}: {
  mistakeId: string;
  onOnboardingAddToDeck?: () => void;
  isAlreadyInDeck: boolean;
  original: string;
  suggestion: string;
  explanation: string;
}) {
  const { mutate, isPending, isSuccess } = useCreateSrsFromMistake();

  const showAddedState = isSuccess || isAlreadyInDeck;

  return (
    <Button
      variant="secondary"
      className="flex-1 py-2 md:py-0"
      onClick={() => {
        mutate(
          {
            mistakeId,
            frontContent: original,
            backContent: suggestion,
            context: explanation,
          },
          {
            onSuccess: () => onOnboardingAddToDeck?.(),
          },
        );
      }}
      disabled={isPending || showAddedState}
    >
      {isPending ? (
        "Adding..."
      ) : showAddedState ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Added
        </>
      ) : (
        "Add to Study Deck"
      )}
    </Button>
  );
}

export function FeedbackCard({
  original,
  suggestion,
  explanation,
  mistakeId,
  onOnboardingAddToDeck,
  isAlreadyInDeck,
}: FeedbackCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <Card id={`mistake-${mistakeId}`} className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-base font-medium">Original Text</h3>
        <p className="text-sm line-through text-muted-foreground">{original}</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-medium">Explanation</h3>
        <p className="text-sm text-muted-foreground">{explanation}</p>
      </div>

      {isRevealed ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <h3 className="text-base font-medium">Suggested Correction</h3>
            <p className="text-sm text-green-700 dark:text-green-400">
              {suggestion}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <AddMistakeToDeckButton
              mistakeId={mistakeId}
              onOnboardingAddToDeck={onOnboardingAddToDeck}
              isAlreadyInDeck={isAlreadyInDeck}
              original={original}
              suggestion={suggestion}
              explanation={explanation}
            />
            <PracticeSection
              originalText={original}
              correctedText={suggestion}
              explanation={explanation}
              mistakeId={mistakeId}
            />
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsRevealed(true)}
        >
          Show Suggestion
        </Button>
      )}
    </Card>
  );
}