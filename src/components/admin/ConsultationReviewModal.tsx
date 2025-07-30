"use client";
import { useAdminConsultation, useUpdateConsultation } from "@/lib/hooks/admin-hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface ConsultationReviewModalProps {
    consultationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ConsultationReviewModal = ({ consultationId, isOpen, onClose }: ConsultationReviewModalProps) => {
    const { data: consultation, isLoading, error } = useAdminConsultation(consultationId);
    const updateMutation = useUpdateConsultation();

    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (consultation) {
            setStatus(consultation.status);
            setNotes(consultation.notes || "");
        }
    }, [consultation]);
    
    const handleUpdate = () => {
        updateMutation.mutate({ id: consultationId, payload: { status, notes } }, {
            onSuccess: onClose,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Review Consultation</DialogTitle>
                </DialogHeader>
                {isLoading && <Skeleton className="h-96 w-full" />}
                {error && <p className="text-destructive">Error: {error.message}</p>}
                {consultation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div>
                            <h3 className="font-semibold mb-2">Scan Details</h3>
                            <p className="text-sm"><strong>User:</strong> {consultation.user.email}</p>
                            <p className="text-sm"><strong>Scan Date:</strong> {new Date(consultation.scan.createdAt).toLocaleString()}</p>
                            <div className="relative mt-4 w-full aspect-square">
                                <Image src={consultation.scan.imageUrl} alt="Skin scan" fill className="rounded-lg object-cover" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="notes">Dermatologist Notes</Label>
                                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={10} />
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};