import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";

export const useRoutine = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["routine", authUser?.id],
    queryFn: apiClient.routine.get,
    enabled: !!authUser,
  });
};