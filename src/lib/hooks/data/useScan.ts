import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/services/api-client.service";
import type { ScanWithAnalysis } from "@/lib/types";

export const useScan = (id: string) => {
  return useQuery({
    queryKey: ["scan", id],
    queryFn: () => apiClient.scan.getById(id),
    enabled: !!id,
    // Poll every 3 seconds if the analysis is not yet present and the scan is recent
    refetchInterval: (query) => {
      const data = query.state.data as ScanWithAnalysis | undefined;
      if (data && !data.analysis) {
        // Only poll if the scan was created in the last 10 minutes.
        // This prevents infinite polling on old scans that may have failed analysis.
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        const scanCreationDate = new Date(data.createdAt);
        if (scanCreationDate > tenMinutesAgo) {
          return 3000; // Poll every 3 seconds
        }
      }
      return false; // Stop polling
    },
  });
};