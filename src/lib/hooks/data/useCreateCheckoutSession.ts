import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useToast } from "@/components/ui/use-toast";

interface CheckoutPayload {
  priceId: string;
  scanId?: string;
}

export const useCreateCheckoutSession = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: CheckoutPayload) => apiClient.billing.createCheckoutSession(payload),
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error.message || "Could not proceed to checkout. Please try again.",
      });
    },
  });
};