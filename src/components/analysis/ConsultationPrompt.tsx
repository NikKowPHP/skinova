'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";
import { useCreateCheckoutSession } from "@/lib/hooks/data/useCreateCheckoutSession";

interface ConsultationPromptProps {
    scanId: string;
}

export const ConsultationPrompt = ({ scanId }: ConsultationPromptProps) => {
  const checkoutMutation = useCreateCheckoutSession();

  const handleStartConsultation = () => {
    if (!process.env.NEXT_PUBLIC_CONSULTATION_PRICE_ID) {
        console.error("Consultation Price ID is not configured.");
        return;
    }
    checkoutMutation.mutate({
        priceId: process.env.NEXT_PUBLIC_CONSULTATION_PRICE_ID,
        scanId: scanId,
    }, {
        onSuccess: (response) => {
            if (response.url) {
                window.location.href = response.url;
            }
        }
    });
  };

  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Need a Professional Opinion?
        </CardTitle>
        <CardDescription>
          For a detailed assessment and prescription-strength recommendations, you can share this analysis with a board-certified dermatologist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleStartConsultation} disabled={checkoutMutation.isPending}>
          {checkoutMutation.isPending ? "Redirecting..." : "Start a Consultation ($49)"}
        </Button>
      </CardContent>
    </Card>
  );
};