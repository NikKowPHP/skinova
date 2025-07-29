'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateScan, useAnalyzeScan } from "@/lib/hooks/data";
import { useAuthStore } from '@/lib/stores/auth.store';
import { useToast } from '../ui/use-toast';
import { createClient } from '@/lib/supabase/client';

export const ScanUploadForm = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const authUser = useAuthStore((state) => state.user);
  const createScanMutation = useCreateScan();
  const analyzeScanMutation = useAnalyzeScan();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile || !authUser) {
      toast({ variant: "destructive", title: "Error", description: "Please select an image to upload." });
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `public/${authUser.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(process.env.NEXT_PUBLIC_SKIN_SCANS_BUCKET!)
        .upload(filePath, imageFile);

      if (uploadError) {
        throw uploadError;
      }
      
      setIsUploading(false);

      createScanMutation.mutate({ imageUrl: filePath, notes }, {
        onSuccess: (newScan) => {
          analyzeScanMutation.mutate(newScan.id, {
            onSuccess: () => {
              router.push(`/scan/${newScan.id}`);
            }
          });
        }
      });

    } catch (error) {
      setIsUploading(false);
      toast({ variant: "destructive", title: "Upload Failed", description: (error as Error).message });
    }
  };
  
  const isProcessing = isUploading || createScanMutation.isPending || analyzeScanMutation.isPending;
  const buttonText = isUploading ? "Uploading..." : "Analyzing...";

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
          <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
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