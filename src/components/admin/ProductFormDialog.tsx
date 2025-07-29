"use client";
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/admin-hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Product } from "@prisma/client";

interface ProductFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}

export const ProductFormDialog = ({ isOpen, onClose, productToEdit }: ProductFormDialogProps) => {
    const [formData, setFormData] = useState({ name: '', brand: '', type: '', description: '' });
    const createMutation = useCreateProduct();
    const updateMutation = useUpdateProduct();

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                brand: productToEdit.brand || '',
                type: productToEdit.type,
                description: productToEdit.description,
            });
        } else {
            setFormData({ name: '', brand: '', type: '', description: '' });
        }
    }, [productToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (productToEdit) {
            updateMutation.mutate({ id: productToEdit.id, payload: formData }, { onSuccess: onClose });
        } else {
            createMutation.mutate(formData, { onSuccess: onClose });
        }
    };
    
    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{productToEdit ? "Edit Product" : "Create New Product"}</DialogTitle>
                    <DialogDescription>Fill in the details for the product catalog.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="brand" className="text-right">Brand</Label>
                        <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Input id="type" name="type" value={formData.type} onChange={handleChange} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : "Save Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};