import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";

export const ConsultationPrompt = () => {
  return (
    <Card className="bg-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Need a Professional Opinion?
        </CardTitle>
        <CardDescription>
          For a detailed assessment and prescription-strength recommendations, you can share this analysis with a board-certified dermatologist.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={() => alert("Initiating consultation... (Phase B)")}>
          Start a Consultation ($49)
        </Button>
      </CardContent>
    </Card>
  );
};