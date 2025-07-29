import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";

export const useProgressAnalytics = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["progressAnalytics", authUser?.id],
    queryFn: apiClient.progress.getAnalytics,
    enabled: !!authUser,
  });
};