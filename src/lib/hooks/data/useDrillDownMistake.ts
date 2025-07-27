import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

interface DrillDownPayload {
  mistakeId: string;
  originalText: string;
  correctedText: string;
  explanation: string;
  targetLanguage: string;
  existingTasks?: string[];
}

export const useDrillDownMistake = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: DrillDownPayload) =>
      apiClient.ai.drillDownMistake(payload),
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Practice Generation Failed",
        description:
          error.message ||
          "Could not generate practice exercises at this time.",
      });
    },
  });
};