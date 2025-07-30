import { getUserById } from "@/lib/user";
import { UpdateSubscriptionForm } from "@/app/admin/users/[id]/UpdateSubscriptionForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { SkinScan, SkinAnalysis, IdentifiedConcern } from "@prisma/client";

// Define a more specific type for the payload
type ScanWithRelations = SkinScan & {
  analysis: (SkinAnalysis & {
    concerns: IdentifiedConcern[];
  }) | null;
};

// Define props interface for clarity and type safety
interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

// Define the page component as an async function constant
const UserDetailPage = async ({ params }: UserDetailPageProps) => {
  const { id } =await params;
  const user = await getUserById({
    where: { id },
    include: {
      scans: {
        include: {
          analysis: {
            include: {
              concerns: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!user) {
    return <div className="p-4">User not found</div>;
  }

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">User Details</h2>
          <p className="text-muted-foreground">
            Manage subscription for {user.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Subscription</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Tier:</span>{" "}
                {user.subscriptionTier}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                {user.subscriptionStatus}
              </p>
              <p>
                <span className="font-medium">Created:</span>{" "}
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <UpdateSubscriptionForm
            userId={id}
            currentTier={user.subscriptionTier || "FREE"}
            currentStatus={user.subscriptionStatus || "ACTIVE"}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Skin Scans</h3>
          {user.scans?.length ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-2">
                {user.scans.map((scan: ScanWithRelations) => (
                  <Link href={`/scan/${scan.id}`} key={scan.id}>
                    <Card className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <p className="font-semibold">
                          Scan from{" "}
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Score: {scan.analysis?.overallScore ?? "N/A"}
                        </p>
                        <p className="text-sm mt-1">
                          {scan.analysis
                            ? `${scan.analysis.concerns.length} concerns found`
                            : "No analysis"}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Analysis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.scans.map((scan: ScanWithRelations) => (
                      <TableRow key={scan.id}>
                        <TableCell>
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {scan.analysis?.overallScore ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          {scan.analysis ? (
                            <Link
                              href={`/scan/${scan.id}`}
                              className="text-primary hover:underline"
                            >
                              View Scan Details
                            </Link>
                          ) : (
                            "No analysis"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              No skin scans found for this user.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;