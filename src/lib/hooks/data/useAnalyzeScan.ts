import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/stores/auth.store";

export const useAnalyzeScan = (options?: {
  onSuccess?: (data: any, scanId: string) => void;
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (scanId: string) => apiClient.analyze.start(scanId),
    onSuccess: (analysis, scanId) => {
      // Invalidate both the specific scan query and the scan history query
      queryClient.invalidateQueries({ queryKey: ["scan", scanId] });
      queryClient.invalidateQueries({ queryKey: ["scans", authUser?.id] });
      toast({
        title: "Analysis Complete",
        description: "Your skin analysis is ready to view.",
      });
      options?.onSuccess?.(analysis, scanId);
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