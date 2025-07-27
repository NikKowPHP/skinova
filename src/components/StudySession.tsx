"use client";
import { useState, useEffect, useRef } from "react";
import { Flashcard } from "@/components/Flashcard";
import { useReviewSrsItem } from "@/lib/hooks/data";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/lib/hooks/useAnalytics";

interface StudyCard {
  id: string;
  frontContent: string;
  backContent: string;
  context: string;
  targetLanguage?: string;
  type: string;
  interval: number;
  easeFactor: number;
}

interface StudySessionProps {
  cards: StudyCard[];
  nativeLanguage?: string | null;
  targetLanguage?: string | null;
  onOnboardingReview?: () => void;
}

export function StudySession({
  cards,
  nativeLanguage,
  targetLanguage,
  onOnboardingReview,
}: StudySessionProps) {
  const [sessionCards, setSessionCards] = useState<StudyCard[]>([]);
  const [initialCardCount, setInitialCardCount] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0); // Track cards reviewed in this session
  const analytics = useAnalytics();
  const sessionStarted = useRef(false);

  useEffect(() => {
    setSessionCards(cards);
    setInitialCardCount(cards.length);
    setReviewedCount(0); // Reset session progress
    sessionStarted.current = false;
  }, [cards]);

  useEffect(() => {
    if (initialCardCount > 0 && !sessionStarted.current) {
      analytics.capture("SRS Session Started", {
        cardCount: initialCardCount,
        language: targetLanguage,
      });
      sessionStarted.current = true;
    }
  }, [initialCardCount, targetLanguage, analytics]);

  const queryClient = useQueryClient();
  const reviewMutation = useReviewSrsItem();
  const currentCard = sessionCards[0];

  const handleReview = (quality: number) => {
    if (!currentCard) return;

    setReviewedCount((prev) => prev + 1);

    analytics.capture("Card Reviewed", {
      cardId: currentCard.id,
      quality,
      type: currentCard.type,
      language: targetLanguage,
    });

    // Perform the mutation in the background for all review types
    reviewMutation.mutate({ srsItemId: currentCard.id, quality });

    // Update the local session deck state
    setSessionCards((prevCards) => {
      const remainingCards = prevCards.slice(1);
      if (quality < 3) {
        // If "Forgot", re-add the card to the end of the queue
        return [...remainingCards, currentCard];
      }
      // If "Good" or "Easy", just remove the card from the session
      return remainingCards;
    });
  };

  const handleStudyMore = () => {
    queryClient.invalidateQueries({ queryKey: ["studyDeck"] });
  };

  return (
    <div className="space-y-6">
      {currentCard ? (
        <>
          <div className="text-xl font-semibold text-muted-foreground">
            Card {reviewedCount + 1} of {initialCardCount}
          </div>
          <div key={currentCard.id} className="animate-in fade-in duration-300">
            <Flashcard
              frontContent={currentCard.frontContent}
              backContent={currentCard.backContent}
              context={currentCard.context}
              type={currentCard.type}
              nativeLanguage={nativeLanguage}
              targetLanguage={targetLanguage}
              interval={currentCard.interval}
              easeFactor={currentCard.easeFactor}
              onReview={handleReview}
              onOnboardingReview={onOnboardingReview}
            />
          </div>
        </>
      ) : (
        <div className="text-center p-6 border rounded-lg bg-muted/20">
          <h2 className="text-xl font-semibold mb-2">Session Complete!</h2>
          <p className="text-gray-600 mb-4">
            You reviewed {initialCardCount} cards. Great job!
          </p>
          <Button onClick={handleStudyMore}>Study More Cards</Button>
        </div>
      )}
    </div>
  );
}