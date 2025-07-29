import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";

export const useScanHistory = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["scans", authUser?.id],
    queryFn: apiClient.scan.getAll,
    enabled: !!authUser,
  });
};