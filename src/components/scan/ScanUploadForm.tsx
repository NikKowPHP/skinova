'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateScan, useAnalyzeScan } from "@/lib/hooks/data";

export const ScanUploadForm = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const router = useRouter();
  const createScanMutation = useCreateScan();
  const analyzeScanMutation = useAnalyzeScan();

  const handleAnalyzeClick = () => {
    // In a real app, this would come from Supabase Storage upload
    const mockImageUrl = 'https://images.unsplash.com/photo-1580894908361-967195033215?q=80&w=2070&auto=format&fit=crop';

    createScanMutation.mutate({ imageUrl: mockImageUrl, notes }, {
      onSuccess: (newScan) => {
        analyzeScanMutation.mutate(newScan.id, {
          onSuccess: () => {
            router.push(`/scan/${newScan.id}`);
          }
        });
      }
    });
  };
  
  const isProcessing = createScanMutation.isPending || analyzeScanMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Scan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50">
          {imagePreview ? (
            <img src={imagePreview} alt="Skin scan preview" className="object-cover h-full w-full rounded-lg" />
          ) : (
            <div className="text-center text-muted-foreground">
              <UploadCloud className="mx-auto h-10 w-10 mb-2" />
              <p>Click to upload or drag & drop</p>
              <p className="text-xs">PNG, JPG, or WEBP</p>
            </div>
          )}
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
        </div>
        <Textarea
          placeholder="Add any notes about your skin today (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleAnalyzeClick} disabled={isProcessing}>
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isProcessing ? "Analyzing..." : "Analyze My Skin"}
        </Button>
      </CardFooter>
    </Card>
  );
};