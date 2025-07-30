'use client';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateScan, useAnalyzeScan } from "@/lib/hooks/data";
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '../ui/use-toast';

export const ScanUploadForm = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  const createScanMutation = useCreateScan();
  const analyzeScanMutation = useAnalyzeScan();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    // Cleanup the object URL when the component unmounts
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleAnalyzeClick = async () => {
    if (!imageFile || !authUser) {
      toast({ variant: "destructive", title: "Error", description: "Please select an image to upload." });
      return;
    }

    const formData = new FormData();
    formData.append('file', imageFile);
    if (notes) {
      formData.append('notes', notes);
    }
    
    createScanMutation.mutate(formData, {
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
  const buttonText = createScanMutation.isPending ? "Uploading..." : (analyzeScanMutation.isPending ? "Analyzing..." : "Analyze My Skin");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Scan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <label htmlFor="scan-upload" className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-secondary/50">
          {imagePreview ? (
            <img src={imagePreview} alt="Skin scan preview" className="object-cover h-full w-full rounded-lg" />
          ) : (
            <div className="text-center text-muted-foreground p-4">
              <Camera className="mx-auto h-10 w-10 mb-2" />
              <p className="font-medium">Tap to take a photo</p>
              <p className="text-xs">Or select an existing picture</p>
            </div>
          )}
          <input
            id="scan-upload"
            type="file"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*"
            capture="user"
          />
        </label>
        <Textarea
          placeholder="Add any notes about your skin today (optional)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleAnalyzeClick} disabled={isProcessing || !imageFile}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {buttonText}
            </>
          ) : (
            "Analyze My Skin"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};