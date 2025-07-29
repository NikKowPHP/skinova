import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

export const useAnalyzeScan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (scanId: string) => apiClient.analyze.start(scanId),
    onSuccess: (analysis, scanId) => {
      queryClient.invalidateQueries({ queryKey: ["scan", scanId] });
      toast({
        title: "Analysis Complete",
        description: "Your skin analysis is ready to view.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "We could not analyze your scan.",
      });
    },
  });
};