import { DashboardSummary } from "@/components/DashboardSummary";
import { ScanHistoryList } from "@/components/progress/ScanHistoryList";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const mockScans = [
    { id: '1', date: 'July 28, 2024', overallScore: 88, thumbnailUrl: 'https://via.placeholder.com/150' },
    { id: '2', date: 'July 21, 2024', overallScore: 85, thumbnailUrl: 'https://via.placeholder.com/150' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/scan">New Scan</Link>
        </Button>
      </div>
      <DashboardSummary totalScans={12} overallScore={88.4} topConcern="Redness" />
      <ScanHistoryList scans={mockScans} />
    </div>
  );
}