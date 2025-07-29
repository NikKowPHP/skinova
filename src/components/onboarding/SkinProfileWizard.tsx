'use client';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_SKIN_TYPES, SUPPORTED_CONCERNS } from '@/lib/constants';

export const SkinProfileWizard = () => {
  const [step, setStep] = React.useState(1);
  // This component will be connected to the Zustand store in a later phase.
  // For now, its state is self-contained.

  return (
    <Dialog open={true}>
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
            <Select>
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
             <Select>
              <SelectTrigger><SelectValue placeholder="Select primary concern" /></SelectTrigger>
              <SelectContent>
                {SUPPORTED_CONCERNS.map(concern => <SelectItem key={concern.value} value={concern.value}>{concern.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="mt-6">
          {step > 1 && <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="ml-auto">Next</Button>
          ) : (
            <Button onClick={() => alert("Onboarding Complete! (Phase B)")} className="ml-auto">Finish Setup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};