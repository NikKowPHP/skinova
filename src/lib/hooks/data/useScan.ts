import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import type { ScanWithAnalysis } from "@/lib/types";

export const useScan = (id: string) => {
  return useQuery({
    queryKey: ["scan", id],
    queryFn: () => apiClient.scan.getById(id),
    enabled: !!id,
    // Poll every 3 seconds if the analysis is not yet present
    refetchInterval: (query) => {
      const data = query.state.data as ScanWithAnalysis | undefined;
      return data && !data.analysis ? 3000 : false;
    },
  });
};