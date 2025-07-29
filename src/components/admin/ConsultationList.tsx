"use client";
import { useState } from "react";
import { useAdminConsultations } from "@/lib/hooks/admin-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsultationReviewModal } from "./ConsultationReviewModal";
import { Consultation } from "@prisma/client";

const ConsultationTable = ({ status }: { status?: string }) => {
    const { data: consultations, isLoading, error } = useAdminConsultations(status);
    const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (error) {
        return <p className="text-destructive">Error: {error.message}</p>;
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>User Email</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {consultations?.map((c: any) => (
                        <TableRow key={c.id} onClick={() => setSelectedConsultationId(c.id)} className="cursor-pointer">
                            <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{c.user.email}</TableCell>
                            <TableCell>{c.status}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {consultations?.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No consultations found.</p>
            )}
            {selectedConsultationId && (
                <ConsultationReviewModal
                    consultationId={selectedConsultationId}
                    isOpen={!!selectedConsultationId}
                    onClose={() => setSelectedConsultationId(null)}
                />
            )}
        </>
    );
};

export const ConsultationList = () => {
    return (
        <Tabs defaultValue="PENDING">
            <TabsList>
                <TabsTrigger value="PENDING">Pending</TabsTrigger>
                <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="PENDING">
                <ConsultationTable status="PENDING" />
            </TabsContent>
            <TabsContent value="COMPLETED">
                <ConsultationTable status="COMPLETED" />
            </TabsContent>
            <TabsContent value="all">
                <ConsultationTable />
            </TabsContent>
        </Tabs>
    );
};