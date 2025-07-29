import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import { useAuthStore } from "@/lib/stores/auth.store";

export const useConsultations = () => {
  const authUser = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: ["consultations", authUser?.id],
    queryFn: apiClient.consultation.getAll,
    enabled: !!authUser,
  });
};