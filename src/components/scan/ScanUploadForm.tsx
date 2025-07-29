'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Image as ImageIcon, Loader2 } from "lucide-react";

export const ScanUploadForm = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // In this phase, this is a mock function.
  const handleAnalyzeClick = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Mock analysis complete! (Phase B)");
    }, 2000);
  };

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
        <Button className="w-full" onClick={handleAnalyzeClick} disabled={isUploading}>
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Analyzing..." : "Analyze My Skin"}
        </Button>
      </CardFooter>
    </Card>
  );
};