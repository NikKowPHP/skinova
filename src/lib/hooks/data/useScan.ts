import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import type { ScanWithAnalysis } from "@/lib/types";

export const useScan = (id: string) => {
  return useQuery({
    queryKey: ["scan", id],
    queryFn: () => apiClient.scan.getById(id),
    enabled: !!id,
    // Poll every 3 seconds if the analysis status is still PENDING.
    refetchInterval: (query) => {
      const data = query.state.data as ScanWithAnalysis | undefined;
      // If we have data and the status is PENDING, keep polling.
      if (data && data.analysisStatus === 'PENDING') {
        return 3000; // Poll every 3 seconds
      }
      // Otherwise, stop polling.
      return false;
    },
  });
};