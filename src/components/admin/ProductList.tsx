"use client";
import { useState } from "react";
import { useAdminProducts, useDeleteProduct } from "@/lib/hooks/admin-hooks";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductFormDialog } from "./ProductFormDialog";
import { Product } from "@prisma/client";

export const ProductList = () => {
    const { data: products, isLoading, error } = useAdminProducts();
    const deleteMutation = useDeleteProduct();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    const handleEdit = (product: Product) => {
        setProductToEdit(product);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setProductToEdit(null);
        setIsFormOpen(true);
    };

    if (isLoading) {
        return <Skeleton className="h-64 w-full" />;
    }
    if (error) {
        return <p className="text-destructive">Error: {error.message}</p>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={handleCreate}>Add New Product</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products?.map(product => (
                        <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.type}</TableCell>
                            <TableCell className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>Edit</Button>
                                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(product.id)}>Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <ProductFormDialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                productToEdit={productToEdit}
            />
        </div>
    );
};