
import Link from "next/link";
import { Card, CardContent } from "./ui/card";
import Spinner from "./ui/Spinner";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  title: string;
  snippet: string;
  date: string;
  isPending?: boolean;
}

interface JournalHistoryListProps {
  journals: JournalEntry[];
}

export function JournalHistoryList({ journals }: JournalHistoryListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Previous Entries</h2>
      <div className="space-y-2 md:space-y-4">
        {journals.map((entry) => (
          <Link
            key={entry.id}
            href={!entry.isPending ? `/journal/${entry.id}` : "#"}
            passHref
            className={cn(entry.isPending && "pointer-events-none")}
            aria-disabled={entry.isPending}
            tabIndex={entry.isPending ? -1 : undefined}
          >
            <Card
              className={cn(
                "transition-colors cursor-pointer first:rounded-t-lg last:rounded-b-lg md:rounded-xl",
                entry.isPending
                  ? "opacity-60 bg-muted/50"
                  : "hover:bg-accent/50",
              )}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-medium line-clamp-1 flex items-center gap-2">
                    {entry.title}
                    {entry.isPending && <Spinner size="sm" />}
                  </h3>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {entry.date}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {entry.snippet}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}