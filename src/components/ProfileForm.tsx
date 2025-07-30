import { useUpdateProfile } from "@/lib/hooks/data";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "./ui/skeleton";
import { SUPPORTED_SKIN_TYPES, SUPPORTED_CONCERNS } from "@/lib/constants";
import { useState, useEffect } from "react";
import type { ProfileUpdateData } from "@/lib/types";
import { SkinType } from "@prisma/client";

interface ProfileFormProps {
  email?: string;
  skinType?: string;
  primaryConcern?: string;
  isLoading?: boolean;
}

const ProfileFormSkeleton = () => (
  <Card>
    <CardContent className="p-4 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </CardContent>
  </Card>
);

export function ProfileForm({
  email,
  skinType,
  primaryConcern,
  isLoading,
}: ProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [formState, setFormState] = useState({
    skinType: skinType || "",
    primaryConcern: primaryConcern || "",
  });

  useEffect(() => {
    setFormState({
      skinType: skinType || "",
      primaryConcern: primaryConcern || "",
    });
  }, [skinType, primaryConcern]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const payload: ProfileUpdateData = {};
    if (formState.skinType) {
      payload.skinType = formState.skinType as SkinType;
    }
    if (formState.primaryConcern) {
      payload.primaryConcern = formState.primaryConcern;
    }

    updateProfile(payload);
  };

  const handleValueChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return <ProfileFormSkeleton />;
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              disabled
              readOnly
            />
          </div>

          <div className="space-y-2">
            <Label>Skin Type</Label>
            <Select
              name="skinType"
              value={formState.skinType}
              onValueChange={(value) =>
                handleValueChange("skinType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your skin type" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_SKIN_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Primary Concern</Label>
            <Select
              name="primaryConcern"
              value={formState.primaryConcern}
              onValueChange={(value) =>
                handleValueChange("primaryConcern", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your primary concern" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_CONCERNS.map((concern) => (
                  <SelectItem key={concern.value} value={concern.value}>
                    {concern.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}