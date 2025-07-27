
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logger";

export const useStuckWriterSuggestions = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: apiClient.ai.getStuckSuggestions,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      logger.error("Stuck writer suggestions error:", error);
      toast({
        variant: "destructive",
        title: "Suggestion Error",
        description:
          error.message || "Could not get writing suggestions at this time.",
      });
    },
  });
};