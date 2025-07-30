import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface ScanEntry {
  id: string;
  date: string;
  overallScore: number;
  thumbnailUrl: string;
}

interface ScanHistoryListProps {
  scans: ScanEntry[];
}

export function ScanHistoryList({ scans }: ScanHistoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Scan History</h2>
      <div className="space-y-2">
        {scans.map((scan) => (
          <Link key={scan.id} href={`/scan/${scan.id}`} passHref>
            <Card className="transition-colors cursor-pointer hover:bg-accent/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md bg-secondary overflow-hidden">
                  <Image src={scan.thumbnailUrl} alt={`Scan from ${scan.date}`} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Scan from {scan.date}</p>
                  <p className="text-sm text-muted-foreground">Overall Score: {scan.overallScore}/100</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}