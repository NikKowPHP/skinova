'use client'
import React, { useEffect, useMemo, useRef } from "react";
import { AnalysisDisplay } from "@/components/AnalysisDisplay";
import { FeedbackCard } from "@/components/FeedbackCard";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useJournalEntry,
  useRetryJournalAnalysis,
  useAnalyzeJournal,
  useStudyDeck,
} from "@/lib/hooks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/Spinner";
import { GuidedPopover } from "@/components/ui/GuidedPopover";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { StrengthsCard } from "@/components/StrengthsCard";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { JournalAnalysisResult } from "@/lib/types";
import { Mistake } from "@prisma/client";
import { logger } from "@/lib/logger";

export default function JournalAnalysisPage() {
  const params = useParams();
  const id = params.id as string;
  const { step, setStep } = useOnboardingStore();
  const analysisInitiated = useRef(false);
  const analytics = useAnalytics();

  const completeOnboarding = () => {
    setStep("COMPLETED");
  };

  const isTourActive = step === "VIEW_ANALYSIS";

  const { data: journal, isLoading, error } = useJournalEntry(id);
  const { data: studyDeck, isLoading: isStudyDeckLoading } = useStudyDeck({
    includeAll: true,
  });
  const retryAnalysisMutation = useRetryJournalAnalysis();
  const analyzeJournalMutation = useAnalyzeJournal();

  useEffect(() => {
    if (
      journal &&
      !journal.analysis &&
      !analyzeJournalMutation.isPending &&
      !analysisInitiated.current
    ) {
      analysisInitiated.current = true;
      analyzeJournalMutation.mutate(id);
    }
  }, [journal, analyzeJournalMutation, id]);

  useEffect(() => {
    if (journal?.analysis) {
      analytics.capture("Analysis Viewed", { journalId: journal.id });
    }
  }, [journal?.analysis, journal?.id, analytics]);

  const isPageLoading = isLoading || isStudyDeckLoading;

  const analysisData: JournalAnalysisResult | null = useMemo(() => {
    if (!journal?.analysis?.rawAiResponse) return null;
    try {
      // The type is now correct from the hook. No casting needed.
      const rawResponse = journal.analysis.rawAiResponse;
      if (!rawResponse) {
        return null;
      }
      return {
        ...rawResponse,
        grammarScore: journal.analysis.grammarScore,
        phrasingScore: journal.analysis.phrasingScore,
        vocabularyScore: journal.analysis.vocabScore,
      };
    } catch (e) {
      logger.error("Failed to process raw AI response:", {
        error: e,
        rawResponse: journal.analysis.rawAiResponse,
      });
      return null;
    }
  }, [journal?.analysis]);

  const groupedMistakes = useMemo(() => {
    if (!journal?.analysis?.mistakes) return {};
    return journal.analysis.mistakes.reduce(
      (acc: Record<string, Mistake[]>, mistake: Mistake) => {
        (acc[mistake.type] = acc[mistake.type] || []).push(mistake);
        return acc;
      },
      {},
    );
  }, [journal?.analysis?.mistakes]);

  if (isPageLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-40 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!journal) return <div>Journal entry not found.</div>;

  const isMutationRunning =
    analyzeJournalMutation.isPending || retryAnalysisMutation.isPending;
  const didMutationFailed =
    (analyzeJournalMutation.isError || retryAnalysisMutation.isError) &&
    !isMutationRunning;

  const isAnalysisPending = !journal.analysis && !didMutationFailed;
  const analysisFailed = !journal.analysis && didMutationFailed;

  const analysisDisplayComponent = (
    <AnalysisDisplay
      content={journal.content}
      highlights={analysisData?.highlights || []}
      mistakes={journal.analysis?.mistakes || []}
    />
  );

  const addedMistakeIds = new Set(
    studyDeck?.map((item: any) => item.mistakeId).filter(Boolean),
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Journal Entry Analysis</h1>

      {isAnalysisPending ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Analysis in Progress...</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">
              Your entry is being analyzed. The page will update automatically.
            </p>
          </CardContent>
        </Card>
      ) : analysisFailed ? (
        <Card className="text-center p-8">
          <CardHeader>
            <CardTitle>Analysis Failed</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              We couldn't analyze this entry. Please try again.
            </p>
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => retryAnalysisMutation.mutate(id)}
              disabled={retryAnalysisMutation.isPending}
            >
              {retryAnalysisMutation.isPending
                ? "Retrying..."
                : "Retry Analysis"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {analysisData && (
            <>
              <AnalysisSummary
                grammarScore={analysisData.grammarScore}
                phrasingScore={analysisData.phrasingScore}
                vocabularyScore={analysisData.vocabularyScore}
                overallSummary={analysisData.overallSummary}
              />
              <div className="w-full lg:w-2/3 mx-auto">
                {isTourActive ? (
                  <GuidedPopover
                    isOpen={true}
                    onDismiss={() => {}} // Onboarding controls this
                    title="Review Your Feedback"
                    description="We've highlighted areas for improvement. The colors show the type of feedback."
                  >
                    {analysisDisplayComponent}
                  </GuidedPopover>
                ) : (
                  analysisDisplayComponent
                )}
              </div>
              {analysisData.strengths && analysisData.strengths.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">What You Did Well</h2>
                  <div className="w-full lg:w-2/3 mx-auto space-y-4">
                    {analysisData.strengths.map((strength, index) => (
                      <StrengthsCard
                        key={index}
                        text={strength.text}
                        explanation={strength.explanation}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Areas for Improvement</h2>
                {Object.keys(groupedMistakes).length > 0 ? (
                  <Tabs
                    defaultValue={Object.keys(groupedMistakes)[0]}
                    className="w-full lg:w-2/3 mx-auto"
                  >
                    <TabsList>
                      {Object.entries(groupedMistakes).map(
                        ([type, mistakes]) => (
                          <TabsTrigger key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)} (
                            {mistakes.length})
                          </TabsTrigger>
                        ),
                      )}
                    </TabsList>
                    {Object.entries(groupedMistakes).map(
                      ([type, mistakes], catIndex) => (
                        <TabsContent key={type} value={type}>
                          <div className="space-y-4">
                            {mistakes.map((feedback, index: number) => {
                              const isAlreadyInDeck = addedMistakeIds.has(
                                feedback.id,
                              );
                              return (
                                <div
                                  key={feedback.id}
                                  className="w-full mx-auto" // Removed lg:w-2/3
                                >
                                  {isTourActive &&
                                  catIndex === 0 &&
                                  index === 0 ? (
                                    <GuidedPopover
                                      isOpen={true}
                                      onDismiss={() => {}} // Onboarding controls this
                                      title="Review, Practice, Retain"
                                      description="See our correction, practice the concept with new exercises, and then add it to your study deck."
                                    >
                                      <FeedbackCard
                                        original={feedback.originalText}
                                        suggestion={feedback.correctedText}
                                        explanation={feedback.explanation}
                                        mistakeId={feedback.id}
                                        onOnboardingAddToDeck={() =>
                                          setStep("CREATE_DECK")
                                        }
                                        isAlreadyInDeck={isAlreadyInDeck}
                                      />
                                    </GuidedPopover>
                                  ) : (
                                    <FeedbackCard
                                      original={feedback.originalText}
                                      suggestion={feedback.correctedText}
                                      explanation={feedback.explanation}
                                      mistakeId={feedback.id}
                                      isAlreadyInDeck={isAlreadyInDeck}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </TabsContent>
                      ),
                    )}
                  </Tabs>
                ) : (
                  <div className="w-full lg:w-2/3 mx-auto">
                    <Card className="p-6 text-center">
                      <CardHeader>
                        <CardTitle>Great Job!</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Our AI didn't find any specific mistakes to correct in
                          this entry. You're on the right track!
                        </p>
                        {isTourActive && (
                          <Button onClick={completeOnboarding} className="mt-4">
                            Continue Onboarding
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
