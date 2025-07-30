import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface RoutineStepCardProps {
  step: number;
  productType: string;
  productName: string;
  productBrand?: string | null;
  productDescription: string;
  instructions: string;
  imageUrl?: string | null;
  purchaseUrl?: string | null;
}

export const RoutineStepCard = ({ step, productType, productName, productBrand, productDescription, instructions, imageUrl, purchaseUrl }: RoutineStepCardProps) => {
  return (
    <Card className="flex flex-col sm:flex-row items-start p-4 gap-4">
      <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center font-bold self-center sm:self-start">{step}</div>
      {imageUrl && (
        <div className="relative h-24 w-24 flex-shrink-0 rounded-md bg-secondary overflow-hidden self-center">
            <Image src={imageUrl} alt={productName} fill className="object-cover" />
        </div>
      )}
      <div className="flex-1 space-y-1">
        <p className="font-semibold">{productType}</p>
        <p className="text-sm">
            <span className="font-medium text-foreground">{productName}</span>
            {productBrand && <span className="text-muted-foreground"> by {productBrand}</span>}
        </p>
        <p className="text-xs text-muted-foreground italic">{productDescription}</p>
        <p className="text-sm pt-2">{instructions}</p>
      </div>
      {purchaseUrl && (
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto mt-2 sm:mt-0 self-center">
          <Link href={purchaseUrl} target="_blank" rel="noopener noreferrer">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy
          </Link>
        </Button>
      )}
    </Card>
  );
};