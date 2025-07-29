import { Lightbulb, Camera, Sun, Smile } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const instructions = [
  { icon: Sun, text: "Find a well-lit area, preferably with natural light." },
  { icon: Smile, text: "Maintain a neutral facial expression." },
  { icon: Camera, text: "Ensure your face is centered and clearly in focus." },
];

export const ScanInstructions = () => {
  return (
    <Card className="bg-secondary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          Tips for a Great Scan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {instructions.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
              <item.icon className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};