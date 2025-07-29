'use client';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_SKIN_TYPES, SUPPORTED_CONCERNS } from '@/lib/constants';
import { useOnboardUser } from '@/lib/hooks/data';
import type { OnboardingData } from '@/lib/types';
import { SkinType } from '@prisma/client';

interface SkinProfileWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onError?: (error: string) => void;
}

export const SkinProfileWizard = ({
  isOpen,
  onClose,
  onComplete,
  onError,
}: SkinProfileWizardProps) => {
  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<OnboardingData>({
    skinType: '' as SkinType,
    primaryConcern: '',
  });

  const { mutate: submitOnboarding, isPending } = useOnboardUser();

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleComplete = () => {
    submitOnboarding(formData, {
      onSuccess: onComplete,
      onError: (error) => onError?.(error.message),
    });
  };

  const isNextDisabled = () => {
    if (step === 2 && !formData.skinType) return true;
    if (step === 3 && !formData.primaryConcern) return true;
    return false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Welcome to Skinova!"}
            {step === 2 && "Tell Us About Your Skin"}
            {step === 3 && "What Are Your Goals?"}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && <p>Let's personalize your experience. A few quick questions will help us get started.</p>}
        
        {step === 2 && (
          <div className="space-y-4">
            <label>What is your skin type?</label>
            <Select onValueChange={(v) => handleChange('skinType', v as SkinType)} value={formData.skinType}>
              <SelectTrigger><SelectValue placeholder="Select skin type" /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_SKIN_TYPES.map(type => <SelectItem key={type.value} value={type.value}>{type.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {step === 3 && (
           <div className="space-y-4">
            <label>What is your primary skin concern?</label>
             <Select onValueChange={(v) => handleChange('primaryConcern', v)} value={formData.primaryConcern}>
              <SelectTrigger><SelectValue placeholder="Select primary concern" /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_CONCERNS.map(concern => <SelectItem key={concern.value} value={concern.value}>{concern.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="mt-6">
          {step > 1 && <Button variant="outline" onClick={prevStep}>Back</Button>}
          {step < 3 ? (
            <Button onClick={nextStep} disabled={isNextDisabled()} className="ml-auto">Next</Button>
          ) : (
            <Button onClick={handleComplete} disabled={isPending || isNextDisabled()} className="ml-auto">
              {isPending ? "Saving..." : "Finish Setup"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};