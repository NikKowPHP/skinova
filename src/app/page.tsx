import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScanFace, Sparkles, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="text-center py-20 px-4 sm:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-4">
            Data-Driven Skincare, <span className="text-primary">Personalized for You</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Stop the guesswork. Scan your skin, get an AI-powered analysis, and receive a personalized routine designed for your unique needs. Track your progress and achieve your skin goals.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Start Your First Scan</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <ScanFace className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">1. Scan Your Skin</h3>
              <p className="text-muted-foreground mt-2">Take a photo to get an instant, AI-driven analysis of your skin's condition.</p>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">2. Get Your Routine</h3>
              <p className="text-muted-foreground mt-2">Receive a personalized skincare routine with product recommendations tailored to your analysis.</p>
            </div>
            <div className="flex flex-col items-center">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold">3. Track Your Progress</h3>
              <p className="text-muted-foreground mt-2">Log your journey with regular scans and watch your skin health improve over time.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}