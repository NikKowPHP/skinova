import { ProgressChart } from "@/components/progress/ProgressChart";
import { ScanHistoryList } from "@/components/progress/ScanHistoryList";

const mockScans = [
    { id: '1', date: 'July 28, 2024', overallScore: 88, thumbnailUrl: 'https://via.placeholder.com/150' },
    { id: '2', date: 'July 21, 2024', overallScore: 85, thumbnailUrl: 'https://via.placeholder.com/150' },
    { id: '3', date: 'July 14, 2024', overallScore: 82, thumbnailUrl: 'https://via.placeholder.com/150' },
];

export default function ProgressPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">My Progress</h1>
        <p className="text-muted-foreground">Your complete skin health logbook.</p>
      </header>
      <ProgressChart />
      <ScanHistoryList scans={mockScans} />
    </div>
  );
}