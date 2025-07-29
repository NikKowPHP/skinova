import { ScanInstructions } from "@/components/scan/ScanInstructions";
import { ScanUploadForm } from "@/components/scan/ScanUploadForm";

export default function ScanPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">New Skin Scan</h1>
        <p className="text-muted-foreground">Upload a photo to get your personalized analysis.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScanInstructions />
        <ScanUploadForm />
      </div>
    </div>
  );
}