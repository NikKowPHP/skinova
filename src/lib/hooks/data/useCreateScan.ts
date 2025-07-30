import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useToast } from "@/components/ui/use-toast";

export const useCreateScan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: FormData) => apiClient.scan.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans", authUser?.id] });
      // Toast is handled by the analysis hook
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Scan Upload Failed",
        description: error.message || "Your scan could not be saved.",
      });
    },
  });
};